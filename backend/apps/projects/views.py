# views.py (projects).
#*Підключення бібліотек.
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import TooManyFilesSent
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets
from storage3.exceptions import StorageApiError
from users.permissions import isAuthenticated
from .supabase_client import upload_file_to_supabase, get_file, update_file, download_file, delete_file
from .serializers import ProjectSerializer
from .tree_builder import build_file_tree
from .models import Project, ProjectFile
import traceback, json, os, re

#Деф очищення шляху.
def sanitize_path (path: str) -> str:
    path = path.replace (" ", "_")
    path = re.sub (r"[^\w\-/\.]", "", path)
    return path

#.
@require_http_methods (["POST"])
@permission_classes ([isAuthenticated])
def add_project (request):
    title = request.POST.get ("title", "")
    description = request.POST.get ("description", "").strip()
    readme = request.POST.get ("readme", "").strip()
    github_url = request.POST.get ("github_url", "")
    # live_url = request.POST.get ("live_url", "")
    technologies = request.POST.get ("technologies", "")
    status = request.POST.get ("status", "")
    image = request.POST.get ("image_url", "")
    files = request.FILES.getlist ("file")
    paths_raw = request.POST.get("paths", "[]")

    print ("POST:", dict (request.POST))
    print ("FILES:", request.FILES)

    try:
        paths = json.loads (paths_raw)
    except json.JSONDecodeError:
        return JsonResponse ({
            "type": "error",
            "message": "Can't parse list of paths."
        }, status = 400)

    if not title or not description:
        return JsonResponse ({
            "type": "warning",
            "message": "Fields \"title\" and \"description\" requaried."
        }, status = 400)

    if not readme:
        return JsonResponse ({
            "type": "warning",
            "message": "Field \"README\" requaried for describe a tehnical part."
        }, status = 400)

    if Project.objects.filter (title = title, owner = request.user).exists():
        return JsonResponse ({
            "type": "warning",
            "message": "Project with it name exist."
        }, status = 400)

    if not files or not paths or len (files) != len (paths):
        return JsonResponse ({
            "type": "error",
            "message": "Files or path not selected, or them count unmuch."
        }, status = 400)

    for file, path in zip (files, paths):
        safe_path = sanitize_path (path)
        try:
            upload_file_to_supabase (file, safe_path, request.user.id)
        except Exception as e:
            return JsonResponse ({
                "type": "error",
                "message": f"Не вдалося завантажити {path}: {str (e)}"
            }, status = 500)

    try:
        with transaction.atomic():
            proj = Project.objects.create (
                owner = request.user,
                title = title,
                description = description,
                readme = readme,
                #? live_url = live_url,
                github_url = github_url,
                technologies = technologies,
                status = status,
                image = image
            )

            for file, path in zip (files, paths):
                safe_path = sanitize_path (path)
                ProjectFile.objects.create (
                    project = proj,
                    path = safe_path,
                    is_directory = False
                )

        return JsonResponse ({
            "type": "success",
            "message": "Проєкт створено успішно.",
            "success": True,
            "project": {
                "owner": proj.owner.username,
                "title": proj.title,
                "description": proj.description,
                "github_url": proj.github_url,
                #? "live_url": proj.live_url,
                "technologies": proj.technologies,
                "image": proj.image,
            }
        })
    except TooManyFilesSent:
        return JsonResponse (
            {"type": "warning", "message": "You select to many files. Select some little."},
            status = 400
        )
    except Exception as e:
        return JsonResponse ({
            "type": "error",
            "message": str (e)
        }, status = 400)

@api_view (["GET"])
def get_project_structure (request, project_id):
    try:
        project = Project.objects.get (id = project_id)
        files = ProjectFile.objects.filter (project = project).order_by ("path")
        tree = build_file_tree (files)
        return Response (tree)
    except Project.DoesNotExist:
        return Response ({"error": "Project not found"}, status=404)

# Отримання вмісту файлу
@api_view (["GET"])
@permission_classes ([IsAuthenticated])
def get_project_file (request, project_id):
    print ("DEBUG: get_project_file called")
    print (f"DEBUG: project_id = {project_id}")
    print (f"DEBUG: full path = {request.get_full_path()}")
    print (f"DEBUG: GET dict = {dict (request.GET)}")
    print (f"DEBUG: GET raw = {request.GET}")
    print (f"DEBUG: query_string = {request.META.get ('QUERY_STRING')}")

    raw_path = request.GET.get ("path")
    print (f"DEBUG: raw_path = {raw_path!r} (type: {type (raw_path).__name__})")

    if isinstance (raw_path, list):
        path = raw_path [0] if raw_path else ""
        print ("DEBUG: path був списком → взято перший елемент")
    else:
        path = raw_path or ""

    print (f"DEBUG: final path = {path!r}")
    print (f"DEBUG: len(path) = {len (path)}")
    print (f"DEBUG: bool(path) = {bool (path)}")

    if not path:
        print ("DEBUG: path is falsy → returning 400")
        return JsonResponse ({"error": "Path is required."}, status = 400)

    print ("DEBUG: path passed check → continuing")

    project = Project.objects.filter (id = project_id, owner = request.user).first()
    print (f"=> DEBUG: project query executed, result: {project}")

    if not project:
        print (f"DEBUG: project {project_id} not found or access denied")
        return JsonResponse ({"error": "Project not found or access denied."}, status = 404)

    print (f"DEBUG: project found: {project.title} (id={project.id})")

    file_entry = ProjectFile.objects.filter (project = project, path = path).first()
    if not file_entry:
        from os.path import basename
        base = basename (path)
        file_entry = ProjectFile.objects.filter (project = project, path__iendswith = base).first()
    print (f"=> DEBUG: file_entry query executed, result: {file_entry}")

    if not file_entry:
        print (f"DEBUG: file not found in DB: project={project.id}, path={path}")
        return JsonResponse ({"error": "Файл не знайдено в базі."}, status = 404)

    #? Важливо: шлях у Supabase формується з ID користувача, а не проєкту!
    full_path = f"{project.owner.id}/{file_entry.path}"
    print (f"Requested file path: {full_path}")
    print (f"DEBUG: owner.id = {project.owner.id}, user.id = {request.user.id}")

    try:
        print (f"[→] Downloading file: {path} → {full_path}")
        file_bytes = get_file (full_path)
        print (f"DEBUG: Downloaded {len (file_bytes)} bytes")

        try:
            content = file_bytes.decode ("utf-8")
        except UnicodeDecodeError:
            print ("DEBUG: UnicodeDecodeError → returning 415")
            return JsonResponse ({"error": "Файл не є текстовим або має інше кодування."}, status = 415)

        print ("DEBUG: file successfully read and decoded")
        return JsonResponse ({
            "path": file_entry.path,
            "content": content
        })

    except StorageApiError as e:
        error_data = e.args [0] if e.args else {}
        status_code = error_data.get ("statusCode", 500)
        message = error_data.get ("message", str (e))
        print (f"DEBUG: StorageApiError: {message} (status {status_code})")
        if status_code == 404:
            return JsonResponse ({"error": "Файл не знайдено в Supabase"}, status = 404)
        return JsonResponse ({"error": f"Помилка Supabase: {message}"}, status = status_code)

    except Exception as e:
        print ("DEBUG: unexpected exception")
        traceback.print_exc()
        return JsonResponse ({"error": f"Невідома помилка: {str (e)}"}, status = 500)

#.
@api_view (["PUT"])
@permission_classes ([IsAuthenticated])
def update_project_file (request, project_id):
    path = request.data.get ("path")
    content = request.data.get ("content")

    if not path or not content:
        return JsonResponse ({"error": "Path and content required"}, status = 400)

    project = Project.objects.filter (id = project_id, owner = request.user).first()
    if not project:
        return JsonResponse ({"error": "Access denied"}, status = 403)

    file_entry = ProjectFile.objects.filter (project = project, path__endswith = path).first()
    if not file_entry:
        return JsonResponse ({"error": "File not found"}, status = 404)

    print (f"[UPDATE] Updating file: project_id={project_id}, path={path}")
    full_path = f"{project.owner.id}/{file_entry.path}"
    print (f"[DEBUG] Writing content to {full_path}: {repr (content [:800])}...")

    try:
        update_file (full_path, content)
        return JsonResponse ({"success": True, "message": "File updated successfully"})
    except Exception as e:
        traceback.print_exc()
        return JsonResponse ({"error": str (e)}, status = 500)

#.
@api_view (["POST"])
@permission_classes ([IsAuthenticated])
def download_project_file (request, project_id):
    path = request.data.get ("path")
    if not path:
        return JsonResponse ({"error": "Path required"}, status = 400)

    project = Project.objects.filter (id = project_id, owner = request.user).first()
    if not project:
        return JsonResponse ({"error": "Access denied"}, status = 403)

    file_entry = ProjectFile.objects.filter (project = project, path__endswith = path).first()
    if not file_entry:
        return JsonResponse ({"error": "File not found"}, status = 404)

    full_path = f"{project.owner.id}/{file_entry.path}"
    try:
        file_data = download_file (full_path)  #? returns bytes
        filename = os.path.basename (file_entry.path)
        response = HttpResponse (file_data, content_type = "application/octet-stream")
        response ["Content-Disposition"] = f"attachment; filename='{filename}'"
        return response
    except Exception as e:
        traceback.print_exc()
        return JsonResponse ({"error": str (e)}, status = 500)

#.
@api_view (["DELETE"])
@permission_classes ([IsAuthenticated])
def delete_project_file (request, project_id):
    path = request.GET.get ("path")
    if not path:
        return JsonResponse ({"error": "Path required"}, status = 400)

    project = get_object_or_404 (Project, id = project_id)

    if project.owner != request.user:
        print (f"[DELETE] Access denied: user {request.user.id} is not owner of project {project.id}")
        return JsonResponse ({"error": "Access denied"}, status = 403)

    print (f"[DELETE] Запит на видалення: project_id={project_id}, path={path}")

    file_entry = ProjectFile.objects.filter (project = project, path__endswith = path).first()

    if not file_entry:
        print (f"[DELETE] Файл не знайдено в базі: project={project.id}, path={path}")
        return JsonResponse ({"error": "File not found in database"}, status = 404)

    full_path = f"{project.id}/{file_entry.path}"
    print (f"[DELETE] Повний шлях у Supabase: {full_path}")

    try:
        delete_file (full_path)
        print (f"[DELETE] Успішно видалено з Supabase: {full_path}")

        file_entry.delete()
        print (f"[DELETE] Видалено запис з бази: path={path}")

        return JsonResponse ({
            "success": True,
            "message": f"Файл '{path}' видалено успішно"
        }, status = 200)

    except StorageApiError as e:
        error_data = e.args [0] if e.args and isinstance (e.args [0], dict) else {}
        status_code = error_data.get ("statusCode", 500)
        message = error_data.get ("message", str (e))

        print (f"[DELETE] Помилка Supabase: {status_code} - {message}")

        if status_code == 404:
            file_entry.delete()
            return JsonResponse ({
                "success": True,
                "message": "File dleted from base (Storage empty)"
            }, status = 200)

        return JsonResponse ({"error": f"Error Supabase: {message}"}, status = status_code)

    except Exception as e:
        traceback.print_exc()
        print (f"[DELETE] Невідома помилка: {str (e)}")
        return JsonResponse ({"error": f"Unknown error: {str (e)}"}, status = 500)

#.
class ProjectViewSet (viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [isAuthenticated]

    def get_queryset (self):
        scope = self.request.query_params.get ("scope", "all")
        if scope == "my":
            return Project.objects.filter (owner = self.request.user)
        return Project.objects.all()

    def perform_create (self, serializer):
        serializer.save (owner = self.request.user)

    def perform_update (self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied ("You can only edit your own projects.")
        serializer.save()

    def perform_destroy (self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied ("You can only delete your own projects.")
        instance.delete()
