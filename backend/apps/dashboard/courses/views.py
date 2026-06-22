# views.py (apps/dashboard/courses/).
#*Підключення бібліотек.
from django.shortcuts import get_object_or_404
import logging
from django.db import models, transaction
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status, filters
from apps.courses.models import Course, Lesson
from ..permissions import IsAdminOrReadOnly
from ..models import AuditLog
from .serializers import (
    CourseListSerializer, 
    CourseDetailSerializer, 
    CourseCreateUpdateSerializer,
    LessonSerializer
)


#Клас пагінації для курсів.
class AdminCoursePagination (PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 50

#Клас для керування курсами в адмінці.
class CourseViewSet (viewsets.ModelViewSet):
    """ViewSet для керування курсами в адмінці"""
    queryset = Course.objects.select_related ("author").prefetch_related ("lessons").all()
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = AdminCoursePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "category"]
    ordering = ["-created_at"]

    def get_serializer_class (self):
        if self.action == "list":
            return CourseListSerializer
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseCreateUpdateSerializer  #? create, update, partial_update

    def perform_create (self, serializer):
        course = serializer.save (author = self.request.user)
        AuditLog.objects.create (
            admin = self.request.user,
            action = "create",
            target_model = "Course",
            target_id = course.id,
            details = {"title": course.title},
            ip_address = self.request.META.get ("REMOTE_ADDR")
        )

    def perform_destroy (self, instance):
        title = instance.title
        instance_id = instance.id
        instance.delete()

        AuditLog.objects.create (
            admin = self.request.user,
            action = "delete",
            target_model = "Course",
            target_id = instance_id,
            details = {"title": title}
        )

    # ==================== ПОВНЕ ОНОВЛЕННЯ ПОРЯДКУ УРОКІВ ====================
    @action(detail=True, methods=["PUT"], url_path='lessons/reorder')
    def reorder_lessons(self, request, pk=None):
        """Повне оновлення порядку всіх уроків"""
        course = self.get_object()
        lessons_data = request.data

        if not isinstance(lessons_data, list):
            return Response({"type": "error", "message": "Expected a list of lessons"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for item in lessons_data:
                lesson_id = item.get("id")
                new_order = item.get("order")

                if not lesson_id or new_order is None:
                    return Response({"type": "error", "message": "Each lesson must have id and order"}, 
                                  status=status.HTTP_400_BAD_REQUEST)

                Lesson.objects.filter(id=lesson_id, course=course).update(order=new_order)

        # Повертаємо оновлений список уроків
        updated_lessons = Lesson.objects.filter(course=course).order_by('order')
        serializer = LessonSerializer(updated_lessons, many=True)

        return Response({
            "type": "success",
            "message": "Lessons reordered successfully",
            "lessons": serializer.data
        }, status=status.HTTP_200_OK)

#Видалення уроку з курсу.
    @action (detail = True, methods = ["DELETE"], url_path = "lessons/(?P<lesson_id>\\d+)")
    def delete_lesson (self, request, pk = None, lesson_id = None):
        """Видаляє урок з курсу за його ID."""
        course = self.get_object()
        lesson = get_object_or_404 (Lesson, id = lesson_id, course = course)
        lesson.delete()
        # After deletion, ensure orders are contiguous
        try:
            self._force_reorder_lessons(course)
        except Exception:
            logging.getLogger(__name__).exception("Failed to reorder lessons after delete for course %s", course.id)

        return Response ({
            "type": "success",
            "message": f"Lesson with id {lesson_id} deleted successfully"
        }, status = status.HTTP_204_NO_CONTENT)