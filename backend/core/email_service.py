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
        self.smtp_server = getattr(settings, 'SMTP_HOST', getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com'))
        self.smtp_port = int(getattr(settings, 'SMTP_PORT', 587))
        
        # Check for different possible email address variables
        self.email_address = getattr(settings, 'FROM_EMAIL', '')
        if not self.email_address:
            self.email_address = getattr(settings, 'EMAIL_ADDRESS', '')
        
        # Check for different possible password variables
        self.email_password = getattr(settings, 'SMTP_PASS', '')
        if not self.email_password:
            self.email_password = getattr(settings, 'EMAIL_PASSWORD', '')
        
        # Determine if using secure connection based on settings
        self.use_tls = getattr(settings, 'SMTP_SECURE', getattr(settings, 'EMAIL_USE_TLS', True))
        
        # Validate SMTP port
        if self.smtp_port not in [25, 465, 587]:
            logger.warning(f"Unusual SMTP port {self.smtp_port} detected. Common ports are 25, 465, 587.")
        
        # Determine if SSL should be used based on port if TLS is not explicitly set
        # For standard configuration: port 465 = SSL, ports 25/587 = TLS
        if self.smtp_port == 465:
            # Port 465 is typically for SSL
            self.use_ssl = True
            self.use_tls = False  # Override if user explicitly set TLS but used port 465
        elif self.smtp_port in [25, 587]:
            # Standard ports for TLS
            # Keep user's TLS setting for these ports
            self.use_ssl = False
        else:
            # For other ports, default to TLS if not specified otherwise
            self.use_ssl = False

    def send_email(self, recipient_email: str, subject: str, html_content: str, text_content: Optional[str] = None):
        """Send an email using SMTP"""
        # Check if email configuration is properly set up
        if not self.email_address or not self.email_password or not self.smtp_server:
            logger.warning(f"Email configuration is not set up. Skipping email to {recipient_email}")
            return False
            
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
            elif self.use_ssl:
                # For SSL connections (like port 465)
                with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, context=context) as server:
                    server.login(self.email_address, self.email_password)
                    server.sendmail(self.email_address, recipient_email, message.as_string())
            else:
                # For non-secure connections
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
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