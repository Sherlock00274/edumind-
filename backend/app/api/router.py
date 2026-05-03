from fastapi import APIRouter

from app.api.routes import analytics, auth, concepts, courses, health, parsing, plans, sessions
from app.core.config import settings

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router, prefix=settings.api_v1_prefix)
api_router.include_router(courses.router, prefix=settings.api_v1_prefix)
api_router.include_router(parsing.router, prefix=settings.api_v1_prefix)
api_router.include_router(concepts.router, prefix=settings.api_v1_prefix)
api_router.include_router(sessions.router, prefix=settings.api_v1_prefix)
api_router.include_router(plans.router, prefix=settings.api_v1_prefix)
api_router.include_router(analytics.router, prefix=settings.api_v1_prefix)
