"""
BusCar Base Scraper - Abstract class for all scrapers
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime
import httpx


@dataclass
class ScrapedCar:
    """Data class for scraped car information"""
    external_id: str
    source: str
    url: str
    brand: str
    model: str
    year: int
    price: float
    km: int
    fuel: str
    transmission: str
    location: str
    
    # Optional fields
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
    published_at: Optional[datetime] = None


class BaseScraper(ABC):
    """Abstract base class for scrapers"""
    
    source_name: str = "unknown"
    base_url: str = ""
    
    def __init__(self):
        self.http_client: Optional[httpx.AsyncClient] = None
    
    async def __aenter__(self):
        await self.setup()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.cleanup()
    
    async def setup(self):
        """Initialize HTTP client"""
        self.http_client = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/html, */*",
                "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
            },
            follow_redirects=True
        )
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.http_client:
            await self.http_client.aclose()
    
    @abstractmethod
    async def scrape(self, max_cars: int = 100, **filters) -> List[ScrapedCar]:
        """
        Main scraping method - must be implemented by subclasses
        
        Args:
            max_cars: Maximum number of cars to scrape
            **filters: Optional filters (brand, model, max_price, etc.)
        
        Returns:
            List of ScrapedCar objects
        """
        pass
    
    @abstractmethod
    async def scrape_detail(self, url: str) -> Optional[ScrapedCar]:
        """
        Scrape detailed information for a single car
        
        Args:
            url: URL of the car listing
        
        Returns:
            ScrapedCar with full details, or None if failed
        """
        pass
    
    def parse_price(self, price_text: str) -> float:
        """Parse price from text"""
        # Remove currency symbols, spaces, dots (thousands separator)
        cleaned = price_text.replace("€", "").replace(".", "").replace(",", ".").strip()
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
    
    def parse_km(self, km_text: str) -> int:
        """Parse kilometers from text"""
        cleaned = km_text.lower().replace("km", "").replace(".", "").replace(",", "").strip()
        try:
            return int(cleaned)
        except ValueError:
            return 0
    
    def parse_year(self, year_text: str) -> int:
        """Parse year from text"""
        import re
        match = re.search(r"(19|20)\d{2}", year_text)
        if match:
            return int(match.group())
        return 0
    
    def normalize_fuel(self, fuel_text: str) -> str:
        """Normalize fuel type"""
        fuel_lower = fuel_text.lower()
        if "electr" in fuel_lower:
            return "electrico"
        elif "hibrid" in fuel_lower:
            return "hibrido"
        elif "diesel" in fuel_lower or "diésel" in fuel_lower:
            return "diesel"
        elif "gasolina" in fuel_lower or "benzin" in fuel_lower:
            return "gasolina"
        elif "gas" in fuel_lower:
            return "gas"
        return "otro"
    
    def normalize_transmission(self, trans_text: str) -> str:
        """Normalize transmission type"""
        trans_lower = trans_text.lower()
        if "auto" in trans_lower or "automát" in trans_lower:
            return "automatico"
        return "manual"
