import pytest
from fastapi.testclient import TestClient
from fastapi import status
from database.models import User
import json


def test_register_user_success(client, test_db):
    """Test successful user registration"""
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "TestPass123!"
    }
    
    response = client.post("/auth/register", json=user_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
    assert data["is_verified"] == False  # User should be created with is_verified=False
    assert "id" in data
    assert "password_hash" not in data  # Password hash should not be returned


def test_register_user_duplicate_email(client, test_db):
    """Test registration with duplicate email"""
    user_data = {
        "name": "Test User",
        "email": "duplicate@example.com",
        "password": "TestPass123!"
    }
    
    # First registration should succeed
    response1 = client.post("/auth/register", json=user_data)
    assert response1.status_code == status.HTTP_200_OK
    
    # Second registration with same email should fail
    response2 = client.post("/auth/register", json=user_data)
    assert response2.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response2.json()["detail"]


def test_register_user_invalid_email(client, test_db):
    """Test registration with invalid email format"""
    user_data = {
        "name": "Test User",
        "email": "invalid-email",
        "password": "TestPass123!"
    }
    
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid email format" in response.json()["detail"]


def test_register_user_weak_password(client, test_db):
    """Test registration with weak password"""
    user_data = {
        "name": "Test User",
        "email": "weakpass@example.com",
        "password": "weak"
    }
    
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Password must be at least 8 characters" in response.json()["detail"]


def test_register_user_password_too_long(client, test_db):
    """Test registration with password exceeding 72 bytes"""
    # Create a password longer than 72 bytes
    long_password = "Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!"  # More than 72 bytes
    
    user_data = {
        "name": "Test User",
        "email": "longpass@example.com",
        "password": long_password
    }
    
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "not exceed 72 bytes" in response.json()["detail"]


def test_login_success(client, test_db):
    """Test successful login"""
    # First register a user
    register_data = {
        "name": "Login User",
        "email": "login@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    # Then login
    login_data = {
        "username": "login@example.com",
        "password": "TestPass123!"
    }
    response = client.post("/auth/login", data=login_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client, test_db):
    """Test login with invalid credentials"""
    login_data = {
        "username": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", data=login_data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_wrong_password(client, test_db):
    """Test login with wrong password"""
    # First register a user
    register_data = {
        "name": "Wrong Password User",
        "email": "wrongpass@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    # Then try to login with wrong password
    login_data = {
        "username": "wrongpass@example.com",
        "password": "WrongPass123!"
    }
    response = client.post("/auth/login", data=login_data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user(client, test_db):
    """Test getting current user with valid token"""
    # First register and login a user
    register_data = {
        "name": "Current User",
        "email": "current@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    login_data = {
        "username": "current@example.com",
        "password": "TestPass123!"
    }
    login_response = client.post("/auth/login", data=login_data)
    assert login_response.status_code == status.HTTP_200_OK
    
    token = login_response.json()["access_token"]
    
    # Get current user with valid token
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Current User"
    assert data["email"] == "current@example.com"


def test_get_current_user_invalid_token(client, test_db):
    """Test getting current user with invalid token"""
    headers = {"Authorization": "Bearer invalidtoken"}
    response = client.get("/auth/me", headers=headers)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout_success(client, test_db):
    """Test successful logout"""
    # First register and login a user
    register_data = {
        "name": "Logout User",
        "email": "logout@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    login_data = {
        "username": "logout@example.com",
        "password": "TestPass123!"
    }
    login_response = client.post("/auth/login", data=login_data)
    assert login_response.status_code == status.HTTP_200_OK
    
    token = login_response.json()["access_token"]
    
    # Logout
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/auth/logout", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Successfully logged out"


def test_email_verification_success(client, test_db):
    """Test successful email verification"""
    # Register a user
    register_data = {
        "name": "Verify User",
        "email": "verify@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    # Get the user from the test database to get their verification token
    user = test_db.query(User).filter(User.email == "verify@example.com").first()
    assert user is not None
    verification_token = user.email_verification_token
    assert verification_token is not None
    
    # Verify the email
    response = client.post("/auth/verify-email", params={"verification_code": verification_token})
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Email verified successfully"
    
    # Check that user is now verified
    updated_user = test_db.query(User).filter(User.email == "verify@example.com").first()
    assert updated_user.is_verified == True


def test_email_verification_invalid_token(client, test_db):
    """Test email verification with invalid token"""
    response = client.post("/auth/verify-email", params={"verification_code": "invalidtoken"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid verification code" in response.json()["detail"]


def test_email_verification_expired_token(client, test_db):
    """Test email verification with expired token"""
    # Register a user
    register_data = {
        "name": "Expired Verify User",
        "email": "expired@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    # Manually set the verification token to expired
    from datetime import datetime, timedelta
    user = test_db.query(User).filter(User.email == "expired@example.com").first()
    assert user is not None
    user.email_verification_expires = datetime.utcnow() - timedelta(hours=1)  # Set to expired
    test_db.commit()
    
    response = client.post("/auth/verify-email", params={"verification_code": user.email_verification_token})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Verification code has expired" in response.json()["detail"]


def test_forgot_password(client, test_db):
    """Test forgot password functionality"""
    # Register a user first
    register_data = {
        "name": "Forgot Password User",
        "email": "forgot@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    # Request password reset
    response = client.post("/auth/forgot-password", params={"email": "forgot@example.com"})
    
    assert response.status_code == status.HTTP_200_OK
    assert "password reset link has been sent" in response.json()["message"]
    
    # Check that the user has a password reset token
    user = test_db.query(User).filter(User.email == "forgot@example.com").first()
    assert user.password_reset_token is not None
    assert user.password_reset_expires is not None


def test_forgot_password_nonexistent_user(client, test_db):
    """Test forgot password with non-existent user (should not reveal user doesn't exist)"""
    response = client.post("/auth/forgot-password", params={"email": "nonexistent@example.com"})
    
    assert response.status_code == status.HTTP_200_OK
    assert "password reset link has been sent" in response.json()["message"]


def test_reset_password_success(client, test_db):
    """Test successful password reset"""
    # Register a user first
    register_data = {
        "name": "Reset Password User",
        "email": "reset@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    # Request password reset to generate token
    forgot_response = client.post("/auth/forgot-password", params={"email": "reset@example.com"})
    assert forgot_response.status_code == status.HTTP_200_OK
    
    # Get the user to retrieve the reset token
    user = test_db.query(User).filter(User.email == "reset@example.com").first()
    assert user is not None
    reset_token = user.password_reset_token
    assert reset_token is not None
    
    # Reset the password
    response = client.post("/auth/reset-password", 
                          params={"reset_code": reset_token, "new_password": "NewTestPass123!"})
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Password reset successfully"
    
    # Verify that the reset token was cleared
    updated_user = test_db.query(User).filter(User.email == "reset@example.com").first()
    assert updated_user.password_reset_token is None
    assert updated_user.password_reset_expires is None


def test_reset_password_invalid_token(client, test_db):
    """Test password reset with invalid token"""
    response = client.post("/auth/reset-password", 
                          params={"reset_code": "invalidtoken", "new_password": "NewTestPass123!"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid reset code" in response.json()["detail"]


def test_reset_password_expired_token(client, test_db):
    """Test password reset with expired token"""
    # Register a user first
    register_data = {
        "name": "Expired Reset User",
        "email": "expiredreset@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    # Request password reset to generate token
    forgot_response = client.post("/auth/forgot-password", params={"email": "expiredreset@example.com"})
    assert forgot_response.status_code == status.HTTP_200_OK
    
    # Manually set the reset token to expired
    from datetime import datetime, timedelta
    user = test_db.query(User).filter(User.email == "expiredreset@example.com").first()
    assert user is not None
    user.password_reset_expires = datetime.utcnow() - timedelta(hours=1)  # Set to expired
    test_db.commit()
    
    response = client.post("/auth/reset-password", 
                          params={"reset_code": user.password_reset_token, "new_password": "NewTestPass123!"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Reset code has expired" in response.json()["detail"]


def test_reset_password_weak_password(client, test_db):
    """Test password reset with weak password"""
    # Register a user first
    register_data = {
        "name": "Weak Reset User",
        "email": "weakreset@example.com",
        "password": "TestPass123!"
    }
    register_response = client.post("/auth/register", json=register_data)
    assert register_response.status_code == status.HTTP_200_OK
    
    # Request password reset to generate token
    forgot_response = client.post("/auth/forgot-password", params={"email": "weakreset@example.com"})
    assert forgot_response.status_code == status.HTTP_200_OK
    
    # Get the user to retrieve the reset token
    user = test_db.query(User).filter(User.email == "weakreset@example.com").first()
    assert user is not None
    reset_token = user.password_reset_token
    assert reset_token is not None
    
    # Try to reset with weak password
    response = client.post("/auth/reset-password", 
                          params={"reset_code": reset_token, "new_password": "weak"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Password must be at least 8 characters" in response.json()["detail"]