# views.py (apps/dashboard/courses/).
#*Підключення бібліотек.
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from apps.courses.models import Course, Lesson
from ..permissions import IsAdminOrReadOnly
from .serializers import (
    CourseListSerializer, 
    CourseDetailSerializer, 
    CourseCreateUpdateSerializer,
    LessonSerializer
)


#Клас для керування курсами в адмінці.
class CourseViewSet (viewsets.ModelViewSet):
    """ViewSet для керування курсами в адмінці"""
    queryset = Course.objects.select_related ("author").prefetch_related ("lesson_set")
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class (self):
        if self.action in ["list"]:
            return CourseListSerializer
        if self.action in ["retrieve"]:
            return CourseDetailSerializer
        return CourseCreateUpdateSerializer  #? create, update, partial_update

    def perform_create (self, serializer):
        serializer.save (author = self.request.user)

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
            "message": f"{len (created_lessons)} lessons created",
            "lessons": created_lessons
        }, status = status.HTTP_201_CREATED)