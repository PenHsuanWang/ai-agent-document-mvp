"""Core configuration module.

Uses pydantic-settings for strong-typed, validated configuration loaded from
environment variables or a .env file.  All secrets are stored as SecretStr to
prevent accidental exposure in logs, repr() output, or JSON serialisation.
"""

from typing import Optional

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Anthropic credentials ────────────────────────────────────────────── #
    # SecretStr prevents the key from appearing in logs or print(settings).
    anthropic_api_key: SecretStr = Field(..., alias="ANTHROPIC_API_KEY")

    # Leave None to use the default Anthropic endpoint; set to a corporate
    # LLM gateway URL for proxy / Zero Data Retention environments.
    anthropic_base_url: Optional[str] = Field(None, alias="ANTHROPIC_BASE_URL")

    # ── Model parameters ─────────────────────────────────────────────────── #
    claude_model: str = Field("claude-3-7-sonnet-20250219", alias="CLAUDE_MODEL")
    max_tokens: int = Field(4096, alias="MAX_TOKENS")
    max_retries: int = Field(2, alias="MAX_RETRIES")

    # ── Application ──────────────────────────────────────────────────────── #
    app_env: str = Field("development", alias="APP_ENV")
    debug: bool = Field(False, alias="DEBUG")
    local_data_dir: str = Field("local_data", alias="LOCAL_DATA_DIR")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Module-level singleton — import ``settings`` everywhere instead of re-parsing.
settings = Settings()
