# urls.py (task).
#*Підключення бібліотек.
#?from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

#?Налаштування роутера.
#?router = DefaultRouter()
#?router.register (r"Challenges", views.ChallengeViewSet, basename = "Challenges")

#Налаштування силок.
urlpatterns = [
    #?path ("", include (router.urls))
    path ("challenges/", views.challenges, name = "challenges"),
    path ("challenge/<int:challenge_id>/", views.challenge_detail, name = "challenge_detail"),
    path ("challenge/<int:challenge_id>/submit_quiz/", views.submit_quiz, name = "submit_quiz"),
]