# serializers.py (forum).
from apps.users.serializers import UserSerializer
from rest_framework import serializers
from .models import Post, Channel, Comment

#Клас серелізатора форума.
class PostSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
#? channel = ChannelSerializer(read_only=True) .
    channel = serializers.PrimaryKeyRelatedField (read_only = True)

    class Meta:
        model = Post
        fields = ["author", "channel", "title", "content", "views_count", "likes_count", "dislikes_count", "slug", "is_pinned", "is_edited", "created_at"]

#Клас серелізатора каналу.
class ChannelSerializer (serializers.ModelSerializer):
    owner = UserSerializer (read_only = True)
    moderators = serializers.PrimaryKeyRelatedField (many = True, read_only = True)
    subscribers = serializers.PrimaryKeyRelatedField (many = True, read_only = True)

    class Meta:
        model = Channel
        fields = ["owner", "moderators", "subscribers", "name", "slug", "description", "logo", "banner", "is_approved", "is_private", "created_at"]

#Клас серелізатора коментаріїв.
class CommentSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
    parent = serializers.PrimaryKeyRelatedField (read_only = True, allow_null = True)
    replies_count = serializers.IntegerField (read_only = True, source = "replies.count")

    class Meta:
        model = Comment
        fields = ["author", "content", "likes_count", "dislikes_count", "parent", "created_at", "updated_at", "is_edited"]
