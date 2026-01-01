"""
BusCar Main Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import cars, alerts, scraping


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚗 Starting BusCar API...")
    await init_db()
    print("✅ Database initialized")
    
    # Start scheduler for periodic scraping
    # from app.services.scheduler import start_scheduler
    # start_scheduler()
    
    yield
    
    # Shutdown
    print("👋 Shutting down BusCar API...")


app = FastAPI(
    title="BusCar API",
    description="API para el agregador de coches de segunda mano BusCar",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cars.router, prefix=settings.api_prefix, tags=["Cars"])
app.include_router(alerts.router, prefix=settings.api_prefix, tags=["Alerts"])
app.include_router(scraping.router, prefix=settings.api_prefix, tags=["Scraping"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "BusCar API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
