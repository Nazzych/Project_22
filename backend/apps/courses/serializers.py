# serializers.py (forum).
from apps.users.serializers import UserSerializer
from rest_framework import serializers
from .models import Course, Lesson


#Клас серелізатора уроку.
class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order", "is_unlocked", "url"]

#Клас серелізатора форума.
class CourseSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
    lessons = serializers.SerializerMethodField()

    def get_lessons (self, obj):
        if obj.lessons.exists():
            return LessonSerializer (obj.lessons.all(), many = True).data
        return []
    class Meta:
        model = Course
        fields = ["id", "author", "title", "description", "tegs", "level", "category", "points", "image", "created_at", "lessons"]