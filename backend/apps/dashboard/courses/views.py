# views.py (apps/dashboard/courses/).
#*Підключення бібліотек.
from django.shortcuts import get_object_or_404
from django.db import transaction
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

#Додавання уроків до курсу
    @action (detail = True, methods = ["POST"])
    def lessons (self, request, pk = None):
        course = self.get_object()
        lessons_data = request.data

        if not isinstance (lessons_data, list):
            return Response ({"type": "error", "message": "Expected a list of lessons"}, status = status.HTTP_400_BAD_REQUEST)

        created_lessons = []
        with transaction.atomic():
            for item in lessons_data:
                serializer = LessonSerializer (data = item)
                if serializer.is_valid():
                    serializer.save (course = course)
                    created_lessons.append (serializer.data)
                else:
                    return Response ({"type": "error", "errors": serializer.errors}, status = status.HTTP_400_BAD_REQUEST)

        return Response ({
            "type": "success",
            "message": f"{len (created_lessons)} lessons created/updated successfully",
            "lessons": created_lessons
        }, status = status.HTTP_201_CREATED)