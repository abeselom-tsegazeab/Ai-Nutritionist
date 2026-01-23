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
from fastapi import File, UploadFile
import os
from pathlib import Path

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


def require_role(required_role: str):
    """
    Dependency to check if the current user has the required role.
    Can be used to restrict access to specific endpoints based on user roles.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: {required_role} role required"
            )
        return current_user
    return role_checker


def require_any_role(required_roles: list):
    """
    Dependency to check if the current user has any of the required roles.
    Can be used to restrict access to specific endpoints based on user roles.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: one of {required_roles} roles required"
            )
        return current_user
    return role_checker


def is_user_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to check if the current user is an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: admin role required"
        )
    return current_user


def is_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to check if the current user is a regular user.
    """
    if current_user.role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user role required"
        )
    return current_user


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
        role="user",  # Default role is user
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
async def login_user(request: Request, db: Session = Depends(get_db)):
    # Handle both form data and JSON data
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            # Handle JSON request
            body = await request.json()
            email = body.get("email")
            password = body.get("password")
        else:
            # Handle form data request (for OAuth2PasswordRequestForm compatibility)
            form = await request.form()
            email = form.get("username")  # OAuth2PasswordRequestForm uses 'username' field
            password = form.get("password")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request format"
        )
    
    # Validate that both email and password are provided
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    user = authenticate_user(db, email, password)
    if not user:
        # Log failed login attempt
        ip_address = request.client.host
        user_agent = request.headers.get("user-agent", "Unknown")
        log_failed_login(email, ip_address, user_agent)
        
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


# Schema for updating user profile
from pydantic import BaseModel

class UserProfileUpdate(BaseModel):
    name: str = None
    height: float = None
    weight: float = None
    age: int = None
    gender: str = None
    activity_level: str = None
    goal: str = None


@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    # Update allowed fields
    allowed_fields = {
        "name", "height", "weight", "age", "gender", "activity_level", "goal"
    }
    
    for field in allowed_fields:
        value = getattr(profile_data, field)
        if value is not None:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
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
async def verify_email(request: Request, db: Session = Depends(get_db)):
    """Verify user's email address using the OTP verification code"""
    # Handle both form data and JSON data
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            # Handle JSON request
            body = await request.json()
            verification_code = body.get("verification_code")
        else:
            # Handle form data request
            form = await request.form()
            verification_code = form.get("verification_code")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request format"
        )
    
    if not verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is required"
        )
    
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
async def forgot_password(request: Request, db: Session = Depends(get_db)):
    """Generate and send password reset token"""
    # Handle both form data and JSON data
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            # Handle JSON request
            body = await request.json()
            email = body.get("email")
        else:
            # Handle form data request
            form = await request.form()
            email = form.get("email")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request format"
        )
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
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
async def reset_password(request: Request, db: Session = Depends(get_db)):
    """Reset user password using the OTP reset code"""
    # Handle both form data and JSON data
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            # Handle JSON request
            body = await request.json()
            reset_code = body.get("reset_code")
            new_password = body.get("new_password")
        else:
            # Handle form data request
            form = await request.form()
            reset_code = form.get("reset_code")
            new_password = form.get("new_password")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request format"
        )
    
    if not reset_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code is required"
        )
    
    if not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password is required"
        )
    
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


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file - authenticated users only"""
    # Define allowed file types and size limits
    allowed_extensions = {"jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"}
    max_file_size = 5 * 1024 * 1024  # 5MB limit
    
    # Check file extension
    file_extension = Path(file.filename).suffix[1:].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > max_file_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5MB."
        )
    
    # Reset file pointer
    await file.seek(0)
    
    # Create uploads directory if it doesn't exist
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    
    # Create user-specific directory
    user_dir = uploads_dir / f"user_{current_user.id}"
    user_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    import uuid
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = user_dir / unique_filename
    
    # Save the file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Optionally update user profile with file path
    # For example, if it's an avatar image
    if file_extension in {"jpg", "jpeg", "png", "gif"}:
        current_user.profile_picture = str(file_path)
        db.commit()
    
    return {
        "filename": file.filename,
        "file_path": str(file_path),
        "file_size": len(file_content),
        "message": "File uploaded successfully"
    }


@router.get("/profile-picture")
def get_profile_picture(
    current_user: User = Depends(get_current_user)
):
    """Get the user's profile picture path"""
    if not current_user.profile_picture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile picture not found"
        )
    
    return {
        "profile_picture": current_user.profile_picture,
        "message": "Profile picture retrieved successfully"
    }


@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    current_user: User = Depends(is_user_admin),
    db: Session = Depends(get_db)
):
    """Get all users - admin only"""
    users = db.query(User).all()
    return users


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    current_user: User = Depends(is_user_admin),
    db: Session = Depends(get_db)
):
    """Update user role - admin only"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate role
    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Valid roles: user, admin"
        )
    
    user.role = role
    db.commit()
    
    return {"message": f"User role updated to {role}"}


@router.get("/user/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(is_user_admin),
    db: Session = Depends(get_db)
):
    """Get user by ID - admin only"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
