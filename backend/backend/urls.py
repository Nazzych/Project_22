# urls.py (backend).
from django.urls import path, include
#* from django.contrib import admin

urlpatterns = [
    #* path ("admin/", admin.site.urls),
    path ("user/", include ("apps.users.urls")),
    path ("project/", include ("apps.projects.urls")),
    path ("task/", include ("apps.task.urls")),
    path ("forum/", include ("apps.forum.urls")),
    path ("admin/", include ("apps.dashboard.urls")),
]
