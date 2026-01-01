from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.database import engine
from database.models import Base
from core.security import get_rate_limit_middleware


from routers import mealplan, auth
from core.config import settings

app = FastAPI(
    title="AI Nutritionist Backend",
    description="LLM-powered nutritional recommendation service",
    version="1.0.0"
)
Base.metadata.create_all(bind=engine)

# Add rate limiting middleware
app = get_rate_limit_middleware(app)

# Handle schema updates
from sqlalchemy import text

# Add role column if it doesn't exist
with engine.connect() as conn:
    # Check if role column exists
    result = conn.execute(text("PRAGMA table_info(users)"))
    columns = [row[1] for row in result.fetchall()]
    
    if 'role' not in columns:
        # Add role column to users table
        conn.execute(text("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"))
        conn.commit()
    
    # Check if profile_picture column exists
    if 'profile_picture' not in columns:
        # Add profile_picture column to users table
        conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture TEXT DEFAULT NULL"))
        conn.commit()
    
    # Check if profile-related columns exist
    # Add columns with appropriate data types
    if 'height' not in columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN height INTEGER DEFAULT NULL"))
        conn.commit()
    if 'weight' not in columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN weight INTEGER DEFAULT NULL"))
        conn.commit()
    if 'age' not in columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN age INTEGER DEFAULT NULL"))
        conn.commit()
    if 'gender' not in columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN gender TEXT DEFAULT NULL"))
        conn.commit()
    if 'activity_level' not in columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN activity_level TEXT DEFAULT NULL"))
        conn.commit()
    if 'goal' not in columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN goal TEXT DEFAULT NULL"))
        conn.commit()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
import os
os.makedirs("uploads", exist_ok=True)

# Mount uploads directory to serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ---Routers---
app.include_router(mealplan.router, prefix="/api")
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "AI Nutritionist Backend Running"}
