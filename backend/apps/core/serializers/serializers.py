from rest_framework import serializers


class BaseModelSerializer(serializers.ModelSerializer):
    """
    Базовий серіалізатор з корисними налаштуваннями за замовчуванням.
    """
    def get_user(self):
        """Зручно отримувати поточного користувача в SerializerMethodField"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user
        return None


class UserProgressSerializerMixin:
    """
    Mixin для серіалізаторів, які мають додавати user_progress.
    """
    user_progress = serializers.SerializerMethodField()

    def get_user_progress(self, obj):
        user = self.context.get('user')
        if not user or not user.is_authenticated:
            return None

        # Припускаємо, що модель має related_name='user_progress'
        progress = obj.user_progress.filter(user=user).first()
        if progress:
            from apps.task.serializers import ChallengeProgressSerializer  # тимчасово
            return ChallengeProgressSerializer(progress).data
        return None