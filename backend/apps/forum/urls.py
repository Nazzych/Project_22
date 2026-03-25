# urls.py (forum).
#*Підключення бібліотек.
#?from rest_framework.routers import DefaultRouter
from django.urls import path
from . import views

#Налаштування силок.
urlpatterns = [
    path ("posts/", views.get_posts, name = "forum-posts"),
    path ("post/add", views.add_post, name = "post-add"),
    path ("post/edit", views.edit_post, name = "post-edit"),
    path ("channels/", views.get_posts, name = "forum-channels"),
]