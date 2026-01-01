"""
BusCar Cars Router - API endpoints for car listings
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Car, Favorite
from app.schemas import (
    CarResponse, CarDetail, CarListResponse, 
    FavoriteCreate, FavoriteResponse, BrandInfo, StatsResponse
)

router = APIRouter()


@router.get("/cars", response_model=CarListResponse)
async def get_cars(
    # Pagination
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    # Sorting
    sort: str = Query("date-desc", regex="^(date|price|year|km)-(asc|desc)$"),
    # Filters
    brand: Optional[str] = None,
    model: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    min_km: Optional[int] = None,
    max_km: Optional[int] = None,
    fuel: Optional[str] = None,  # Comma-separated
    transmission: Optional[str] = None,  # Comma-separated
    location: Optional[str] = None,
    sources: Optional[str] = None,  # Comma-separated
    body_type: Optional[str] = None,
    seller_type: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get paginated list of cars with filters"""
    
    # Base query
    query = select(Car).where(Car.is_active == True)
    count_query = select(func.count(Car.id)).where(Car.is_active == True)
    
    # Apply filters
    conditions = []
    
    if brand:
        conditions.append(Car.brand == brand)
    if model:
        conditions.append(Car.model == model)
    if min_price is not None:
        conditions.append(Car.price >= min_price)
    if max_price is not None:
        conditions.append(Car.price <= max_price)
    if min_year is not None:
        conditions.append(Car.year >= min_year)
    if max_year is not None:
        conditions.append(Car.year <= max_year)
    if min_km is not None:
        conditions.append(Car.km >= min_km)
    if max_km is not None:
        conditions.append(Car.km <= max_km)
    if fuel:
        fuel_list = [f.strip() for f in fuel.split(",")]
        conditions.append(Car.fuel.in_(fuel_list))
    if transmission:
        trans_list = [t.strip() for t in transmission.split(",")]
        conditions.append(Car.transmission.in_(trans_list))
    if location:
        conditions.append(Car.location == location)
    if sources:
        source_list = [s.strip() for s in sources.split(",")]
        conditions.append(Car.source.in_(source_list))
    if body_type:
        conditions.append(Car.body_type == body_type)
    if seller_type:
        conditions.append(Car.seller_type == seller_type)
    if search:
        search_pattern = f"%{search}%"
        conditions.append(
            or_(
                Car.brand.ilike(search_pattern),
                Car.model.ilike(search_pattern),
                Car.description.ilike(search_pattern)
            )
        )
    
    if conditions:
        query = query.where(and_(*conditions))
        count_query = count_query.where(and_(*conditions))
    
    # Sorting
    sort_field, sort_dir = sort.split("-")
    sort_mapping = {
        "date": Car.scraped_at,
        "price": Car.price,
        "year": Car.year,
        "km": Car.km
    }
    sort_column = sort_mapping.get(sort_field, Car.scraped_at)
    if sort_dir == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Execute
    result = await db.execute(query)
    cars = result.scalars().all()
    
    return CarListResponse(
        cars=[CarResponse.model_validate(car) for car in cars],
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page
    )


@router.get("/cars/{car_id}", response_model=CarDetail)
async def get_car(car_id: int, db: AsyncSession = Depends(get_db)):
    """Get detailed information about a specific car"""
    result = await db.execute(select(Car).where(Car.id == car_id))
    car = result.scalar_one_or_none()
    
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    return CarDetail.model_validate(car)


@router.get("/brands", response_model=List[BrandInfo])
async def get_brands(db: AsyncSession = Depends(get_db)):
    """Get list of all brands with counts and models"""
    # Get brands with counts
    query = (
        select(Car.brand, func.count(Car.id).label("count"))
        .where(Car.is_active == True)
        .group_by(Car.brand)
        .order_by(func.count(Car.id).desc())
    )
    result = await db.execute(query)
    brands_data = result.all()
    
    brands = []
    for brand_name, count in brands_data:
        # Get models for each brand
        models_query = (
            select(Car.model)
            .where(and_(Car.brand == brand_name, Car.is_active == True))
            .distinct()
            .order_by(Car.model)
        )
        models_result = await db.execute(models_query)
        models = [row[0] for row in models_result.all()]
        
        brands.append(BrandInfo(name=brand_name, count=count, models=models))
    
    return brands


@router.get("/brands/{brand}/models")
async def get_models(brand: str, db: AsyncSession = Depends(get_db)):
    """Get models for a specific brand"""
    query = (
        select(Car.model, func.count(Car.id).label("count"))
        .where(and_(Car.brand == brand, Car.is_active == True))
        .group_by(Car.model)
        .order_by(Car.model)
    )
    result = await db.execute(query)
    
    return [{"name": row[0], "count": row[1]} for row in result.all()]


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get general statistics"""
    # Total cars
    total_query = select(func.count(Car.id)).where(Car.is_active == True)
    total_result = await db.execute(total_query)
    total_cars = total_result.scalar()
    
    # Cars by source
    source_query = (
        select(Car.source, func.count(Car.id))
        .where(Car.is_active == True)
        .group_by(Car.source)
    )
    source_result = await db.execute(source_query)
    cars_by_source = dict(source_result.all())
    
    # Cars by fuel
    fuel_query = (
        select(Car.fuel, func.count(Car.id))
        .where(Car.is_active == True)
        .group_by(Car.fuel)
    )
    fuel_result = await db.execute(fuel_query)
    cars_by_fuel = dict(fuel_result.all())
    
    # Price range
    price_query = select(func.min(Car.price), func.max(Car.price)).where(Car.is_active == True)
    price_result = await db.execute(price_query)
    min_price, max_price = price_result.one()
    
    # Last update
    last_query = select(func.max(Car.scraped_at))
    last_result = await db.execute(last_query)
    last_update = last_result.scalar()
    
    return StatsResponse(
        total_cars=total_cars,
        total_sources=len(cars_by_source),
        last_update=last_update,
        cars_by_source=cars_by_source,
        cars_by_fuel=cars_by_fuel,
        price_range={"min": min_price or 0, "max": max_price or 0}
    )


# ================================
# Favorites
# ================================

@router.post("/favorites", response_model=FavoriteResponse)
async def add_favorite(
    favorite: FavoriteCreate,
    user_id: str = Query(..., description="User or session ID"),
    db: AsyncSession = Depends(get_db)
):
    """Add a car to favorites"""
    # Check if car exists
    car_result = await db.execute(select(Car).where(Car.id == favorite.car_id))
    car = car_result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Check if already favorited
    existing = await db.execute(
        select(Favorite).where(
            and_(Favorite.user_id == user_id, Favorite.car_id == favorite.car_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    # Create favorite
    new_favorite = Favorite(user_id=user_id, car_id=favorite.car_id)
    db.add(new_favorite)
    await db.flush()
    await db.refresh(new_favorite)
    
    # Load car relationship
    result = await db.execute(
        select(Favorite)
        .where(Favorite.id == new_favorite.id)
        .options(selectinload(Favorite.car))
    )
    return result.scalar_one()


@router.get("/favorites", response_model=List[FavoriteResponse])
async def get_favorites(
    user_id: str = Query(..., description="User or session ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get user's favorite cars"""
    result = await db.execute(
        select(Favorite)
        .where(Favorite.user_id == user_id)
        .options(selectinload(Favorite.car))
        .order_by(Favorite.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/favorites/{car_id}")
async def remove_favorite(
    car_id: int,
    user_id: str = Query(..., description="User or session ID"),
    db: AsyncSession = Depends(get_db)
):
    """Remove a car from favorites"""
    result = await db.execute(
        select(Favorite).where(
            and_(Favorite.user_id == user_id, Favorite.car_id == car_id)
        )
    )
    favorite = result.scalar_one_or_none()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    await db.delete(favorite)
    return {"message": "Favorite removed"}
