from fastapi import HTTPException, status, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from datetime import datetime, timedelta

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

def get_rate_limit_middleware(app):
    """Add rate limiting middleware to the app"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    return app

# Additional security functions
def is_valid_origin(request: Request, allowed_origins: list) -> bool:
    """Check if the request origin is in the allowed list"""
    origin = request.headers.get("origin")
    if not origin:
        return True  # Allow requests without origin header
    return origin in allowed_origins

def sanitize_input(input_str: str) -> str:
    """Basic input sanitization to prevent injection attacks"""
    # Remove potentially dangerous characters
    dangerous_chars = ["<", ">", "\"", "'", "(", ")", ";", "&", "|"]
    sanitized = input_str
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, "")
    return sanitized.strip()