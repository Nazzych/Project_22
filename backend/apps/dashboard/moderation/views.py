# views.py (dashboard/moderation).
#*Підключення бібліотек.
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from apps.forum.models import Channel
from ..models import AuditLog, Complaint, ContactMessage
from ..permissions import IsAdminOrReadOnly
from .serializers import AdminChannelSerializer, ComplaintSerializer, ContactMessageSerializer


#Деф отримання чи є шось на модерацію.
@api_view (["GET"])
@permission_classes ([IsAdminOrReadOnly])
def get_dashbord_info (request):
    ...

#Клас для пагінації модерацій.
class ModerationPagination (PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 50

#Клас для управління каналами.
class AdminChannelViewSet (viewsets.ModelViewSet):
    queryset = Channel.objects.all()
    serializer_class = AdminChannelSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = ModerationPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "tags"]
    ordering = ["-created_at"]

    @action (detail = False, methods = ["GET"])
    def pending (self, request):
        pending_channels = self.queryset.filter (is_approved = False)
        page = self.paginate_queryset (pending_channels)
        if page is not None:
            serializer = self.get_serializer (page, many = True)
            return Response (serializer.data)

        serializer = self.get_serializer (pending_channels, many = True)
        return Response (serializer.data)

    @action (detail = True, methods = ["PUT"])
    def approve (self, request, pk = None):
        channel = self.get_object()
        if channel.is_approved:
            return Response ({"type": "warning", "message": "Channel already approved"}, status = status.HTTP_400_BAD_REQUEST)

        channel.is_approved = True
        channel.save()

        AuditLog.objects.create (
            admin = request.user,
            action = "approve",
            target_model = "Channel",
            target_id = channel.id,
            details = {"channel_name": channel.name},
            ip_address = request.META.get ("REMOTE_ADDR")
        )
        return Response ({
            "type": "success",
            "message": f"Channel '{channel.name}' approved successfully"
        })

    @action (detail = True, methods = ["PUT"])
    def reject (self, request, pk = None):
        channel = self.get_object()
        channel_name = channel.name
        channel.delete()

        AuditLog.objects.create (
            admin = request.user,
            action = "reject",
            target_model = "Channel",
            target_id = pk,
            details = {"channel_name": channel_name},
            ip_address = request.META.get ("REMOTE_ADDR")
        )
        return Response ({
            "type": "success",
            "message": f"Channel '{channel_name}' rejected and deleted"
        })

#Клас для управління скаргами.
class ComplaintViewSet (viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = ModerationPagination
    ordering = ["-created_at"]

    @action (detail = True, methods = ["POST"])
    def resolve (self, request, pk = None):
        complaint = self.get_object()
        complaint.status = "resolved"
        complaint.reviewed_by = request.user
        complaint.review_comment = request.data.get ("review_comment", "")
        complaint.save()

        AuditLog.objects.create (
            admin = request.user,
            action = "resolve",
            target_model = "Complaint",
            target_id = complaint.id,
            details = {"review_comment": complaint.review_comment}
        )
        return Response ({"type": "success", "message": "Complaint resolved"})

#Клас для управління повідомленнями з форми Contact Us.
class ContactMessageViewSet (viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = ModerationPagination
    ordering = ["-created_at"]

    @action (detail = True, methods = ["POST"])
    def mark_read (self, request, pk = None):
        message = self.get_object()
        message.is_read = True
        message.handled_by = request.user
        message.handled_at = timezone.now()
        message.response = request.data.get ("response", "")
        message.save()

        AuditLog.objects.create (
            admin = request.user,
            action = "update",
            target_model = "ContactMessage",
            target_id = message.id
        )
        return Response ({"type": "success", "message": "Message marked as handled"})