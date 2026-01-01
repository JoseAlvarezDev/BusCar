"""
BusCar Backend Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./buscar.db"
    
    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "BusCar <noreply@buscar.es>"
    
    # Scraping
    scrape_interval_hours: int = 6
    max_cars_per_scrape: int = 100
    
    # API
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:8080,http://localhost:5173"
    
    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
