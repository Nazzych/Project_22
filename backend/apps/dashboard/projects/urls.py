# urls.py (dashboard/projects/).
#*Підключення бібліотек.
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminProjectViewSet


#Налаштування роутера.
router = DefaultRouter()
router.register (r"", AdminProjectViewSet, basename = "admin-projects")

#Налаштування силок.
urlpatterns = [
    path ("", include (router.urls)),
]