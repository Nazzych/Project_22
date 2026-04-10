# views.py (admin).
#*Підключення бібліотек.
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import TooManyFilesSent
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets, status as Statuse
from storage3.exceptions import StorageApiError
from users.permissions import isAuthenticated, IsAdministrator
from apps.task.serializers import ChellangeSerializer
from apps.task.models import Challange
from apps.forum.serializers import ChannelSerializer
from apps.forum.models import Channel
from apps.courses.models import Course, Lesson
from apps.courses.serializers import CourseSerializer, LessonSerializer
from apps.users.models import Profile
from apps.users.serializers import UserSerializer
from .permissions import IsAdminOrReadOnly
from .serializers import AdminUserUpdateSerializer
import traceback, json, os, re


@api_view (["POST"])
@require_http_methods (["POST"])
@permission_classes ([IsAdminOrReadOnly])
def add_challenge (request):
    print ("=== DEBUG: POST request to add_challenge ===")
    print ("POST data:", request.POST)
    print ("FILES:", request.FILES)

    data = request.data
    title = data.get ("title", "").strip()
    description = data.get ("description", "").strip()
    tegs = data.get ("tegs", "").strip()
    points = data.get ("points", "")
    difficul = data.get ("difficul", "medium")
    language = data.get ("language", "python")
    e_input = data.get ("e_input", "").strip()
    e_output = data.get ("e_output", "").strip()
    code = data.get ("code", "").strip()

    if not title or not description:
        return JsonResponse ({
            "type": "warning",
            "message": "Fields \"title\" and \"description\" requaried."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    if Challange.objects.filter (title = title).exists():
        return Response ({
            "type": "warning",
            "message": "Challange exist with this name. Pleace rename."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            challenge = Challange.objects.create (
                title = title,
                description = description,
                tegs = tegs,
                status = False,
                points = int (points) if points.isdigit() else 10,
                difficul = difficul,
                language = language,
                e_input = e_input,
                e_output = e_output,
                code = code,
            )

        serializer = ChellangeSerializer (challenge)
        return Response ({
            "type": "success",
            "message": "Chellane created successfully",
            "challenge": serializer.data
        }, status = Statuse.HTTP_201_CREATED)
    except Exception as e:
        print ("Error creating chellange:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["PUT"])
@permission_classes ([IsAdminOrReadOnly])
def update_challange (request, challenge_id):
    if not challenge_id:
        return Response ({
            "type": "error",
            "message": "Not provided <challenge_id>."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    challenge = get_object_or_404 (Challange, id = challenge_id)
    if not challenge:
        return Response ({
            "type": "error",
            "message": f"Not finded the challenge by ID - {challenge_id}."
        }, status = Statuse.HTTP_404_NOT_FOUND)

    data = request.data
    title = data.get ("title", "").strip()
    description = data.get ("description", "").strip()
    tegs = data.get ("tegs", "").strip()
    points = data.get ("points", "")
    difficul = data.get ("difficul", "medium")
    language = data.get ("language", "python")
    e_input = data.get ("e_input", "").strip()
    e_output = data.get ("e_output", "").strip()
    code = data.get ("code", "").strip()

    if not title or not description:
        return JsonResponse ({
            "type": "warning",
            "message": "Fields \"title\" and \"description\" requaried."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    if Challange.objects.filter (title = title).exclude  ( id=challenge.id).exists():
        return Response ({
            "type": "warning",
            "message": "Challange exist with this name. Pleace rename."
        }, status = Statuse.HTTP_400_BAD_REQUEST)
    
    try:
        if title:
            challenge.title = title
        if description:
            challenge.description = description
        if tegs:
            challenge.tegs = tegs
        if points is not None:
            challenge.points = int(points) if str(points).isdigit() else challenge.points
        if difficul:
            challenge.difficul = difficul
        if language:
            challenge.language = language
        if e_input:
            challenge.e_input = e_input
        if e_output:
            challenge.e_output = e_output
        if code:
            challenge.code = code
        challenge.save()

        serializer = ChellangeSerializer (challenge)
        return Response ({
            "type": "success",
            "message": "Challange updated successfuly",
            "challenge": serializer.data
        }, status = Statuse.HTTP_200_OK)
    except Exception as e:
        print ("Error updating chellange:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["DELETE"])
@require_http_methods (["DELETE"])
@permission_classes ([IsAdminOrReadOnly])
def delete_challenge (request, challenge_id):
    if not challenge_id:
        return JsonResponse ({
            "type": "error",
            "message": "Challenge ID not provided!"
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    try:
        Challange.objects.get (id = int (challenge_id)).delete()
        return Response ({
            "type": "success",
            "message": "Chellange deleted successfully"
        }, status = Statuse.HTTP_200_OK)
    except Challange.DoesNotExist:
        return Response ({
            "type": "error",
            "message": "Challenge not found"
        }, status = Statuse.HTTP_404_NOT_FOUND)
    except Exception as e:
        print ("Error deleting chellange:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)


#.
@api_view (["GET"])
@require_http_methods (["GET"])
@permission_classes ([IsAdminOrReadOnly])
def get_unupproved_channels (reguest):
    try:
        channels = Channel.objects.filter (is_approved = False)
        serializer = ChannelSerializer (channels, many = True)
        return Response (serializer.data)
    except Channel.DoesNotExist:
        return Response ({
            "type": "error",
            "message": "Channels not found"
        }, status = Statuse.HTTP_404_NOT_FOUND)
    except Exception as e:
        print ("Error geting channels:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["PUT"])
@require_http_methods (["PUT"])
@permission_classes ([IsAdminOrReadOnly])
def approve_channel (request, channel_id):
    try:
        channel = Channel.objects.get (id = int (channel_id))
        channel.is_approved = True
        channel.save()

        return Response ({
            "type": "success",
            "message": "Challenge approved successfully"
        }, status = Statuse.HTTP_200_OK)
    except Channel.DoesNotExist:
        return Response ({
            "type": "error",
            "message": "Challenge not found"
        }, status = Statuse.HTTP_404_NOT_FOUND)
    except Exception as e:
        print ("Error approving channel:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["PUT"])
@require_http_methods (["PUT"])
@permission_classes ([IsAdminOrReadOnly])
def reject_channel (request, channel_id):
    try:
        channel = Channel.objects.get (id = int (channel_id))
        channel.delete()

        return Response ({
            "type": "success",
            "message": "Challenge rejected successfully"
        }, status = Statuse.HTTP_200_OK)
    except Channel.DoesNotExist:
        return Response ({
            "type": "error",
            "message": "Challenge not found"
        }, status = Statuse.HTTP_404_NOT_FOUND)
    except Exception as e:
        print ("Error rejecting channel:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["GET"])
@permission_classes ([IsAdminOrReadOnly])
def get_courses (request):
    courses = Course.objects.all()
    serializer = CourseSerializer (courses, many = True)
    return Response (serializer.data)

@api_view (["GET"])
@permission_classes ([IsAdminOrReadOnly])
def get_course (request, course_id):
    if not course_id:
        return Response ({
            "type": "error",
            "message": "Not provided <course_id>."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    course = get_object_or_404 (Course, id = course_id)
    if not course:
        return Response ({
            "type": "error",
            "message": f"Not finded the course by ID - {course_id}."
        }, status = Statuse.HTTP_404_NOT_FOUND)

    serializer = CourseSerializer (course)
    return Response (serializer.data)


@api_view (["POST"])
@permission_classes ([IsAdminOrReadOnly])
def add_course (request):
    data = request.data
    title = data.get ("title", "")
    description = data.get ("description", "")
    tegs = data.get ("tegs", "")
    level = data.get ("level", "")
    category = data.get ("category", "")
    points = data.get ("points", "")
    image = data.get ("image", "")

    if not title or not description:
        return JsonResponse ({
            "type": "warning",
            "message": "Fields \"title\" and \"description\" is required."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    if Course.objects.filter (title = title).exists():
        return Response ({
            "type": "warning",
            "message": "Course exist with this title. Please rename."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            curse = Course.objects.create (
                author = request.user,
                description = description,
                title = title,
                tegs = tegs,
                level = level,
                category = category,
                points = points,
                image = image
            )

        serializer = CourseSerializer (curse)
        return Response ({
            "type": "success",
            "message": "Course created successfully",
            "course": serializer.data
        }, status = Statuse.HTTP_201_CREATED)
    except Exception as e:
        print ("Error creating curse:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["PUT"])
@permission_classes ([IsAdminOrReadOnly])
def edit_course (request, course_id):
    if not course_id:
        return Response ({
            "type": "error",
            "message": "Not provided <course_id>."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    course = get_object_or_404 (Course, id = course_id)
    if not course:
        return Response ({
            "type": "error",
            "message": f"Not finded the course by ID - {course_id}."
        }, status = Statuse.HTTP_404_NOT_FOUND)

    data = request.data
    title = data.get ("title", "").strip()
    description = data.get ("description", "").strip()
    tegs = data.get ("tegs", "").strip()
    points = data.get ("points", "")
    level = data.get ("level", "")
    category = data.get ("category", "")
    image = data.get ("image", "")

    if not title or not description:
        return JsonResponse ({
            "type": "warning",
            "message": "Fields \"title\" and \"description\" requaried."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    if Course.objects.filter (title = title).exclude  ( id=course.id).exists():
        return Response ({
            "type": "warning",
            "message": "Course exist with this name. Pleace rename."
        }, status = Statuse.HTTP_400_BAD_REQUEST)
    
    try:
        if title:
            course.title = title
        if description:
            course.description = description
        if tegs:
            course.tegs = tegs
        if points is not None:
            course.points = int (points) if str (points).isdigit() else course.points
        if level:
            course.level = level
        if category:
            course.category = category
        if image:
            course.image = image
        course.save()

        serializer = CourseSerializer (course)
        return Response ({
            "type": "success",
            "message": "Course updated successfuly",
            "course": serializer.data
        }, status = Statuse.HTTP_200_OK)
    except Exception as e:
        print ("Error updating course:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view (["DELETE"])
@require_http_methods (["DELETE"])
@permission_classes ([IsAdminOrReadOnly])
def delete_course (request, course_id):
    if not course_id:
        return JsonResponse ({
            "type": "error",
            "message": "Course ID not provided!"
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    try:
        Course.objects.get (id = int (course_id)).delete()
        return Response ({
            "type": "success",
            "message": "Course deleted successfully"
        }, status = Statuse.HTTP_200_OK)
    except Challange.DoesNotExist:
        return Response ({
            "type": "error",
            "message": "Course not found"
        }, status = Statuse.HTTP_404_NOT_FOUND)
    except Exception as e:
        print ("Error deleting course:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view (["POST"])
@permission_classes ([IsAdminOrReadOnly])
def add_lesson (request, course_id):
    course = get_object_or_404 (Course, id = course_id)

    lessons_data = request.data

    if not isinstance (lessons_data, list):
        return Response ({
            "type": "error",
            "message": "Expected a list of lessons"
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    if not lessons_data:
        return Response ({
            "type": "warning",
            "message": "No lessons provided"
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    created_lessons = []

    try:
        with transaction.atomic():
            for item in lessons_data:
                title = item.get ("title", "").strip()
                content = item.get ("content", "").strip()
                order = item.get ("order")
                url = item.get ("url", "").strip()

                if not title or not content:
                    raise ValueError ("Title and content are required for all lessons")

                if Lesson.objects.filter (course = course, title = title).exists():
                    raise ValueError (f"Lesson with title '{title}' already exists in this course")

                lesson = Lesson.objects.create (
                    course = course,
                    title = title,
                    content = content,
                    order = order or 1,
                    url = url,
                )
                created_lessons.append (lesson)

        serializer = LessonSerializer (created_lessons, many = True)

        return Response ({
            "type": "success",
            "message": f"{len (created_lessons)} lessons created successfully",
            "lessons": serializer.data
        }, status = Statuse.HTTP_201_CREATED)

    except ValueError as ve:
        return Response ({
            "type": "warning",
            "message": str (ve)
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print ("Error creating lessons:", str (e))
        return Response ({
            "type": "error",
            "message": "Server error while creating lessons"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["GET"])
@permission_classes ([IsAdminOrReadOnly])
def get_users (request):
    users = User.objects.all()
    serializer = UserSerializer (users, many = True)
    return Response (serializer.data)

@api_view (["PATCH", "PUT"])
@permission_classes ([IsAdminOrReadOnly])
def update_user (request, user_id):
    if not user_id:
        return Response ({
            "type": "error",
            "message": "Not provided <user_id>."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    user = get_object_or_404 (User, id = user_id)
    serializer = AdminUserUpdateSerializer (user, data = request.data, partial = True)

    if serializer.is_valid():
        updated_user = serializer.save()
        print("=== DEBUG AFTER SAVE ===")
        print("User fields:", updated_user.first_name, updated_user.last_name)
        if hasattr(updated_user, 'profile'):
            print("Profile bio:", updated_user.profile.bio)
            print("Profile total_points:", updated_user.profile.total_points)
        return Response({"type": "success"})
    return Response ({
        "type": "error",
        "message": serializer.errors
    }, status = Statuse.HTTP_400_BAD_REQUEST)