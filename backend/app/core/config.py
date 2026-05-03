from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "local"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./edumind.db"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    llm_api_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    llm_api_key: str | None = None
    llm_model: str = "deepseek-v4-flash"
    llm_timeout_seconds: float = 60.0


settings = Settings()
