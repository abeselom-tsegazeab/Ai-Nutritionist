from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./nutritionist.db"
    OPENAI_API_KEY: str | None = None
    JWT_SECRET: str = "your_secret_here"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_SECURE: bool = False
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    FROM_EMAIL: str = ""
    EMAIL_ADDRESS: str = ""
    EMAIL_PASSWORD: str = ""
    FRONTEND_URL: str = "http://localhost:5173"
    EMAIL_USE_TLS: bool = True

    model_config = ConfigDict(env_file=".env")


settings = Settings()
