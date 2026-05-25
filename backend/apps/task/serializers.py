# serializers.py (task).
#*Підключення бібліотек.
from rest_framework import serializers
from .models import Challenge, CodeChallenge, QuizChallenge, QuizAnswer, QuizQuestion, UserChallengeProgress


#Клас серелізатора завдання для користувача.
class UserChallengeProgressSerializer (serializers.ModelSerializer):
    class Meta:
        model = UserChallengeProgress
        fields = ["id", "user", "challenge", "status", "submitted_code", "submitted_at", "mentor_feedback", "mentor_score", "completed_at", "attempted_at", "attempts", "selected_answers"]

#Клас серелізатора відповіді на питання вікторини.
class QuizAnswerSerializer (serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ["id", "answer_text", "is_correct"]

#Клас серелізатора питання вікторини.
class QuizQuestionSerializer (serializers.ModelSerializer):
    answers = QuizAnswerSerializer (many = True, read_only = True)
    answers_count = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = ["id", "question_text", "order", "answers", "answers_count"]

    def get_answers_count (self, obj):
        return obj.answers.count()

#Клас серелізатора завдання вікторини.
class QuizChallengeSerializer (serializers.ModelSerializer):
    questions = QuizQuestionSerializer (many = True, read_only = True)

    class Meta:
        model = QuizChallenge
        fields = ["id", "time_limit_minutes", "passing_score", "questions"]

#Клас серелізатора завдання коду.
class CodeChallengeSerializer (serializers.ModelSerializer):
    class Meta:
        model = CodeChallenge
        fields = ["id", "starter_code", "e_input", "e_output"]

#Клас серелізатора завдання.
class ChallengeSerializer (serializers.ModelSerializer):
    code_challenge = CodeChallengeSerializer (read_only = True)
    quiz_challenge = QuizChallengeSerializer (read_only = True)
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "id", "author", "title", "description", "tags", "points",
            "difficulty", "language", "c_type", "status", "created_at", "updated_at",
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
            return UserChallengeProgressSerializer (progress).data
        return None