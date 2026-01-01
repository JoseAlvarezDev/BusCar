# BusCar 🚗

BusCar es una aplicación web moderna para buscar y comparar precios de coches de segunda mano en España. Utiliza un backend en Python (FastAPI) para agregar datos y un frontend en Vanilla JS con un diseño premium.

![BusCar Splash Screen](https://via.placeholder.com/800x450?text=BusCar+Preview)

## 🚀 Características

- **Buscador Potente**: Filtra por marca, modelo, precio, año, kilometraje y combustible.
- **Comparador**: Compara hasta 3 coches lado a lado.
- **Favoritos**: Guarda los coches que te interesan.
- **Alertas**: (En desarrollo) Recibe notificaciones de bajadas de precio.
- **Diseño Responsive**: Interfaz moderna y adaptada a móviles.
- **Datos en tiempo real**: Scraping de fuentes públicas (Wallapop, etc.).

## 🛠️ Tecnologías

### Frontend
- **HTML5 & Vanilla CSS**: Sin frameworks pesados, para máximo rendimiento.
- **Vanilla JavaScript**: Lógica de cliente ligera y rápida.
- **Lucide Icons**: Iconografía moderna y consistente.
- **Component Based**: Arquitectura modular basada en componentes JS.

### Backend
- **FastAPI**: Framework de Python de alto rendimiento.
- **SQLite**: Base de datos ligera (fácilmente migrable a PostgreSQL).
- **BeautifulSoup4**: Para el scraping de datos.
- **Pydantic**: Validación de datos robusta.

## 📦 Instalación y Uso

### Prerrequisitos
- Python 3.8+
- Un navegador web moderno

### 1. Configuración del Backend

```bash
# Navegar al directorio del backend
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# (Opcional) Configurar variables de entorno
cp .env.example .env
# Edita .env con tu configuración si es necesario

# Poblar la base de datos con datos de prueba (si no hay scraping activo)
python seed.py

# Iniciar el servidor
uvicorn app.main:app --reload
```

El backend estará corriendo en `http://localhost:8000`.

### 2. Configuración del Frontend

El frontend es estático, por lo que puedes servirlo con cualquier servidor HTTP simple.

```bash
# Desde la raíz del proyecto
python3 -m http.server 8080
```

Abre `http://localhost:8080` en tu navegador.

## 🤝 Contribución

1. Haz un Fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.
