from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.models import User
from routers.auth import get_current_user
from database.database import get_db


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


def is_admin(current_user: User = Depends(get_current_user)) -> User:
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