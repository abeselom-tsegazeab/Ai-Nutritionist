import logging
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import declarative_base
from database.database import engine

Base = declarative_base()

class AuditEventType(Enum):
    USER_LOGIN = "user_login"
    USER_LOGIN_FAILED = "user_login_failed"
    USER_REGISTER = "user_register"
    USER_LOGOUT = "user_logout"
    USER_PASSWORD_RESET = "user_password_reset"
    USER_EMAIL_VERIFICATION = "user_email_verification"
    USER_PROFILE_UPDATE = "user_profile_update"
    API_ACCESS = "api_access"
    API_ACCESS_DENIED = "api_access_denied"
    SECURITY_EVENT = "security_event"

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    user_id = Column(Integer, nullable=True)  # Nullable for events before user authentication
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create the audit log table
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("security_audit.log"),
        logging.StreamHandler()
    ]
)
audit_logger = logging.getLogger("audit")

def log_audit_event(
    event_type: AuditEventType,
    user_id: Optional[int] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[str] = None
):
    """
    Log an audit event to both database and file
    """
    try:
        # Log to file
        audit_logger.info(f"{event_type.value} - User: {user_id}, IP: {ip_address}, Details: {details}")
        
        # Log to database (in a real application, this would be done with a separate session)
        # For this implementation, we'll just log to file as the primary method
    except Exception as e:
        # Even if logging fails, we don't want to break the main application flow
        print(f"Error logging audit event: {e}")

def log_user_login(user_id: int, ip_address: str, user_agent: str):
    log_audit_event(
        event_type=AuditEventType.USER_LOGIN,
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent,
        details="User successfully logged in"
    )

def log_failed_login(email: str, ip_address: str, user_agent: str):
    log_audit_event(
        event_type=AuditEventType.USER_LOGIN_FAILED,
        ip_address=ip_address,
        user_agent=user_agent,
        details=f"Failed login attempt for email: {email}"
    )

def log_user_registration(user_id: int, ip_address: str, user_agent: str):
    log_audit_event(
        event_type=AuditEventType.USER_REGISTER,
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent,
        details="New user registration"
    )

def log_security_event(event_description: str, ip_address: str = None, user_id: int = None):
    log_audit_event(
        event_type=AuditEventType.SECURITY_EVENT,
        user_id=user_id,
        ip_address=ip_address,
        details=event_description
    )