# serializers.py (task).
#*Підключення бібліотек.
from rest_framework import serializers
from .models import Challenge, ChallengeProgress

#Клас серелізатора завдання.
class ChellangeSerializer (serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ["id", "title", "points", "description", "tegs", "e_input", "e_output", "c_type", "code", "difficul", "language", "status", "created_at", "updated_at"]

#Клас серелізатора завдання для користувача.
class ChellangeProgressSerializer (serializers.ModelSerializer):
    class Meta:
        model = ChallengeProgress
        fields = ["id", "user", "challenge", "status", "submitted_code", "submitted_at", "mentor_feedback", "mentor_score", "completed_at", "attempts"]
