from __future__ import annotations
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import map, search, stations, trains, zones
from app.core.config import settings
from app.core.exceptions import NotFoundException, ValidationException

app = FastAPI(
    title="Railyn API",
    description="Indian Railways Network Explorer API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(NotFoundException)
async def not_found_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "Not found", "detail": exc.detail},
    )


@app.exception_handler(ValidationException)
async def validation_handler(request: Request, exc: ValidationException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "Validation error", "detail": exc.detail},
    )


# Health check
@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "railyn-api"}


# Register routers
app.include_router(stations.router, prefix="/api")
app.include_router(trains.router, prefix="/api")
app.include_router(zones.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(map.router, prefix="/api")
