# views.py (apps/dashboard/courses/).
#*Підключення бібліотек.
from django.shortcuts import get_object_or_404
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
    # ==================== СТВОРЕННЯ НОВИХ УРОКІВ ====================
    @action(detail=True, methods=["POST"], url_path='lessons')
    def lessons(self, request, pk=None):
        """Створення нових уроків"""
        course = self.get_object()
        lessons_data = request.data

        if not isinstance(lessons_data, list):
            return Response({"type": "error", "message": "Expected a list of lessons"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        result = []
        with transaction.atomic():
            max_order = Lesson.objects.filter(course=course).aggregate(
                models.Max('order')
            )['order__max'] or 0

            current_order = max_order + 1

            for item in lessons_data:
                item.pop('id', None)   # важливо при створенні

                serializer = LessonSerializer(data=item)
                if serializer.is_valid():
                    serializer.save(course=course, order=current_order)
                    result.append(serializer.data)
                    current_order += 1
                else:
                    return Response({"type": "error", "errors": serializer.errors}, 
                                  status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "type": "success",
            "message": f"{len(result)} lessons created successfully",
            "lessons": result
        }, status=status.HTTP_201_CREATED)

    # ==================== ОНОВЛЕННЯ УРОКІВ ====================
    @action(detail=True, methods=["PUT"], url_path='lessons-update')
    def update_lessons(self, request, pk=None):
        """Оновлення уроків + безпечна зміна порядку"""
        course = self.get_object()
        lessons_data = request.data

        if not isinstance(lessons_data, list):
            return Response({"type": "error", "message": "Expected a list of lessons"}, 
                            status=status.HTTP_400_BAD_REQUEST)

        result = []
        with transaction.atomic():
            for item in lessons_data:
                lesson_id = item.get("id")
                if not lesson_id:
                    return Response({
                        "type": "error",
                        "message": "Field 'id' is required for update"
                    }, status=status.HTTP_400_BAD_REQUEST)

                lesson = get_object_or_404(Lesson, id=lesson_id, course=course)

                # Оновлюємо урок БЕЗ order (щоб уникнути конфлікту)
                update_data = {k: v for k, v in item.items() if k != 'order'}
                serializer = LessonSerializer(lesson, data=update_data, partial=True)

                if serializer.is_valid():
                    serializer.save()
                    result.append(serializer.data)
                else:
                    return Response({"type": "error", "errors": serializer.errors}, 
                                  status=status.HTTP_400_BAD_REQUEST)

            # Після всіх змін — повністю перераховуємо порядок
            self._force_reorder_lessons(course)

        return Response({
            "type": "success",
            "message": f"{len(result)} lessons updated successfully",
            "lessons": result
        }, status=status.HTTP_200_OK)


    def _force_reorder_lessons(self, course):
        """Примусово перераховує порядок усіх уроків (1, 2, 3...)"""
        lessons = list(course.lessons.all().order_by('order'))
        
        for new_order, lesson in enumerate(lessons, start=1):
            if lesson.order != new_order:
                # Raw update — обходимо save() моделі повністю
                Lesson.objects.filter(id=lesson.id).update(order=new_order)

#Видалення уроку з курсу.
    @action (detail = True, methods = ["DELETE"], url_path = "lessons/(?P<lesson_id>\\d+)")
    def delete_lesson (self, request, pk = None, lesson_id = None):
        """Видаляє урок з курсу за його ID."""
        course = self.get_object()
        lesson = get_object_or_404 (Lesson, id = lesson_id, course = course)
        lesson.delete()

        return Response ({
            "type": "success",
            "message": f"Lesson with id {lesson_id} deleted successfully"
        }, status = status.HTTP_204_NO_CONTENT)