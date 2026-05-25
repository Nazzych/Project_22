# models.py (dashboard).
#*Підключення бібліотек.
from django.db import models
from django.conf import settings


#Клас вибору дій для логів.
class LogChoice (models.TextChoices):
    CREATE = "create", "Creation"
    UPDATE = "update", "Update"
    DELETE = "delete", "Delete"
    BAN = "ban", "Ban/Unban"
    APPROVE = "approve", "Approve"
    REJECT = "reject", "Reject"
    OTHER = "other", "Other"

#Клас вибору статусів для скарг.
class CompainChoice (models.TextChoices):
    PENDING = "pending", "Pending Review"
    REVIEWED = "reviewed", "Reviewed"
    RESOLVED = "resolved", "Resolved"
    DISMISSED = "dismissed", "Dismissed"

#Клас для зберігання інформації про заблокованих користувачів.
class BannedUser (models.Model):
    """Модель для зберігання інформації про заблокованих користувачів"""
    user = models.OneToOneField (settings.AUTH_USER_MODEL, on_delete = models.CASCADE, related_name = "ban_info")
    banned_by = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.SET_NULL, null = True, related_name = "banned_users")
    reason = models.TextField (blank = True)
    banned_at = models.DateTimeField (auto_now_add = True)
    is_permanent = models.BooleanField (default = True)
    expires_at = models.DateTimeField (null = True, blank = True)
    active = models.BooleanField (default = True)

    class Meta:
        verbose_name = "Banned User"
        verbose_name_plural = "Banned Users"

    def __str__ (self):
        return f"Banned: {self.user.username}"

#Клас для зберігання аудит логів.
class AuditLog (models.Model):
    """Повний аудит дій адміністраторів"""
    admin = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.CASCADE, related_name = "admin_logs")
    action = models.CharField (max_length = 20, choices = LogChoice.choices, default = LogChoice.OTHER)
    target_model = models.CharField (max_length = 100)
    target_id = models.PositiveIntegerField (null = True, blank = True)
    details = models.JSONField (default = dict, blank = True)
    ip_address = models.GenericIPAddressField (null = True, blank = True)
    created_at = models.DateTimeField (auto_now_add = True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Аудит лог"
        verbose_name_plural = "Аудит логи"

    def __str__ (self):
        return f"{self.admin.username} | {self.action} | {self.target_model} #{self.target_id}"

#Клас для зберігання скарг від користувачів.
class Complaint (models.Model):
    """Скарги від користувачів"""
    reporter = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.CASCADE, related_name = "my_complaints")
    target_user = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.SET_NULL, null = True, blank = True, related_name = "complaints_against")
    reviewed_by = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.SET_NULL, null = True, related_name = "reviewed_complaints")
    target_type = models.CharField (max_length = 50)
    target_id = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField (max_length = 20, choices = CompainChoice.choices, default = CompainChoice.PENDING)
    created_at = models.DateTimeField (auto_now_add = True)
    review_comment = models.TextField (blank = True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Скарга"
        verbose_name_plural = "Скарги"

#Клас для зберігання інформації про повідомлення з форми Contact Us.
class ContactMessage (models.Model):
    """Повідомлення з форми Contact Us"""
    name = models.CharField (max_length = 150)
    email = models.EmailField()
    subject = models.CharField (max_length = 200)
    message = models.TextField()
    response = models.TextField (blank = True)
    is_read = models.BooleanField (default = False)
    handled_by = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.SET_NULL, null = True, blank = True)
    handled_at = models.DateTimeField (null = True, blank = True)
    created_at = models.DateTimeField (auto_now_add = True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Контактне повідомлення"
        verbose_name_plural = "Контактні повідомлення"

    def __str__ (self):
        return f"{self.name} — {self.subject [:50]}"