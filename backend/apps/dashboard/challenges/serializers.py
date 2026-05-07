# serializers.py (apps/dashboard/challenges/).
#*Підключення бібліотек.
from rest_framework import serializers
from apps.task.models import (
    Challenge, CodeChallenge, QuizChallenge, QuizQuestion, QuizAnswer
)

# --- Quiz Answer ---
class QuizAnswerSerializer (serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ["id", "answer_text", "is_correct"]

# --- Quiz Question ---
class QuizQuestionSerializer (serializers.ModelSerializer):
    answers = QuizAnswerSerializer (many = True, read_only = True)

    class Meta:
        model = QuizQuestion
        fields = ["id", "question_text", "order", "answers"]

# --- Code Challenge ---
class CodeChallengeSerializer (serializers.ModelSerializer):
    class Meta:
        model = CodeChallenge
        fields = ["id", "language", "starter_code", "e_input", "e_output"]

# --- Quiz Challenge ---
class QuizChallengeSerializer (serializers.ModelSerializer):
    questions = QuizQuestionSerializer (many = True, read_only = True)

    class Meta:
        model = QuizChallenge
        fields = ["id", "time_limit_minutes", "passing_score", "questions"]

# --- Challenge (Admin) ---
class ChallengeSerializer (serializers.ModelSerializer):
    code_challenge = CodeChallengeSerializer (read_only = True)
    quiz_challenge = QuizChallengeSerializer (read_only = True)

    class Meta:
        model = Challenge
        fields = [
            "id", "author", "title", "description", "tags", "points",
            "difficulty", "c_type", "status", "created_at", "updated_at",
            "code_challenge", "quiz_challenge"
        ]
