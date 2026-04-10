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
from .models import Challange
from .serializers import ChellangeSerializer
import traceback, json, os, re


@api_view (["GET"])
@permission_classes ([isAuthenticated])
def challenges (request):
    chellanges = Challange.objects.all()
    serializer = ChellangeSerializer (chellanges, many = True)
    return Response (serializer.data)

@api_view (["GET"])
@permission_classes ([isAuthenticated])
def challenge_detail (request, challenge_id):
    chellange = get_object_or_404 (Challange, id = challenge_id)
    serializer = ChellangeSerializer (chellange)
    return Response (serializer.data)