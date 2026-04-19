from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.db import models, transaction
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
    author = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "courses")
    title = models.CharField (max_length = 255)
    description = models.TextField()
    tegs = models.CharField (max_length = 255, null = True, blank = True)
    points = models.PositiveIntegerField (default = 0)
    level = models.CharField (max_length = 20, choices = Difficul.choices, default = Difficul.EASY)
    category = models.CharField (max_length = 100, choices = Category.choices, default = Category.OTHER)
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

    class Meta:
        ordering = ["order"]
        unique_together = ("course", "order")

    def __str__ (self):
        return f"{self.course.title} - {self.title}"

    def save (self, *args, **kwargs):
        if self.order is None or self.order == 0:
            with transaction.atomic():
                max_order = Lesson.objects.filter (course = self.course).aggregate (models.Max ("order"))["order__max"]
                self.order = (max_order or 0) + 1
        elif Lesson.objects.filter (course = self.course, order = self.order).exclude (pk = self.pk).exists():
            with transaction.atomic():
                Lesson.objects.filter (
                    course = self.course, 
                    order__gte = self.order
                ).exclude (pk = self.pk).update (order = models.F ("order") + 1)
        super().save (*args, **kwargs)

#Клас прогресу курсу.
class UserLessonProgress (models.Model):
    user = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "lesson_progress")
    lesson = models.ForeignKey (Lesson, on_delete = models.CASCADE, related_name = "progress")
    is_unlocked = models.BooleanField (default = False)
    is_completed = models.BooleanField (default = False)
    completed_at = models.DateTimeField (null = True, blank = True)

    class Meta:
        unique_together = ("user", "lesson")
