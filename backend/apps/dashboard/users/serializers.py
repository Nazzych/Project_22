# serializers.py (apps/dashboard/users/).
#*Підключення бібліотек.
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.users.models import Profile

#*Отримання користувача.
User = get_user_model()


#Клас серелізатора профілю.
class AdminProfileUpdateSerializer (serializers.ModelSerializer):
    """Серіалізатор для адмінського редагування профілю"""
    class Meta:
        model = Profile
        fields = ["bio", "avatar_url", "address", "youtube", "linkedin", "twitter", "git", "global_rank", "total_points", "problems_solved", "current_streak"]

#Клас серелізатора для відображення списку користувачів в адмінці.
class AdminUserListSerializer (serializers.ModelSerializer):
    """Серіалізатор для відображення списку користувачів в адмінці"""
    profile = AdminProfileUpdateSerializer (read_only = True)
    ban_info = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username", "email", "is_staff", "is_superuser", "date_joined", "ban_info", "profile"]
    
    def get_ban_info (self, obj):
        ban = getattr (obj, 'ban_info', None)
        if ban and ban.active:
            return {"reason": ban.reason, "is_permanent": ban.is_permanent}
        return None

#Клас серелізатора користувача.
class AdminUserUpdateSerializer (serializers.ModelSerializer):
    """Серіалізатор для адмінського редагування користувача + профілю"""
    profile = AdminProfileUpdateSerializer (required = False)

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username", "email", "is_staff", "profile"]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
            "username": {"required": False},
            "email": {"required": False},
            "is_staff": {"required": False},
            "profile": {"required": False}
        }
