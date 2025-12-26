from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./nutritionist.db"
    OPENAI_API_KEY: str | None = None
    JWT_SECRET: str = "your_secret_here"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
