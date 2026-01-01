"""
BusCar Scraping Router - API endpoints for managing scraping
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import ScrapeLog
from app.schemas import ScrapeRequest, ScrapeStatus

router = APIRouter()


async def run_scraping(sources: List[str], max_cars: int, db: AsyncSession):
    """Background task to run scraping"""
    from app.scrapers import get_scraper
    from app.models import Car, PriceHistory
    from sqlalchemy import select
    
    for source in sources:
        log = ScrapeLog(source=source, status="running")
        db.add(log)
        await db.commit()  # Use commit to get log.id and persist initial status
        
        try:
            scraper = get_scraper(source)
            if scraper:
                scraped_cars = await scraper.scrape(max_cars=max_cars)
                log.cars_found = len(scraped_cars)
                
                saved_count = 0
                for s_car in scraped_cars:
                    try:
                        # Check if car already exists
                        result = await db.execute(
                            select(Car).where(Car.external_id == s_car.external_id)
                        )
                        existing_car = result.scalar_one_or_none()
                        
                        if existing_car:
                            # Update price history if changed
                            if existing_car.price != s_car.price:
                                price_entry = PriceHistory(
                                    car_id=existing_car.id,
                                    price=s_car.price
                                )
                                db.add(price_entry)
                                existing_car.price = s_car.price
                            
                            # Update other technical fields
                            existing_car.km = s_car.km
                            existing_car.updated_at = datetime.utcnow()
                        else:
                            # Create new car
                            new_car = Car(
                                external_id=s_car.external_id,
                                source=s_car.source,
                                url=s_car.url,
                                brand=s_car.brand,
                                model=s_car.model,
                                price=s_car.price,
                                year=s_car.year,
                                km=s_car.km,
                                fuel=s_car.fuel,
                                transmission=s_car.transmission,
                                location=s_car.location,
                                image_url=s_car.image_url,
                                images=s_car.images,
                                seller_type=s_car.seller_type,
                                negotiable=s_car.negotiable
                            )
                            db.add(new_car)
                            await db.flush() # Get new_car.id
                            
                            # Add initial price history
                            price_entry = PriceHistory(
                                car_id=new_car.id,
                                price=s_car.price
                            )
                            db.add(price_entry)
                            saved_count += 1
                    except Exception as e:
                        print(f"Error saving car {s_car.external_id}: {e}")
                        continue
                
                log.status = "success"
                await db.commit()
        except Exception as e:
            log.status = "failed"
            log.errors = str(e)
            await db.rollback()
        finally:
            log.finished_at = datetime.utcnow()
            db.add(log)
            await db.commit()



@router.post("/scrape", response_model=dict)
async def trigger_scrape(
    request: ScrapeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Trigger a manual scraping run"""
    sources = request.sources or ["wallapop", "coches.net", "autoscout24", "milanuncios", "motor.es"]
    max_cars = request.max_cars or 100
    
    # Add background task
    background_tasks.add_task(run_scraping, sources, max_cars, db)
    
    return {
        "message": "Scraping started",
        "sources": sources,
        "max_cars": max_cars
    }


@router.get("/scrape/status", response_model=List[ScrapeStatus])
async def get_scrape_status(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """Get recent scraping logs"""
    result = await db.execute(
        select(ScrapeLog)
        .order_by(ScrapeLog.started_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/scrape/status/{log_id}", response_model=ScrapeStatus)
async def get_scrape_log(log_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific scrape log"""
    result = await db.execute(select(ScrapeLog).where(ScrapeLog.id == log_id))
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(status_code=404, detail="Scrape log not found")
    
    return log
