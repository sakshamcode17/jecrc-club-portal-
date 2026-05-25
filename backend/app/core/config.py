from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "JECRC Club Hub"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "yoursecretkeyhere"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./sql_app.db"
    DB_USE_NULL_POOL: bool = False
    DB_DISABLE_PREPARED_STATEMENTS: bool = False
    SQL_ECHO: bool = False
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
