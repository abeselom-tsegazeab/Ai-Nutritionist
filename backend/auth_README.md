# Authentication System

## Overview
The AI Nutritionist authentication system provides secure user registration, login, and session management using industry-standard security practices.

## Security Features

### Password Security
- Passwords are hashed using bcrypt with automatically managed salt
- Password strength validation requiring minimum 8 characters with uppercase, lowercase, number, and special character
- No plaintext password storage

### Account Protection
- Account lockout after 5 failed login attempts
- 30-minute lockout period after account lockout is triggered
- Failed login attempt tracking
- Last login timestamp tracking

### Input Validation
- Email format validation using regex pattern
- SQL injection prevention through SQLAlchemy ORM
- Input sanitization for additional protection

### JWT Security
- Secure JWT token generation with configurable expiration (default 60 minutes)
- HS256 algorithm for token signing
- Proper error handling to prevent user enumeration

### Rate Limiting
- Login attempts limited to 5 per minute per IP
- Registration limited to 10 per hour per IP
- Protection against brute force and DoS attacks

## Endpoints

### POST /api/auth/register
- Creates a new user account
- Requires: name, email, password
- Returns: User information (excluding password)

### POST /api/auth/login
- Authenticates user credentials
- Requires: username (email), password
- Returns: JWT access token

### GET /api/auth/me
- Retrieves current user information
- Requires: Valid JWT token in Authorization header
- Returns: User information

## Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for JWT signing (should be a strong random string)
- `JWT_ALGORITHM`: Algorithm for JWT signing (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 60)

### Security Settings
- Maximum failed login attempts before lockout: 5
- Account lockout duration: 30 minutes
- Password requirements: 8+ chars, uppercase, lowercase, number, special character

## Security Checklist

### Implemented
- [x] Password hashing with bcrypt
- [x] Account lockout mechanism
- [x] Rate limiting
- [x] Input validation
- [x] JWT-based authentication
- [x] SQL injection prevention
- [x] User enumeration prevention
- [x] Password strength requirements
- [x] Email format validation
- [x] Secure token expiration

### Planned
- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Refresh token implementation
- [ ] Session management
- [ ] Audit logging
- [ ] Two-factor authentication