# models.py (user).
#*Підключення бібліотек.
from django.conf import settings
from django.db import models

#Клас моделі користувача.
class Profile (models.Model):
    user = models.OneToOneField (settings.AUTH_USER_MODEL, on_delete = models.CASCADE)
    bio = models.TextField (null = True, blank = True)
    avatar_url = models.CharField (null = True, blank = True)
    address = models.CharField (max_length = 100, null = True, blank = True)
    git = models.CharField (max_length = 200, null = True, blank = True)
    youtube = models.CharField (max_length = 200, null = True, blank = True)
    twitter = models.CharField (max_length = 200, null = True, blank = True)
    linkedin = models.CharField (max_length = 200, null = True, blank = True)
    global_rank = models.IntegerField (null = True, blank = True)
    total_points = models.IntegerField (null = True, blank = True)
    problems_solved = models.IntegerField (null = True, blank = True)
    current_streak = models.IntegerField (null = True, blank = True)

    def __str__ (self):
        return f"{self.user.first_name} {self.user.last_name}"
