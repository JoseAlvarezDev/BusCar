"""
BusCar Scrapers Module
"""
from typing import Optional
from app.scrapers.base import BaseScraper


def get_scraper(source: str) -> Optional[BaseScraper]:
    """Get scraper instance by source name"""
    scrapers = {
        "wallapop": "app.scrapers.wallapop.WallapopScraper",
        "coches.net": "app.scrapers.cochesnet.CochesNetScraper",
        "autoscout24": "app.scrapers.autoscout24.AutoScout24Scraper",
        "milanuncios": "app.scrapers.milanuncios.MilanunciosScraper",
        "motor.es": "app.scrapers.motores.MotorEsScraper",
    }
    
    if source not in scrapers:
        return None
    
    # Dynamic import
    module_path, class_name = scrapers[source].rsplit(".", 1)
    try:
        import importlib
        module = importlib.import_module(module_path)
        scraper_class = getattr(module, class_name)
        return scraper_class()
    except (ImportError, AttributeError):
        return None
