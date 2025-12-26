import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Use the existing .env variable names
        self.smtp_server = settings.SMTP_HOST if hasattr(settings, 'SMTP_HOST') else settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.email_address = settings.FROM_EMAIL if hasattr(settings, 'FROM_EMAIL') else settings.EMAIL_ADDRESS
        self.email_password = settings.SMTP_PASS if hasattr(settings, 'SMTP_PASS') else settings.EMAIL_PASSWORD
        
        # Determine if using secure connection based on port
        if hasattr(settings, 'SMTP_SECURE'):
            self.use_tls = settings.SMTP_SECURE
        else:
            self.use_tls = settings.EMAIL_USE_TLS if hasattr(settings, 'EMAIL_USE_TLS') else True

    def send_email(self, recipient_email: str, subject: str, html_content: str, text_content: Optional[str] = None):
        """Send an email using SMTP"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.email_address
            message["To"] = recipient_email

            # Create text/plain and text/html parts
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Create secure connection and send email
            context = ssl.create_default_context()
            
            if self.use_tls:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls(context=context)
                    server.login(self.email_address, self.email_password)
                    server.sendmail(self.email_address, recipient_email, message.as_string())
            else:
                # For SSL connections (like port 465)
                with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, context=context) as server:
                    server.login(self.email_address, self.email_password)
                    server.sendmail(self.email_address, recipient_email, message.as_string())
            
            logger.info(f"Email sent successfully to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {recipient_email}: {str(e)}")
            return False

    def send_verification_email(self, recipient_email: str, verification_token: str):
        """Send email verification email with OTP"""
        
        subject = "Verify Your Email Address - AI Nutritionist"
        html_content = f"""
        <html>
            <body>
                <h2>Welcome to AI Nutritionist!</h2>
                <p>Your verification code is:</p>
                <div style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; margin: 20px 0;">
                    {verification_token}
                </div>
                <p>Please enter this code in the app to verify your email address.</p>
                <p>This code will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
            </body>
        </html>
        """
        
        text_content = f"""
        Welcome to AI Nutritionist!
        
        Your verification code is: {verification_token}
        
        Please enter this code in the app to verify your email address.
        
        This code will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
        """
        
        return self.send_email(recipient_email, subject, html_content, text_content)

    def send_password_reset_email(self, recipient_email: str, reset_token: str):
        """Send password reset email with OTP"""
        
        subject = "Password Reset Request - AI Nutritionist"
        html_content = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your AI Nutritionist account.</p>
                <p>Your reset code is:</p>
                <div style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; margin: 20px 0;">
                    {reset_token}
                </div>
                <p>Please enter this code in the app to reset your password.</p>
                <p>This code will expire in 24 hours.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
            </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        You requested a password reset for your AI Nutritionist account.
        
        Your reset code is: {reset_token}
        
        Please enter this code in the app to reset your password.
        
        This code will expire in 24 hours.
        
        If you didn't request a password reset, please ignore this email.
        """
        
        return self.send_email(recipient_email, subject, html_content, text_content)

# Global email service instance
email_service = EmailService()