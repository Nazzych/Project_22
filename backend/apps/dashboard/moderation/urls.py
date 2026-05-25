# urls.py (dashboard/moderation).
#*Підключення бібліотек.
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminChannelViewSet, ComplaintViewSet, ContactMessageViewSet


#Налаштування роутера.
router = DefaultRouter()
router.register (r"channels", AdminChannelViewSet, basename = "admin-channels")
router.register (r"complaints", ComplaintViewSet, basename = "complaints")
router.register (r"contact", ContactMessageViewSet, basename = "contact-messages")

#Налаштування силок.
urlpatterns = [
    path ("", include (router.urls)),
]