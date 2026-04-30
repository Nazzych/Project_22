from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from core.permissions.permissions import isAuthenticated
from .serializers import CourseSerializer, CourseWithProgressSerializer
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

#.
@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_courses (request):
    courses = Course.objects.exclude (lessons__isnull = True)
    serializer = CourseSerializer (courses, many = True)
    return Response (serializer.data)

#.
@api_view (["POST"])
@permission_classes ([isAuthenticated])
def update_lesson_progress (request, lesson_id):
    """Оновлення статусу урока та перевірка на виконання курсу"""
    user = request.user
    lesson = get_object_or_404 (Lesson, id = lesson_id)

#* === СТАВИМ УРОК ЯК РОЗБЛОКОВАНИЙ Й ВИКОНАНИЙ ===
    progress, _ = UserLessonProgress.objects.get_or_create (
        user = user,
        lesson = lesson,
        defaults = {"is_unlocked": True}
    )

    progress.is_unlocked = True
    progress.is_completed = True
    progress.completed_at = timezone.now()
    progress.save()

#* === РОЗБЛОКУВАННЯ НАСТУПНОГО УРОКУ ===
    next_lesson = Lesson.objects.filter (
        course = lesson.course,
        order = lesson.order + 1
    ).first()

    if next_lesson:
        next_progress, _ = UserLessonProgress.objects.get_or_create (
            user = user,
            lesson = next_lesson,
            defaults = {"is_unlocked": True}
        )
        if not next_progress.is_unlocked:
            next_progress.is_unlocked = True
            next_progress.save()

    return Response ({
        "type": "success",
        "message": "Lesson progress updated",
        "progress": {
            "lesson": lesson.id,
            "is_unlocked": progress.is_unlocked,
            "is_completed": progress.is_completed,
            "completed_at": progress.completed_at
        }
    }, status = status.HTTP_200_OK)
