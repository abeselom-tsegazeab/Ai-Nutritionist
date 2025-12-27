from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from database.database import get_db
from database.models import User
from sqlalchemy import Boolean
from database.schemas import UserCreate, UserResponse, UserLogin
from core.config import settings
from passlib.context import CryptContext
import bcrypt
import re
from datetime import timezone
from slowapi import Limiter
from slowapi.util import get_remote_address
from core.token_manager import TokenManager
from core.email_utils import EmailVerification
from core.audit_logger import log_user_login, log_failed_login, log_user_registration, log_security_event
import logging
from core.tfa_manager import TwoFactorAuth
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    # Ensure password doesn't exceed bcrypt's 72-byte limit
    # Convert to bytes to properly count byte length, not character length
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to 72 bytes and decode back to string
        truncated_password = password_bytes[:72].decode('utf-8', errors='ignore')
    else:
        truncated_password = password
    return pwd_context.hash(truncated_password)


def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def validate_password(password: str) -> bool:
    # Password must be at least 8 characters, contain uppercase, lowercase, number, and special character
    # Also must not exceed 72 bytes due to bcrypt limitation
    if len(password) < 8:
        return False
    # Check if password exceeds 72 bytes when encoded as UTF-8
    if len(password.encode('utf-8')) > 72:
        return False
    if not re.search(r"[A-Z]", password):  # Has uppercase
        return False
    if not re.search(r"[a-z]", password):  # Has lowercase
        return False
    if not re.search(r"\d", password):  # Has digit
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):  # Has special character
        return False
    return True


def check_account_lockout(user: User) -> bool:
    """Check if account is locked due to too many failed attempts"""
    if user.locked_until and user.locked_until > datetime.utcnow():
        return True
    return False


def reset_failed_attempts(db: Session, user: User):
    """Reset failed login attempts after successful login"""
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.utcnow()
    db.commit()


def increment_failed_attempts(db: Session, user: User):
    """Increment failed login attempts and lock account if needed"""
    user.failed_login_attempts += 1
    if user.failed_login_attempts >= 5:  # Lock after 5 failed attempts
        user.locked_until = datetime.utcnow() + timedelta(minutes=30)  # Lock for 30 minutes
    db.commit()


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    
    # Check if account is locked
    if check_account_lockout(user):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account is locked due to too many failed login attempts. Please try again later."
        )
    
    if not verify_password(password, user.password_hash):
        increment_failed_attempts(db, user)
        return False
    
    # Reset failed attempts on successful login
    reset_failed_attempts(db, user)
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserResponse)
@limiter.limit("10/hour")
def register_user(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    # Validate email format
    if not validate_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate password strength
    if not validate_password(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters with uppercase, lowercase, number, and special character, and not exceed 72 bytes"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Generate email verification token
    verification_token = EmailVerification.generate_verification_token()
    verification_expires = datetime.utcnow() + timedelta(hours=24)  # Token valid for 24 hours
    
    # Create new user
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        is_active=True,
        is_verified=False,
        email_verification_token=verification_token,
        email_verification_expires=verification_expires
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send verification email (in a real app, this would be done asynchronously)
    try:
        EmailVerification.send_verification_email(db_user.email, verification_token)
    except Exception as e:
        # Log the error but don't fail the registration if email sending fails
        logging.error(f"Failed to send verification email to {db_user.email}: {str(e)}")
    
    # Log user registration
    ip_address = request.client.host
    user_agent = request.headers.get("user-agent", "Unknown")
    log_user_registration(db_user.id, ip_address, user_agent)
    
    return db_user


@router.post("/login")
@limiter.limit("5/minute")
def login_user(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Log failed login attempt
        ip_address = request.client.host
        user_agent = request.headers.get("user-agent", "Unknown")
        log_failed_login(form_data.username, ip_address, user_agent)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = TokenManager.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Generate refresh token
    refresh_token = TokenManager.create_refresh_token(
        data={"sub": user.email}
    )
    
    # Hash the refresh token for secure storage
    hashed_refresh_token = TokenManager.hash_token(refresh_token)
    
    # Store the hashed refresh token in the database
    user.refresh_token_hash = hashed_refresh_token
    user.refresh_token_expires = datetime.utcnow() + timedelta(days=7)
    db.commit()
    
    # Log successful login
    ip_address = request.client.host
    user_agent = request.headers.get("user-agent", "Unknown")
    log_user_login(user.id, ip_address, user_agent)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/refresh")
def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh the access token using a valid refresh token"""
    try:
        # Verify the refresh token format
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token required"
            )
        
        # Decode the refresh token to get the user email
        email, payload = TokenManager.verify_token(refresh_token, token_type="refresh")
        
        # Find the user in the database
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Check if the refresh token has expired
        if user.refresh_token_expires and user.refresh_token_expires < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired"
            )
        
        # Verify the refresh token matches the stored hash
        hashed_token = TokenManager.hash_token(refresh_token)
        if user.refresh_token_hash != hashed_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Generate new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = TokenManager.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    except HTTPException:
        # If there's an error, clear the stored refresh token
        if 'user' in locals():
            user.refresh_token_hash = None
            user.refresh_token_expires = None
            db.commit()
        raise


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Invalidate the refresh token on logout"""
    # Clear the refresh token from the database
    current_user.refresh_token_hash = None
    current_user.refresh_token_expires = None
    db.commit()
    
    return {"message": "Successfully logged out"}


@router.post("/verify-email")
def verify_email(verification_code: str, db: Session = Depends(get_db)):
    """Verify user's email address using the OTP verification code"""
    # Find user with matching verification code
    user = db.query(User).filter(User.email_verification_token == verification_code).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Check if the token has expired
    if user.email_verification_expires and user.email_verification_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired"
        )
    
    # Update user to mark as verified
    user.is_verified = True
    user.email_verification_token = None
    user.email_verification_expires = None
    db.commit()
    
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(email: str, db: Session = Depends(get_db)):
    """Resend email verification token"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new verification token
    verification_token = EmailVerification.generate_verification_token()
    verification_expires = datetime.utcnow() + timedelta(hours=24)
    
    user.email_verification_token = verification_token
    user.email_verification_expires = verification_expires
    db.commit()
    
    # Send verification email
    try:
        EmailVerification.send_verification_email(user.email, verification_token)
        return {"message": "Verification email sent successfully"}
    except Exception as e:
        logging.error(f"Failed to send verification email to {user.email}: {str(e)}")
        # Don't fail the request if email sending fails
        return {"message": "Verification email could not be sent, but user record is valid"}


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """Generate and send password reset token"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Don't reveal if user exists to prevent user enumeration
        return {"message": "If an account with this email exists, a password reset link has been sent"}
    
    # Generate password reset token
    reset_token = EmailVerification.generate_password_reset_token()
    reset_expires = datetime.utcnow() + timedelta(hours=24)
    
    user.password_reset_token = reset_token
    user.password_reset_expires = reset_expires
    db.commit()
    
    # Send password reset email
    try:
        EmailVerification.send_password_reset_email(user.email, reset_token)
    except Exception as e:
        logging.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        # Continue without throwing an error to prevent user enumeration
    
    return {"message": "If an account with this email exists, a password reset link has been sent"}


@router.post("/reset-password")
def reset_password(reset_code: str, new_password: str, db: Session = Depends(get_db)):
    """Reset user password using the OTP reset code"""
    # Find user with matching reset code
    user = db.query(User).filter(User.password_reset_token == reset_code).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset code"
        )
    
    # Check if the reset token has expired
    if user.password_reset_expires and user.password_reset_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code has expired"
        )
    
    # Validate new password
    if not validate_password(new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters with uppercase, lowercase, number, and special character, and not exceed 72 bytes"
        )
    
    # Hash new password
    hashed_password = get_password_hash(new_password)
    user.password_hash = hashed_password
    
    # Clear the reset token
    user.password_reset_token = None
    user.password_reset_expires = None
    db.commit()
    
    return {"message": "Password reset successfully"}


@router.post("/enable-tfa")
def enable_tfa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Enable two-factor authentication for the current user"""
    qr_code = TwoFactorAuth.enable_tfa_for_user(current_user, db)
    
    return {
        "message": "TFA enabled successfully",
        "qr_code": qr_code,  # QR code for authenticator app
        "secret": current_user.tfa_secret  # Also return the secret as backup
    }


@router.post("/verify-tfa-setup")
def verify_tfa_setup(token: str, current_user: User = Depends(get_current_user)):
    """Verify the TFA setup by checking the token from the authenticator app"""
    if not current_user.tfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TFA not enabled for this user"
        )
    
    is_valid = TwoFactorAuth.verify_tfa_setup(current_user, token)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TFA token"
        )
    
    return {"message": "TFA setup verified successfully"}


@router.post("/disable-tfa")
def disable_tfa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Disable two-factor authentication for the current user"""
    TwoFactorAuth.disable_tfa_for_user(current_user, db)
    
    return {"message": "TFA disabled successfully"}


@router.post("/verify-tfa")
def verify_tfa_login(token: str, email: str, db: Session = Depends(get_db)):
    """Verify TFA token during login (for users with TFA enabled)"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.tfa_enabled or not user.tfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TFA not enabled for this user"
        )
    
    is_valid = TwoFactorAuth.verify_token(user.tfa_secret, token)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TFA token"
        )
    
    return {"message": "TFA verified successfully", "user_id": user.id}
