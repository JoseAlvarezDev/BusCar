"""
BusCar Pydantic Schemas for API validation
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ================================
# Car Schemas
# ================================

class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    price: float
    km: int
    fuel: str
    transmission: str
    location: str


class CarCreate(CarBase):
    external_id: str
    source: str
    url: str
    version: Optional[str] = None
    power: Optional[int] = None
    doors: Optional[int] = None
    color: Optional[str] = None
    body_type: Optional[str] = None
    province: Optional[str] = None
    seller_type: str = "particular"
    seller_name: Optional[str] = None
    description: Optional[str] = None
    features: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[str] = None
    negotiable: bool = False
    warranty: bool = False
    certified: bool = False


class CarResponse(CarBase):
    id: int
    source: str
    url: str
    version: Optional[str] = None
    power: Optional[int] = None
    body_type: Optional[str] = None
    seller_type: str
    image_url: Optional[str] = None
    images: Optional[str] = None
    negotiable: bool
    warranty: bool
    scraped_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


class CarDetail(CarResponse):
    external_id: str
    doors: Optional[int] = None
    color: Optional[str] = None
    province: Optional[str] = None
    seller_name: Optional[str] = None
    description: Optional[str] = None
    features: Optional[str] = None
    certified: bool
    updated_at: datetime
    published_at: Optional[datetime] = None


class CarListResponse(BaseModel):
    cars: List[CarResponse]
    total: int
    page: int
    per_page: int
    pages: int


# ================================
# Filter Schemas
# ================================

class CarFilters(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    min_km: Optional[int] = None
    max_km: Optional[int] = None
    fuel: Optional[List[str]] = None
    transmission: Optional[List[str]] = None
    location: Optional[str] = None
    sources: Optional[List[str]] = None
    body_type: Optional[str] = None
    seller_type: Optional[str] = None


# ================================
# Favorite Schemas
# ================================

class FavoriteCreate(BaseModel):
    car_id: int


class FavoriteResponse(BaseModel):
    id: int
    car_id: int
    created_at: datetime
    car: CarResponse
    
    class Config:
        from_attributes = True


# ================================
# Alert Schemas
# ================================

class AlertCreate(BaseModel):
    email: EmailStr
    brand: Optional[str] = None
    model: Optional[str] = None
    max_price: float = Field(..., gt=0)
    min_year: Optional[int] = Field(None, ge=1990)
    max_km: Optional[int] = Field(None, ge=0)
    fuel: Optional[str] = None
    location: Optional[str] = None


class AlertResponse(BaseModel):
    id: int
    email: str
    brand: Optional[str] = None
    model: Optional[str] = None
    max_price: float
    min_year: Optional[int] = None
    max_km: Optional[int] = None
    fuel: Optional[str] = None
    location: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_notified: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AlertUpdate(BaseModel):
    is_active: Optional[bool] = None
    max_price: Optional[float] = None


# ================================
# Brand/Model Schemas
# ================================

class BrandInfo(BaseModel):
    name: str
    count: int
    models: List[str]


class ModelInfo(BaseModel):
    name: str
    count: int


# ================================
# Stats Schemas
# ================================

class StatsResponse(BaseModel):
    total_cars: int
    total_sources: int
    last_update: Optional[datetime] = None
    cars_by_source: dict
    cars_by_fuel: dict
    price_range: dict


# ================================
# Scraping Schemas
# ================================

class ScrapeRequest(BaseModel):
    sources: Optional[List[str]] = None  # None = all sources
    max_cars: Optional[int] = 100


class ScrapeStatus(BaseModel):
    id: int
    source: str
    status: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    cars_found: int
    cars_added: int
    cars_updated: int
    errors: Optional[str] = None
    
    class Config:
        from_attributes = True
