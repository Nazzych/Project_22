# urls.py (user).
#*Підключення бібліотек.
#?from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

#?router = DefaultRouter()
#?router.register (r"", views.UserViewSet, basename = "user")

#Налаштування силок.
urlpatterns = [
    path ("check-csrf/", views.csrf_check, name = "check-csrf"),
    path ("check-session/", views.check_session, name = "check-session"),
    path ("login/", views.login, name = "user-login"),
    path ("register/", views.register, name = "user-register"),
    path ("logout/", views.logout, name = "user-logout"),
    path ("auth/github/callback/", views.github_login_callback, name = "github-login-callback"),
    path ("auth/google/callback/", views.google_login_callback, name = "google-login-callback"),
    path ("me/", views.CurrentUserView.as_view(), name = "current-user"),
    path ("update/", views.update_profile, name = "update-profile"),
    path ("github/update/", views.github_save_profile, name = "update-github-profile"),
    path ("change-pass/", views.update_password, name = "update-password"),
    path ("delete/", views.delete_profile, name = "delete-profile"),
    #?path ("api/", include (router.urls))
]

