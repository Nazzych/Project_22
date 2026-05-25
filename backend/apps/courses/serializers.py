# serializers.py (courses)
#*Імпорт бібліотек.
from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Course, Lesson, UserLessonProgress

User = get_user_model()


#? (Чи треба їх лишати)<.
# ==================== ПРОСТИЙ СЕРІАЛІЗАТОР УРОКУ (для інших випадків) ====================
class LessonSerializer (serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order", "url"]

# ==================== ПРОСТИЙ СЕРІАЛІЗАТОР КУРСУ (якщо треба без прогресу) ====================
class CourseSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
    lessons_count = serializers.IntegerField (source = "lessons.count", read_only = True)

    class Meta:
        model = Course
        fields = ["id", "author", "title", "description", "tags", "level", "category", "points", "image", "created_at", "lessons_count"]
#?>.


# ==================== УРОК З ПРОГРЕСОМ ====================
class LessonWithProgressSerializer (serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    completed_at = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order", "url", "is_unlocked", "is_completed", "completed_at"]

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

    def get_completed_at (self, obj):
        user = self.context.get ("user")
        if not user or not user.is_authenticated:
            return None

        progress = UserLessonProgress.objects.filter (user = user, lesson = obj).first()
        return progress.completed_at if progress else None

# ==================== КУРС З ПРОГРЕСОМ ====================
class CourseWithProgressSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
    lessons = serializers.SerializerMethodField()
    lessons_count = serializers.IntegerField (source = "lessons.count", read_only = True)
    completed_lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "author", "title", "description", "tags", "level", "category", "points", "image", "created_at", "lessons", "lessons_count", "completed_lessons_count"]

    def get_lessons (self, obj):
        """Повертає уроки з прогресом користувача"""
        user = self.context.get ("user")
        lessons_qs = obj.lessons.all().order_by ("order")

        serializer = LessonWithProgressSerializer (
            lessons_qs, 
            many = True, 
            context = {"user": user}
        )
        return serializer.data

    def get_completed_lessons_count (self, obj):
        """Кількість завершених уроків користувача"""
        user = self.context.get ("user")
        if not user or not user.is_authenticated:
            return 0

        return UserLessonProgress.objects.filter (
            user = user,
            lesson__course = obj,
            is_completed = True
        ).count()