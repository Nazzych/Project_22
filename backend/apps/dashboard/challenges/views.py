# views.py (apps/dashboard/challenges/).
#*Підключення бібліотек.
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status, filters
from apps.task.models import Challenge, QuizChallenge, QuizQuestion, QuizAnswer
from ..models import AuditLog
from ..permissions import IsAdminOrReadOnly
from .serializers import ChallengeSerializer


#Клас пагінації для завдань.
class AdminChallengePagination (PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 50

#Клас для керування завданнями в адмінці.
class ChallengeViewSet (viewsets.ModelViewSet):
    """ViewSet для керування завданнями в адмінці"""
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = AdminChallengePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "tags"]
    ordering = ["-created_at"]

    def perform_create (self, serializer):
        challenge = serializer.save (author = self.request.user)
        AuditLog.objects.create (
            admin = self.request.user,
            action = "create",
            target_model = "Challenge",
            target_id = challenge.id,
            details = {"title": challenge.title, "c_type": challenge.c_type},
            ip_address = self.request.META.get ("REMOTE_ADDR")
        )

    def perform_update (self, serializer):
        challenge = serializer.save()
        AuditLog.objects.create (
            admin = self.request.user,
            action = "update",
            target_model = "Challenge",
            target_id = challenge.id,
            details = {"title": challenge.title, "c_type": challenge.c_type},
            ip_address = self.request.META.get ("REMOTE_ADDR")
        )

    def perform_destroy (self, instance):
        challenge_title = instance.title
        challenge_c_type = instance.c_type
        challenge_id = instance.id
        instance.delete()
        AuditLog.objects.create (
            admin = self.request.user,
            action = "delete",
            target_model = "Challenge",
            target_id = challenge_id,
            details = {"title": challenge_title, "c_type": challenge_c_type},
            ip_address = self.request.META.get ("REMOTE_ADDR")
        )

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