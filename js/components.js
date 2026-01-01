// ========================================
// BusCar - UI Components
// ========================================

const Components = {

    // Header Component
    header: () => `
        <div class="header-container">
        <a href="#" class="logo" onclick="App.goHome()">
            <img src="assets/logo.png" alt="BusCar Logo" class="logo-image" style="height: 36px; width: auto; margin-right: 10px;">
            <span class="logo-text">Bus<span class="logo-accent">Car</span></span>
        </a>
            <nav class="nav">
                <a href="#" class="nav-link active" data-section="home">
                    <i data-lucide="home"></i><span>Inicio</span>
                </a>
                <a href="#" class="nav-link" data-section="favorites">
                    <i data-lucide="heart"></i><span>Favoritos</span>
                    <span class="nav-badge" id="favorites-count">0</span>
                </a>
                <a href="#" class="nav-link" data-section="compare">
                    <i data-lucide="arrow-left-right"></i><span>Comparar</span>
                    <span class="nav-badge" id="compare-count">0</span>
                </a>
                <a href="#" class="nav-link" data-section="alerts">
                    <i data-lucide="bell"></i><span>Alertas</span>
                </a>
            </nav>
            <div class="header-actions">
                <button class="btn-icon" id="theme-toggle" title="Cambiar tema">
                    <i data-lucide="moon"></i>
                </button>
            </div>
        </div>
    `,

    // Hero Section
    hero: () => `
        <div class="hero-bg">
            <div class="hero-gradient"></div>
        </div>
        <div class="hero-content">
            <h1 class="hero-title">
                Encuentra tu <span class="text-gradient">coche ideal</span><br>al mejor precio
            </h1>
            <p class="hero-subtitle">
                Comparamos precios de las mejores webs de coches de segunda mano en España
            </p>
            <div class="quick-search">
                <div class="search-field">
                    <i data-lucide="car"></i>
                    <select id="quick-brand"><option value="">Marca</option></select>
                </div>
                <div class="search-field">
                    <i data-lucide="settings"></i>
                    <select id="quick-model"><option value="">Modelo</option></select>
                </div>
                <div class="search-field">
                    <i data-lucide="euro"></i>
                    <select id="quick-price">
                        <option value="">Precio máx.</option>
                        <option value="5000">Hasta 5.000€</option>
                        <option value="10000">Hasta 10.000€</option>
                        <option value="15000">Hasta 15.000€</option>
                        <option value="20000">Hasta 20.000€</option>
                        <option value="30000">Hasta 30.000€</option>
                        <option value="50000">Hasta 50.000€</option>
                    </select>
                </div>
                <button class="btn-search" id="quick-search-btn">
                    <i data-lucide="search"></i><span>Buscar</span>
                </button>
            </div>
            <div class="hero-stats">
                <div class="stat">
                    <span class="stat-value" id="total-cars">0</span>
                    <span class="stat-label">Coches disponibles</span>
                </div>
                <div class="stat">
                    <span class="stat-value">5</span>
                    <span class="stat-label">Fuentes</span>
                </div>
                <div class="stat">
                    <span class="stat-value">24h</span>
                    <span class="stat-label">Actualización</span>
                </div>
            </div>
        </div>
        <div class="scroll-indicator"><i data-lucide="chevron-down"></i></div>
    `,

    // Categories Section
    categories: () => {
        const cats = window.BusCarData.categories;
        const counts = {};
        Object.keys(cats).forEach(key => {
            counts[key] = window.BusCarData.cars.filter(cats[key].filter).length;
        });

        return `
            <div class="container">
                <h2 class="section-title">Explora por categoría</h2>
                <div class="categories-grid">
                    ${Object.entries(cats).map(([key, cat]) => `
                        <button class="category-card" data-category="${key}">
                            <div class="category-icon"><i data-lucide="${cat.icon}"></i></div>
                            <span class="category-name">${cat.name}</span>
                            <span class="category-count">${counts[key].toLocaleString()}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Car Card
    carCard: (car, options = {}) => {
        const isFav = App?.state?.favorites?.includes(car.id);
        const isCompare = App?.state?.compareList?.includes(car.id);

        return `
            <article class="car-card" data-id="${car.id}">
                <div class="car-image-wrapper">
                    <img src="${car.image}" alt="${car.fullName}" class="car-image" loading="lazy">
                    <span class="source-tag ${car.source.replace('.', '')}">${car.source}</span>
                    <div class="car-actions">
                        <button class="btn-action ${isFav ? 'active' : ''}" data-action="favorite" title="Añadir a favoritos">
                            <i data-lucide="heart"></i>
                        </button>
                        <button class="btn-action ${isCompare ? 'active' : ''}" data-action="compare" title="Comparar">
                            <i data-lucide="arrow-left-right"></i>
                        </button>
                    </div>
                    ${car.negotiable ? '<span class="badge negotiable">Negociable</span>' : ''}
                </div>
                <div class="car-info">
                    <h3 class="car-title">${car.fullName}</h3>
                    <div class="car-price">${car.price.toLocaleString()}€</div>
                    <div class="car-specs">
                        <span><i data-lucide="calendar"></i> ${car.year}</span>
                        <span><i data-lucide="gauge"></i> ${(car.km / 1000).toFixed(0)}k km</span>
                        <span><i data-lucide="fuel"></i> ${car.fuel}</span>
                    </div>
                    <div class="car-meta">
                        <span class="car-location"><i data-lucide="map-pin"></i> ${car.location}</span>
                        <span class="car-seller ${car.seller}">${car.seller === 'profesional' ? '🏢 Pro' : '👤 Part.'}</span>
                    </div>
                </div>
            </article>
        `;
    },

    // Filters Sidebar  
    filtersSidebar: () => `
        <div class="filters-header">
            <h3><i data-lucide="filter"></i> Filtros</h3>
            <button class="btn-clear-filters" id="clear-filters">Limpiar</button>
        </div>
        <div class="filter-group">
            <label class="filter-label">Fuente</label>
            <div class="source-filters">
                ${window.BusCarData.sources.map(s => `
                    <label class="checkbox-label">
                        <input type="checkbox" name="source" value="${s}" checked>
                        <span class="source-badge ${s.replace('.', '')}">${s}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="filter-group">
            <label class="filter-label">Marca</label>
            <select id="filter-brand" class="filter-select">
                <option value="">Todas las marcas</option>
                ${Object.keys(window.BusCarData.brands).sort().map(b =>
        `<option value="${b}">${b}</option>`
    ).join('')}
            </select>
        </div>
        <div class="filter-group">
            <label class="filter-label">Modelo</label>
            <select id="filter-model" class="filter-select" disabled>
                <option value="">Selecciona marca</option>
            </select>
        </div>
        <div class="filter-group">
            <label class="filter-label">Precio máximo</label>
            <input type="range" id="price-range" min="0" max="100000" step="1000" value="100000" class="price-slider">
            <div class="range-value" id="price-value">Hasta 100.000€</div>
        </div>
        <div class="filter-group">
            <label class="filter-label">Año desde</label>
            <select id="year-min" class="filter-select">
                <option value="">Cualquiera</option>
                ${Array.from({ length: 15 }, (_, i) => 2025 - i).map(y =>
        `<option value="${y}">${y}</option>`
    ).join('')}
            </select>
        </div>
        <div class="filter-group">
            <label class="filter-label">Combustible</label>
            <div class="checkbox-grid">
                ${window.BusCarData.fuelTypes.map(f => `
                    <label class="checkbox-pill">
                        <input type="checkbox" name="fuel" value="${f}">
                        <span>${f.charAt(0).toUpperCase() + f.slice(1)}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="filter-group">
            <label class="filter-label">Cambio</label>
            <div class="checkbox-grid">
                ${window.BusCarData.transmissions.map(t => `
                    <label class="checkbox-pill">
                        <input type="checkbox" name="transmission" value="${t}">
                        <span>${t.charAt(0).toUpperCase() + t.slice(1)}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="filter-group">
            <label class="filter-label">Ubicación</label>
            <select id="filter-location" class="filter-select">
                <option value="">Toda España</option>
                ${window.BusCarData.locations.map(l =>
        `<option value="${l}">${l}</option>`
    ).join('')}
            </select>
        </div>
        <button class="btn-apply-filters" id="apply-filters">
            <i data-lucide="check"></i> Aplicar filtros
        </button>
    `,

    // Main Content Grid
    mainContent: () => `
        <div class="container main-grid">
            <aside class="filters-sidebar" id="filters-sidebar"></aside>
            <section class="results-section">
                <div class="results-header">
                    <div class="results-info">
                        <h2 id="results-title">Todos los coches</h2>
                        <span class="results-count"><span id="results-count">0</span> resultados</span>
                    </div>
                    <div class="results-actions">
                        <button class="btn-filter-mobile" id="toggle-filters">
                            <i data-lucide="filter"></i> Filtros
                        </button>
                        <select id="sort-select" class="sort-select">
                            <option value="date-desc">Más recientes</option>
                            <option value="price-asc">Precio ↑</option>
                            <option value="price-desc">Precio ↓</option>
                            <option value="year-desc">Año ↓</option>
                            <option value="km-asc">Km ↑</option>
                        </select>
                    </div>
                </div>
                <div class="active-filters" id="active-filters"></div>
                <div class="cars-grid" id="cars-grid"></div>
                <div class="loading-state hidden" id="loading-state">
                    <div class="loader"></div>
                    <p>Buscando coches...</p>
                </div>
                <div class="empty-state hidden" id="empty-state">
                    <div class="empty-icon"><i data-lucide="search-x"></i></div>
                    <h3>No encontramos resultados</h3>
                    <p>Prueba a modificar los filtros</p>
                </div>
                <div class="pagination" id="pagination"></div>
            </section>
        </div>
    `,

    // Toast notification
    toast: (message, type = 'info') => `
        <div class="toast toast-${type}">
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
            <span>${message}</span>
        </div>
    `,

    // Car Detail Modal
    carDetailModal: (car) => {
        const isFav = App?.state?.favorites?.includes(car.id);
        const isCompare = App?.state?.compareList?.includes(car.id);

        // Generate similar images for gallery simulation
        const galleryImages = [
            car.image,
            car.image.replace('w=400', 'w=600'),
            car.image.replace('fit=crop', 'fit=cover'),
        ];

        const fuelLabels = {
            'gasolina': { icon: 'fuel', color: '#ef4444' },
            'diesel': { icon: 'fuel', color: '#f59e0b' },
            'electrico': { icon: 'zap', color: '#10b981' },
            'hibrido': { icon: 'leaf', color: '#22d3ee' }
        };

        const fuelInfo = fuelLabels[car.fuel] || fuelLabels.gasolina;

        return `
            <div class="modal-overlay" onclick="App.closeModal()"></div>
            <div class="modal-content car-detail-modal">
                <button class="modal-close" onclick="App.closeModal()">
                    <i data-lucide="x"></i>
                </button>
                
                <div class="car-detail-layout">
                    <!-- Gallery Section -->
                    <div class="car-gallery">
                        <div class="gallery-main">
                            <img src="${car.image}" alt="${car.fullName}" id="gallery-main-img">
                            <span class="source-tag ${car.source.replace('.', '')}">${car.source}</span>
                            ${car.negotiable ? '<span class="badge negotiable">Negociable</span>' : ''}
                            ${car.warranty ? '<span class="badge warranty"><i data-lucide="shield-check"></i> Garantía</span>' : ''}
                        </div>
                        <div class="gallery-thumbs">
                            ${galleryImages.map((img, i) => `
                                <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="App.changeGalleryImage('${img}', this)">
                                    <img src="${img}" alt="Vista ${i + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Info Section -->
                    <div class="car-detail-info">
                        <div class="car-detail-header">
                            <div>
                                <h2 class="car-detail-title">${car.fullName}</h2>
                                <p class="car-detail-subtitle">${car.year} · ${car.km.toLocaleString()} km · ${car.transmission}</p>
                            </div>
                            <div class="car-detail-price">
                                <span class="price-value">${car.price.toLocaleString()}€</span>
                                <span class="price-monthly">~${Math.round(car.price / 48).toLocaleString()}€/mes*</span>
                            </div>
                        </div>
                        
                        <!-- Quick Stats -->
                        <div class="car-stats-grid">
                            <div class="car-stat">
                                <i data-lucide="calendar"></i>
                                <div>
                                    <span class="stat-value">${car.year}</span>
                                    <span class="stat-label">Año</span>
                                </div>
                            </div>
                            <div class="car-stat">
                                <i data-lucide="map-pin"></i>
                                <div>
                                    <span class="stat-value">${(car.km / 1000).toFixed(0)}k</span>
                                    <span class="stat-label">Kilómetros</span>
                                </div>
                            </div>
                            <div class="car-stat">
                                <i data-lucide="${fuelInfo.icon}" style="color: ${fuelInfo.color}"></i>
                                <div>
                                    <span class="stat-value">${car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1)}</span>
                                    <span class="stat-label">Combustible</span>
                                </div>
                            </div>
                            <div class="car-stat">
                                <i data-lucide="zap"></i>
                                <div>
                                    <span class="stat-value">${car.power || 'N/D'}</span>
                                    <span class="stat-label">CV</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Technical Specs -->
                        <div class="car-specs-section">
                            <h3><i data-lucide="list"></i> Especificaciones</h3>
                            <div class="specs-grid">
                                <div class="spec-item">
                                    <span class="spec-label">Marca</span>
                                    <span class="spec-value">${car.brand}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Modelo</span>
                                    <span class="spec-value">${car.model}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Cambio</span>
                                    <span class="spec-value">${car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Tipo carrocería</span>
                                    <span class="spec-value">${car.bodyType ? car.bodyType.charAt(0).toUpperCase() + car.bodyType.slice(1) : 'N/D'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Vendedor</span>
                                    <span class="spec-value">${car.seller === 'profesional' ? '🏢 Profesional' : '👤 Particular'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Ubicación</span>
                                    <span class="spec-value"><i data-lucide="map-pin"></i> ${car.location}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div class="car-description">
                            <h3><i data-lucide="align-left"></i> Descripción</h3>
                            <p>
                                ${car.brand} ${car.model} del año ${car.year} en excelente estado. 
                                Motor ${car.fuel} con ${car.power || 'potencia no especificada'} CV y cambio ${car.transmission}. 
                                Kilometraje: ${car.km.toLocaleString()} km. 
                                ${car.warranty ? '✅ Incluye garantía.' : ''}
                                ${car.negotiable ? '💬 Precio negociable.' : ''}
                                Vehículo disponible en ${car.location}.
                            </p>
                        </div>
                        
                        <!-- Actions -->
                        <div class="car-actions-bar">
                            <button class="btn-primary btn-large" onclick="window.open('${car.url}', '_blank')">
                                <i data-lucide="external-link"></i> Ver en ${car.source}
                            </button>
                            <button class="btn-secondary ${isFav ? 'active' : ''}" onclick="App.toggleFavorite('${car.id}'); App.updateModalButtons('${car.id}');">
                                <i data-lucide="heart"></i>
                            </button>
                            <button class="btn-secondary ${isCompare ? 'active' : ''}" onclick="App.toggleCompare('${car.id}'); App.updateModalButtons('${car.id}');">
                                <i data-lucide="arrow-left-right"></i>
                            </button>
                            <button class="btn-secondary" onclick="App.sharecar('${car.id}')">
                                <i data-lucide="share-2"></i>
                            </button>
                        </div>
                        
                        <p class="price-disclaimer">*Financiación estimada a 48 meses. Consultar condiciones.</p>
                    </div>
                </div>
            </div>
        `;
    },

    // Alert Modal
    alertModal: () => `
        <div class="modal-overlay" onclick="App.closeAlertModal()"></div>
        <div class="modal-content alert-modal">
            <button class="modal-close" onclick="App.closeAlertModal()">
                <i data-lucide="x"></i>
            </button>
            <div class="modal-header">
                <h2><i data-lucide="bell-plus"></i> Crear Alerta de Precio</h2>
                <p>Recibe un email cuando aparezca un coche con estas características.</p>
            </div>
            <form id="alert-form" onsubmit="event.preventDefault(); App.submitAlert(this);">
                <div class="form-group">
                    <label>Email para notificaciones</label>
                    <input type="email" name="email" required placeholder="tu@email.com" class="form-input">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Marca</label>
                        <select name="brand" id="alert-brand" class="form-input" onchange="App.updateModelSelect('alert-model', this.value)" required>
                            <option value="">Seleccionar marca</option>
                            ${Object.keys(window.BusCarData.brands).sort().map(b => `<option value="${b}">${b}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Modelo (Opcional)</label>
                        <select name="model" id="alert-model" class="form-input" disabled>
                            <option value="">Cualquier modelo</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Precio Máximo</label>
                        <div class="input-with-icon">
                            <i data-lucide="euro"></i>
                            <input type="number" name="max_price" required placeholder="Ej. 15000" class="form-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Año Mínimo</label>
                        <select name="min_year" class="form-input">
                            <option value="">Cualquier año</option>
                            ${Array.from({ length: 15 }, (_, i) => 2025 - i).map(y => `<option value="${y}">${y}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                     <div class="form-group">
                        <label>Km Máximos</label>
                        <div class="input-with-icon">
                            <i data-lucide="gauge"></i>
                            <input type="number" name="max_km" placeholder="Ej. 100000" class="form-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Combustible</label>
                        <select name="fuel" class="form-input">
                            <option value="">Cualquiera</option>
                            <option value="diesel">Diésel</option>
                            <option value="gasolina">Gasolina</option>
                            <option value="hibrido">Híbrido</option>
                            <option value="electrico">Eléctrico</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="App.closeAlertModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Crear Alerta</button>
                </div>
            </form>
        </div>
    `,

    // Footer Component
    footer: () => `
        <footer class="footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-info">
                        <a href="#" class="logo" onclick="App.goHome()">
                            <img src="assets/logo.png" alt="BusCar Logo" class="logo-image" style="height: 36px; width: auto; margin-right: 10px;">
                            <span class="logo-text">Bus<span class="logo-accent">Car</span></span>
                        </a>
                        <p> By Jose Alvarez Dev.El portal líder en España para encontrar tu próximo coche de segunda mano. Comparamos más de 500.000 ofertas diariamente.</p>
                        <div class="social-links">
                            <a href="#" class="social-btn"><i data-lucide="facebook"></i></a>
                            <a href="#" class="social-btn"><i data-lucide="instagram"></i></a>
                            <a href="#" class="social-btn"><i data-lucide="twitter"></i></a>
                            <a href="#" class="social-btn"><i data-lucide="youtube"></i></a>
                        </div>
                    </div>
                    
                    <div class="footer-col">
                        <h4 class="footer-title">Servicios</h4>
                        <div class="footer-links">
                            <a href="#" class="footer-link">Buscador de coches</a>
                            <a href="#" class="footer-link">Tasación online</a>
                            <a href="#" class="footer-link">Financiación</a>
                            <a href="#" class="footer-link">Seguros de coche</a>
                        </div>
                    </div>
                    
                    <div class="footer-col">
                        <h4 class="footer-title">Empresa</h4>
                        <div class="footer-links">
                            <a href="#" class="footer-link">Sobre nosotros</a>
                            <a href="#" class="footer-link">Contacto</a>
                            <a href="#" class="footer-link">Blog</a>
                            <a href="#" class="footer-link">Anúnciate</a>
                        </div>
                    </div>
                    
                    <div class="footer-col">
                        <h4 class="footer-title">Newsletter</h4>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px;">Recibe las mejores ofertas en tu email antes que nadie.</p>
                        <form class="newsletter-form" onsubmit="event.preventDefault(); App.showToast('¡Suscrito con éxito!', 'success')">
                            <div class="newsletter-input-group">
                                <input type="email" placeholder="Tu email" class="newsletter-input" required>
                                <button type="submit" class="btn-newsletter">
                                    <i data-lucide="send"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; 2024 BusCar - Todos los derechos reservados.</p>
                    <div class="footer-legal">
                        <a href="#" class="footer-link">Aviso Legal</a>
                        <a href="#" class="footer-link">Privacidad</a>
                        <a href="#" class="footer-link">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    `
};

window.Components = Components;

