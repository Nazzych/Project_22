import re
from pathlib import Path


def sanitize_path(path: str) -> str:
    """
    Безпечна обробка шляху для захисту від Path Traversal атак.
    """
    if not path:
        return ""
    
    # Видаляємо небезпечні символи
    path = re.sub(r'[<>:"|?*]', '', path)
    # Нормалізуємо шляхи
    path = Path(path).resolve().as_posix()
    
    # Забороняємо абсолютні шляхи та спроби вийти за межі
    if path.startswith('/') or '..' in path:
        return ""
    
    return path


def get_client_ip(request):
    """Отримує реальний IP клієнта"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip