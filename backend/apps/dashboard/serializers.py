# serializers.py (admin).
#*Підключення бібліотек.
from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.users.models import Profile
from apps.projects.models import Project
from .models import BannedUser

#*Отримання користувача.
User = get_user_model()


#Клас серелізатора для бану користувача.
class AdminBanUserSerializer (serializers.ModelSerializer):
    """Серіалізатор для бану користувача"""
    user = AdminUserUpdateSerializer (read_only = True) #? або UserSerializer якщо треба деталі.
    banned_by = serializers.StringRelatedField (read_only = True)

    class Meta:
        model = BannedUser
        fields = ["id", "user", "banned_by", "reason", "is_permanent", "banned_at", "expires_at", "active"]
        read_only_fields = ["id", "banned_at", "banned_by"]


#Клас серелізатора для відображення списку проектів.
class AdminProjectListSerializer (serializers.ModelSerializer):
    owner = AdminUserUpdateSerializer (read_only = True)

    class Meta:
        model = Project
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "readme",
            "github_url",
            "technologies",
            "image",
            "stars",
            "status",
            "is_public",
            "created_at"
        ]

#Клас серелізатора для редагування проекту.
class AdminProjectUpdateSerializer (serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField (queryset = User.objects.all(), required = False)

    class Meta:
        model = Project
        fields = [
            "owner",
            "title",
            "description",
            "readme",
            "github_url",
            "live_url",
            "technologies",
            "image",
            "stars",
            "status",
            "is_public"
        ]
        extra_kwargs = {
            "title": {"required": False},
            "description": {"required": False},
            "readme": {"required": False},
            "github_url": {"required": False, "allow_blank": True},
            "live_url": {"required": False, "allow_blank": True},
            "technologies": {"required": False, "allow_blank": True},
            "image": {"required": False, "allow_blank": True},
            "stars": {"required": False},
            "status": {"required": False, "allow_blank": True},
            "is_public": {"required": False},
        }