from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.schemas.user import AuthRead, ProfileStatsRead, UserCreate, UserLogin, UserRead
from app.services.in_memory import store

router = APIRouter(tags=["auth"])


@router.post("/auth/register", response_model=AuthRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate) -> AuthRead:
    try:
        user = store.create_user(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return AuthRead(token=store.create_token(user.id), user=user)


@router.post("/auth/login", response_model=AuthRead)
def login(payload: UserLogin) -> AuthRead:
    user = store.authenticate_user(payload.email, payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return AuthRead(token=store.create_token(user.id), user=user)


@router.get("/auth/me", response_model=UserRead)
def me(user: CurrentUser) -> UserRead:
    return user


@router.get("/users/me/profile", response_model=ProfileStatsRead)
def profile_stats(user: CurrentUser) -> ProfileStatsRead:
    return store.get_profile_stats(user.id)
