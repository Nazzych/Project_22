# permissions.py (user).
#*Підключення бібліотек.
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import status
from functools import wraps

#Клас залежності авторинизованості.
class isAuthenticated (permissions.BasePermission):
    def has_permission (self, request, view):
        return request.user.is_authenticated and hasattr (request.user, "profile")

#Клас залежності для адміністратора.
class IsAdministrator (permissions.BasePermission):
    def has_permission (self, request, view):
        return request.user.is_authenticated and hasattr (request.user, "profile") and request.user.is_staff


#Клас кастомної перевірки авторизованості. 
def login_required_api (view_func):
    @wraps (view_func)
    def _wrapped_view (request, *args, **kwargs):
        user = request.user
        if not user or not user.is_authenticated:
            return Response ({"detail": "Authentication required."}, status = status.HTTP_401_UNAUTHORIZED)
        return view_func (request, *args, **kwargs)
    return _wrapped_view
