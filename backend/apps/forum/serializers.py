# serializers.py (forum).
#*Підключення бібліотек.
from apps.users.serializers import UserSerializer
from rest_framework import serializers
from .models import Post, Channel, Comment


#Клас серелізатора форума.
class PostSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
    channel = serializers.PrimaryKeyRelatedField (read_only = True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "author", "channel", "title", "content", "slug", "views_count", "likes_count", "dislikes_count", "comments_count", "is_pinned", "is_edited", "created_at"]

    def get_comments_count (self, obj):
        return obj.comment_set.count()

#Клас серелізатора каналу.
class ChannelSerializer (serializers.ModelSerializer):
    owner = UserSerializer (read_only = True)
    moderators = serializers.PrimaryKeyRelatedField (many = True, read_only = True)
    subscribers = serializers.PrimaryKeyRelatedField (many = True, read_only = True)
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Channel
        fields = ["id", "owner", "moderators", "subscribers", "name", "description", "logo", "banner", "slug", "posts_count", "is_approved", "is_private", "created_at"]

    def get_posts_count (self, obj):
        return obj.posts.count()

#Клас серелізатора коментаріїв.
class CommentSerializer (serializers.ModelSerializer):
    author = UserSerializer (read_only = True)
    parent = serializers.PrimaryKeyRelatedField (read_only = True, allow_null = True)
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "author", "content", "parent", "depth", "likes_count", "dislikes_count", "replies_count", "is_edited", "created_at", "updated_at"]

    def get_replies_count (self, obj):
        return obj.replies.count()