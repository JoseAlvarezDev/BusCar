"""
BusCar Seed Script - Populate database with initial data
"""
import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session, init_db
from app.models import Car, PriceHistory


async def seed_data():
    print("🌱 Seeding database...")
    await init_db()
    
    async with async_session() as db:
        # Check if we already have cars
        from sqlalchemy import func, select
        result = await db.execute(select(func.count(Car.id)))
        if result.scalar() > 0:
            print("✨ Database already has data. Skipping seed.")
            return

        brands = {
            "Mercedes-Benz": ["Clase C", "Clase E", "GLC", "A 200"],
            "BMW": ["Serie 3", "Serie 5", "X3", "Serie 1"],
            "Audi": ["A3", "A4", "Q5", "A6"],
            "Volkswagen": ["Golf", "Tiguan", "Passat", "Polo"],
            "Toyota": ["Yaris", "Corolla", "RAV4", "C-HR"],
            "Peugeot": ["208", "3008", "2008", "5008"],
            "Seat": ["Ibiza", "Leon", "Ateca", "Arona"],
            "Ford": ["Focus", "Fiesta", "Kuga", "Puma"]
        }
        
        fuels = ["gasolina", "diesel", "hibrido", "electrico"]
        transmissions = ["manual", "automatico"]
        sources = ["wallapop", "coches.net", "autoscout24", "milanuncios"]
        locations = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia"]
        
        cars_to_add = []
        
        car_image_ids = [
            "1494976388531-d1058494cdd8", "1503376780353-7e6692767b70", 
            "1552519507-da3b142c6e3d", "1583121274602-3e289df55366",
            "1525609004824-2f08ac699acc", "1502877338515-7a81bd756553",
            "1541899481282-d53b2ad9f44a", "1492144531280-45e1fe2d49fe",
            "1567818735868-e526a6ef45df", "1542362567-b052f7f93035"
        ]
        
        for i in range(50):
            brand = random.choice(list(brands.keys()))
            model = random.choice(brands[brand])
            price = random.randint(5000, 60000)
            year = random.randint(2010, 2024)
            km = random.randint(0, 200000)
            fuel = random.choice(fuels)
            transmission = random.choice(transmissions)
            source = random.choice(sources)
            location = random.choice(locations)
            
            img_id = random.choice(car_image_ids)
            
            car = Car(
                external_id=f"{source}-{i:04d}",
                source=source,
                url=f"https://www.{source}.com/anuncio/{i}",
                brand=brand,
                model=model,
                price=price,
                year=year,
                km=km,
                fuel=fuel,
                transmission=transmission,
                location=location,
                seller_type=random.choice(["particular", "profesional"]),
                negotiable=random.choice([True, False]),
                warranty=random.choice([True, False]),
                image_url=f"https://images.unsplash.com/photo-{img_id}?w=400&fit=crop",
                scraped_at=datetime.utcnow() - timedelta(days=random.randint(0, 10))
            )
            db.add(car)
            cars_to_add.append(car)
            
        await db.flush()
        
        # Add price history for some cars
        for car in cars_to_add:
            # Current price
            db.add(PriceHistory(car_id=car.id, price=car.price))
            
            # Historical price (lower)
            if random.random() > 0.7:
                old_price = car.price + random.randint(500, 2000)
                db.add(PriceHistory(
                    car_id=car.id, 
                    price=old_price, 
                    recorded_at=car.scraped_at - timedelta(days=5)
                ))
        
        await db.commit()
        print(f"✅ Successfully seeded {len(cars_to_add)} cars")


if __name__ == "__main__":
    asyncio.run(seed_data())
