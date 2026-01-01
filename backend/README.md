# BusCar Backend

Backend para el agregador de coches de segunda mano BusCar.

## Stack Tecnológico

- **Framework**: FastAPI (Python 3.11+)
- **Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **ORM**: SQLAlchemy
- **Scrapers**: Playwright + BeautifulSoup
- **Tareas programadas**: APScheduler
- **Notificaciones**: SMTP Email

## Instalación

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

## Ejecución

```bash
# Desarrollo
uvicorn app.main:app --reload --port 8000

# Producción
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /api/cars` - Listar coches con filtros
- `GET /api/cars/{id}` - Detalle de un coche
- `GET /api/brands` - Lista de marcas
- `GET /api/brands/{brand}/models` - Modelos de una marca
- `POST /api/favorites` - Añadir favorito
- `DELETE /api/favorites/{id}` - Eliminar favorito
- `POST /api/alerts` - Crear alerta de precio
- `GET /api/alerts` - Listar alertas
- `POST /api/scrape` - Ejecutar scraping manual (admin)

## Scrapers disponibles

- Wallapop
- Coches.net
- AutoScout24
- Milanuncios
- Motor.es

## Estructura

```
backend/
├── app/
│   ├── main.py           # Punto de entrada FastAPI
│   ├── config.py         # Configuración
│   ├── database.py       # Conexión BD
│   ├── models.py         # Modelos SQLAlchemy
│   ├── schemas.py        # Schemas Pydantic
│   ├── routers/
│   │   ├── cars.py       # Endpoints de coches
│   │   ├── alerts.py     # Endpoints de alertas
│   │   └── scraping.py   # Endpoints de scraping
│   ├── scrapers/
│   │   ├── base.py       # Scraper base
│   │   ├── wallapop.py
│   │   ├── cochesnet.py
│   │   └── ...
│   ├── services/
│   │   ├── notification.py
│   │   └── scheduler.py
│   └── utils/
│       └── helpers.py
├── requirements.txt
└── .env.example
```
