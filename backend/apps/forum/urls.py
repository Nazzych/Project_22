# urls.py (forum).
#*Підключення бібліотек.
#?from rest_framework.routers import DefaultRouter
from django.urls import path
from . import views

#Налаштування силок.
urlpatterns = [
    path ("posts/", views.get_posts, name = "forum-posts"),
    path ("post/add", views.add_post, name = "post-add"),
    path ("channels/", views.get_posts, name = "forum-channels"),
]