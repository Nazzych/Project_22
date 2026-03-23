from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.text import slugify

#.
class Channel (models.Model):
    owner = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "owned_channels")
    moderators = models.ManyToManyField (User, related_name = "moderated_channels", blank = True)
    subscribers = models.ManyToManyField (User, related_name = "subscribed_channels", blank = True)
    name = models.CharField (max_length = 100, unique = True)
    slug = models.SlugField (max_length = 120, unique = True, blank = True)
    description = models.TextField (blank = True)
    logo = models.URLField (blank = True, null=True) 
    banner = models.URLField (blank = True, null=True)

    is_approved = models.BooleanField (default = False)
    is_private = models.BooleanField (default = False)
    created_at = models.DateTimeField (auto_now_add = True)

    def save (self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify (self.name)
        super().save (*args, **kwargs)

#.
class Post (models.Model):
    author = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "posts")
    channel = models.ForeignKey (Channel, on_delete = models.SET_NULL, null=True, blank = True, related_name = "posts")
    title = models.CharField (max_length = 300, blank = True)
    content = models.TextField()
    views_count = models.PositiveIntegerField (default = 0)
    likes_count = models.PositiveIntegerField (default = 0)
    dislikes_count = models.PositiveIntegerField (default = 0)
    slug = models.SlugField (max_length = 300, blank = True, unique = True)

    is_pinned = models.BooleanField (default = False)
    is_edited = models.BooleanField (default = False)
    created_at = models.DateTimeField (auto_now_add = True)

    def save (self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify (self.title or f"post-{self.id}")
        super().save (*args, **kwargs)

    class Meta:
        ordering = ["likes_count"]

#.
class Comment (models.Model):
    author = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "comments")
    content = models.TextField()
    likes_count = models.PositiveIntegerField (default = 0)
    dislikes_count = models.PositiveIntegerField (default = 0)
    parent = models.ForeignKey ("self", null=True, blank = True, on_delete = models.CASCADE, related_name = "replies")

    content_type = models.ForeignKey (ContentType, on_delete = models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey ("content_type", "object_id")

    created_at = models.DateTimeField (auto_now_add = True)
    updated_at = models.DateTimeField (auto_now=True)
    is_edited = models.BooleanField (default = False)

    class Meta:
        indexes = [
            models.Index (fields = ["content_type", "object_id"]),
        ]
        ordering = ["-created_at"]