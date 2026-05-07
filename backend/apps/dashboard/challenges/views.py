# views.py (apps/dashboard/challenges/).
#*Підключення бібліотек.
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.task.models import Challenge, QuizChallenge, QuizQuestion, QuizAnswer
from ..permissions import IsAdminOrReadOnly
from .serializers import ChallengeSerializer


#Клас для керування завданнями в адмінці.
class ChallengeViewSet (viewsets.ModelViewSet):
    """ViewSet для керування завданнями в адмінці"""
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create (self, serializer):
        serializer.save (author = self.request.user)

    def perform_update (self, serializer):
        serializer.save()

    @action (detail = True, methods = ["post"])
    def add_quiz_questions (self, request, pk = None):
        """Додати питання до квізу"""
        challenge = self.get_object()
        if challenge.c_type != "quiz":
            return Response ({"error": "Not a quiz challenge"}, status = status.HTTP_400_BAD_REQUEST)

        quiz_challenge, _ = QuizChallenge.objects.get_or_create (challenge = challenge)
        quiz_questions = request.data.get ("quiz_questions", [])

        with transaction.atomic():
            QuizQuestion.objects.filter (quiz = quiz_challenge).delete()
            for idx, q_data in enumerate (quiz_questions, 1):
                question = QuizQuestion.objects.create (
                    quiz = quiz_challenge,
                    question_text = q_data ["question_text"].strip(),
                    order = idx
                )
                for answer_data in q_data.get ("answers", []):
                    QuizAnswer.objects.create (
                        question = question,
                        answer_text = answer_data ["answer_text"].strip(),
                        is_correct = answer_data.get ("is_correct", False)
                    )
        return Response ({"success": f"{len (quiz_questions)} questions added"})