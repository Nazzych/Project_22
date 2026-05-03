# auth_views.py (core/api/).
#*Імпорт модулів.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse


#Перевірка CSRF cookie.
@api_view (["GET"])
@ensure_csrf_cookie
@permission_classes ([AllowAny])
def csrf_check (request):
    return JsonResponse ({"detail": "CSRF cookie set"})

#Перевірка сесії.
@api_view (["GET"])
@permission_classes ([AllowAny])
def check_session (request):
    return JsonResponse ({"authenticated": request.user.is_authenticated})