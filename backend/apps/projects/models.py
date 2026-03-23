from django.db import models
from django.contrib.auth.models import User


#Class for status.
class Status (models.TextChoices):
    ACTIVE = "active", "Active"
    COMPLETED = "completed", "Completed"
    ARCHIVED = "archived", "Archived"

#ProjectHub / GitHub projects.
class Project (models.Model):
    owner = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "projects")
    title = models.CharField (max_length = 255, blank = False, null = False)
    description = models.TextField (blank = False, null = False)
    readme = models.TextField (default = "No readme provided", blank = False, null = False)
    github_url = models.URLField (blank = True, null = True)
    #? live_url = models.URLField (blank = True, null = True)
    technologies = models.CharField (max_length = 255, blank = True)
    image = models.URLField (blank = True, null = True)
    stars = models.IntegerField (default = 0)
    status = models.CharField (max_length = 20, choices = Status.choices, default = Status.ACTIVE)
    is_public = models.BooleanField (default = True)
    created_at = models.DateTimeField (auto_now_add = True)

    def __str__ (self):
        return self.title

#ProjectHub / GitHub projects.
class ProjectFile (models.Model):
    project = models.ForeignKey (Project, on_delete = models.CASCADE, related_name = "files")
    path = models.CharField (max_length = 500)
    is_directory = models.BooleanField (default = False)
    uploaded_at = models.DateTimeField (auto_now_add = True)

    def __str__ (self):
        return self.path

#GitHub repo.
class GitHubRepo (models.Model):
    project = models.OneToOneField (Project, on_delete = models.CASCADE, related_name = "github")
    repo_id = models.CharField (max_length = 100)
    full_name = models.CharField (max_length = 255)
    default_branch = models.CharField (max_length = 100)
    language = models.CharField (max_length = 100)
    topics = models.JSONField (blank = True, null = True)
    stars = models.IntegerField (blank = True, null = True)
    forks = models.IntegerField (blank = True, null = True)
    watchers = models.IntegerField (blank = True, null = True)
    license = models.CharField (max_length = 100, blank = True, null = True)
    last_push = models.DateTimeField (blank = True, null = True)
