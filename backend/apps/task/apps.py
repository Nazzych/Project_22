# apps.py (task).
#*Підключення бібліотек.
from django.apps import AppConfig


#Клас конфігурації для додатку "task".
class TaskConfig (AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.task"

    def ready (self):
        import apps.task.signals
