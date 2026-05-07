# signals.py (task).
#*Підключення бібліотек.
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.task.models import UserChallengeProgress


#Деф для нормалізації поля selected_answers після збереження UserChallengeProgress.
@receiver (post_save, sender = UserChallengeProgress)
def normalize_selected_answers (sender, instance, **kwargs):
    """
    Автоматично нормалізує поле selected_answers після збереження.
    Гарантує, що воно завжди буде словником.
    """
    if not isinstance (instance.selected_answers, dict):
        instance.selected_answers = {}
        instance.save (update_fields = ["selected_answers"])
