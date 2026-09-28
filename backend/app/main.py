from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, bills, dashboard, meters, payments, pricing, rooms, tenants
from app.core.config import settings
from app.db.mongodb import ensure_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    yield


app = FastAPI(
    title="RentFlow API",
    description="He thong quan ly phong tro - API backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(tenants.router, prefix="/api")
app.include_router(meters.router, prefix="/api")
app.include_router(pricing.router, prefix="/api")
app.include_router(bills.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok"}
