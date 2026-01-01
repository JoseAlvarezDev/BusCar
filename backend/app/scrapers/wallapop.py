"""
BusCar Wallapop Scraper
Note: Wallapop uses an API, so we can scrape it without browser
"""
from typing import List, Optional
import json
from app.scrapers.base import BaseScraper, ScrapedCar


class WallapopScraper(BaseScraper):
    """Scraper for Wallapop"""
    
    source_name = "wallapop"
    base_url = "https://api.wallapop.com"
    
    # Wallapop category ID for cars
    CARS_CATEGORY_ID = "100"
    
    async def scrape(self, max_cars: int = 100, **filters) -> List[ScrapedCar]:
        """
        Scrape car listings from Wallapop
        
        Note: This is a simplified example. Wallapop's API may require
        authentication or have anti-scraping measures.
        """
        await self.setup()
        cars = []
        
        try:
            # Build search URL
            params = {
                "category_ids": self.CARS_CATEGORY_ID,
                "filters_source": "search_box",
                "latitude": 40.4168,  # Madrid
                "longitude": -3.7038,
                "order_by": "newest",
                "step": 0,
            }
            
            # Apply filters
            if filters.get("brand"):
                params["keywords"] = filters["brand"]
            if filters.get("max_price"):
                params["max_sale_price"] = filters["max_price"]
            if filters.get("min_price"):
                params["min_sale_price"] = filters["min_price"]
            
            # Make request
            url = f"{self.base_url}/api/v3/general/search"
            response = await self.http_client.get(url, params=params)
            
            if response.status_code != 200:
                print(f"Wallapop API error: {response.status_code}")
                return cars
            
            data = response.json()
            items = data.get("search_objects", [])[:max_cars]
            
            for item in items:
                try:
                    car = self._parse_item(item)
                    if car:
                        cars.append(car)
                except Exception as e:
                    print(f"Error parsing Wallapop item: {e}")
                    continue
            
        except Exception as e:
            print(f"Wallapop scraping error: {e}")
        finally:
            await self.cleanup()
        
        return cars
    
    def _parse_item(self, item: dict) -> Optional[ScrapedCar]:
        """Parse a Wallapop item into ScrapedCar"""
        try:
            # Extract basic info
            item_id = item.get("id", "")
            title = item.get("title", "")
            price = float(item.get("price", 0))
            
            # Parse brand and model from title
            # This is simplified - real implementation would need better parsing
            parts = title.split(" ", 1)
            brand = parts[0] if parts else "Desconocido"
            model = parts[1] if len(parts) > 1 else "Desconocido"
            
            # Get attributes
            attrs = {a.get("title", ""): a.get("value", "") for a in item.get("attributes", [])}
            
            # Extract car details from attributes
            year = self.parse_year(attrs.get("year", "2020"))
            km = self.parse_km(attrs.get("km", "0"))
            fuel = self.normalize_fuel(attrs.get("fuel", "gasolina"))
            transmission = self.normalize_transmission(attrs.get("gearbox", "manual"))
            
            # Location
            location = item.get("location", {})
            city = location.get("city", "España")
            
            # Image
            images = item.get("images", [])
            image_url = images[0].get("medium") if images else None
            
            return ScrapedCar(
                external_id=f"wallapop-{item_id}",
                source="wallapop",
                url=f"https://es.wallapop.com/item/{item_id}",
                brand=brand,
                model=model,
                year=year,
                price=price,
                km=km,
                fuel=fuel,
                transmission=transmission,
                location=city,
                image_url=image_url,
                images=json.dumps([img.get("original") for img in images]) if images else None,
                seller_type="particular",
                negotiable=item.get("flags", {}).get("negotiable", False)
            )
            
        except Exception as e:
            print(f"Error parsing Wallapop item: {e}")
            return None
    
    async def scrape_detail(self, url: str) -> Optional[ScrapedCar]:
        """Scrape detailed information from a Wallapop listing"""
        # Extract item ID from URL
        # Real implementation would fetch full details
        return None
