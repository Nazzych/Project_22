# admin.py (user).
#*Підключення бібліотек.
from django.contrib import admin
from .models import Profile

admin.site.register (Profile)
