from django.db import models
from django.conf import settings


#.
# class ControlCenter (models.Model):
#     user = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.CASCADE, related_name = "control_center")

#.
class BannedUser (models.Model):
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