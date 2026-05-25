# serializers.py (dashboard/moderation/).
#*Підключення бібліотек.
from rest_framework import serializers
from apps.forum.models import Channel
from ..models import Complaint, ContactMessage


#Серіалізатор для відображення інформації про канал.
class AdminChannelSerializer (serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField (read_only = True)
    owner_username = serializers.CharField (source = "owner.username", read_only = True)

    class Meta:
        model = Channel
        fields = ["id", "owner", "owner_username", "name", "description", "logo", "banner", "is_approved", "created_at"]
        read_only_fields = ["created_at"]

#Серіалізатор для відображення інформації про скаргу.
class ComplaintSerializer (serializers.ModelSerializer):
    reporter_username = serializers.CharField (source = "reporter.username", read_only = True)
    target_username = serializers.CharField (source = "target_user.username", read_only = True)

    class Meta:
        model = Complaint
        fields = [
            "id", "reporter", "reporter_username", "target_user",
            "target_username", "target_type", "target_id", "reason",
            "status", "created_at", "reviewed_by", "review_comment"
        ]

#Серіалізатор для відображення інформації про повідомлення з форми Contact Us.
class ContactMessageSerializer (serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id", "name", "email", "subject", "message", "response",
            "is_read", "handled_by", "created_at",
            "handled_at"
        ]