"""
BusCar Scheduler Service - Periodic scraping and alert checking
"""
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session
from app.models import Car, Alert
from app.scrapers import get_scraper
from app.services.notification import notification_service


scheduler = AsyncIOScheduler()


async def run_scheduled_scraping():
    """Run scraping for all sources"""
    print(f"[{datetime.now()}] Starting scheduled scraping...")
    
    sources = ["wallapop", "coches.net", "autoscout24", "milanuncios", "motor.es"]
    
    async with async_session() as db:
        for source in sources:
            try:
                scraper = get_scraper(source)
                if scraper:
                    async with scraper:
                        cars = await scraper.scrape(max_cars=settings.max_cars_per_scrape)
                        print(f"  - {source}: Found {len(cars)} cars")
                        # TODO: Save/update cars in database
            except Exception as e:
                print(f"  - {source}: Error - {e}")
    
    print(f"[{datetime.now()}] Scraping completed")


async def check_alerts():
    """Check all active alerts and send notifications"""
    print(f"[{datetime.now()}] Checking price alerts...")
    
    async with async_session() as db:
        # Get active alerts that haven't been notified in 24 hours
        threshold = datetime.utcnow() - timedelta(hours=24)
        
        result = await db.execute(
            select(Alert).where(
                and_(
                    Alert.is_active == True,
                    (Alert.last_notified == None) | (Alert.last_notified < threshold)
                )
            )
        )
        alerts = result.scalars().all()
        
        print(f"  - Checking {len(alerts)} active alerts")
        
        for alert in alerts:
            try:
                # Build query for matching cars
                query = select(Car).where(
                    and_(
                        Car.is_active == True,
                        Car.price <= alert.max_price
                    )
                )
                
                if alert.brand:
                    query = query.where(Car.brand == alert.brand)
                if alert.model:
                    query = query.where(Car.model == alert.model)
                if alert.min_year:
                    query = query.where(Car.year >= alert.min_year)
                if alert.max_km:
                    query = query.where(Car.km <= alert.max_km)
                if alert.fuel:
                    query = query.where(Car.fuel == alert.fuel)
                if alert.location:
                    query = query.where(Car.location == alert.location)
                
                # Get recent cars (scraped in last 24 hours)
                query = query.where(Car.scraped_at > threshold)
                query = query.order_by(Car.price.asc()).limit(20)
                
                result = await db.execute(query)
                matching_cars = result.scalars().all()
                
                if matching_cars:
                    # Send notification
                    success = await notification_service.send_alert_notification(
                        alert=alert,
                        matching_cars=matching_cars
                    )
                    
                    if success:
                        alert.last_notified = datetime.utcnow()
                        await db.commit()
                        print(f"  - Alert {alert.id}: Sent notification for {len(matching_cars)} cars")
                
            except Exception as e:
                print(f"  - Alert {alert.id}: Error - {e}")
    
    print(f"[{datetime.now()}] Alert check completed")


def start_scheduler():
    """Start the background scheduler"""
    # Schedule scraping every N hours
    scheduler.add_job(
        run_scheduled_scraping,
        trigger=IntervalTrigger(hours=settings.scrape_interval_hours),
        id="scheduled_scraping",
        name="Periodic car scraping",
        replace_existing=True
    )
    
    # Schedule alert checking every hour
    scheduler.add_job(
        check_alerts,
        trigger=IntervalTrigger(hours=1),
        id="check_alerts",
        name="Check price alerts",
        replace_existing=True
    )
    
    scheduler.start()
    print(f"✅ Scheduler started - Scraping every {settings.scrape_interval_hours}h, alerts every 1h")


def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
