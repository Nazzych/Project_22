from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import TooManyFilesSent
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets, status
from storage3.exceptions import StorageApiError
from users.permissions import isAuthenticated
from .models import Course
from .serializers import CourseSerializer, LessonSerializer


#.
"""
    course = get_object_or_404(Course, pk=pk)

    # якщо курс без уроків
    if not course.lessons.exists():
        # перевірка чи користувач адмін
        if not request.user.is_staff:
            return Response(
                {"detail": "Цей курс ще не має уроків"},
                status=status.HTTP_403_FORBIDDEN
            )

    serializer = CourseSerializer(course)
    return Response(serializer.data)
"""
@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_course (request, course_id):
    if not course_id:
        return Response ({
            "type": "error",
            "message": "Not provided <course_id>."
        }, status = status.HTTP_400_BAD_REQUEST)

    course = get_object_or_404 (Course, id = course_id)
    if not course.lessons.exists() and not request.user.is_staff:
        return Response (
            {"detail": "In this course not lessons"},
            status = status.HTTP_403_FORBIDDEN
        )
    lessons = course.lessons.all()

    return Response ({
        "course": CourseSerializer (course).data,
        "lessons": LessonSerializer (lessons, many = True).data
    })

#TODO: courses = Course.objects.exclude (lessons__isnull = True)course_id
@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_courses (request):
    courses = Course.objects.exclude (lessons__isnull = True)
    serializer = CourseSerializer (courses, many = True)
    return Response (serializer.data)
