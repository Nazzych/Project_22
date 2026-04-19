# serializers.py (courses)
#*Імпорт бібліотек.
from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Course, Lesson, UserLessonProgress

User = get_user_model()


# ==================== ПРОСТИЙ СЕРІАЛІЗАТОР УРОКУ (для інших випадків) ====================
class LessonSerializer (serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order", "url"]

# ==================== ПРОСТИЙ СЕРІАЛІЗАТОР КУРСУ (якщо треба без прогресу) ====================
class CourseSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
    lessons = LessonSerializer (many = True, read_only = True)

    class Meta:
        model = Course
        fields = ["id", "author", "title", "description", "tegs", "level", "category", "points", "image", "created_at", "lessons"]


# ==================== УРОК З ПРОГРЕСОМ ====================
class LessonWithProgressSerializer (serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order", "url", "is_unlocked", "is_completed"]

    def get_is_unlocked (self, obj):
        user = self.context.get ("user")
        if not user or not user.is_authenticated:
            return obj.order == 1

        progress = UserLessonProgress.objects.filter (user = user, lesson = obj).first()
        return progress.is_unlocked if progress else (obj.order == 1)

    def get_is_completed (self, obj):
        user = self.context.get ("user")
        if not user or not user.is_authenticated:
            return False

        progress = UserLessonProgress.objects.filter (user = user, lesson = obj).first()
        return progress.is_completed if progress else False

# ==================== КУРС З ПРОГРЕСОМ ====================
class CourseWithProgressSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "author", "title", "description", "tegs", "level", "category", "points", "image", "created_at", "lessons"]

    def get_lessons (self, obj):
        user = self.context.get ("user")
        lessons_qs = obj.lessons.all().order_by ("order")

        serializer = LessonWithProgressSerializer (
            lessons_qs, 
            many = True, 
            context = {"user": user}
        )
        return serializer.data