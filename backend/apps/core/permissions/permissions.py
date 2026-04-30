from rest_framework.permissions import BasePermission
from rest_framework import permissions


#Клас залежності авторинизованості.
class isAuthenticated (permissions.BasePermission):
    def has_permission (self, request, view):
        return request.user.is_authenticated and hasattr (request.user, "profile")

#Клас залежності для адміністратора.
class IsAdministrator (permissions.BasePermission):
    def has_permission (self, request, view):
        return request.user.is_authenticated and hasattr (request.user, "profile") and request.user.is_staff


class IsOwner(BasePermission):
    """
    Дозволяє доступ тільки власнику об'єкта.
    Використовується для Project, Challenge, Course, Lesson тощо.
    """
    def has_object_permission(self, request, view, obj):
        # Якщо об'єкт має поле owner або user — перевіряємо його
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'creator'):
            return obj.creator == request.user
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        # Якщо нічого не знайшли — забороняємо
        return False


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Дозволяє читати всім, а змінювати тільки авторизованим користувачам.
    """
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated

class IsAuthenticatedWithProfileOrReadOnly(IsAuthenticatedOrReadOnly):
    """Читання всім, зміни — тільки з профілем"""
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return super().has_permission(request, view) and hasattr(request.user, 'profile')