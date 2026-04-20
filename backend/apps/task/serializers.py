# serializers.py (task).
#*Підключення бібліотек.
from rest_framework import serializers
from .models import Challenge, ChallengeProgress

#Клас серелізатора завдання.
class ChellangeSerializer (serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ["id", "title", "points", "description", "tags", "c_type", "difficulty", "status", "created_at", "updated_at"]

#Клас серелізатора завдання для користувача.
class ChellangeProgressSerializer (serializers.ModelSerializer):
    class Meta:
        model = ChallengeProgress
        fields = ["id", "user", "challenge", "status", "submitted_code", "submitted_at", "mentor_feedback", "mentor_score", "completed_at", "attempts"]
