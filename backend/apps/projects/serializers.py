# serializers.py (projects).
from apps.users.serializers import UserSerializer
from rest_framework import serializers
from .models import Project

#Клас серелізатора проекту.
class ProjectSerializer (serializers.ModelSerializer):
    owner = UserSerializer (read_only = True)

    class Meta:
        model = Project
        fields = "__all__"
