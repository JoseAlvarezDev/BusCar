"""
BusCar Alerts Router - API endpoints for price alerts
"""
from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.models import Alert
from app.schemas import AlertCreate, AlertResponse, AlertUpdate

router = APIRouter()


@router.post("/alerts", response_model=AlertResponse)
async def create_alert(
    alert: AlertCreate,
    user_id: str = Query(..., description="User or session ID"),
    db: AsyncSession = Depends(get_db)
):
    """Create a new price alert"""
    new_alert = Alert(
        user_id=user_id,
        email=alert.email,
        brand=alert.brand,
        model=alert.model,
        max_price=alert.max_price,
        min_year=alert.min_year,
        max_km=alert.max_km,
        fuel=alert.fuel,
        location=alert.location
    )
    db.add(new_alert)
    await db.flush()
    await db.refresh(new_alert)
    return new_alert


@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    user_id: str = Query(..., description="User or session ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get user's price alerts"""
    result = await db.execute(
        select(Alert)
        .where(Alert.user_id == user_id)
        .order_by(Alert.created_at.desc())
    )
    return result.scalars().all()


@router.get("/alerts/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: int,
    user_id: str = Query(..., description="User or session ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific alert"""
    result = await db.execute(
        select(Alert).where(
            and_(Alert.id == alert_id, Alert.user_id == user_id)
        )
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert


@router.patch("/alerts/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: int,
    update: AlertUpdate,
    user_id: str = Query(..., description="User or session ID"),
    db: AsyncSession = Depends(get_db)
):
    """Update an alert"""
    result = await db.execute(
        select(Alert).where(
            and_(Alert.id == alert_id, Alert.user_id == user_id)
        )
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if update.is_active is not None:
        alert.is_active = update.is_active
    if update.max_price is not None:
        alert.max_price = update.max_price
    
    await db.flush()
    await db.refresh(alert)
    return alert


@router.delete("/alerts/{alert_id}")
async def delete_alert(
    alert_id: int,
    user_id: str = Query(..., description="User or session ID"),
    db: AsyncSession = Depends(get_db)
):
    """Delete an alert"""
    result = await db.execute(
        select(Alert).where(
            and_(Alert.id == alert_id, Alert.user_id == user_id)
        )
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    await db.delete(alert)
    return {"message": "Alert deleted"}
