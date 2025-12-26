from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---Routers---
app.include_router(mealplan.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

@app.get("/")
def home():
    return {"message": "AI Nutritionist Backend Running"}
