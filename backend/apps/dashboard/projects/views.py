# views.py (dashboard/projects/).
#*Підключення бібліотек.
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.projects.models import Project
from ..models import AuditLog
from ..permissions import IsAdminOrReadOnly
from .serializers import AdminProjectListSerializer, AdminProjectUpdateSerializer


#Пагінація для проектів.
class AdminProjectPagination (PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50

#ViewSet для керування проектами.
class AdminProjectViewSet (viewsets.ModelViewSet):
    queryset = Project.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = AdminProjectPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "technologies", "owner__username"]
    ordering_fields = ["created_at", "stars", "title"]
    ordering = ["-created_at"]

    def get_serializer_class (self):
        if self.action in ["update", "partial_update"]:
            return AdminProjectUpdateSerializer
        return AdminProjectListSerializer

    def perform_update (self, serializer):
        project = serializer.save()

        AuditLog.objects.create (
            admin = self.request.user,
            action = "update",
            target_model = "Project",
            target_id = project.id,
            details = {
                "title": project.title,
                "updated_fields": list (serializer.validated_data.keys())
            },
            ip_address = self.request.META.get ("REMOTE_ADDR")
        )

    def perform_destroy (self, instance):
        project_title = instance.title
        project_id = instance.id
        instance.delete()

        AuditLog.objects.create (
            admin = self.request.user,
            action = "delete",
            target_model = "Project",
            target_id = project_id,
            details = {"title": project_title},
            ip_address = self.request.META.get ("REMOTE_ADDR")
        )

    @action (detail = True, methods = ["POST"])
    def toggle_public (self, request, pk = None):
        project = self.get_object()
        project.is_public = not project.is_public
        project.save()

        AuditLog.objects.create (
            admin = request.user,
            action = "update",
            target_model = "Project",
            target_id = project.id,
            details = {"is_public": project.is_public}
        )

        return Response ({
            "type": "success",
            "message": f"Project is now {'public' if project.is_public else 'private'}",
            "is_public": project.is_public
        })