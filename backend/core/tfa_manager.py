import pyotp
import qrcode
import io
import base64
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database.models import User
from typing import Optional

class TwoFactorAuth:
    @staticmethod
    def generate_secret() -> str:
        """Generate a new TFA secret for a user"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(secret: str, email: str, issuer_name: str = "AI Nutritionist") -> str:
        """Generate a QR code for TFA setup"""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=email,
            issuer_name=issuer_name
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Convert to base64 for easy transmission
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        return img_str
    
    @staticmethod
    def verify_token(secret: str, token: str) -> bool:
        """Verify a TFA token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)  # Allow 1 period before/after for network delays
    
    @staticmethod
    def enable_tfa_for_user(user: User, db: Session) -> str:
        """Enable TFA for a user and return the QR code"""
        # Generate a new secret for the user
        secret = TwoFactorAuth.generate_secret()
        user.tfa_secret = secret
        user.tfa_enabled = True
        db.commit()
        
        # Generate QR code
        qr_code = TwoFactorAuth.generate_qr_code(secret, user.email)
        return qr_code
    
    @staticmethod
    def disable_tfa_for_user(user: User, db: Session):
        """Disable TFA for a user"""
        user.tfa_secret = None
        user.tfa_enabled = False
        user.tfa_verified = False
        db.commit()
    
    @staticmethod
    def verify_tfa_setup(user: User, token: str) -> bool:
        """Verify that the user has correctly set up TFA"""
        if not user.tfa_secret:
            return False
        
        is_valid = TwoFactorAuth.verify_token(user.tfa_secret, token)
        if is_valid:
            user.tfa_verified = True
        
        return is_valid