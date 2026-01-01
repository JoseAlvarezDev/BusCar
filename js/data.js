// ========================================
// BusCar - Data Layer
// ========================================

const BRANDS_MODELS = {
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q3', 'Q5', 'Q7', 'e-tron', 'RS3', 'RS6'],
    'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'X1', 'X3', 'X5', 'X6', 'i3', 'i4', 'iX'],
    'Mercedes-Benz': ['Clase A', 'Clase B', 'Clase C', 'Clase E', 'Clase S', 'GLA', 'GLC', 'GLE', 'EQA', 'EQC'],
    'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'T-Cross', 'ID.3', 'ID.4', 'Arteon'],
    'SEAT': ['Ibiza', 'León', 'Arona', 'Ateca', 'Tarraco', 'Cupra Formentor', 'Cupra Born'],
    'Renault': ['Clio', 'Mégane', 'Captur', 'Kadjar', 'Arkana', 'Zoe', 'Mégane E-Tech'],
    'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'e-208', 'e-2008'],
    'Citroën': ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'ë-C4'],
    'Ford': ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Mustang', 'Mustang Mach-E'],
    'Toyota': ['Yaris', 'Corolla', 'C-HR', 'RAV4', 'Camry', 'Land Cruiser', 'bZ4X'],
    'Honda': ['Civic', 'Jazz', 'HR-V', 'CR-V', 'e'],
    'Hyundai': ['i20', 'i30', 'Tucson', 'Kona', 'Ioniq 5', 'Santa Fe'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'EV6', 'Sorento'],
    'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
    'Jeep': ['Renegade', 'Compass', 'Wrangler', 'Grand Cherokee'],
    'Volvo': ['XC40', 'XC60', 'XC90', 'V60', 'S60', 'C40 Recharge'],
    'Mazda': ['Mazda2', 'Mazda3', 'CX-3', 'CX-30', 'CX-5', 'MX-5', 'MX-30'],
    'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq']
};

const SOURCES = ['wallapop', 'coches.net', 'autoscout24', 'milanuncios', 'motor.es'];
const FUEL_TYPES = ['gasolina', 'diesel', 'electrico', 'hibrido'];
const TRANSMISSIONS = ['manual', 'automatico'];
const LOCATIONS = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao', 'Zaragoza', 'Alicante', 'Murcia', 'Palma'];

const CATEGORIES = {
    'electrico': { name: 'Eléctricos', icon: 'zap', filter: car => car.fuel === 'electrico' },
    'suv': { name: 'SUV', icon: 'mountain', filter: car => car.bodyType === 'suv' },
    'deportivo': { name: 'Deportivos', icon: 'gauge', filter: car => car.bodyType === 'deportivo' },
    'familiar': { name: 'Familiares', icon: 'users', filter: car => car.bodyType === 'familiar' },
    'hibrido': { name: 'Híbridos', icon: 'battery-charging', filter: car => car.fuel === 'hibrido' },
    'economico': { name: 'Económicos', icon: 'banknote', filter: car => car.price < 10000 },
    'premium': { name: 'Premium', icon: 'award', filter: car => ['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Tesla', 'Volvo'].includes(car.brand) },
    'todoterreno': { name: 'Todoterreno', icon: 'mountain-snow', filter: car => car.bodyType === 'todoterreno' }
};

const CAR_IMAGES = {
    'default': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop',
    'Audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    'BMW': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    'Mercedes-Benz': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
    'Volkswagen': 'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=400&h=300&fit=crop',
    'Tesla': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop',
    'Porsche': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop',
    'Toyota': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400&h=300&fit=crop',
    'Ford': 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=400&h=300&fit=crop',
    'Jeep': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop'
};

// Generate sample cars
function generateSampleCars(count = 200) {
    const cars = [];
    const brands = Object.keys(BRANDS_MODELS);
    const bodyTypes = ['sedan', 'suv', 'hatchback', 'familiar', 'deportivo', 'todoterreno', 'coupe'];

    for (let i = 0; i < count; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const models = BRANDS_MODELS[brand];
        const model = models[Math.floor(Math.random() * models.length)];
        const year = 2015 + Math.floor(Math.random() * 11);
        const km = Math.floor(Math.random() * 150000) + 5000;
        const fuel = FUEL_TYPES[Math.floor(Math.random() * FUEL_TYPES.length)];
        const transmission = TRANSMISSIONS[Math.floor(Math.random() * TRANSMISSIONS.length)];
        const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const bodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];

        // Price calculation based on characteristics
        let basePrice = 8000 + Math.random() * 50000;
        if (['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Tesla'].includes(brand)) basePrice *= 1.5;
        if (fuel === 'electrico') basePrice *= 1.3;
        if (year >= 2022) basePrice *= 1.2;
        basePrice = basePrice * (1 - km / 500000);
        const price = Math.round(basePrice / 100) * 100;

        // Power calculation
        const power = fuel === 'electrico'
            ? 100 + Math.floor(Math.random() * 400)
            : 70 + Math.floor(Math.random() * 250);

        cars.push({
            id: `car-${i + 1}`,
            brand,
            model,
            fullName: `${brand} ${model}`,
            year,
            price,
            km,
            fuel,
            transmission,
            power,
            source,
            location,
            bodyType,
            image: CAR_IMAGES[brand] || CAR_IMAGES.default,
            url: '#',
            dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            seller: Math.random() > 0.6 ? 'particular' : 'profesional',
            warranty: Math.random() > 0.5,
            negotiable: Math.random() > 0.7
        });
    }

    return cars.sort((a, b) => b.dateAdded - a.dateAdded);
}

// Initialize sample data
const SAMPLE_CARS = generateSampleCars(200);

// Export for use
window.BusCarData = {
    cars: SAMPLE_CARS,
    brands: BRANDS_MODELS,
    sources: SOURCES,
    fuelTypes: FUEL_TYPES,
    transmissions: TRANSMISSIONS,
    locations: LOCATIONS,
    categories: CATEGORIES,
    carImages: CAR_IMAGES
};
