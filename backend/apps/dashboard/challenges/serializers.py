# serializers.py (apps/dashboard/challenges/).
#*Підключення бібліотек.
from django.db import transaction
from rest_framework import serializers
from apps.task.models import (
    Challenge, CodeChallenge, QuizChallenge, QuizQuestion, QuizAnswer, ChallengeType
)


# --- Quiz Answer ---
class QuizAnswerSerializer (serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ["id", "answer_text", "is_correct"]
        read_only_fields = ["id"]

# --- Quiz Question ---
class QuizQuestionSerializer (serializers.ModelSerializer):
    answers = QuizAnswerSerializer (many = True)

    class Meta:
        model = QuizQuestion
        fields = ["id", "question_text", "order", "answers"]
        read_only_fields = ["id"]

# --- Code Challenge ---
class CodeChallengeSerializer (serializers.ModelSerializer):
    class Meta:
        model = CodeChallenge
        fields = ["id", "starter_code", "e_input", "e_output"]
        read_only_fields = ["id"]

# --- Quiz Challenge ---
class QuizChallengeSerializer (serializers.ModelSerializer):
    questions = QuizQuestionSerializer (many = True)

    class Meta:
        model = QuizChallenge
        fields = ["id", "time_limit_minutes", "passing_score", "questions"]
        read_only_fields = ["id"]

# --- Challenge (Admin) ---
class ChallengeSerializer (serializers.ModelSerializer):
    quiz_questions = serializers.JSONField (required = False, write_only = True)
    code = serializers.CharField(required=False, write_only=True, allow_blank=True)
    e_input = serializers.CharField(required=False, write_only=True, allow_blank=True)
    e_output = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = Challenge
        fields = [
            "id", "author", "title", "description", "tags", "language", "points",
            "difficulty", "c_type", "status", "created_at", "updated_at", "quiz_questions", "code", "e_input", "e_output"
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at"]
        extra_kwargs = {
            "quiz_questions": {"required": False},
            "code": {"required": False},
            "e_input": {"required": False},
            "e_output": {"required": False}
        }

    def create (self, validated_data):
        quiz_questions = validated_data.pop ("quiz_questions", None)
        code = validated_data.pop ("code", None)
        e_input = validated_data.pop ("e_input", None)
        e_output = validated_data.pop ("e_output", None)

        with transaction.atomic():
            challenge = Challenge.objects.create (**validated_data)
            if challenge.c_type == ChallengeType.CODE:
                if self._has_code_data (code, e_input, e_output):
                    self._save_nested (challenge, code, e_input, e_output)
            elif challenge.c_type == ChallengeType.QUIZ:
                if self._has_quiz_data (quiz_questions):
                    self._save_nested (challenge, quiz_questions)
        return challenge

    def update (self, instance, validated_data):
        quiz_questions = validated_data.pop ("quiz_questions", None)
        code = validated_data.pop ("code", None)
        e_input = validated_data.pop ("e_input", None)
        e_output = validated_data.pop ("e_output", None)

        with transaction.atomic():
            instance = super().update (instance, validated_data)
            if instance.c_type == ChallengeType.CODE:
                if self._has_code_data (code, e_input, e_output):
                    self._save_nested (instance, code, e_input, e_output)
            elif instance.c_type == ChallengeType.QUIZ:
                if self._has_quiz_data (quiz_questions):
                    self._save_nested (instance, quiz_questions)
        return instance

# ====================== Допоміжні методи ======================

    def _has_code_data (self, code, e_input, e_output):
        """Перевіряє, чи є хоч якісь дані для CodeChallenge"""
        return bool (
            (code and str (code).strip()) or
            (e_input and str (e_input).strip()) or
            (e_output and str (e_output).strip())
        )

    def _has_quiz_data (self, quiz_questions):
        """Перевіряє, чи є реальні питання в квізі"""
        if not isinstance (quiz_questions, list):
            return False
        return len (quiz_questions) > 0

    def _save_nested (self, challenge = None, code = None, e_input = None, e_output = None, quiz_questions = None):
        """Зберігаємо дані залежно від типу завдання"""
        if challenge.c_type == ChallengeType.CODE:
            if self._has_code_data (code, e_input, e_output):
                print ("→ Saving CODE Challenge data")
                print (f"→ Updating/Creating CodeChallenge for Challenge ID {challenge.id} with code: {code}, e_input: {e_input}, e_output: {e_output}")
                CodeChallenge.objects.update_or_create (
                    challenge = challenge,
                    defaults = {
                        "starter_code": code or None,
                        "e_input": e_input or None,
                        "e_output": e_output or None
                    }
                )

        elif challenge.c_type == ChallengeType.QUIZ and isinstance(quiz_questions, list):
            print(f"→ Saving QUIZ with {len(quiz_questions)} questions")
            QuizChallenge.objects.filter(challenge=challenge).delete()
            quiz_challenge = QuizChallenge.objects.create(challenge=challenge)

            for idx, q_data in enumerate(quiz_questions, 1):
                question = QuizQuestion.objects.create(
                    quiz=quiz_challenge,
                    question_text=q_data.get("question_text", ""),
                    order=idx
                )
                for ans in q_data.get("answers", []):
                    QuizAnswer.objects.create(
                        question=question,
                        answer_text=ans.get("answer_text", ""),
                        is_correct=ans.get("is_correct", False)
                    )