# urls.py (admin).
#*Підключення бібліотек.
#?from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

#?Налаштування роутера.
#?router = DefaultRouter()
#?router.register (r"chellanges", views.ChellangeViewSet, basename = "chellanges")

#Налаштування силок.
urlpatterns = [
    #?path ("", include (router.urls))
    path ("users/", views.get_users, name = "users"),
    path ("user/update/<int:user_id>/", views.update_user, name = "user-update"),
    path ("user/del/<int:user_id>/", views.delete_user, name = "user-delete"),
    path ("user/ban/<int:user_id>/", views.ban_user, name = "user-ban"),
    path ("task/add", views.add_challenge, name = "add-challenge"),
    path ("task/update/<int:challenge_id>/", views.update_challange, name = "update-challange"),
    path ("task/del/<int:challenge_id>/", views.delete_challenge, name = "delete-challenge"),
    path ("task/unapproved/", views.get_unupproved_channels, name = "get-unapproved-channels"),
    path ("task/accept/<int:channel_id>/", views.approve_channel, name = "approve-channel"),
    path ("task/reject/<int:channel_id>/", views.reject_channel, name = "reject-channel"),
    path ("courses/", views.get_courses, name = "courses"),
    path ("course/<int:course_id>/", views.get_course, name = "course"),
    path ("course/add/", views.add_course, name = "course-add"),
    path ("course/edit/<int:course_id>/", views.edit_course, name = "course-edit"),
    path ("course/del/<int:course_id>/", views.delete_course, name = "course-delete"),
    path ("lesson/add/<int:course_id>/", views.add_lesson, name = "add-lesson"),
    path ("projects/", views.get_projects, name = "projects"),
    path ("proj/<int:project_id>/update/", views.update_project, name = "update-project"),
    path ("proj/<int:project_id>/del/", views.delete_project, name = "del-project"),
]