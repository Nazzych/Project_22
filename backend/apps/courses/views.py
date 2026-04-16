from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import TooManyFilesSent
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets, status
from storage3.exceptions import StorageApiError
from users.permissions import isAuthenticated
from .serializers import CourseSerializer, LessonSerializer, CourseWithProgressSerializer
from .models import Course, Lesson, UserLessonProgress


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
    serializer = CourseWithProgressSerializer (
        course, 
        context = {"user": request.user}
    )

    return Response ({
        "course": serializer.data,
        "lessons":serializer.data.get ("lessons", [])
    })

#TODO: courses = Course.objects.exclude (lessons__isnull = True)course_id
@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_courses (request):
    courses = Course.objects.prefetch_related ("lessons").all()
    serializer = CourseSerializer (courses, many = True, context = {"user": request.user})
    return Response (serializer.data)

#.
@api_view (["POST"])
@permission_classes ([isAuthenticated])
def update_lesson_progress(request, lesson_id):
    """Оновлення статусу урока та перевірка на виконання курсу"""
    user = request.user
    lesson = get_object_or_404(Lesson, id=lesson_id)

    progress, created = UserLessonProgress.objects.get_or_create(
        user=user,
        lesson=lesson,
        defaults={"is_unlocked": True}
    )

    progress.is_unlocked = True
    progress.is_completed = True
    progress.completed_at = timezone.now()
    progress.save()

    return Response({
        "type": "success",
        "message": "Lesson progress updated",
        "progress": {
            "lesson": lesson.id,
            "is_unlocked": progress.is_unlocked,
            "is_completed": progress.is_completed,
            "completed_at": progress.completed_at
        }
    }, status=status.HTTP_200_OK)
