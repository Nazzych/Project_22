# serializers.py (dashboard/projects/).
#*Підключення бібліотек.
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.projects.models import Project
from apps.dashboard.users.serializers import AdminUserUpdateSerializer

User = get_user_model()

#Серіалізатор для відображення інформації про проект.
class AdminProjectListSerializer (serializers.ModelSerializer):
    owner = AdminUserUpdateSerializer (read_only = True)

    class Meta:
        model = Project
        fields = ["id", "owner", "title", "description", "readme", "github_url", "technologies", "image", "stars", "status", "is_public", "created_at", "updated_at"]

#Серіалізатор для редагування проекту.
class AdminProjectUpdateSerializer (serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField (queryset = User.objects.all(), required = False)

    class Meta:
        model = Project
        fields = ["owner", "title", "description", "readme", "github_url", "technologies", "image", "stars", "status", "is_public"]
        extra_kwargs = {
            "title": {"required": False},
            "description": {"required": False},
            "github_url": {"required": False, "allow_blank": True},
            "live_url": {"required": False, "allow_blank": True},
        }

    def __init__ (self, *args, **kwargs):
        super().__init__ (*args, **kwargs)
        self.fields ["owner"].queryset = type (self.Meta.model)._default_manager