# serializers.py (admin).
from rest_framework import serializers
from django.contrib.auth.models import User
from apps.users.models import Profile

#Клас серелізатора профілю.
class AdminProfileUpdateSerializer (serializers.ModelSerializer):
    """Серіалізатор для адмінського редагування профілю"""
    class Meta:
        model = Profile
        fields = [
            "bio", 
            "avatar_url",
            "address",
            "youtube", 
            "linkedin", 
            "twitter", 
            "git",
            "global_rank",
            "total_points",
            "problems_solved",
            "current_streak"
        ]

#Клас серелізатора користувача.
class AdminUserUpdateSerializer (serializers.ModelSerializer):
    """Серіалізатор для адмінського редагування користувача + профілю"""
    profile = AdminProfileUpdateSerializer (required = False)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "is_staff",
            "profile"
        ]

    def update (self, instance, validated_data):
        profile_data = validated_data.pop ("profile", None)
        instance = super().update (instance, validated_data)

        if profile_data and hasattr (instance, "profile"):
            profile_serializer = AdminProfileUpdateSerializer (
                instance.profile, 
                data = profile_data, 
                partial = True
            )
            if profile_serializer.is_valid():
                profile_serializer.save()
        return instance