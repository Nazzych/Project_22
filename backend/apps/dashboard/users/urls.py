# urls.py (apps/dashboard/users/).
#*Підключення бібліотек.
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminUserViewSet


#Налаштування роутера.
router = DefaultRouter()
router.register (r"", AdminUserViewSet, basename = "admin-users")

#Налаштування силок.
urlpatterns = [
    path ("", include (router.urls)),
    
    #? Якщо хочеш додаткові кастомні дії (наприклад ban)
    # path("<int:pk>/ban/", AdminUserViewSet.as_view({"post": "ban"}), name="user-ban"),
]

#!<:
# Приклад кінцевих URL:
# GET    /api/dashboard/users/                  → список користувачів
# GET    /api/dashboard/users/42/               → деталі одного користувача
# PATCH  /api/dashboard/users/42/               → оновити користувача
# POST   /api/dashboard/users/42/ban/          → забанити/розбанити