import secrets
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database.models import User
from core.token_manager import TokenManager
from typing import Optional
from core.email_service import email_service

class EmailVerification:
    @staticmethod
    def generate_verification_token() -> str:
        """Generate a 6-digit numeric OTP for email verification"""
        return ''.join(secrets.choice(string.digits) for _ in range(6))
    
    @staticmethod
    def generate_password_reset_token() -> str:
        """Generate a 6-digit numeric OTP for password reset"""
        return ''.join(secrets.choice(string.digits) for _ in range(6))
    
    @staticmethod
    def send_verification_email(user_email: str, verification_token: str):
        """Send verification email using the email service"""
        return email_service.send_verification_email(user_email, verification_token)
    
    @staticmethod
    def send_password_reset_email(user_email: str, reset_token: str):
        """Send password reset email using the email service"""
        return email_service.send_password_reset_email(user_email, reset_token)
    
    @staticmethod
    def verify_email_token(db: Session, token: str) -> Optional[User]:
        """Verify an email verification token and activate the user's email"""
        user = db.query(User).filter(
            User.email_verification_token == token,
            User.email_verification_expires > datetime.utcnow()
        ).first()
        
        if not user:
            return None
        
        # Verify the token hasn't expired and update user status
        user.is_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        db.commit()
        
        return user
    
    @staticmethod
    def validate_password_reset_token(db: Session, token: str) -> Optional[User]:
        """Validate a password reset token"""
        user = db.query(User).filter(
            User.password_reset_token == token,
            User.password_reset_expires > datetime.utcnow()
        ).first()
        
        if not user:
            return None
        
        return user