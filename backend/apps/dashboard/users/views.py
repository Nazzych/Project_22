# views.py (apps/dashboard/users/).
#*Підключення бібліотек.
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, status
from ..models import BannedUser
from ..permissions import IsAdminOrReadOnly
from .serializers import AdminUserListSerializer, AdminUserUpdateSerializer

#*Отримання користувача.
User = get_user_model()


#Клас ViewSet для користувачів в адмінці.
class AdminUserViewSet (viewsets.ModelViewSet):
    queryset = User.objects.select_related ("profile").prefetch_related ("ban_info")
    serializer_class = AdminUserListSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class (self):
        if self.action in ["update", "partial_update", "create"]:
            return AdminUserUpdateSerializer
        return AdminUserListSerializer

    def get_queryset (self):
        #?<!-- Якщо потрібно виключити суперкористувачів для не-суперкористувачів -->
        # qs = User.objects.select_related ("profile").all()
        # if not self.request.user.is_superuser:
        #     qs = qs.exclude (is_superuser = True)
        # return qs
        #?>.
        return User.objects.select_related ("profile").all()

    @action (detail = True, methods = ["POST"], permission_classes = [IsAdminOrReadOnly])
    def ban (self, request, pk = None):
        user = self.get_object()
        if user.is_superuser or user.id == request.user.id:
            return Response ({
                "type": "error",
                "message": "Operation not allowed on this user."
            }, status = status.HTTP_403_FORBIDDEN)

        try:
            #? Перевіряємо, чи вже забанений.
            ban = BannedUser.objects.filter (user = user).first()

            if ban:
                #? Розбанити.
                ban.delete()
                message = f"User @{user.username} has been unbanned successfully"
            else:
                #? Забанити.
                data = request.data
                BannedUser.objects.create (
                    user = user,
                    banned_by = request.user,
                    reason = data.get ("reason", "").strip(),
                    is_permanent = True,
                    active = True
                )
                message = f"User @{user.username} has been banned successfully"
            return Response ({
                "type": "success",
                "message": message
            }, status = status.HTTP_200_OK)

        except Exception as e:
            print ("Error banning/unbanning user:", str (e))
            return Response ({
                "type": "error",
                "message": "Server error while processing ban"
            }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
