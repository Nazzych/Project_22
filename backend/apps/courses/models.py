from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.db import models
from apps.task.models import Difficul


#Клас категорії для курсу.
class Category(models.TextChoices):
    PROGRAMMING = "programming", "Programming"
    WEB = "web", "Web Development"
    MOBILE = "mobile", "Mobile Development"
    DATA = "data", "Data Science"
    ALGO = "algo", "Algorithms & Data Structures"
    DEVOPS = "devops", "DevOps & Infrastructure"
    OTHER = "other", "Other"

#Клас курсу.
class Course (models.Model):
    title = models.CharField (max_length = 255)
    description = models.TextField()
    tegs = models.CharField (max_length = 255, null = True, blank = True)
    level = models.CharField (max_length = 20, choices = Difficul.choices, default = Difficul.EASY)
    category = models.CharField (max_length = 100, choices = Category.choices, default = Category.OTHER)
    points = models.PositiveIntegerField (default = 0)
    author = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "courses")
    image = models.URLField (null = True, blank = True)
    created_at = models.DateTimeField (auto_now_add = True)

    def __str__ (self):
        return self.title

    def get_available_lessons (self, user):
            lessons = self.lessons.all()
            if not lessons.exists() and not user.is_staff:
                raise PermissionDenied ("This course in work.")
            return lessons

#Клас уроку.
class Lesson (models.Model):
    course = models.ForeignKey (Course, on_delete = models.CASCADE, related_name = "lessons")
    title = models.CharField (max_length = 255)
    content = models.TextField()
    order = models.PositiveIntegerField()
    url = models.URLField (null = True, blank = True)

    def __str__ (self):
        return f"{self.course.title} - {self.title}"

#Клас прогресу курсу.
class UserLessonProgress (models.Model):
    user = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "lesson_progress")
    lesson = models.ForeignKey (Lesson, on_delete = models.CASCADE, related_name = "progress")
    is_unlocked = models.BooleanField (default = False)
    is_completed = models.BooleanField (default = False)
    completed_at = models.DateTimeField (null = True, blank = True)

    class Meta:
        unique_together = ("user", "lesson")
