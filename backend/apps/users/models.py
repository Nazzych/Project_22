# models.py (user).
#*Підключення бібліотек.
from django.contrib.auth.models import User
from django.db import models

#Клас моделі користувача.
class Profile (models.Model):
    user = models.OneToOneField (User, on_delete = models.CASCADE)
    bio = models.TextField (null = True, blank = True)
    avatar_url = models.CharField (null = True, blank = True, default = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop")
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
