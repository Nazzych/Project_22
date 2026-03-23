# supabase_client.py (projects).
#*Підключення бібліотек.
from django.http import JsonResponse
from supabase import create_client
from dotenv import load_dotenv
import httpx
import os
import re


#Завантаження змінних середовища.
load_dotenv()
SUPABASE_URL = os.getenv ("SUPABASE_URL")
SUPABASE_KEY = os.getenv ("SUPABASE_KEY")
supabase = create_client (SUPABASE_URL, SUPABASE_KEY)

#Деф очищення шляху від небезпечних символів.
def sanitize_path (path: str) -> str:
    path = path.replace (" ", "_")
    return re.sub (r"[^\w\-/\.]", "", path)

#Деф завантаження файлу в Supabase.
def upload_file_to_supabase (file, path, user_id):
    bucket_name = "codehub-files"

    safe_path = sanitize_path (path)
    full_path = f"{user_id}/{safe_path}"
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{bucket_name}/{full_path}"
    #? print (f"[DEBUG] Uploading to: {upload_url}")

    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": file.content_type or "application/octet-stream",
        "x-upsert": "false",
        "x-amz-meta-user_id": str (user_id)
    }

    try:
        response = httpx.post (upload_url, content = file.read(), headers = headers, timeout = 30)
        
        print (f"[DEBUG] Supabase status: {response.status_code}")
        print (f"[DEBUG] Supabase response: {response.text [:300]}")
        
        response.raise_for_status()
        #? print (f"[✓] Uploaded via REST: {full_path}")
        return None

    except httpx.HTTPStatusError as e:
        print (f"[✗] Supabase HTTP error: {e.response.status_code}")
        print (f"[✗] Body: {e.response.text}")

        try:
            error_data = e.response.json()
        except Exception:
            error_data = {"message": e.response.text}

        message = error_data.get ("message", "Unknown error")
        status = e.response.status_code
        return JsonResponse ({"error": f"Error Supabase: {message}"}, status = status)

    except Exception as e:
        print (f"[✗] Unexpected error: {str (e)}")
        return JsonResponse ({"error": "Unexpected error"}, status = 500)

#Деф отримання файлу.
def get_file (path: str):
    try:
        response = supabase.storage.from_("codehub-files").download (path)
        if hasattr (response, "error") and response.error:
            raise Exception (f"Supabase error: {response.error.message}")
        return response
    except Exception as e:
        print (f"DEBUG: get_file() failed: {e}")
        raise

#Деф оновлення файлу.
def update_file (path: str, content: str):
    try:
        file_bytes = content.encode ("utf-8")
        response = supabase.storage.from_("codehub-files").update (path, file_bytes, {
            "content-type": "text/plain",
            "x-upsert": "true",
            "cache-control": "no-cache"
        })
        return response
    except Exception as e:
        print ("DEBUG: update_file() failed:", str (e))
        raise

#Деф завантаження файлу.
def download_file (path: str):
    try:
        response = supabase.storage.from_("codehub-files").download (path)
        if hasattr (response, "error") and response.error:
            raise Exception (f"Supabase download error: {response.error.message}")
        print (f"[✓] Downloaded: {path}")
        return response
    except Exception as e:
        print (f"DEBUG: download_file() failed: {e}")
        raise

#Деф видалення файлу.
def delete_file (path: str):
    try:
        response = supabase.storage.from_("codehub-files").remove ([path])
        if hasattr (response, "error") and response.error:
            raise Exception (f"Supabase delete error: {response.error.message}")
        print (f"[✓] Deleted: {path}")
    except Exception as e:
        print (f"DEBUG: delete_file() failed: {e}")
        raise