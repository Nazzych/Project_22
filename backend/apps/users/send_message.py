from django.core.mail import send_mail
from django.utils.html import format_html
from backend.settings import DEFAULT_FROM_EMAIL

def send_password_email(email, password):
    subject = "🛡️ Your Code-HUB-NH Access Key"
    plain_message = f"""
Welcome to Code-HUB-NH!

Your temporary password: {password}

Please log in and change it as soon as possible.
"""

    html_message = format_html(f"""
        <div style="font-family: 'Courier New', monospace; background-color: #0d1117; color: #c9d1d9; padding: 24px; border-radius: 8px;">
            <h2 style="color: #58a6ff;">🧠 Welcome to <span style="color:#8b949e;">Code-HUB-NH</span></h2>
            <p>We've generated a secure access key for your GitHub-based account.</p>
            <p style="margin-top: 20px;">🔐 <strong>Your temporary password:</strong></p>
            <div style="background: #161b22; padding: 12px 16px; font-size: 18px; border: 1px solid #30363d; border-radius: 6px; display: inline-block;">
                <code id="temp-pass">{password}</code>
            </div>
            <p style="margin-top: 16px;">
                <a href="http://localhost:3000/profile" style="background-color: #238636; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    🔐 Go to Profile
                </a>
            </p>
            <p style="margin-top: 24px; color: #8b949e;">Please change your password immediately after logging in.</p>
            <hr style="border-color: #30363d;">
            <p style="font-size: 12px; color: #6e7681;">This is an automated security message from Code-HUB-NH. Stay safe, stay sharp.</p>
        </div>
    """)

    send_mail(
        subject,
        plain_message,
        DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
        html_message=html_message
    )
