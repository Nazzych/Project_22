# models.py (task). [клан сопрано]
#*Підключення бібліотек.
from django.db import models, transaction
from django.utils import timezone
from django.conf import settings


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
class Difficulty (models.TextChoices):
    EASY = "easy", "Easy"
    MEDIUM = "medium", "Medium"
    HARD = "hard", "Hard"

#Class for type.
class ChallengeType (models.TextChoices):
    QUIZ = "quiz", "Quiz"
    CODE = "code", "Code"
    MENTOR = "mentor", "Mentor Check"

#Class for status in challenge.
class ChallengeStatus (models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"

#Class for  status in user challenge.
class ChallengeProgress (models.TextChoices):
    NOT_STARTED = "not_started", "Not Started"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"
    SUBMITTED = "submitted", "Submitted (awaiting review)"


#*[-----<Models>-----].
#Клас <загальний> завданнь.
class Challenge (models.Model):
    """Базова модель для всіх типів завдань"""
    author = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.CASCADE, verbose_name = "Автор")
    title = models.CharField (max_length = 200, verbose_name = "Назва завдання")
    description = models.TextField (verbose_name = "Опис завдання")
    tags = models.CharField (max_length = 255, blank = True, help_text = "Через кому: easy, python")
    points = models.PositiveIntegerField (default = 0, help_text = "Кількість балів за виконання завдання", verbose_name = "Бали")
    difficulty = models.CharField (max_length = 20, choices = Difficulty.choices, default = Difficulty.EASY)
    c_type = models.CharField (max_length = 20, choices = ChallengeType.choices, verbose_name = "Тип завдання")
    status = models.CharField (max_length = 20, choices = ChallengeStatus.choices, default = ChallengeStatus.DRAFT)
    language = models.CharField (max_length = 40, choices = Language.choices)
    created_at = models.DateTimeField (auto_now_add = True)
    updated_at = models.DateTimeField (auto_now = True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Завдання"
        verbose_name_plural = "Завдання"

    def __str__ (self):
        return f"{self.title} ({self.c_type})"

#Клас завдання типу - код.
class CodeChallenge (models.Model):
    """Специфічні поля для завдань з кодом"""
    challenge = models.OneToOneField (Challenge, on_delete = models.CASCADE, related_name = "code_challenge")
    starter_code = models.TextField (blank = True, null = True)
    e_input = models.TextField (blank = True, null = True)
    e_output = models.TextField (blank = True, null = True)

    def __str__ (self):
        return f"Code: {self.challenge.title}"

#Клас завдання типу - квіз.
class QuizChallenge (models.Model):
    """Специфічні поля для Quiz"""
    challenge = models.OneToOneField (Challenge, on_delete = models.CASCADE, related_name = "quiz_challenge")
    time_limit_minutes = models.PositiveIntegerField (null = True, blank = True)
    passing_score = models.PositiveIntegerField (default = 70, help_text = "Мінімальний бал для проходження квізу")

    def __str__ (self):
        return f"Quiz: {self.challenge.title}"


#Клас питання квізу.
class QuizQuestion (models.Model):
    quiz = models.ForeignKey (QuizChallenge, on_delete = models.CASCADE, related_name = "questions")
    question_text = models.TextField()
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]

    def __str__ (self):
        return f"Q{self.order}: {self.question_text [:50]}"

    def save (self, *args, **kwargs):
        if self.order is None or self.order == 0:
            with transaction.atomic():
                max_order = QuizQuestion.objects.filter (quiz = self.quiz).aggregate (models.Max ("order"))["order__max"]
                self.order = (max_order or 0) + 1

        elif QuizQuestion.objects.filter (
                quiz = self.quiz, 
                order = self.order
            ).exclude (pk = self.pk).exists():
            with transaction.atomic():
                QuizQuestion.objects.filter (
                    quiz = self.quiz, 
                    order__gte = self.order
                ).exclude (pk = self.pk).update (order = models.F ("order") + 1)
        super().save (*args, **kwargs)

#Клас відповідів квізу.
class QuizAnswer (models.Model):
    question = models.ForeignKey (QuizQuestion, on_delete = models.CASCADE, related_name = "answers")
    answer_text = models.CharField (max_length = 500)
    is_correct = models.BooleanField (default = False)

    def __str__ (self):
        return self.answer_text [:50]

#Class for connect user to challenge.
class UserChallengeProgress (models.Model):
    user = models.ForeignKey (
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "challenge_progress"
    )
    challenge = models.ForeignKey (
        Challenge,
        on_delete = models.CASCADE,
        related_name = "user_progress"
    )
    status = models.CharField (
        max_length = 30,
        choices = ChallengeProgress.choices,
        default = ChallengeProgress.NOT_STARTED
    )
    attempts = models.PositiveIntegerField (default = 0)

    completed_at = models.DateTimeField (null = True, blank = True)
    attempted_at = models.DateTimeField (auto_now_add = True, null = True, blank = True)

# === Поля для Code Challenge ===
    submitted_code = models.TextField (blank = True, null = True)
    submitted_at = models.DateTimeField (null = True, blank = True)

# === Поля для Quiz ===
    current_question_index = models.PositiveIntegerField (default = 0)
    selected_answers = models.JSONField (default = dict, blank = True)   #? { "question_id": answer_index }

# === Поля для Mentor Check ===
    mentor_feedback = models.TextField (blank = True, null = True)
    mentor_score = models.PositiveIntegerField (null = True, blank = True)

    class Meta:
        unique_together = ("user", "challenge")
        ordering = ["-completed_at", "-submitted_at"]

    def __str__ (self):
        return f"{self.user.username} — {self.challenge.title} [{self.status}]"

    @property
    def is_completed (self):
        """Повертає True, якщо завдання виконано"""
        return self.status == ChallengeProgress.COMPLETED

    # ====================== МЕТОДИ ======================

    def mark_completed (self, score = None):
        """Позначити завдання як виконане"""
        self.status = ChallengeProgress.COMPLETED
        self.completed_at = timezone.now()
        if score is not None:
            self.mentor_score = score
        self.save()

    def save_selected_answer (self, question_id: int, answer_index: int):
        """Зберегти вибрану відповідь на конкретне питання (для Quiz)"""
        self.selected_answers [str (question_id)] = answer_index
        self.save (update_fields = ["selected_answers"])

    def get_selected_answer (self, question_id: int):
        """Отримати вибрану відповідь на питання"""
        return self.selected_answers.get (str (question_id))

#?<.
    # def reset_progress(self):
    #     """Скинути прогрес (корисно для повторного проходження)"""
    #     self.status = ChallengeProgress.NOT_STARTED
    #     self.completed_at = None
    #     self.attempts = 0
    #     self.submitted_code = None
    #     self.current_question_index = 0
    #     self.selected_answers = {}
    #     self.mentor_feedback = None
    #     self.mentor_score = None
    #     self.save()
#?>.