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
            <head>
                <style>
                    @keyframes fadeIn {{
                        from {{ opacity: 0; transform: translateY(-10px); }}
                        to {{ opacity: 1; transform: translateY(0); }}
                    }}
                    @keyframes pulse {{
                        0% {{ transform: scale(1); }}
                        50% {{ transform: scale(1.05); }}
                        100% {{ transform: scale(1); }}
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 30px;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
                        border-radius: 12px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    }}
                    .header {{
                        text-align: center;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #4F46E5;
                        margin-bottom: 25px;
                    }}
                    .logo {{
                        font-size: 28px;
                        font-weight: bold;
                        color: #4F46E5;
                        margin-bottom: 10px;
                    }}
                    .content {{
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                    }}
                    .otp-container {{
                        background: linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%);
                        padding: 25px;
                        border-radius: 12px;
                        text-align: center;
                        margin: 25px 0;
                        color: white;
                        animation: fadeIn 0.5s ease-out, pulse 2s infinite;
                    }}
                    .otp-code {{
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        text-align: center;
                        margin: 15px 0;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 25px;
                        padding-top: 20px;
                        border-top: 1px solid #eaeaea;
                        color: #6b7280;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">AI Nutritionist</div>
                        <h2 style="margin: 0; color: #1f2937; animation: fadeIn 0.5s ease-out;">Welcome aboard!</h2>
                    </div>
                    <div class="content">
                        <h3 style="color: #4F46E5; margin-top: 0; animation: fadeIn 0.5s 0.1s ease-out both;">Verify Your Email Address</h3>
                        <p style="color: #4b5563; animation: fadeIn 0.5s 0.2s ease-out both;">Thank you for joining AI Nutritionist! Your verification code is:</p>
                        
                        <div class="otp-container">
                            <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your Verification Code</p>
                            <div class="otp-code" style="animation: fadeIn 0.5s 0.3s ease-out both;">
                                {verification_token}
                            </div>
                            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Valid for 24 hours</p>
                        </div>
                        
                        <p style="color: #4b5563; animation: fadeIn 0.5s 0.4s ease-out both;">Please enter this code in the app to verify your email address and complete your registration.</p>
                        <p style="color: #4b5563; animation: fadeIn 0.5s 0.5s ease-out both;">If you didn't create an account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 AI Nutritionist. All rights reserved.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
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
            <head>
                <style>
                    @keyframes fadeIn {{
                        from {{ opacity: 0; transform: translateY(-10px); }}
                        to {{ opacity: 1; transform: translateY(0); }}
                    }}
                    @keyframes pulse {{
                        0% {{ transform: scale(1); }}
                        50% {{ transform: scale(1.05); }}
                        100% {{ transform: scale(1); }}
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 30px;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
                        border-radius: 12px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    }}
                    .header {{
                        text-align: center;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #4F46E5;
                        margin-bottom: 25px;
                    }}
                    .logo {{
                        font-size: 28px;
                        font-weight: bold;
                        color: #4F46E5;
                        margin-bottom: 10px;
                    }}
                    .content {{
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                    }}
                    .otp-container {{
                        background: linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%);
                        padding: 25px;
                        border-radius: 12px;
                        text-align: center;
                        margin: 25px 0;
                        color: white;
                        animation: fadeIn 0.5s ease-out, pulse 2s infinite;
                    }}
                    .otp-code {{
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        text-align: center;
                        margin: 15px 0;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 25px;
                        padding-top: 20px;
                        border-top: 1px solid #eaeaea;
                        color: #6b7280;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">AI Nutritionist</div>
                        <h2 style="margin: 0; color: #1f2937; animation: fadeIn 0.5s ease-out;">Password Reset Request</h2>
                    </div>
                    <div class="content">
                        <h3 style="color: #4F46E5; margin-top: 0; animation: fadeIn 0.5s 0.1s ease-out both;">Reset Your Password</h3>
                        <p style="color: #4b5563; animation: fadeIn 0.5s 0.2s ease-out both;">You requested a password reset for your AI Nutritionist account. Your reset code is:</p>
                        
                        <div class="otp-container">
                            <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your Reset Code</p>
                            <div class="otp-code" style="animation: fadeIn 0.5s 0.3s ease-out both;">
                                {reset_token}
                            </div>
                            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Valid for 24 hours</p>
                        </div>
                        
                        <p style="color: #4b5563; animation: fadeIn 0.5s 0.4s ease-out both;">Please enter this code in the app to reset your password.</p>
                        <p style="color: #4b5563; animation: fadeIn 0.5s 0.5s ease-out both;">If you didn't request a password reset, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 AI Nutritionist. All rights reserved.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
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