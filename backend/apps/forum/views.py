# views.py (admin).
#*Підключення бібліотек.
from django.contrib.contenttypes.models import ContentType
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
from core.permissions.permissions import isAuthenticated
from .models import Post, Channel, Comment
from .serializers import PostSerializer, ChannelSerializer, CommentSerializer
# from .permissions import IsAdminOrReadOnly
#* import traceback, json, os, re


#*<----------[Дефи для отримання даних]---------->.
#Пости.
@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_posts (request):
    posts = Post.objects.filter (channel = None).all()
    serializer = PostSerializer (posts, many = True)
    return Response (serializer.data)

#Канали та їх пости.
@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_channels (request):
    channels = Channel.objects.filter (is_approved = True).all()
    serializer = ChannelSerializer (channels, many = True)
    return Response (serializer.data)

@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_channel (request, channel_id):
    channel = get_object_or_404 (Channel, id = channel_id, is_approved = True)
    serializer = ChannelSerializer (channel)
    return Response (serializer.data)

@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_channel_posts (request, channel_id):
    posts = Post.objects.filter (channel_id = channel_id)
    serializer = PostSerializer (posts, many = True)
    return Response (serializer.data)

#Коментарі.
@api_view (["GET"])
@permission_classes ([isAuthenticated])
def get_post_comments (request, post_id):
    post = get_object_or_404 (Post, id = post_id)
    post_type = ContentType.objects.get_for_model (Post)

    comments = Comment.objects.filter (
        content_type = post_type,
        object_id = post.id,
        parent__isnull = True
    ).prefetch_related("replies")

    serializer = CommentSerializer (comments, many = True)
    return Response (serializer.data)


#*<----------[Дефи для CRUD постів]---------->.
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
            post.is_edited = True
            post.save()

        return Response (
            {"success": True, "message": "Post updated successfully."},
            status = status.HTTP_200_OK
        )
    except Exception as e:
        print ("Error updating post:", str (e))
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


#*<----------[Дефи для CRUD каналів]---------->.
@api_view (["POST"])
@permission_classes ([isAuthenticated])
def add_channel (request):
    data = request.data
    name = data.get ("name", "")
    description = data.get ("description", "")
    logo = data.get ("logo", "")
    banner = data.get ("banner", "")
    is_private = data.get ("is_private", "")

    if not name or not description:
        return JsonResponse ({
            "type": "warning",
            "message": "Fields \"name\" and \"description\" is required."
        }, status = status.HTTP_400_BAD_REQUEST)

    if Channel.objects.filter (name = name).exists():
        return Response ({
            "type": "warning",
            "message": "Channel exist with this name. Please rename."
        }, status = status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            channel = Channel.objects.create (
                name = name,
                description = description,
                logo = logo,
                banner = banner,
                is_private = (is_private == "true"),
                is_approved = request.user.is_staff,
                owner_id = request.user.id
            )

        serializer = ChannelSerializer (channel)
        return Response ({
            "type": "success",
            "message": "Channel created successfully",
            "channel": serializer.data
        }, status = status.HTTP_201_CREATED)
    except Exception as e:
        print ("Error creating channel:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["PUT"])
@permission_classes ([isAuthenticated])
def edit_channel (request, channel_id):
    data = request.data
    name = data.get ("name", "")
    description = data.get ("description", "")
    logo = data.get ("logo", "")
    banner = data.get ("banner", "")
    is_private = data.get ("is_private", "")

    channel = get_object_or_404 (Channel, id = channel_id)

    if not (request.user.is_staff or channel.owner == request.user):
        return Response (
            {"type": "error", "message": "You do not have permission to edit this channel."},
            status = status.HTTP_403_FORBIDDEN
        )

    if Channel.objects.filter (name = name).exclude (id = channel.id).exists():
        return Response ({
            "type": "warning",
            "message": "Channel exist with this name. Please rename."
        }, status = status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            channel.name = name or channel.name
            channel.description = description or channel.description
            channel.logo = logo
            channel.banner = banner
            channel.is_private = is_private == "true" or channel.is_private
            channel.save()

        return Response (
            {"success": True, "message": "Channel updated successfully."},
            status = status.HTTP_200_OK
        )
    except Exception as e:
        print ("Error updating channel:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["DELETE"])
@permission_classes ([isAuthenticated])
def delete_channel (request, channel_id):
    if not channel_id:
        return JsonResponse ({
            "type": "error",
            "message": "Channel ID not provided!"
        }, status = status.HTTP_400_BAD_REQUEST)

    try:
        Channel.objects.get (id = int (channel_id)).delete()
        return Response ({
            "type": "success",
            "message": "Channel deleted successfully"
        }, status = status.HTTP_200_OK)
    except Channel.DoesNotExist:
        return Response ({
            "type": "error",
            "message": "Channel not found"
        }, status = status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print ("Error deleting channel:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)


#*<----------[Дефи для отримання коментарів]---------->.
@api_view (["POST"])
@permission_classes ([isAuthenticated])
def create_comment (request, model_name, object_id):
    try:
        model = ContentType.objects.get (model = model_name).model_class()
    except ContentType.DoesNotExist:
        return Response ({"type": "error", "message": "Invalid model"}, status = status.HTTP_400_BAD_REQUEST)

    obj = get_object_or_404 (model, id = object_id)

    content = request.data.get ("content")
    parent_id = request.data.get ("parent_id")

    parent = None
    if parent_id:
        parent = Comment.objects.filter (id = parent_id).first()

    comment = Comment.objects.create (
        author = request.user,
        content = content,
        content_type = ContentType.objects.get_for_model (model),
        object_id = obj.id,
        parent = parent
    )

    serializer = CommentSerializer (comment)
    return Response ({
        "type": "success",
        "message": "Comment created successfully",
        "comment": serializer.data
    }, status = status.HTTP_201_CREATED)

@api_view (["PUT", "PATCH"])
@permission_classes ([isAuthenticated])
def edit_comment (request, comment_id):
    try:
        comment = get_object_or_404 (Comment, id = comment_id)

        if request.user != comment.author and not request.user.is_staff:
            return Response ({
                "type": "warning",
                "message": "You are not the owner of this comment."
            }, status = status.HTTP_403_FORBIDDEN)

        content = request.data.get ("content")
        if content:
            comment.content = content
            comment.is_edited = True
            comment.save()

        serializer = CommentSerializer (comment)
        return Response({
            "type": "success",
            "message": "Comment updated successfully",
            "comment": serializer.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        print ("Error updating comment:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["DELETE"])
@permission_classes ([isAuthenticated])
def delete_comment (request, comment_id):
    if not comment_id:
        return JsonResponse ({
            "type": "error",
            "message": "Comment ID not provided!"
        }, status = status.HTTP_400_BAD_REQUEST)
    try:
        comment = get_object_or_404 (Comment, id = comment_id)

        if request.user != comment.author and not request.user.is_staff:
            return Response ({
                "type": "warning",
                "message": "You are not the owner of this comment."
            }, status = status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response ({
            "type": "success",
            "message": "Comment deleted successfully"
        }, status = status.HTTP_204_NO_CONTENT)
    except Exception as e:
        print ("Error deleting comment:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)