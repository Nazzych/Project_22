# urls.py (courses).
#*Підключення бібліотек.
#?from rest_framework.routers import DefaultRouter
from django.urls import path
from . import views

#Налаштування силок.
urlpatterns = [
    path ("<int:course_id>/", views.get_course, name = "course-detail"),
    path ("list/", views.get_courses, name = "courses-list"),
]