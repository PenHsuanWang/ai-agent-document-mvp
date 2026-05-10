"""FastAPI application entry point.

Responsibilities:
- Create and configure the FastAPI application instance.
- Register all routers.
- Configure structured logging.
- Expose a /health endpoint for liveness probes.
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.chat import router as chat_router
from app.api.v1.documents import router as documents_router
from app.core.config import settings


def _configure_logging() -> None:
    log_level = logging.DEBUG if settings.debug else logging.INFO
    logging.basicConfig(
        stream=sys.stdout,
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    # Quieten noisy third-party loggers.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Application lifespan — startup / shutdown hooks."""
    _configure_logging()
    logger = logging.getLogger(__name__)
    logger.info(
        "Starting AI Agent MVP | env=%s | model=%s",
        settings.app_env,
        settings.claude_model,
    )
    yield
    logger.info("Shutting down AI Agent MVP.")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Local File Reader & Summarizer AI Agent",
        description=(
            "MVP AI Agent that reads local documents and answers questions "
            "using Claude as the reasoning engine."
        ),
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS — open for MVP / local development; tighten for production.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(chat_router, prefix="/api/v1", tags=["chat"])
    app.include_router(documents_router, prefix="/api/v1/documents", tags=["documents"])

    @app.get("/health", tags=["ops"], summary="Liveness probe")
    async def health():
        return {"status": "ok", "env": settings.app_env}

    return app


app = create_app()
