# serializers.py (user).
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["address", "youtube", "linkedin", "twitter", "git", "bio", "avatar_url", "global_rank", "total_points", "problems_solved", "current_streak"]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username", "email", "date_joined", "is_staff", "profile"]
