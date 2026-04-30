# serializers.py (task).
#*Підключення бібліотек.
from rest_framework import serializers
from .models import Challenge, CodeChallenge, QuizChallenge, QuizAnswer, QuizQuestion, UserChallengeProgress


#Клас серелізатора завдання для користувача.
class ChallengeProgressSerializer (serializers.ModelSerializer):
    class Meta:
        model = UserChallengeProgress
        fields = ["id", "user", "challenge", "status", "submitted_code", "submitted_at", "mentor_feedback", "mentor_score", "completed_at", "attempts", "selected_answers"]


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ["id", "answer_text", "is_correct"]

class QuizQuestionSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ["id", "question_text", "order", "answers"]

class QuizChallengeSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizChallenge
        fields = ["id", "time_limit_minutes", "passing_score", "questions"]

class CodeChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeChallenge
        fields = ["id", "language", "starter_code", "e_input", "e_output"]

#Клас серелізатора завдання.
class ChallengeSerializer(serializers.ModelSerializer):
    code_challenge = CodeChallengeSerializer(read_only=True)
    quiz_challenge = QuizChallengeSerializer(read_only=True)
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "id", "title", "description", "tags", "points",
            "difficulty", "c_type", "status", "created_at", "updated_at",
            "code_challenge", "quiz_challenge", "user_progress"
        ]

    def get_user_progress (self, obj):
        """Повертає прогрес тільки для поточного залогіненого користувача"""
        user = self.context.get ("user")
        if not user or not user.is_authenticated:
            return None
        progress = UserChallengeProgress.objects.filter (
            user = user, 
            challenge = obj
        ).first()
        if progress:
            return ChallengeProgressSerializer (progress).data
        return None