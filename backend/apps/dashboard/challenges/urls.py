# urls.py (apps/dashboard/challenges).
#*Підключення бібліотек.
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChallengeViewSet


#Налаштування роутера.
router = DefaultRouter()
router.register (r"", ChallengeViewSet, basename = "admin-challenges")

#Налаштування силок.
urlpatterns = [
    path ("", include (router.urls)),
]