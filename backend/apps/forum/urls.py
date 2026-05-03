# urls.py (forum).
#*Підключення бібліотек.
#?from rest_framework.routers import DefaultRouter
from django.urls import path
from . import views

#Налаштування силок.
urlpatterns = [
    path ("posts/", views.get_posts, name = "forum-posts"),
    path ("post/add/", views.add_post, name = "post-add"),
    path ("post/edit/<int:post_id>/", views.edit_post, name = "post-edit"),
    path ("post/del/<int:post_id>/", views.delete_post, name = "post-delete"),
    path ("post/<int:post_id>/", views.PostDetailView.as_view(), name = "post-detail"),
    path ("channels/", views.get_channels, name = "forum-channels"),
    path ("channel/<int:channel_id>/", views.get_channel, name = "forum-channel"),
    path ("channel/<int:channel_id>/posts/", views.get_channel_posts, name = "forum-channel-posts"),
    path ("channel/add/", views.add_channel, name = "channel-add"),
    path ("channel/edit/<int:channel_id>/", views.edit_channel, name = "channel-edit"),
    path ("channel/del/<int:channel_id>/", views.delete_channel, name = "channel-delete"),
    path ("comments/post/<int:post_id>/", views.get_post_comments, name = "post-comments"),
    path ("comment/<str:model_name>/<int:object_id>/", views.create_comment, name = "comment-create"),
    path ("comment/edit/<int:comment_id>/", views.edit_comment, name = "comment-edit"),
    path ("comment/del/<int:comment_id>/", views.delete_comment, name = "comment-delete"),
]