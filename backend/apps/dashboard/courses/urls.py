# urls.py (apps/dashboard/courses).
#*Підключення бібліотек.
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet


#Налаштування роутера.
router = DefaultRouter()
router.register (r"", CourseViewSet, basename = "admin-courses")

#Налаштування силок.
urlpatterns = [
    path ("", include (router.urls)),
    path ("<int:course_id>/lessons/", CourseViewSet.as_view ({"put": "update_lessons"}), name = "lessons-update"),
]