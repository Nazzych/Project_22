from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from ..permissions.permissions import IsOwner


class OwnerRequiredMixin:
    """
    Mixin для views, який перевіряє, чи є поточний користувач власником об'єкта.
    Використовується в APIView та ViewSet.
    """
    
    def get_object(self):
        """
        Перевизначаємо get_object, щоб автоматично перевіряти право власності.
        """
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs.get('pk') or self.kwargs.get('id'))
        
        # Перевіряємо права
        if not IsOwner().has_object_permission(self.request, self, obj):
            raise PermissionDenied("You do not have permission to access this object.")
        
        return obj


class OwnerOrReadOnlyMixin:
    """
    Дозволяє читати всім, а змінювати/видаляти тільки власнику.
    """
    def check_object_permissions(self, request, obj):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return
        
        if not IsOwner().has_object_permission(request, self, obj):
            raise PermissionDenied("You do not have permission to modify this object.")