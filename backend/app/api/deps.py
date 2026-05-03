from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from app.schemas.user import UserRead
from app.services.in_memory import store


def user_from_authorization(authorization: str | None) -> UserRead | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    return store.get_user_by_token(token)


def require_current_user(authorization: Annotated[str | None, Header()] = None) -> UserRead:
    user = user_from_authorization(authorization)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user


CurrentUser = Annotated[UserRead, Depends(require_current_user)]
