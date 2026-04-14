# serializers.py (forum).
from apps.users.serializers import UserSerializer
from rest_framework import serializers
from .models import Course, Lesson


#Клас серелізатора уроку.
class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order", "url"]

# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Lesson, UserLessonProgress

User = get_user_model()


class LessonWithProgressSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order", "url", "is_unlocked", "is_completed"]

    def get_is_unlocked(self, obj):
        user = self.context.get('user')
        if not user:
            return obj.order == 1  # перший урок завжди доступний для неавторизованих (або False)

        progress = UserLessonProgress.objects.filter(user=user, lesson=obj).first()
        return progress.is_unlocked if progress else (obj.order == 1)

    def get_is_completed(self, obj):
        user = self.context.get('user')
        if not user:
            return False
        progress = UserLessonProgress.objects.filter(user=user, lesson=obj).first()
        return progress.is_completed if progress else False


class CourseSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "author", "title", "description", "tegs", "level", "category", "points", "image", "created_at", "lessons"]

    def get_lessons(self, obj):
        user = self.context.get('user')
        lessons = obj.lessons.all().order_by('order')
        serializer = LessonWithProgressSerializer(lessons, many=True, context={'user': user})
        return serializer.data