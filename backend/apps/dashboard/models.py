from django.db import models
from django.contrib.auth.models import User


#.
# class ControlCenter (models.Model):
#     user = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "control_center")

#.
class BannedUser (models.Model):
    user = models.OneToOneField (User, on_delete = models.CASCADE, related_name = "ban_info")
    banned_by = models.ForeignKey (User, on_delete = models.SET_NULL, null = True, related_name = "banned_users")
    reason = models.TextField (blank = True)
    banned_at = models.DateTimeField (auto_now_add = True)
    is_permanent = models.BooleanField (default = True)

    class Meta:
        verbose_name = "Banned User"
        verbose_name_plural = "Banned Users"

    def __str__ (self):
        return f"Banned: {self.user.username}"