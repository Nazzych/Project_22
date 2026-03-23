# urls.py (admin).
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
    path ("task/add", views.add_challenge, name = "add_challenge"),
    path ("task/del/<int:chellange_id>/", views.delete_challenge, name = "delete_challenge"),
]