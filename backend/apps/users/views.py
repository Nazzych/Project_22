# views.py (user).
#*Підключення бібліотек.
from django.contrib.auth import get_user_model, update_session_auth_hash, authenticate, get_backends, login as auth_login, logout as auth_logout
from django.contrib.auth.password_validation import validate_password
#? from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.http import HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods, require_POST
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets, status
from backend.settings import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
from .serializers import UserSerializer
from .permissions import isAuthenticated, IsAdministrator, login_required_api
from dateutil.parser import parse
from .models import Profile
from .send_message import send_password_email
import json, secrets, requests, jwt, time


@api_view (["GET"])
@ensure_csrf_cookie
@permission_classes ([AllowAny])
def csrf_check (request):
    return JsonResponse({"detail": "CSRF cookie set"})

@api_view (["GET"])
@permission_classes ([AllowAny])
def check_session (request):
    return Response({"authenticated": request.user.is_authenticated})

@permission_classes ([AllowAny])
def generate_github_jwt():
    with open (settings.GITHUB_PRIVATE_KEY_PATH, "r") as f:
        private_key = f.read()

    payload = {
        "iat": int(time.time()),
        "exp": int(time.time()) + 600,
        "iss": settings.GITHUB_APP_ID,
    }

    encoded_jwt = jwt.encode (payload, private_key, algorithm = "RS256")
    return encoded_jwt

User = get_user_model()

@require_http_methods(["GET", "POST"])
@permission_classes ([AllowAny])
def login(request):
    if request.user.is_authenticated: 
        return JsonResponse({"detail": "Already logged in"}, status=400)

    if request.method == "POST":
        data = json.loads (request.body)
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        try:
            user = User.objects.get(email=email)
            print (f"=> {user.username if user else 'Not found'}")
            if user.check_password(password):
                auth_login(request, user)
                return JsonResponse({
                    "success": True,
                    "user": {
                        "username": user.username,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                    }
                })
        except User.DoesNotExist:
            print (f"Except error")

        return JsonResponse({"success": False})

    return HttpResponseNotAllowed(["GET", "POST"])

@require_http_methods (["GET", "POST"])
@permission_classes ([AllowAny])
def register (request):
    if request.user.is_authenticated:
        return JsonResponse ({"detail": "Already logged in"}, status = 400)

    if request.method == "GET":
        return JsonResponse ({"data": "None you ha!"})

    try:
        data = json.loads (request.body)
    except json.JSONDecodeError:
        return JsonResponse ({"error": "Невірний формат JSON."}, status = 400)

    username = data.get ("name", "").strip()
    email = data.get ("email", "").strip().lower()
    password = data.get ("password", "")

    if not username or not email or not password:
        return JsonResponse ({"error": "Усі поля обов’язкові."}, status = 400)

    if User.objects.filter (email = email).exists():
        return JsonResponse ({"error": "Користувач з такою електронною поштою вже існує."}, status = 400)

    try:
        validate_password (password)
    except ValidationError as e:
        return JsonResponse ({"error": e.messages}, status = 400)

    name_parts = username.split (" ", 1)
    first_name = name_parts [0]
    last_name = name_parts [1] if len (name_parts) > 1 else ""

    user = User.objects.create_user (
        username = username,
        first_name = first_name,
        last_name = last_name,
        email = email,
        password = password
    )

    auth_login (request, user)

    return JsonResponse ({
        "success": True,
        "user": {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    })

@require_POST
@permission_classes ([isAuthenticated])
def logout (request):
    if request.user.is_authenticated: 
        auth_logout (request)
    return redirect ("user-login")

@api_view (["GET"])
@permission_classes ([AllowAny])
def github_login_callback (request):
    #?print ("CLIENT_ID:", GITHUB_CLIENT_ID)
    #?print ("CLIENT_SECRET:", GITHUB_CLIENT_SECRET)

    code = request.GET.get ("code")
    if not code:
        return Response ({"error": "No code provided"}, status = 400)

    token_res = requests.post (
        "https://github.com/login/oauth/access_token",
        headers = {"Accept": "application/json"},
        data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        },
        timeout = 10
    )
    token_data = token_res.json()
    access_token = token_data.get ("access_token")
    if not access_token:
        return Response ({"error": "GitHub access token not received", "details": token_data}, status = 400)

    header = {"Authorization": f"token {access_token}"}
    user_data = requests.get ("https://api.github.com/user", headers = header).json()
    email_data = requests.get ("https://api.github.com/user/emails", headers = header).json()

    try:
        if not isinstance (email_data, list):
            raise ValueError ("Expected list of emails")
        primary_email = next ((e ["email"] for e in email_data if e.get ("primary") and e.get ("verified")), None)
    except Exception as e:
        return Response ({
            "error": "Failed to parse email response",
            "details": str (e),
            "raw_response": email_data
        }, status = 500)

    username = user_data.get ("login") or ""
    full_name = user_data.get ("name") or ""
    first_name, *rest = full_name.strip().split (" ")
    last_name = " ".join (rest) if rest else ""

    user, created = User.objects.get_or_create ( #? or use "_"
        email = primary_email,
        defaults = {
            "username": username,
            "email": primary_email,
            "first_name": first_name,
            "last_name": last_name,
        }
    )
    #?(опційно) оновити дані, якщо користувач вже існує or use update_or_create
    # if not created:
    #     user.first_name = first_name
    #     user.last_name = last_name
    #     user.save()
    profile_data = {
        'username': username.lower(),
        'email': primary_email,
        'name': full_name,
        'html_url': user_data.get('html_url'),
        'company': user_data.get('company'),
        'blog': user_data.get('blog'),
        'bio': user_data.get('bio'),
        'twitter_username': user_data.get('twitter_username'),
        'public_repos': user_data.get('public_repos'),
        'followers': user_data.get('followers'),
        'created_at': user_data.get('created_at'),
        'avatar_url': user_data.get('avatar_url'),
    }
    #? print (f"==> Profile Data: \n{profile_data}")
    if created:
        password = secrets.token_urlsafe (16)
        user.set_password (password)
        user.save()
        auth_login (request, user)
        profile_data.update ({"created": True})
        send_password_email (user.email, password)
        payload = {
            "profile_data": profile_data,
            "exp": int (time.time()) + 300
        }
        token = jwt.encode (payload, settings.SECRET_KEY, algorithm = "HS256")
        return redirect (f"http://localhost:3000/profile?token={token}")
    else:
        auth_login (request, user)
        return redirect ("http://localhost:3000/")

@api_view (["PUT"])
@permission_classes ([isAuthenticated])
def github_save_profile (request):
    user = request.user
    profile = user.profile

    allowed_fields = {
        "username": "user",
        "email": "user",
        "name": "user",
        "bio": "profile",
        "twitter_url": "profile:twitter",
        "html_url": "profile:git",
        "avatar_url": "profile",
        "public_repos": "profile",
        "followers": "profile",
        "created_at": "profile",
    }
    # print ("Received data:", request.data)
    for field, target in allowed_fields.items():
        value = request.data.get (field)
        if value is not None and value != "":
            if field == "name":
                parts = value.strip().split()
                user.first_name = parts [0]
                user.last_name = " ".join (parts [1:]) if len (parts) > 1 else ""
            elif field == "username":
                user.username = value.lower()
            elif field == "email":
                user.email = value
            elif ":" in target:
                model, actual_field = target.split (":")
                if model == "profile":
                    setattr (profile, actual_field, value)
            elif target == "user":
                setattr (user, field, value)
            elif target == "profile":
#?обробка типів
                if field in ["public_repos", "followers"]:
                    try:
                        value = int (value)
                    except ValueError:
                        continue
                elif field == "created_at":
                    try:
                        value = parse (value)
                    except Exception:
                        continue
                setattr (profile, field, value)

    user.save()
    profile.save()

    return Response({"status": "ok"})

class CurrentUserView (APIView):
    permission_classes = [isAuthenticated]

    def get (self, request):
        serializer = UserSerializer (request.user)
        return Response (serializer.data)

# @permission_classes([IsAuthenticated])
@api_view (["PUT"])
@login_required_api
def update_profile (request):
    user = request.user
    data = request.data
    username = data.get ("username", user.username)
    email = data.get ("email", user.email)

    existing_username = User.objects.filter (username = username).first()
    if existing_username and existing_username.id != user.id:
        return Response ({"warning": True, "message": "This \"username\" is already taken by another user."}, status = status.HTTP_302_FOUND)
    
    existing_useremail = User.objects.filter (email = email).first()
    if existing_useremail and existing_useremail.id != user.id:
        return Response ({"warning": True, "message": "This \"E-mail\" is already taken by another user."}, status = status.HTTP_302_FOUND)

    user.email = email
    user.username = username
    user.first_name = data.get ("first_name", user.first_name)
    user.last_name = data.get ("last_name", user.last_name)
    user.profile.bio = data.get ("bio", user.profile.bio)
    user.profile.git = data.get ("git", user.profile.git)
    user.profile.address = data.get ("address", user.profile.address)
    user.profile.youtube = data.get ("youtube", user.profile.youtube)
    user.profile.twitter = data.get ("twitter", user.profile.twitter)
    user.profile.linkedin = data.get ("linkedin", user.profile.linkedin)

    user.save()
    user.profile.save()

    return Response ({"success": True}, status = status.HTTP_200_OK)

@api_view (["PUT"])
@permission_classes ([isAuthenticated])
def update_password (request):
    user = request.user
    data = request.data
    old_password = data.get ("old_password", "")
    new_password = data.get ("new_password", "")
    confirm_password = data.get ("confirm_password", "")

    if not user.check_password (old_password):
        return Response ({"success": False, "details": "Incorecr old password!"}, status = status.HTTP_401_UNAUTHORIZED)
    if new_password != confirm_password:
        return Response ({"success": False, "details": "Password not match!"}, status = status.HTTP_400_BAD_REQUEST)

    user.set_password (new_password)
    user.save()
    update_session_auth_hash (request, user)
    return Response ({"success": True}, status = status.HTTP_200_OK)

@api_view (["DELETE"])
@permission_classes ([isAuthenticated])
def delete_profile (request):
    user = request.user
    user.delete()
    return Response ({"success": True}, status = status.HTTP_200_OK)

# class UserViewSet (viewsets.ReadOnlyModelViewSet):
#     """
#     - GET /users/ → список усіх користувачів
#     - GET /users/{id}/ → перегляд конкретного користувача
#     """
#     queryset = Profile.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [IsAdministrator]
#     def retrieve (self, request, *args, **kwargs):
#         user = self.get_object()
#         borrowed_items = OrderItem.objects.filter (order__user = user.user, order__is_closed = False).select_related ("book", "book__author")
#         for item in borrowed_items:
#             item.total_price = item.book.price * item.quantity
#         return render (request, "user/components/user_detail.html", {"user": user, "books": borrowed_items})