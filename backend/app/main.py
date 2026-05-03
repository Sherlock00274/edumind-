from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import init_db
from app.services.in_memory import store


def create_app() -> FastAPI:
    app = FastAPI(
        title="EduMind API",
        version="0.1.0",
        description="Adaptive learning backend for final exam preparation.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.on_event("startup")
    def startup() -> None:
        init_db()
        store.get_demo_user()

    return app


app = create_app()
