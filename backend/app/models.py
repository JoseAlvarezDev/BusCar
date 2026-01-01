"""
BusCar Database Models
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Car(Base):
    """Model for car listings"""
    __tablename__ = "cars"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(50), index=True)  # wallapop, coches.net, etc.
    url: Mapped[str] = mapped_column(String(500))
    
    # Basic info
    brand: Mapped[str] = mapped_column(String(100), index=True)
    model: Mapped[str] = mapped_column(String(100), index=True)
    version: Mapped[Optional[str]] = mapped_column(String(200))
    year: Mapped[int] = mapped_column(Integer, index=True)
    price: Mapped[float] = mapped_column(Float, index=True)
    
    # Technical specs
    km: Mapped[int] = mapped_column(Integer, index=True)
    fuel: Mapped[str] = mapped_column(String(50), index=True)  # gasolina, diesel, electrico, hibrido
    transmission: Mapped[str] = mapped_column(String(50))  # manual, automatico
    power: Mapped[Optional[int]] = mapped_column(Integer)  # CV
    doors: Mapped[Optional[int]] = mapped_column(Integer)
    color: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Category
    body_type: Mapped[Optional[str]] = mapped_column(String(50))  # sedan, suv, hatchback, etc.
    
    # Location
    location: Mapped[str] = mapped_column(String(100), index=True)
    province: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Seller
    seller_type: Mapped[str] = mapped_column(String(50))  # particular, profesional
    seller_name: Mapped[Optional[str]] = mapped_column(String(200))
    
    # Details
    description: Mapped[Optional[str]] = mapped_column(Text)
    features: Mapped[Optional[str]] = mapped_column(Text)  # JSON array of features
    
    # Images
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    images: Mapped[Optional[str]] = mapped_column(Text)  # JSON array of image URLs
    
    # Flags
    negotiable: Mapped[bool] = mapped_column(Boolean, default=False)
    warranty: Mapped[bool] = mapped_column(Boolean, default=False)
    certified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    scraped_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    
    # Indexes for common queries
    __table_args__ = (
        Index('ix_cars_brand_model', 'brand', 'model'),
        Index('ix_cars_price_year', 'price', 'year'),
        Index('ix_cars_source_active', 'source', 'is_active'),
    )


class Favorite(Base):
    """User favorites"""
    __tablename__ = "favorites"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)  # Session ID or user ID
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    car: Mapped["Car"] = relationship("Car")


class Alert(Base):
    """Price alerts"""
    __tablename__ = "alerts"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)
    email: Mapped[str] = mapped_column(String(255))
    
    # Filter criteria
    brand: Mapped[Optional[str]] = mapped_column(String(100))
    model: Mapped[Optional[str]] = mapped_column(String(100))
    max_price: Mapped[float] = mapped_column(Float)
    min_year: Mapped[Optional[int]] = mapped_column(Integer)
    max_km: Mapped[Optional[int]] = mapped_column(Integer)
    fuel: Mapped[Optional[str]] = mapped_column(String(50))
    location: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_notified: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PriceHistory(Base):
    """Track price changes"""
    __tablename__ = "price_history"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id", ondelete="CASCADE"), index=True)
    price: Mapped[float] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    car: Mapped["Car"] = relationship("Car")


class ScrapeLog(Base):
    """Log of scraping runs"""
    __tablename__ = "scrape_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(50))
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    cars_found: Mapped[int] = mapped_column(Integer, default=0)
    cars_added: Mapped[int] = mapped_column(Integer, default=0)
    cars_updated: Mapped[int] = mapped_column(Integer, default=0)
    errors: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="running")  # running, success, failed
