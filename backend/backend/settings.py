from dotenv import load_dotenv
from pathlib import Path
from decouple import config
import sys, os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / 'apps'))
load_dotenv (os.path.join(BASE_DIR, '.env'))


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-co%mymdg#=0!ju)80)wux%m0o!0gx_#(oqald%pf4utivjq^6o'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
#Third party apps
    'rest_framework',
    'corsheaders',
    "supabase",

#Local apps
    'apps.users',
    'apps.task',
    'apps.courses',
    'apps.projects',
    'apps.forum',
    'apps.dashboard',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.server': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

#? E-mail (swsp tuxw xykx vjuh)
EMAIL_BACKEND = config ("EMAIL_BACKEND")
EMAIL_HOST = config ("EMAIL_HOST")
EMAIL_PORT = config ("EMAIL_PORT", cast = int)
EMAIL_USE_TLS = config ("EMAIL_USE_TLS", cast = bool)
EMAIL_HOST_USER = config ("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config ("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = config ("DEFAULT_FROM_EMAIL")

# Protection
CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://192.168.110.67:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://192.168.110.67:3000",
]

CORS_ALLOW_CREDENTIALS = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False  # True на проді з HTTPS
CSRF_COOKIE_SECURE = False     # True на проді з HTTPS