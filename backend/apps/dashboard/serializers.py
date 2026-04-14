# serializers.py (admin).
from rest_framework import serializers
from django.contrib.auth.models import User
from apps.users.models import Profile
from .models import BannedUser

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
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "is_staff",
            "profile"
        ]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
            "username": {"required": False},
            "email": {"required": False},
            "is_staff": {"required": False},
            "profile": {"required": False}
        }

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

#Клас серелізатора для бану користувача.
class AdminBanUserSerializer (serializers.ModelSerializer):
    """Серіалізатор для бану користувача"""
    user = AdminUserUpdateSerializer (read_only = True) #? або UserSerializer якщо треба деталі.
    banned_by = serializers.StringRelatedField()

    class Meta:
        model = BannedUser
        fields = ["id", "user", "banned_by", "reason", "is_permanent", "banned_at"]
        read_only_fields = ["id", "banned_at"]

#Клас серелізатора для відображення списку користувачів в адмінці.
class AdminUserListSerializer (serializers.ModelSerializer):
    """Серіалізатор для відображення списку користувачів в адмінці"""
    profile = AdminProfileUpdateSerializer (read_only = True)
    ban_info = AdminBanUserSerializer (read_only = True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "is_staff",
            "is_superuser",
            "date_joined",
            "ban_info",
            "profile"
        ]