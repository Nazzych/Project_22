# urls.py (projects).
#*Підключення бібліотек.
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register (r"projects", views.ProjectViewSet, basename = "projects")

#Налаштування силок.
urlpatterns = [
    path ("add/", views.add_project, name = "project-add"),
    path ("projects/<int:pk>-<slug:slug>/", views.ProjectViewSet.as_view ({"get": "retrieve"}), name = "project-detail-slug"),
    path ("<int:project_id>/structure/", views.get_project_structure),
    path ("<int:project_id>/file/", views.get_project_file, name = "project-file-get"),
    path ("<int:project_id>/file/update/", views.update_project_file, name = "project-file-update"),
    path ("<int:project_id>/file/download/", views.download_project_file, name = "project-file-download"),
    path ("<int:project_id>/file/delete/", views.delete_project_file, name = "project-file-delete"),
    path ("", include (router.urls))
]