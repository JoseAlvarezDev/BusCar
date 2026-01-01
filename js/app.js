// ========================================
// BusCar - Main Application
// ========================================

const App = {
    state: {
        apiUrl: 'http://localhost:8000/api',
        currentSection: 'home',
        cars: [],
        filteredCars: [],
        favorites: JSON.parse(localStorage.getItem('buscar-favorites') || '[]'),
        compareList: JSON.parse(localStorage.getItem('buscar-compare') || '[]'),
        alerts: JSON.parse(localStorage.getItem('buscar-alerts') || '[]'),
        filters: {
            sources: ['wallapop', 'coches.net', 'autoscout24', 'milanuncios', 'motor.es'],
            brand: '',
            model: '',
            maxPrice: 100000,
            yearMin: null,
            fuel: [],
            transmission: [],
            location: '',
            category: null,
            search: ''
        },
        sort: 'date-desc',
        page: 1,
        perPage: 12,
        totalCars: 0,
        loading: false
    },

    async init() {
        console.log('🚀 Initializing BusCar with backend...');

        // Initialize splash screen icons immediately
        lucide.createIcons();

        this.render();
        this.bindEvents();
        this.updateBadges();

        const startTime = Date.now();
        await this.loadInitialData();

        // Ensure splash screen shows for at least 1.5s for premium feeling
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 1500 - elapsed);

        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add('hidden');
                setTimeout(() => splash.remove(), 1000);
            }
        }, delay);
    },

    async loadInitialData() {
        this.state.loading = true;
        try {
            // Load brands from API
            const brandsRes = await fetch(`${this.state.apiUrl}/brands`);
            const brandsData = await brandsRes.json();

            // Map API brands to local format
            const brandsMap = {};
            brandsData.forEach(b => {
                brandsMap[b.name] = b.models;
            });
            window.BusCarData.brands = brandsMap;

            // Initial car load
            await this.fetchCars();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showToast('Error conectando con el servidor', 'error');
            // Fallback to local data if API fails
            this.state.cars = window.BusCarData.cars;
            this.state.filteredCars = [...this.state.cars];
        } finally {
            this.state.loading = false;
        }
    },

    async fetchCars() {
        this.state.loading = true;
        const f = this.state.filters;

        // Build query params
        const params = new URLSearchParams({
            page: this.state.page,
            per_page: this.state.perPage,
            sort: this.state.sort
        });

        if (f.brand) params.append('brand', f.brand);
        if (f.model) params.append('model', f.model);
        if (f.maxPrice < 100000) params.append('max_price', f.maxPrice);
        if (f.yearMin) params.append('min_year', f.yearMin);
        if (f.location) params.append('location', f.location);
        if (f.sources.length > 0) params.append('sources', f.sources.join(','));
        if (f.fuel.length > 0) params.append('fuel', f.fuel.join(','));
        if (f.transmission.length > 0) params.append('transmission', f.transmission.join(','));
        if (f.search) params.append('search', f.search);

        try {
            const res = await fetch(`${this.state.apiUrl}/cars?${params.toString()}`);
            const data = await res.json();

            // Map API response to frontend format
            const mappedCars = data.cars.map(c => ({
                ...c,
                fullName: `${c.brand} ${c.model}`,
                image: c.image_url || window.BusCarData.carImages[c.brand] || window.BusCarData.carImages.default,
                dateAdded: new Date(c.scraped_at)
            }));

            this.state.cars = mappedCars;
            this.state.filteredCars = mappedCars;
            this.state.totalCars = data.total;
        } catch (error) {
            console.error('Error fetching cars:', error);
            this.showToast('Error al cargar coches', 'error');
        } finally {
            this.state.loading = false;
            if (this.state.currentSection === 'home') {
                const grid = document.getElementById('cars-grid');
                if (grid) this.renderCars();
            }
        }
    },


    render() {
        document.getElementById('header').innerHTML = Components.header();
        document.getElementById('hero-section').innerHTML = Components.hero();
        document.getElementById('categories-section').innerHTML = Components.categories();
        document.getElementById('main-content').innerHTML = Components.mainContent();
        document.getElementById('filters-sidebar').innerHTML = Components.filtersSidebar();
        document.getElementById('footer').innerHTML = Components.footer();

        this.populateBrandSelect();
        this.applyFilters();
        document.getElementById('total-cars').textContent = this.state.cars.length.toLocaleString();

        lucide.createIcons();
    },

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.section);
            });
        });

        // Quick search
        document.getElementById('quick-brand').addEventListener('change', (e) => {
            this.updateModelSelect('quick-model', e.target.value);
        });

        document.getElementById('quick-search-btn').addEventListener('click', () => {
            this.quickSearch();
        });

        // Filter brand change
        document.getElementById('filter-brand').addEventListener('change', (e) => {
            this.updateModelSelect('filter-model', e.target.value);
            this.state.filters.brand = e.target.value;
        });

        // Price range
        document.getElementById('price-range').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('price-value').textContent =
                value >= 100000 ? 'Sin límite' : `Hasta ${value.toLocaleString()}€`;
            this.state.filters.maxPrice = value;
        });

        // Apply filters
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.collectFilters();
            this.applyFilters();
        });

        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Sort
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.state.sort = e.target.value;
            this.applyFilters();
        });

        // Categories
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.filterByCategory(card.dataset.category);
            });
        });

        // Car card actions (delegated)
        document.getElementById('cars-grid').addEventListener('click', (e) => {
            const card = e.target.closest('.car-card');
            const actionBtn = e.target.closest('.btn-action');

            if (actionBtn) {
                e.stopPropagation();
                const carId = card.dataset.id;
                const action = actionBtn.dataset.action;

                if (action === 'favorite') this.toggleFavorite(carId);
                if (action === 'compare') this.toggleCompare(carId);
            } else if (card) {
                this.showCarDetail(card.dataset.id);
            }
        });

        // Mobile filters toggle
        document.getElementById('toggle-filters').addEventListener('click', () => {
            document.getElementById('filters-sidebar').classList.toggle('open');
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
        });
    },

    navigateTo(section) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Hide all sections
        document.getElementById('hero-section').classList.toggle('hidden', section !== 'home');
        document.getElementById('categories-section').classList.toggle('hidden', section !== 'home');
        document.getElementById('main-content').classList.toggle('hidden', section !== 'home');
        document.getElementById('favorites-section').classList.toggle('hidden', section !== 'favorites');
        document.getElementById('compare-section').classList.toggle('hidden', section !== 'compare');
        document.getElementById('alerts-section').classList.toggle('hidden', section !== 'alerts');

        if (section === 'favorites') this.renderFavorites();
        if (section === 'compare') this.renderCompare();
        if (section === 'alerts') this.renderAlerts();

        this.state.currentSection = section;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        lucide.createIcons();
    },

    goHome() {
        this.navigateTo('home');
    },

    populateBrandSelect() {
        // Brands are loaded in loadInitialData and stored in window.BusCarData.brands
        const brands = Object.keys(window.BusCarData.brands).sort();
        const options = brands.map(b => `<option value="${b}">${b}</option>`).join('');

        document.getElementById('quick-brand').innerHTML = '<option value="">Marca</option>' + options;
        document.getElementById('filter-brand').innerHTML = '<option value="">Todas las marcas</option>' + options;
    },

    updateModelSelect(selectId, brand) {
        const select = document.getElementById(selectId);
        if (!brand) {
            select.innerHTML = '<option value="">Todos los modelos</option>';
            select.disabled = true;
            return;
        }

        // Models are stored as an array in the brands map
        const models = window.BusCarData.brands[brand] || [];
        select.innerHTML = '<option value="">Todos los modelos</option>' +
            models.map(m => `<option value="${m}">${m}</option>`).join('');
        select.disabled = false;
    },

    collectFilters() {
        const f = this.state.filters;
        f.brand = document.getElementById('filter-brand').value;
        f.model = document.getElementById('filter-model').value;
        f.maxPrice = parseInt(document.getElementById('price-range').value);
        f.yearMin = document.getElementById('year-min').value ? parseInt(document.getElementById('year-min').value) : null;
        f.location = document.getElementById('filter-location').value;

        f.sources = [...document.querySelectorAll('input[name="source"]:checked')].map(i => i.value);
        f.fuel = [...document.querySelectorAll('input[name="fuel"]:checked')].map(i => i.value);
        f.transmission = [...document.querySelectorAll('input[name="transmission"]:checked')].map(i => i.value);
    },

    applyFilters() {
        this.fetchCars();
    },

    renderCars() {
        const { filteredCars, loading } = this.state;
        const grid = document.getElementById('cars-grid');
        const emptyState = document.getElementById('empty-state');

        document.getElementById('results-count').textContent = this.state.totalCars.toLocaleString();

        if (loading && filteredCars.length === 0) {
            grid.innerHTML = '<div class="loading-spin"><i data-lucide="loader-2" class="spin"></i></div>';
            lucide.createIcons();
            return;
        }

        if (filteredCars.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            grid.innerHTML = filteredCars.map(car => Components.carCard(car)).join('');
        }

        this.renderPagination();
        lucide.createIcons();
    },

    renderPagination() {
        const { totalCars, page, perPage } = this.state;
        const totalPages = Math.ceil(totalCars / perPage);
        const pagination = document.getElementById('pagination');

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = `<button class="btn-page" ${page === 1 ? 'disabled' : ''} onclick="App.goToPage(${page - 1})">
            <i data-lucide="chevron-left"></i>
        </button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                html += `<button class="btn-page ${i === page ? 'active' : ''}" onclick="App.goToPage(${i})">${i}</button>`;
            } else if (i === page - 3 || i === page + 3) {
                html += '<span class="page-dots">...</span>';
            }
        }

        html += `<button class="btn-page" ${page === totalPages ? 'disabled' : ''} onclick="App.goToPage(${page + 1})">
            <i data-lucide="chevron-right"></i>
        </button>`;

        pagination.innerHTML = html;
    },

    goToPage(page) {
        this.state.page = page;
        this.fetchCars();
        document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
    },

    quickSearch() {
        const brand = document.getElementById('quick-brand').value;
        const model = document.getElementById('quick-model').value;
        const maxPrice = document.getElementById('quick-price').value;

        this.state.filters.brand = brand;
        this.state.filters.model = model;
        if (maxPrice) this.state.filters.maxPrice = parseInt(maxPrice);

        this.state.page = 1;
        this.fetchCars();
        document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
    },

    filterByCategory(category) {
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));

        if (this.state.filters.category === category) {
            this.state.filters.category = null;
            this.clearFilters();
            return;
        }

        this.state.filters.category = category;
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');

        // Map frontend categories to API filters
        this.clearFilters(false); // Clear without fetching

        const cat = window.BusCarData.categories[category];
        document.getElementById('results-title').textContent = cat ? cat.name : 'Todos los coches';

        if (category === 'electrico') this.state.filters.fuel = ['electrico'];
        if (category === 'hibrido') this.state.filters.fuel = ['hibrido'];
        if (category === 'economico') this.state.filters.maxPrice = 10000;
        if (category === 'premium') this.state.filters.brand = 'Mercedes-Benz'; // Mock behavior for demo

        this.state.page = 1;
        this.fetchCars();
        document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
    },

    clearFilters(shouldFetch = true) {
        this.state.filters = {
            sources: ['wallapop', 'coches.net', 'autoscout24', 'milanuncios', 'motor.es'],
            brand: '', model: '', maxPrice: 100000, yearMin: null,
            fuel: [], transmission: [], location: '', category: !shouldFetch ? this.state.filters.category : null,
            search: ''
        };

        document.getElementById('filter-brand').value = '';
        document.getElementById('filter-model').value = '';
        document.getElementById('filter-model').disabled = true;
        document.getElementById('price-range').value = 100000;
        document.getElementById('price-value').textContent = 'Sin límite';
        document.getElementById('year-min').value = '';
        document.getElementById('filter-location').value = '';
        document.querySelectorAll('input[name="source"]').forEach(i => i.checked = true);
        document.querySelectorAll('input[name="fuel"]').forEach(i => i.checked = false);
        document.querySelectorAll('input[name="transmission"]').forEach(i => i.checked = false);

        if (shouldFetch) {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            document.getElementById('results-title').textContent = 'Todos los coches';
            this.state.page = 1;
            this.fetchCars();
        }
    },


    toggleFavorite(carId) {
        const idx = this.state.favorites.indexOf(carId);
        if (idx > -1) {
            this.state.favorites.splice(idx, 1);
            this.showToast('Eliminado de favoritos', 'info');
        } else {
            this.state.favorites.push(carId);
            this.showToast('Añadido a favoritos', 'success');
        }
        localStorage.setItem('buscar-favorites', JSON.stringify(this.state.favorites));
        this.updateBadges();
        this.renderCars();
    },

    toggleCompare(carId) {
        const idx = this.state.compareList.indexOf(carId);
        if (idx > -1) {
            this.state.compareList.splice(idx, 1);
            this.showToast('Eliminado del comparador', 'info');
        } else if (this.state.compareList.length >= 4) {
            this.showToast('Máximo 4 coches para comparar', 'error');
            return;
        } else {
            this.state.compareList.push(carId);
            this.showToast('Añadido al comparador', 'success');
        }
        localStorage.setItem('buscar-compare', JSON.stringify(this.state.compareList));
        this.updateBadges();
        this.renderCars();
    },

    updateBadges() {
        document.getElementById('favorites-count').textContent = this.state.favorites.length;
        document.getElementById('compare-count').textContent = this.state.compareList.length;
    },

    async showCarDetail(carId) {
        // Show loading toast or modal skeleton if needed
        try {
            const res = await fetch(`${this.state.apiUrl}/cars/${carId}`);
            if (!res.ok) throw new Error('Car not found');
            const carRes = await res.json();

            // Map to frontend format
            const car = {
                ...carRes,
                fullName: `${carRes.brand} ${carRes.model}`,
                image: carRes.image_url || window.BusCarData.carImages[carRes.brand] || window.BusCarData.carImages.default,
                dateAdded: new Date(carRes.scraped_at)
            };

            const modal = document.getElementById('car-modal');
            modal.innerHTML = Components.carDetailModal(car);
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';

            lucide.createIcons();
        } catch (error) {
            console.error('Error showing car detail:', error);
            this.showToast('No se pudo cargar el detalle del coche', 'error');
        }
    },

    closeModal() {
        const modal = document.getElementById('car-modal');
        modal.classList.remove('open');
        modal.innerHTML = '';
        document.body.style.overflow = '';
    },

    changeGalleryImage(src, thumb) {
        document.getElementById('gallery-main-img').src = src;
        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
    },

    updateModalButtons(carId) {
        // Re-render modal to update button states
        const car = this.state.cars.find(c => c.id === carId);
        if (car) {
            const modal = document.getElementById('car-modal');
            modal.innerHTML = Components.carDetailModal(car);
            lucide.createIcons();
        }
    },

    shareCar(carId) {
        const car = this.state.cars.find(c => c.id === carId);
        if (!car) return;

        if (navigator.share) {
            navigator.share({
                title: car.fullName,
                text: `¡Mira este ${car.fullName} por ${car.price.toLocaleString()}€!`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showToast('Enlace copiado al portapapeles', 'success');
        }
    },

    renderFavorites() {
        const container = document.getElementById('favorites-section');
        const favCars = this.state.cars.filter(c => this.state.favorites.includes(c.id));

        container.innerHTML = `
            <div class="container">
                <div class="section-header">
                    <h2><i data-lucide="heart"></i> Mis Favoritos (${favCars.length})</h2>
                    ${favCars.length > 0 ? '<button class="btn-secondary" onclick="App.clearFavorites()"><i data-lucide="trash-2"></i> Limpiar</button>' : ''}
                </div>
                ${favCars.length > 0
                ? `<div class="cars-grid">${favCars.map(c => Components.carCard(c)).join('')}</div>`
                : '<div class="empty-state"><div class="empty-icon"><i data-lucide="heart-off"></i></div><h3>No tienes favoritos</h3><p>Guarda coches para verlos más tarde</p></div>'
            }
            </div>
        `;
        lucide.createIcons();
    },

    renderCompare() {
        const container = document.getElementById('compare-section');
        const compareCars = this.state.cars.filter(c => this.state.compareList.includes(c.id));

        if (compareCars.length === 0) {
            container.innerHTML = `
                <div class="container">
                    <div class="section-header"><h2><i data-lucide="arrow-left-right"></i> Comparador</h2></div>
                    <div class="empty-state"><div class="empty-icon"><i data-lucide="arrow-left-right"></i></div><h3>Añade coches para comparar</h3><p>Puedes comparar hasta 4 coches</p></div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = `
            <div class="container">
                <div class="section-header">
                    <h2><i data-lucide="arrow-left-right"></i> Comparador (${compareCars.length})</h2>
                    <button class="btn-secondary" onclick="App.clearCompare()"><i data-lucide="trash-2"></i> Limpiar</button>
                </div>
                <div class="compare-table-wrapper">
                    <table class="compare-table">
                        <thead>
                            <tr>
                                <th>Característica</th>
                                ${compareCars.map(c => `<th><img src="${c.image}" alt="${c.fullName}"><span>${c.fullName}</span></th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Precio</td>${compareCars.map(c => `<td class="highlight">${c.price.toLocaleString()}€</td>`).join('')}</tr>
                            <tr><td>Año</td>${compareCars.map(c => `<td>${c.year}</td>`).join('')}</tr>
                            <tr><td>Kilometraje</td>${compareCars.map(c => `<td>${c.km.toLocaleString()} km</td>`).join('')}</tr>
                            <tr><td>Combustible</td>${compareCars.map(c => `<td>${c.fuel}</td>`).join('')}</tr>
                            <tr><td>Cambio</td>${compareCars.map(c => `<td>${c.transmission}</td>`).join('')}</tr>
                            <tr><td>Potencia</td>${compareCars.map(c => `<td>${c.power || 'N/D'} CV</td>`).join('')}</tr>
                            <tr><td>Ubicación</td>${compareCars.map(c => `<td>${c.location}</td>`).join('')}</tr>
                            <tr><td>Fuente</td>${compareCars.map(c => `<td><span class="source-badge ${c.source.replace('.', '')}">${c.source}</span></td>`).join('')}</tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async renderAlerts() {
        const container = document.getElementById('alerts-section');

        // Show loading state if needed
        if (this.state.loadingAlerts) {
            container.innerHTML = '<div class="container"><div class="loading-spin"><i data-lucide="loader-2" class="spin"></i></div></div>';
            lucide.createIcons();
            return;
        }

        // Fetch alerts from API (using a stored user_id or similar, for now we simulate fetching user's alerts)
        // Since we don't have auth, we'll store a random user_id in localStorage on first visit
        let userId = localStorage.getItem('buscar-user-id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('buscar-user-id', userId);
        }

        try {
            const res = await fetch(`${this.state.apiUrl}/alerts?user_id=${userId}`);
            if (res.ok) {
                this.state.alerts = await res.json();
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }

        container.innerHTML = `
            <div class="container">
                <div class="section-header">
                    <h2><i data-lucide="bell"></i> Alertas de Precio</h2>
                    <button class="btn-primary" onclick="App.openAlertModal()"><i data-lucide="bell-plus"></i> Nueva alerta</button>
                </div>
                ${this.state.alerts.length > 0
                ? `<div class="alerts-list">${this.state.alerts.map(a => `
                        <div class="alert-item">
                            <div class="alert-info">
                                <div class="alert-title">
                                    <strong>${a.brand} ${a.model || '(Todos)'}</strong>
                                    <span class="alert-price">Max: ${a.max_price.toLocaleString()}€</span>
                                </div>
                                <div class="alert-details">
                                    <span><i data-lucide="calendar" size="14"></i> >${a.min_year || 'Indif.'}</span>
                                    <span><i data-lucide="gauge" size="14"></i> <${a.max_km ? (a.max_km / 1000) + 'k' : 'Indif.'}</span>
                                    <span><i data-lucide="fuel" size="14"></i> ${a.fuel || 'Indif.'}</span>
                                </div>
                            </div>
                            <button class="btn-icon delete-alert" onclick="App.deleteAlert(${a.id})" title="Eliminar alerta">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    `).join('')}</div>`
                : '<div class="empty-state"><div class="empty-icon"><i data-lucide="bell-off"></i></div><h3>No tienes alertas activas</h3><p>Crea una alerta y te avisaremos cuando bajen los precios.</p></div>'
            }
            </div>
        `;
        lucide.createIcons();
    },

    openAlertModal() {
        const modal = document.getElementById('alert-modal');
        modal.innerHTML = Components.alertModal();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Pre-fill email if exists
        const savedEmail = localStorage.getItem('buscar-email');
        if (savedEmail) {
            const emailInput = modal.querySelector('input[name="email"]');
            if (emailInput) emailInput.value = savedEmail;
        }

        // Pre-fill current search filters if applicable
        const f = this.state.filters;
        if (f.brand) {
            const brandSelect = modal.querySelector('select[name="brand"]');
            if (brandSelect) {
                brandSelect.value = f.brand;
                this.updateModelSelect('alert-model', f.brand);
                if (f.model) modal.querySelector('select[name="model"]').value = f.model;
            }
        }

        lucide.createIcons();
    },

    closeAlertModal() {
        const modal = document.getElementById('alert-modal');
        modal.classList.remove('open');
        modal.innerHTML = '';
        document.body.style.overflow = '';
    },

    async submitAlert(form) {
        const formData = new FormData(form);
        const userId = localStorage.getItem('buscar-user-id') || 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('buscar-user-id', userId);

        // Save email for next time
        localStorage.setItem('buscar-email', formData.get('email'));

        const alertData = {
            email: formData.get('email'),
            brand: formData.get('brand'),
            model: formData.get('model') || null,
            max_price: parseInt(formData.get('max_price')),
            min_year: formData.get('min_year') ? parseInt(formData.get('min_year')) : null,
            max_km: formData.get('max_km') ? parseInt(formData.get('max_km')) : null,
            fuel: formData.get('fuel') || null
        };

        try {
            const res = await fetch(`${this.state.apiUrl}/alerts?user_id=${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alertData)
            });

            if (!res.ok) throw new Error('Error creating alert');

            this.showToast('Alerta creada correctamente', 'success');
            this.closeAlertModal();
            this.renderAlerts();

        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error al crear la alerta', 'error');
        }
    },

    async deleteAlert(alertId) {
        if (!confirm('¿Seguro que quieres eliminar esta alerta?')) return;

        const userId = localStorage.getItem('buscar-user-id');
        try {
            const res = await fetch(`${this.state.apiUrl}/alerts/${alertId}?user_id=${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                this.showToast('Alerta eliminada', 'success');
                this.renderAlerts();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            this.showToast('Error al eliminar la alerta', 'error');
        }
    },

    clearFavorites() {
        if (!confirm('¿Eliminar todos los favoritos?')) return;
        this.state.favorites = [];
        localStorage.setItem('buscar-favorites', '[]');
        this.updateBadges();
        this.renderFavorites();
    },

    clearCompare() {
        this.state.compareList = [];
        localStorage.setItem('buscar-compare', '[]');
        this.updateBadges();
        this.renderCompare();
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i><span>${message}</span>`;
        container.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
