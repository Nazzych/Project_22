# permissions.py (admin).
#*Підключення бібліотек.
from rest_framework.permissions import BasePermission, SAFE_METHODS


#Клас залежності адміністратора (CRUD)/користувача (читання та виконання).
class IsAdminOrReadOnly (BasePermission):
    """Дозволяє читання всім, а запис/зміну — тільки staff"""

#Метод для перевірки дозволу на рівні запиту.
    def has_permission (self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

#Метод для перевірки дозволу на рівні об'єкта.
    def has_object_permission (self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff