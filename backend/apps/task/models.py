# models.py (task). [клан сопрано]
from django.db import models
from django.conf import settings
from django.utils import timezone


#*[-----<Choices>-----].
#Class for language.
class Language (models.TextChoices):
    PYTHON = "py", "Python"
    GO = "go", "Go"
    DART = "dart", "Dart"
    RUST = "rs", "Rust"
    KOTLIN = "kt", "Kotlin"
    SWIFT = "swift", "Swift"
    JAVA = "java", "Java"
    JAVASCRIPT = "js", "JavaScript"
    TYPESCRIPT = "ts", "TypeScript"
    JSX = "jsx", "JSX"
    TSX = "tsx", "TSX"
    HTML = "html", "HTML"
    CSS = "css", "CSS"
    C = "c", "C"
    CPP = "cpp", "C++"
#Формати файлів.
    MD = "md", "Markdown"
    JSON = "json", "JSON"
    XML = "xml", "XML"
    CSV = "csv", "CSV"
    YAML = "yaml", "YAML"
    YML = "yml", "YML"
    PEM = "pem", "PEM"
    ENV = "env", "Env"
    SQLITE = "sqlite3", "SQLite3"
    DB = "db", "Database"
    SH = "sh", "Shell Script"
    BAT = "bat", "Batch"
    INI = "ini", "INI"

#Class for difficul.
class Difficul (models.TextChoices):
    EASY = "easy", "Easy"
    MEDIUM = "medium", "Medium"
    HARD = "hard", "Hard"

#Class for type.
class ChallengeType (models.TextChoices):
    QUIZ = "quiz", "Quiz"
    CODE = "code", "Code"
    MENTOR = "mentor", "Mentor Check"

#Class for status in chellange.
class ChallengeStatus (models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"

#Class for  status in user chellange.
class ChallengeProgress (models.TextChoices):
    NOT = "not_started", "Not Started"
    PROGGRESS = "in_progress", "In Progress"
    COMPLETE = "completed", "Completed"
    FAIL = "failed", "Failed"
    SUBMIT = "submitted", "Submitted (awaiting review)"


#*[-----<Models>-----].
#Class chellange.
class Challange (models.Model):
    title = models.CharField (max_length = 100, blank = False, null = False)
    description = models.TextField (blank = False, null = False)
    tegs = models.CharField (max_length = 255, blank = True, help_text = "Через кому: array, two-pointers")
    points = models.IntegerField (default = 0)
    code = models.TextField (blank = True, null = True, help_text = "Початковий код для типу 'code'")
    e_input = models.TextField (blank = True, null = True)
    e_output = models.TextField (blank = True, null = True)
    c_type = models.CharField (max_length = 20, choices = ChallengeType.choices, default = ChallengeType.CODE)
    difficul = models.CharField (max_length = 20, choices = Difficul.choices, default = Difficul.EASY)
    language = models.CharField (max_length = 40, choices = Language.choices, default = Language.PYTHON)
    status = models.CharField (max_length = 20, choices = ChallengeStatus.choices, default = ChallengeStatus.DRAFT)

    created_at = models.DateTimeField (auto_now_add = True)
    updated_at = models.DateTimeField (auto_now = True)

    def __str__ (self):
        return self.title

#Class for connect user to chellange.
class UserChallengeProgress (models.Model):
    user = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.CASCADE, related_name = "challenge_progress")
    challenge = models.ForeignKey (Challange, on_delete = models.CASCADE, related_name = "user_progress")

    status = models.CharField (max_length = 20, choices = ChallengeProgress.choices, default = ChallengeProgress.NOT)
    submitted_code = models.TextField (blank = True, null = True)
    submitted_at = models.DateTimeField (null = True, blank = True)

    mentor_feedback = models.TextField (blank = True, null = True)
    mentor_score = models.PositiveIntegerField (null = True, blank = True)

    completed_at = models.DateTimeField (null = True, blank = True)
    attempts = models.PositiveIntegerField (default = 0)

    class Meta:
        constraints = [
            models.UniqueConstraint (fields = ["user", "challenge"], name="unique_user_challenge")
        ]
        ordering = ["-completed_at", "-submitted_at"]

    def __str__ (self):
        return f"{self.user.username} — {self.challenge.title} ({self.status})"

    @property
    def is_completed (self):
        return self.status == "completed"

    def mark_completed (self, score = None):
        self.status = "completed"
        self.completed_at = timezone.now()
        self.mentor_score = score
        self.save()