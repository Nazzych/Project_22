# urls.py (task).
#*Підключення бібліотек.
#?from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

#?Налаштування роутера.
#?router = DefaultRouter()
#?router.register (r"chellanges", views.ChellangeViewSet, basename = "chellanges")

#Налаштування силок.
urlpatterns = [
    #?path ("", include (router.urls))
    path ("chellanges/", views.challenges, name = "challenges"),
    path ("chellange/<int:challenge_id>/", views.challenge_detail, name = "challenge_detail"),
    
]