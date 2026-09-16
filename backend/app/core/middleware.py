import uuid
import structlog
import traceback
import os
from typing import Callable, Awaitable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from app.core.config import settings

logger = structlog.get_logger(__name__)

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        request_id = str(uuid.uuid4())
        structlog.contextvars.bind_contextvars(request_id=request_id)
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            error_id = str(uuid.uuid4())
            is_prod = settings.APP_ENV == "production"
            
            logger.exception("unhandled_exception", error_id=error_id, exc_info=exc)
            
            detail = "An internal server error occurred." if is_prod else str(exc)
            
            payload = {
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": detail,
                "instance": request.url.path,
                "error_id": error_id
            }
            if not is_prod:
                payload["stack_trace"] = traceback.format_exc()
            
            return JSONResponse(
                status_code=500,
                content=payload,
                headers={"Content-Type": "application/problem+json"}
            )

class RLSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
                request.state.current_org = payload.get("org_id")
                request.state.current_role = payload.get("roles", [""])[0] if payload.get("roles") else None
            except JWTError:
                pass
        
        response = await call_next(request)
        return response
