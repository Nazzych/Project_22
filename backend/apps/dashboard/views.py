# views.py (admin).
#*Підключення бібліотек.
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import TooManyFilesSent
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets, status as Statuse
from storage3.exceptions import StorageApiError
from users.permissions import isAuthenticated, IsAdministrator
from apps.task.models import Challange
from apps.task.serializers import ChellangeSerializer
from .permissions import IsAdminOrReadOnly
import traceback, json, os, re


@api_view (["POST"])
@require_http_methods (["POST"])
@permission_classes ([IsAdminOrReadOnly])
def add_challenge (request):
    print ("=== DEBUG: POST request to add_challenge ===")
    print ("POST data:", request.POST)
    print ("FILES:", request.FILES)

    data = request.data
    title = data.get ("title", "").strip()
    description = data.get ("description", "").strip()
    tegs = data.get ("tegs", "").strip()
    points = data.get ("points", "")
    difficul = data.get ("difficul", "medium")
    language = data.get ("language", "python")
    e_input = data.get ("e_input", "").strip()
    e_output = data.get ("e_output", "").strip()
    code = data.get ("code", "").strip()

    if not title or not description:
        return JsonResponse ({
            "type": "warning",
            "message": "Fields \"title\" and \"description\" requaried."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    if Challange.objects.filter (title = title).exists():
        return Response ({
            "type": "warning",
            "message": "Challange exist with this name. Pleace rename."
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            challenge = Challange.objects.create (
                title = title,
                description = description,
                tegs = tegs,
                status = False,
                points = int (points) if points.isdigit() else 10,
                difficul = difficul,
                language = language,
                e_input = e_input,
                e_output = e_output,
                code = code,
            )

        serializer = ChellangeSerializer (challenge)
        return Response ({
            "type": "success",
            "message": "Chellane created successfully",
            "challenge": serializer.data
        }, status = Statuse.HTTP_201_CREATED)
    except Exception as e:
        print ("Error creating chellange:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view (["DELETE"])
@require_http_methods (["DELETE"])
@permission_classes ([IsAdminOrReadOnly])
def delete_challenge (request, chellange_id):
    if not chellange_id:
        return JsonResponse ({
            "type": "error",
            "message": "Challenge ID not provided!"
        }, status = Statuse.HTTP_400_BAD_REQUEST)

    try:
        Challange.objects.get (id = int (chellange_id)).delete()
        return Response ({
            "type": "success",
            "message": "Chellange deleted successfully"
        }, status = Statuse.HTTP_200_OK)
    except Challange.DoesNotExist:
        return Response ({
            "type": "error",
            "message": "Challenge not found"
        }, status = Statuse.HTTP_404_NOT_FOUND)
    except Exception as e:
        print ("Error deleting chellange:", str (e))
        return Response ({
            "type": "error",
            "message": f"Server error: {str (e)}"
        }, status = Statuse.HTTP_500_INTERNAL_SERVER_ERROR)


#?Клас DRF-CRUD завданнями як адміністратор.
# class ChellangeViewSet (viewsets.ModelViewSet):
#     queryset = Challange.objects.all()
#     serializer_class = ChellangeSerializer
#     permission_classes = [IsAdminOrReadOnly]