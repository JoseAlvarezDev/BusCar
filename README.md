# <img src="assets/logo.png" alt="BusCar Logo" width="50" height="50" style="vertical-align: middle;"> BusCar

**BusCar** es una plataforma moderna e inteligente para la agregación, búsqueda y comparación de coches de segunda mano en España. Diseñada con un enfoque "Mobile-First" y una estética premium, ofrece una experiencia de usuario fluida y potente.

![BusCar Preview](assets/preview.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68%2B-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Javascript](https://img.shields.io/badge/Vanilla-JS-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🚀 Características Principales

*   **🔍 Motor de Búsqueda Avanzado**: Filtra millones de opciones por marca, modelo, precio, año, kilometraje, combustible y más.
*   **⚖️ Comparador Inteligente**: Compara hasta 3 vehículos simultáneamente para tomar la mejor decisión.
*   **❤️ Lista de Favoritos**: Guarda y gestiona tus coches preferidos con persistencia local.
*   **⚡ Datos en Tiempo Real**: Backend robusto que agrega ofertas de múltiples fuentes (preparado para Wallapop y otros portales).
*   **🎨 Diseño Premium**: Interfaz oscura moderna (Dark Mode), animaciones fluidas y experiencia de usuario optimizada (UX).
*   **📱 Totalmente Responsive**: Funciona perfectamente en ordenadores, tablets y móviles.

## 🛠️ Stack Tecnológico

La arquitectura de **BusCar** ha sido diseñada para ser ligera, rápida y fácil de mantener.

### Frontend
*   **HTML5 Semantic**: Estructura limpia y accesible.
*   **Vanilla CSS3**: Estilos personalizados con variables CSS, animaciones y Flexbox/Grid. Sin dependencias pesadas.
*   **Vanilla JavaScript (ES6+)**: Lógica de cliente modular basada en componentes.
*   **Lucide Icons**: Iconografía SVG moderna y ligera.

### Backend
*   **Python**: Lenguaje principal.
*   **FastAPI**: Framework web asíncrono de alto rendimiento para construir la API.
*   **SQLite + SQLAlchemy (Async)**: Persistencia de datos ligera y eficiente.
*   **BeautifulSoup4**: Motor de scraping para la obtención de datos.
*   **Pydantic**: Validación y serialización de datos.

## 📦 Instalación y Despliegue Local

Sigue estos pasos para tener tu propia instancia de BusCar corriendo en minutos.

### Prerrequisitos
*   Git
*   Python 3.8 o superior
*   Navegador web moderno

### 1. Clonar el repositorio

```bash
git clone https://github.com/Josealvarezdev/BusCar.git
cd BusCar
```

### 2. Configurar el Backend (API)

```bash
# Entrar al directorio del backend
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# (Opcional) Configurar variables de entorno
cp .env.example .env
# Edita .env según tus necesidades (base de datos, claves, etc.)

# Poblar la base de datos con datos de ejemplo
python seed.py

# Iniciar el servidor de desarrollo
uvicorn app.main:app --reload
```
La API estará disponible en `http://localhost:8000` (Documentación en `/docs`).

### 3. Ejecutar el Frontend

Dado que el frontend es estático y conecta con la API, puedes servirlo con cualquier servidor HTTP.

```bash
# Desde la raíz del proyecto (nueva terminal)
python3 -m http.server 8080
```
Visita `http://localhost:8080` en tu navegador.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si quieres mejorar BusCar:

1.  Haz un Fork del repositorio.
2.  Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`).
3.  Haz tus cambios y commitea (`git commit -m 'Añade nueva funcionalidad increíble'`).
4.  Haz Push a tu rama (`git push origin feature/NuevaFuncionalidad`).
5.  Abre un Pull Request.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---
Hecho con 💙 por [Jose Alvarez](https://github.com/Josealvarezdev)
