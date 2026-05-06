from pydantic import BaseModel, Field


class UserLlmSettingsRead(BaseModel):
    api_url: str = Field(alias="apiUrl")
    model: str
    has_user_api_key: bool = Field(alias="hasUserApiKey")
    has_effective_api_key: bool = Field(alias="hasEffectiveApiKey")
    api_key_preview: str | None = Field(default=None, alias="apiKeyPreview")


class UserLlmSettingsUpdate(BaseModel):
    api_key: str | None = Field(default=None, alias="apiKey")
