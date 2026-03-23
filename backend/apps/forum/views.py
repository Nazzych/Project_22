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
from users.permissions import isAuthenticated, IsAdministrator
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
