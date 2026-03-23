# permissions.py (admin).
#*Підключення бібліотек.
from rest_framework.permissions import BasePermission, SAFE_METHODS

#Клас залежності адміністратора (CRUD)/користувача (читання та виконання).
class IsAdminOrReadOnly (BasePermission):
    def has_permission (self, request, view):

#?Якщо GET/HEAD/OPTIONS → дозволити всім
        if request.method in SAFE_METHODS:
            return True

#?Інакше тільки staff
        return request.user and request.user.is_staff
