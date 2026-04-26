# views.py (admin).
#*Підключення бібліотек.
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import TooManyFilesSent
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db import transaction, models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets, status as Statuse
from storage3.exceptions import StorageApiError
from users.permissions import isAuthenticated, IsAdministrator
from apps.task.serializers import ChallengeSerializer
from apps.task.models import Challenge, CodeChallenge, QuizChallenge, ChallengeType, QuizQuestion, QuizAnswer
from apps.forum.serializers import ChannelSerializer
from apps.forum.models import Channel
from apps.courses.models import Course, Lesson
from apps.courses.serializers import CourseSerializer, LessonSerializer
from apps.projects.models import Project
from .permissions import IsAdminOrReadOnly
from .serializers import AdminUserListSerializer, AdminUserUpdateSerializer, AdminProjectListSerializer, AdminProjectUpdateSerializer
from .models import BannedUser
import traceback, json, os, re


@api_view(["POST"])
@permission_classes([IsAdminOrReadOnly])
def add_challenge(request):
    data = request.data 
    
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    tegs = data.get("tegs", "").strip()
    points = data.get("points", "50")
    difficul = data.get("difficul", "medium")
    language = data.get("language", "python")
    status_ = data.get("status", "draft")  # ✅ status - зарезервоване слово
    c_type = data.get("c_type", "code")
    
    e_input = data.get("e_input", "").strip()
    e_output = data.get("e_output", "").strip()
    code = data.get("code", "").strip()
    
    quiz_questions = data.get("quiz_questions", [])
    
    if not title or not description:
        return JsonResponse({
            "type": "warning",
            "message": "Fields 'title' and 'description' are required."
        }, status=Statuse.HTTP_400_BAD_REQUEST)  # ✅ status

    if Challenge.objects.filter(title=title).exists():
        return Response({
            "type": "warning",
            "message": "Challenge with this name already exists. Please rename."
        }, status=Statuse.HTTP_400_BAD_REQUEST)  # ✅ status

    try:
        with transaction.atomic():
            challenge = Challenge.objects.create(
                title=title,
                description=description,
                tags=tegs,
                points=int(points),
                difficulty=difficul,
                c_type=c_type,
                status=status_
            )
            
            if c_type == ChallengeType.CODE:
                CodeChallenge.objects.create(
                    challenge=challenge,
                    language=language,
                    starter_code=code,
                    e_input=e_input,
                    e_output=e_output
                )
            
            elif c_type == ChallengeType.QUIZ:
                quiz_challenge = QuizChallenge.objects.create(challenge=challenge)
                
                # ✅ ПРАВИЛЬНА обробка quiz_questions з фронтенду
                if isinstance(quiz_questions, list):
                    print(f"DEBUG: Processing {len(quiz_questions)} quiz questions")  # DEBUG
                    for idx, q_data in enumerate(quiz_questions, 1):
                        print(f"DEBUG: Question {idx}: {q_data}")  # DEBUG
                        
                        if (isinstance(q_data, dict) and 
                            q_data.get("question_text") and 
                            isinstance(q_data.get("answers"), list) and  # ✅ answers!
                            len(q_data.get("answers", [])) >= 2):
                            
                            question_text = q_data["question_text"].strip()
                            answers_data = q_data.get("answers", [])
                            
                            # ✅ Створюємо питання
                            question = QuizQuestion.objects.create(
                                quiz=quiz_challenge,
                                question_text=question_text,
                                order=idx
                            )
                            
                            # ✅ Створюємо відповіді
                            for answer_data in answers_data:
                                if (isinstance(answer_data, dict) and 
                                    answer_data.get("answer_text")):
                                    
                                    QuizAnswer.objects.create(
                                        question=question,
                                        answer_text=answer_data["answer_text"].strip(),
                                        is_correct=answer_data.get("is_correct", False)
                                    )
                            print(f"DEBUG: Created question {idx} with {len(answers_data)} answers")  # DEBUG
            
            serializer = ChallengeSerializer(challenge)
            return Response({
                "type": "success",
                "message": "Challenge created successfully",
                "challenge": serializer.data
            }, status=Statuse.HTTP_201_CREATED)  # ✅ status

    except ValueError as e:
        print(f"ValueError: {e}")
        return Response({
            "type": "error",
            "message": "Invalid points value"
        }, status=Statuse.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "type": "error",
            "message": f"Server error: {str(e)}"
        }, status=Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PUT", "PATCH"])
@permission_classes([IsAdminOrReadOnly])
def update_challange(request, challenge_id):  # ✅ Правильна назва
    try:
        challenge = Challenge.objects.get(id=challenge_id)
    except Challenge.DoesNotExist:
        return Response({
            "type": "error",
            "message": "Challenge not found"
        }, status=Statuse.HTTP_404_NOT_FOUND)

    data = request.data

    # ✅ Оновлення основних полів Challenge
    challenge.title = data.get("title", challenge.title).strip()
    challenge.description = data.get("description", challenge.description).strip()
    challenge.tags = data.get("tegs", challenge.tags).strip()  # ✅ tags, не tegs
    challenge.points = int(data.get("points", challenge.points))
    challenge.difficulty = data.get("difficul", challenge.difficulty)  # ✅ difficulty
    challenge.c_type = data.get("c_type", challenge.c_type)
    challenge.status = data.get("status", challenge.status)
    challenge.save()

    # ✅ CODE CHALLENGE
    if challenge.c_type == ChallengeType.CODE:
        code_challenge, created = CodeChallenge.objects.get_or_create(
            challenge=challenge,
            defaults={
                'language': data.get("language", "python"),
                'starter_code': data.get("code", ""),
                'e_input': data.get("e_input", ""),
                'e_output': data.get("e_output", "")
            }
        )
        if not created:
            code_challenge.language = data.get("language", code_challenge.language)
            code_challenge.starter_code = data.get("code", code_challenge.starter_code or "")
            code_challenge.e_input = data.get("e_input", code_challenge.e_input or "")
            code_challenge.e_output = data.get("e_output", code_challenge.e_output or "")
            code_challenge.save()

    # ✅ QUIZ CHALLENGE
    elif challenge.c_type == ChallengeType.QUIZ:
        quiz_challenge, created = QuizChallenge.objects.get_or_create(challenge=challenge)
        
        # Видаляємо старі питання
        QuizQuestion.objects.filter(quiz=quiz_challenge).delete()
        
        # Нові питання
        quiz_questions = data.get("quiz_questions", [])
        if isinstance(quiz_questions, list):
            for idx, q_data in enumerate(quiz_questions, 1):
                if (isinstance(q_data, dict) and 
                    q_data.get("question_text") and 
                    isinstance(q_data.get("answers"), list)):
                    
                    question = QuizQuestion.objects.create(
                        quiz=quiz_challenge,
                        question_text=q_data["question_text"].strip(),
                        order=idx
                    )
                    
                    for answer_data in q_data.get("answers", []):
                        if isinstance(answer_data, dict) and answer_data.get("answer_text"):
                            QuizAnswer.objects.create(
                                question=question,
                                answer_text=answer_data["answer_text"].strip(),
                                is_correct=answer_data.get("is_correct", False)
                            )

    serializer = ChallengeSerializer(challenge)  # ✅ Правильний serializer
    return Response({
        "type": "success",
        "message": "Challenge updated successfully",
        "challenge": serializer.data
    }, status=Statuse.HTTP_200_OK)
@api_view (["DELETE"])
@require_http_methods (["DELETE"])
@permission_classes ([IsAdminOrReadOnly])
def delete_challenge (request, challenge_id):
    try:
        Challenge.objects.get (id = int (challenge_id)).delete()
        return Response ({
            "type": "success",
            "message": "Chellange deleted successfully"
        }, status = Statuse.HTTP_200_OK)
    except Challenge.DoesNotExist:
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
    course = get_object_or_404 (Course, id = course_id)
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
    course = get_object_or_404 (Course, id = course_id)

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
    try:
        Course.objects.get (id = int (course_id)).delete()
        return Response ({
            "type": "success",
            "message": "Course deleted successfully"
        }, status = Statuse.HTTP_200_OK)
    except Challenge.DoesNotExist:
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
    users = User.objects.select_related ("profile").all()
    serializer_users = AdminUserListSerializer (users, many = True)
    return Response (serializer_users.data)

@api_view (["PATCH"])
@permission_classes ([IsAdminOrReadOnly])
def update_user (request, user_id):
    user = get_object_or_404 (User, id = user_id)
    if user.is_superuser:
        return Response ({
            "type": "error",
            "message": "You can't manage of the owner this site!"
        }, status = Statuse.HTTP_403_FORBIDDEN)

    serializer = AdminUserUpdateSerializer (user, data = request.data, partial = True)

    if serializer.is_valid():
        serializer.save()
        #? updated_user = serializer.save()
        #? print ("=== DEBUG AFTER SAVE ===")
        #? print ("User fields:", updated_user.first_name, updated_user.last_name)
        #? if hasattr (updated_user, 'profile'):
        #?     print ("Profile bio:", updated_user.profile.bio)
        #?     print ("Profile total_points:", updated_user.profile.total_points)
        return Response ({"type": "success", "message": "User updated successfully"}, status = Statuse.HTTP_200_OK)
    return Response ({
        "type": "error",
        "message": serializer.errors
    }, status = Statuse.HTTP_400_BAD_REQUEST)

#.
@api_view (["DELETE"])
@permission_classes ([IsAdminOrReadOnly])
def delete_user (request, user_id):
    if user_id == request.user.id:
        return Response ({
            "type": "error", 
            "message": "You cannot del yourself"
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    try:
        user = get_object_or_404 (User, id = user_id).delete()
        if user.is_superuser:
            return Response ({
                "type": "error",
                "message": "You can't manage of the owner this site!"
            }, status = Statuse.HTTP_403_FORBIDDEN)

        return Response ({"type": "success", "message": "User deleted successfully"}, status = Statuse.HTTP_204_NO_CONTENT)
    except Exception as e:
        print ("Error deleting user:", str (e))
        return Response ({
            "type": "error",
            "message": "Server error while deleting user"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

#.
@api_view (["POST"])
@permission_classes ([IsAdminOrReadOnly])
def ban_user (request, user_id):
    user = get_object_or_404 (User, id = user_id)
    if user.is_superuser:
        return Response ({
            "type": "error",
            "message": "You can't manage of the owner this site!"
        }, status = Statuse.HTTP_403_FORBIDDEN)

    if user.id == request.user.id:
        return Response ({
            "type": "error", 
            "message": "You cannot ban yourself"
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    try:
        #? Перевіряємо, чи вже забанений.
        ban = BannedUser.objects.filter (user = user).first()

        if ban:
            #? Розбанити.
            ban.delete()
            return Response ({
                "type": "success",
                "message": f"User @{user.username} has been unbanned successfully"
            }, status = Statuse.HTTP_200_OK)
        else:
            #? Забанити.
            data = request.data
            BannedUser.objects.create (
                user = user,
                banned_by = request.user,
                reason = data.get ("reason", "").strip(),
                is_permanent = True
            )
            return Response ({
                "type": "success",
                "message": f"User @{user.username} has been banned successfully"
            }, status = Statuse.HTTP_200_OK)

    except Exception as e:
        print ("Error banning/unbanning user:", str (e))
        return Response ({
            "type": "error",
            "message": "Server error while processing ban"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

#.
@api_view (["GET"])
@permission_classes ([IsAdminOrReadOnly])
def get_projects (request):
    projects = Project.objects.all()
    serializer = AdminProjectListSerializer (projects, many = True)
    return Response ({"type": "success", "projects": serializer.data})

#.
@api_view (["PUT", "PATCH"])
@permission_classes ([IsAdminOrReadOnly])
def update_project (request, project_id):
    project = get_object_or_404 (Project, id = project_id)
    serializer = AdminProjectUpdateSerializer (project, data = request.data, partial = True)
    if serializer.is_valid():
        serializer.save()
        return Response ({
            "type": "success",
            "message": "Project updated successfully by admin",
            "project": serializer.data
        }, status = Statuse.HTTP_200_OK)

    return Response ({
        "type": "error",
        "message": "Validation failed",
        "errors": serializer.errors
    }, status = Statuse.HTTP_400_BAD_REQUEST)

#.
@api_view (["DELETE"])
@permission_classes ([IsAdminOrReadOnly])
def delete_project (request, project_id):
    try:
        get_object_or_404 (Project, id = project_id).delete()
        return Response ({
            "type": "success",
            "message": "Project deleted successfully by admin",
        }, status = Statuse.HTTP_200_OK)
    except:
        return Response ({
            "type": "error",
            "message": "Server error while deleting project!",
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)