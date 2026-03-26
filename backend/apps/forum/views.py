# views.py (admin).
#*Підключення бібліотек.
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import TooManyFilesSent
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets, status
from storage3.exceptions import StorageApiError
from users.permissions import isAuthenticated
from .models import Post, Channel, Comment
from .serializers import PostSerializer, ChannelSerializer, CommentSerializer
# from .permissions import IsAdminOrReadOnly
import traceback, json, os, re


@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_posts (request):
    posts = Post.objects.all()
    serializer = PostSerializer (posts, many = True)
    return Response (serializer.data)

@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_channels (request):
    channels = Channel.objects.all()
    serializer = ChannelSerializer (channels, many = True)
    return Response (serializer.data)

@api_view (["POST"])
@permission_classes ([isAuthenticated])
def add_post (request):
    data = request.data
    title = data.get ("title", "")
    content = data.get ("content", "")
    channel_id = data.get ("channel")

    if not title or not content:
        return JsonResponse ({
            "type": "warning",
            "message": "Fields \"title\" and \"content\" is required."
        }, status = status.HTTP_400_BAD_REQUEST)

    if Post.objects.filter (title = title).exists():
        return Response ({
            "type": "warning",
            "message": "Post exist with this title. Please rename."
        }, status = status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            channel = None
            if channel_id:
                channel = get_object_or_404 (Channel, id = channel_id)

            post = Post.objects.create (
                author = request.user,
                title = title,
                content = content,
                channel = channel
            )

        serializer = PostSerializer (post)
        return Response ({
            "type": "success",
            "message": "Post created successfully",
            "post": serializer.data
        }, status = status.HTTP_201_CREATED)
    except Exception as e:
        print ("Error creating post:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["PUT"])
@permission_classes ([isAuthenticated])
def edit_post (request, post_id):
    data = request.data
    title = data.get ("title", "")
    content = data.get ("content", "")

    post = get_object_or_404 (Post, id = post_id)

    if not (request.user.is_staff or post.author == request.user):
        return Response (
            {"type": "error", "message": "You do not have permission to edit this post."},
            status = status.HTTP_403_FORBIDDEN
        )

    if Post.objects.filter (title = title).exclude (id = post.id).exists():
        return Response ({
            "type": "warning",
            "message": "Post exist with this title. Please rename."
        }, status = status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            post.title = title or post.title
            post.content = content or post.content
            post.save()

        return Response (
            {"success": True, "message": "Post updated successfully."},
            status = status.HTTP_200_OK
        )
    except Exception as e:
        print ("Error creating post:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view (["DELETE"])
@permission_classes ([isAuthenticated])
def delete_post (request, post_id):
    if not post_id:
        return JsonResponse ({
            "type": "error",
            "message": "Post ID not provided!"
        }, status = status.HTTP_400_BAD_REQUEST)

    try:
        Post.objects.get (id = int (post_id)).delete()
        return Response ({
            "type": "success",
            "message": "Post deleted successfully"
        }, status = status.HTTP_200_OK)
    except Post.DoesNotExist:
        return Response ({
            "type": "error",
            "message": "Post not found"
        }, status = status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print ("Error deleting post:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
