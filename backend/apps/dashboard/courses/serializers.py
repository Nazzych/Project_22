# serializers.py (apps/dashboard/courses/).
#*Підключення бібліотек.
from rest_framework import serializers
from apps.courses.models import Course, Lesson


#Клас серелізатора для уроку.
class LessonSerializer (serializers.ModelSerializer):
    """Серіалізатор для уроку"""
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order", "url", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

#Клас серелізатора для відображення списку курсів.
class CourseListSerializer (serializers.ModelSerializer):
    """Список курсів (коротка інформація)"""
    lessons_count = serializers.IntegerField (read_only = True, source = "lesson_set.count")

    class Meta:
        model = Course
        fields = [
            "id", "author", "title", "description", "image", "level", 
            "category", "points", "tags", "created_at", "updated_at", "lessons_count"
        ]

#Клас серелізатора для відображення детальної інформації про курс.
class CourseDetailSerializer (serializers.ModelSerializer):
    """Повна інформація про курс + уроки"""
    lessons = LessonSerializer (many = True, read_only = True)

    class Meta:
        model = Course
        fields = [
            "id", "author", "title", "description", "image", "level",
            "category", "points", "tags", "lessons", "created_at", "updated_at"
        ]

#Клас серелізатора для створення та оновлення курсу.
class CourseCreateUpdateSerializer (serializers.ModelSerializer):
    """Для створення та оновлення курсу"""
    class Meta:
        model = Course
        fields = [
            "title", "description", "image", "level",
            "category", "points", "tags"
        ]
        extra_kwargs = {
            "title": {"required": True},
            "description": {"required": True},
        }