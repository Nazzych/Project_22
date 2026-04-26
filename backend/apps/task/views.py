from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import TooManyFilesSent
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets, status
from users.permissions import isAuthenticated
from .models import Challenge, ChallengeProgress, ChallengeType, UserChallengeProgress
from .serializers import ChallengeSerializer


@api_view (["GET"])
@permission_classes ([isAuthenticated])
def challenges (request):
    chellanges = Challenge.objects.all()
    serializer = ChallengeSerializer (chellanges, many = True, context={'user': request.user})
    return Response (serializer.data)

@api_view (["GET"])
@permission_classes ([isAuthenticated])
def challenge_detail (request, challenge_id):
    challenge = get_object_or_404 (Challenge, id = challenge_id)
    serializer = ChallengeSerializer (challenge, context={'user': request.user})
    return Response (serializer.data)

@api_view(["POST"])
@permission_classes([isAuthenticated])
def submit_quiz(request, challenge_id):
    """Подача відповідей на Quiz"""
    challenge = get_object_or_404(Challenge, id=challenge_id, c_type="quiz")

    if not hasattr(challenge, 'quiz_challenge') or not challenge.quiz_challenge:
        return Response({"error": "This is not a quiz challenge"}, status=status.HTTP_400_BAD_REQUEST)

    quiz_challenge = challenge.quiz_challenge
    user = request.user
    answers_data = request.data.get("answers", {})   # формат: {"48": 0, "49": 2, ...}

    print("Received answers_data:", answers_data)

    questions = list(quiz_challenge.questions.all().order_by('order'))
    total_questions = len(questions)

    if total_questions == 0:
        return Response({"error": "No questions in this quiz"}, status=status.HTTP_400_BAD_REQUEST)

    correct_count = 0
    detailed_results = []

    for question in questions:
        q_id_str = str(question.id)
        user_answer_idx = answers_data.get(q_id_str)

        if user_answer_idx is None:
            detailed_results.append({
                "question_id": question.id,
                "is_correct": False,
                "user_answer_index": None
            })
            continue

        try:
            user_answer_idx = int(user_answer_idx)
        except (ValueError, TypeError):
            return Response({"error": f"Invalid answer for question {question.id}"}, status=status.HTTP_400_BAD_REQUEST)

        answers_list = list(question.answers.all())

        is_correct = False
        if 0 <= user_answer_idx < len(answers_list):
            selected_answer = answers_list[user_answer_idx]
            is_correct = selected_answer.is_correct

        if is_correct:
            correct_count += 1

        detailed_results.append({
            "question_id": question.id,
            "is_correct": is_correct,
            "user_answer_index": user_answer_idx
        })

    score_percent = round((correct_count / total_questions) * 100) if total_questions > 0 else 0
    passing_score = getattr(quiz_challenge, 'passing_score', 70) or 70
    passed = score_percent >= passing_score

    # === Оновлюємо прогрес користувача ===
    progress, _ = UserChallengeProgress.objects.get_or_create(
        user=user,
        challenge=challenge
    )

    progress.attempts += 1
    progress.selected_answers = answers_data
    progress.current_question_index = 0

    if passed:
        progress.status = ChallengeProgress.COMPLETED
        # progress.completed_at = timezone.now()

        # Нараховуємо очки
        if hasattr(user, 'profile') and user.profile:
            user.profile.total_points = (getattr(user.profile, 'total_points', 0) or 0) + (challenge.points or 0)
            user.profile.save()
    else:
        progress.status = ChallengeProgress.FAIL

    progress.save()

    return Response({
        "success": True,
        "score": score_percent,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "passed": passed,
        "passing_score": passing_score,
        "status": progress.status,
        "detailed_results": detailed_results,
        "message": f"You got {correct_count}/{total_questions} correct ({score_percent}%)"
    })