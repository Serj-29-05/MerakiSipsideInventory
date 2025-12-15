// Meraki Sipside Ingredients Inventory Management System
// Handles ingredient CRUD operations, stock tracking, and order processing

const INVENTORY_STORAGE_KEY = 'meraki_ingredients_inventory';
const INVENTORY_HISTORY_KEY = 'meraki_ingredients_history';

let inventory = {};
let filteredInventory = {};

const DEFAULT_SELLING_PRICES = {
    m1: { G: 39, V: 49 },
    m2: { G: 39, V: 49 },
    m3: { G: 39, V: 49 },
    m4: { G: 39, V: 49 },
    m5: { G: 39, V: 49 },
    m6: { G: 39, V: 49 },
    m7: { G: 39, V: 49 },
    m8: { G: 39, V: 49 },
    ch1: { G: 59, V: 69 },
    ch2: { G: 59, V: 69 },
    ch3: { G: 59, V: 69 },
    ch4: { G: 59, V: 69 },
    ch5: { G: 59, V: 69 },
    s1: { G: 49, V: 59 },
    s2: { G: 49, V: 59 },
    s3: { G: 49, V: 59 },
    s4: { G: 49, V: 59 },
    s5: { G: 49, V: 59 },
    s6: { G: 49, V: 59 },
    fries1: { R: 45, M: 65, L: 95 },
    fries2: { R: 45, M: 65, L: 95 },
    fries3: { R: 45, M: 65, L: 95 }
};

// Initialize inventory on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize ingredients inventory
    if (window.MerakiInventorySync) {
        inventory = window.MerakiInventorySync.initializeIngredientsInventory();
        filteredInventory = { ...inventory };
    }
    
    initializeUI();
    updateDashboard();
    renderInventoryTable();
    checkStockAlerts();
    setupDashboardInteractions();
    setupOrderSync();
});

// Load inventory from localStorage
function loadInventory() {
    if (!window.MerakiInventorySync) {
        console.error('Inventory sync module not loaded');
        return;
    }
    
    inventory = window.MerakiInventorySync.getIngredientsInventory();
    filteredInventory = { ...inventory };
}

// Save inventory to localStorage
function saveInventory() {
    if (!window.MerakiInventorySync) {
        console.error('Inventory sync module not loaded');
        return;
    }
    
    window.MerakiInventorySync.saveIngredientsInventory(inventory);
    
    // Log history entry
    const history = {
        timestamp: new Date().toISOString(),
        action: 'update',
        snapshot: Object.keys(inventory).length
    };
    logInventoryHistory(history);
}

// Log inventory history
function logInventoryHistory(entry) {
    try {
        let history = JSON.parse(localStorage.getItem(INVENTORY_HISTORY_KEY) || '[]');
        history.push(entry);
        // Keep only last 100 entries
        if (history.length > 100) {
            history = history.slice(-100);
        }
        localStorage.setItem(INVENTORY_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to log history:', e);
    }
}

// Get default inventory (Meraki Sipside products)
function getDefaultInventory() {
    return [
        // Milktea (G | V)
        { id: 'm1', name: 'Bubble Tea', category: 'Milktea', description: 'Classic milktea with pearls', price: 49, sellingPrices: { ...DEFAULT_SELLING_PRICES.m1 }, stock: 50, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'm2', name: 'Cookies & Cream', category: 'Milktea', description: 'Creamy cookies flavor', price: 49, sellingPrices: { ...DEFAULT_SELLING_PRICES.m2 }, stock: 50, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'm3', name: 'Choco Hokkaido', category: 'Milktea', description: 'Rich chocolate flavor', price: 49, sellingPrices: { ...DEFAULT_SELLING_PRICES.m3 }, stock: 50, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'm4', name: 'Matcha', category: 'Milktea', description: 'Japanese green tea', price: 49, sellingPrices: { ...DEFAULT_SELLING_PRICES.m4 }, stock: 50, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'm5', name: 'Winter Melon', category: 'Milktea', description: 'Sweet melon flavor', price: 49, sellingPrices: { ...DEFAULT_SELLING_PRICES.m5 }, stock: 50, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'm6', name: 'Okinawa', category: 'Milktea', description: 'Brown sugar specialty', price: 49, sellingPrices: { ...DEFAULT_SELLING_PRICES.m6 }, stock: 50, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'm7', name: 'Red Velvet', category: 'Milktea', description: 'Velvety smooth', price: 49, sellingPrices: { ...DEFAULT_SELLING_PRICES.m7 }, stock: 50, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'm8', name: 'Chocolate', category: 'Milktea', description: 'Classic chocolate', price: 49, sellingPrices: { ...DEFAULT_SELLING_PRICES.m8 }, stock: 50, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },

        // Iced Coffee
        { id: 'ic1', name: 'Spanish Latte', category: 'Iced Coffee', description: 'Creamy and sweet', price: 49, stock: 60, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ic2', name: 'French Vanilla', category: 'Iced Coffee', description: 'Smooth vanilla', price: 49, stock: 60, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ic3', name: 'Salted Caramel', category: 'Iced Coffee', description: 'Sweet and salty', price: 49, stock: 60, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ic4', name: 'Dark Mocha', category: 'Iced Coffee', description: 'Rich chocolate coffee', price: 49, stock: 60, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ic5', name: 'Matcha (Iced)', category: 'Iced Coffee', description: 'Green tea coffee', price: 49, stock: 60, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ic6', name: 'Hazelnut', category: 'Iced Coffee', description: 'Nutty flavor', price: 49, stock: 60, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },

        // Cheesecake (G | V)
        { id: 'ch1', name: 'Oreo Matcha', category: 'Cheesecake', description: 'Matcha with oreo', price: 69, sellingPrices: { ...DEFAULT_SELLING_PRICES.ch1 }, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'ch2', name: 'Red Velvet', category: 'Cheesecake', description: 'Smooth red velvet', price: 69, sellingPrices: { ...DEFAULT_SELLING_PRICES.ch2 }, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'ch3', name: 'Oreolicious', category: 'Cheesecake', description: 'Loaded with oreos', price: 69, sellingPrices: { ...DEFAULT_SELLING_PRICES.ch3 }, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'ch4', name: 'Creamy Cheesecake', category: 'Cheesecake', description: 'Classic cheesecake', price: 69, sellingPrices: { ...DEFAULT_SELLING_PRICES.ch4 }, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'ch5', name: 'Choco Delight', category: 'Cheesecake', description: 'Chocolate heaven', price: 69, sellingPrices: { ...DEFAULT_SELLING_PRICES.ch5 }, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },

        // Fruit Tea
        { id: 'ft1', name: 'Lychee', category: 'Fruit Tea', description: 'Sweet lychee', price: 49, stock: 40, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ft2', name: 'Orange', category: 'Fruit Tea', description: 'Citrus burst', price: 49, stock: 40, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ft3', name: 'Blueberry', category: 'Fruit Tea', description: 'Berry fresh', price: 49, stock: 40, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ft4', name: 'Apple Green', category: 'Fruit Tea', description: 'Green apple', price: 49, stock: 40, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ft5', name: 'Four Season', category: 'Fruit Tea', description: 'Mixed fruits', price: 49, stock: 40, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ft6', name: 'Strawberry', category: 'Fruit Tea', description: 'Fresh strawberry', price: 49, stock: 40, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 'ft7', name: 'Passion Fruit', category: 'Fruit Tea', description: 'Tropical passion', price: 49, stock: 40, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },

        // Soda (G | V)
        { id: 's1', name: 'Green Sparkle', category: 'Soda', description: 'Refreshing lime soda', price: 59, sellingPrices: { ...DEFAULT_SELLING_PRICES.s1 }, stock: 45, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 's2', name: 'Blueberry Cloud', category: 'Soda', description: 'Blueberry fizz', price: 59, sellingPrices: { ...DEFAULT_SELLING_PRICES.s2 }, stock: 45, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 's3', name: 'Lychee Soda', category: 'Soda', description: 'Sweet lychee fizz', price: 59, sellingPrices: { ...DEFAULT_SELLING_PRICES.s3 }, stock: 45, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 's4', name: 'Strawberry Burst', category: 'Soda', description: 'Berry explosion', price: 59, sellingPrices: { ...DEFAULT_SELLING_PRICES.s4 }, stock: 45, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 's5', name: 'Blue Lagoon', category: 'Soda', description: 'Blue curacao', price: 59, sellingPrices: { ...DEFAULT_SELLING_PRICES.s5 }, stock: 45, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 's6', name: 'Sparkling Apple', category: 'Soda', description: 'Apple fizz', price: 59, sellingPrices: { ...DEFAULT_SELLING_PRICES.s6 }, stock: 45, lowStockThreshold: 10, lastUpdated: new Date().toISOString() },

        // Frappe
        { id: 'frp1', name: 'Oreo Java Chip', category: 'Frappe', description: 'Coffee and oreo', price: 79, stock: 35, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },
        { id: 'frp2', name: 'Mango', category: 'Frappe', description: 'Tropical mango', price: 79, stock: 35, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },
        { id: 'frp3', name: 'Creamy Avocado', category: 'Frappe', description: 'Smooth avocado', price: 79, stock: 35, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },
        { id: 'frp4', name: 'Ube', category: 'Frappe', description: 'Purple yam', price: 79, stock: 35, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },
        { id: 'frp5', name: 'Strawberry', category: 'Frappe', description: 'Berry delight', price: 79, stock: 35, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },
        { id: 'frp6', name: 'Bubble Gum', category: 'Frappe', description: 'Sweet bubblegum', price: 79, stock: 35, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },

        // Snacks
        { id: 'sn1', name: 'Regular Corndog', category: 'Snacks', description: 'Classic corndog', price: 40, stock: 25, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn2', name: 'Cheezy Corndog', category: 'Snacks', description: 'Cheese-filled', price: 45, stock: 25, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn3', name: 'Classic Burger', category: 'Snacks', description: 'Simple burger', price: 25, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn4', name: 'Cheese Burger', category: 'Snacks', description: 'With cheese', price: 35, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn5', name: 'Egg Burger', category: 'Snacks', description: 'With egg', price: 45, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn6', name: 'Egg Burger With Cheese', category: 'Snacks', description: 'Egg and cheese', price: 50, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn7', name: 'Egg Sandwich', category: 'Snacks', description: 'Simple egg sandwich', price: 30, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn8', name: 'Ham & Egg Sandwich', category: 'Snacks', description: 'Ham and egg', price: 55, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn9', name: 'Classic Hotdog', category: 'Snacks', description: 'Simple hotdog', price: 30, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn10', name: 'Cheezy Hotdog', category: 'Snacks', description: 'With cheese', price: 45, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 'sn11', name: 'Overload Hotdog', category: 'Snacks', description: 'Fully loaded', price: 70, stock: 30, lowStockThreshold: 5, lastUpdated: new Date().toISOString() },

        // Fries
        { id: 'fries1', name: 'Cheese Fries', category: 'Fries', description: 'Cheesy fries', price: 65, sellingPrices: { ...DEFAULT_SELLING_PRICES.fries1 }, stock: 40, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },
        { id: 'fries2', name: 'Sour Cream Fries', category: 'Fries', description: 'With sour cream', price: 65, sellingPrices: { ...DEFAULT_SELLING_PRICES.fries2 }, stock: 40, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },
        { id: 'fries3', name: 'BBQ Fries', category: 'Fries', description: 'BBQ flavored', price: 65, sellingPrices: { ...DEFAULT_SELLING_PRICES.fries3 }, stock: 40, lowStockThreshold: 8, lastUpdated: new Date().toISOString() },
        { id: 'fries4', name: 'Overload Cheezy', category: 'Fries', description: 'Extra cheesy', price: 75, stock: 40, lowStockThreshold: 8, lastUpdated: new Date().toISOString() }
    ];
}

// Initialize UI event listeners
function initializeUI() {
    // Add product button
    document.getElementById('btn-add-product')?.addEventListener('click', () => {
        openProductModal();
    });

    // Modal close
    document.getElementById('modal-close')?.addEventListener('click', closeProductModal);
    document.getElementById('btn-cancel-form')?.addEventListener('click', closeProductModal);

    // Click outside modal to close
    document.getElementById('product-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'product-modal') {
            closeProductModal();
        }
    });

    // Product form submit
    document.getElementById('product-form')?.addEventListener('submit', handleProductFormSubmit);

    // Search and filters
    document.getElementById('search-inventory')?.addEventListener('input', applyFilters);
    document.getElementById('filter-category')?.addEventListener('change', applyFilters);
    document.getElementById('filter-stock')?.addEventListener('change', applyFilters);

    // Export/Import
    document.getElementById('btn-export-data')?.addEventListener('click', exportInventory);
    document.getElementById('btn-import-data')?.addEventListener('click', importInventory);

    // Stock status modal close interactions
    document.getElementById('stock-modal-close')?.addEventListener('click', closeStockStatusModal);
    document.getElementById('stock-status-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'stock-status-modal') {
            closeStockStatusModal();
        }
    });
}

// Attach handlers to dashboard cards for quick stock insights
function setupDashboardInteractions() {
    const lowStockCard = document.querySelector('.dashboard-card.alert');
    const outOfStockCard = document.querySelector('.dashboard-card.danger');

    lowStockCard?.addEventListener('click', () => {
        const items = Object.entries(inventory)
            .filter(([key, item]) => item.stock > 0 && item.stock <= item.lowStockThreshold)
            .map(([key, item]) => ({ id: key, ...item }));
        openStockStatusModal('Low Stock Ingredients', items);
    });

    outOfStockCard?.addEventListener('click', () => {
        const items = Object.entries(inventory)
            .filter(([key, item]) => item.stock === 0)
            .map(([key, item]) => ({ id: key, ...item }));
        openStockStatusModal('Out of Stock Ingredients', items);
    });
}

// Update dashboard statistics
function updateDashboard() {
    const inventoryArray = Object.values(inventory);
    const totalProducts = inventoryArray.length;
    const inStock = inventoryArray.filter(p => p.stock > p.lowStockThreshold).length;
    const lowStock = inventoryArray.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStock = inventoryArray.filter(p => p.stock === 0).length;

    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('in-stock-products').textContent = inStock;
    document.getElementById('low-stock-products').textContent = lowStock;
    document.getElementById('out-of-stock-products').textContent = outOfStock;
}

// Render inventory table
function renderInventoryTable() {
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filteredArray = Object.entries(filteredInventory).map(([key, item]) => ({ id: key, ...item }));

    if (filteredArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No ingredients found.</td></tr>';
        return;
    }

    filteredArray.forEach(ingredient => {
        const row = document.createElement('tr');
        row.className = getStockStatusClass(ingredient);
        row.dataset.productId = ingredient.id;

        const stockValue = typeof ingredient.stock === 'number' ? ingredient.stock : 0;
        const statusBadge = getStatusBadge(ingredient);
        const lastUpdated = ingredient.lastUpdated ? 
            new Date(ingredient.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
            'N/A';

        // Determine category from ingredient id/name
        const category = getIngredientCategory(ingredient.id);

        row.innerHTML = `
            <td>${ingredient.id}</td>
            <td><strong>${ingredient.name}</strong></td>
            <td>${category}</td>
            <td>${ingredient.unit || 'units'}</td>
            <td>
                <input type="number" min="0" step="1" value="${stockValue}" 
                       class="stock-input" data-id="${ingredient.id}">
            </td>
            <td>${ingredient.lowStockThreshold || 0}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-action btn-edit" data-id="${ingredient.id}" title="Edit">✏️</button>
                <button class="btn-action btn-delete" data-id="${ingredient.id}" title="Delete">🗑️</button>
            </td>
        `;

        tbody.appendChild(row);
    });

    // Attach event listeners
    tbody.querySelectorAll('.stock-input').forEach(input => {
        input.addEventListener('change', (e) => {
            updateStock(e.target.dataset.id, parseInt(e.target.value));
        });
    });

    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editProduct(e.target.dataset.id);
        });
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteProduct(e.target.dataset.id);
        });
    });

    tbody.querySelectorAll('.price-input').forEach(input => {
        input.addEventListener('change', (e) => {
            updatePrice(e.target.dataset.id, parseFloat(e.target.value));
        });
    });
}

// Helper function to determine ingredient category
function getIngredientCategory(ingredientId) {
    const id = String(ingredientId).toLowerCase();
    if (id.includes('base')) return 'Bases';
    if (id.includes('powder')) return 'Powders';
    if (id.includes('syrup')) return 'Syrups';
    if (id.includes('milk') || id.includes('cream') || id.includes('juice')) return 'Dairy';
    if (id.includes('pearl') || id.includes('cookie') || id.includes('sugar') || id.includes('ice')) return 'Toppings';
    if (id.includes('puree') || id.includes('avocado') || id.includes('curacao')) return 'Fresh';
    if (id.includes('chip') || id.includes('sauce') || id.includes('nugget') || id.includes('hotdog') || 
        id.includes('fillet') || id.includes('wing') || id.includes('patty') || id.includes('gravy') || 
        id.includes('siopao') || id.includes('potato') || id.includes('bun')) return 'Snack Ingredients';
    return 'Other';
}

// Get stock status class for row styling
function getStockStatusClass(item) {
    if (item.stock === 0) return 'out-of-stock';
    if (item.stock <= item.lowStockThreshold) return 'low-stock';
    return 'in-stock';
}

// Get status badge HTML
function getStatusBadge(item) {
    if (item.stock === 0) {
        return '<span class="badge badge-danger">Out of Stock</span>';
    }
    if (item.stock <= item.lowStockThreshold) {
        return '<span class="badge badge-warning">Low Stock</span>';
    }
    return '<span class="badge badge-success">In Stock</span>';
}

// Apply search and filters
function applyFilters() {
    const searchTerm = document.getElementById('search-inventory')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('filter-category')?.value || 'all';
    const stockFilter = document.getElementById('filter-stock')?.value || 'all';

    filteredInventory = {};
    
    Object.entries(inventory).forEach(([key, item]) => {
        const category = getIngredientCategory(key);
        
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                            key.toLowerCase().includes(searchTerm);

        const matchesCategory = categoryFilter === 'all' || category === categoryFilter;

        let matchesStock = true;
        if (stockFilter === 'in-stock') {
            matchesStock = item.stock > item.lowStockThreshold;
        } else if (stockFilter === 'low-stock') {
            matchesStock = item.stock > 0 && item.stock <= item.lowStockThreshold;
        } else if (stockFilter === 'out-of-stock') {
            matchesStock = item.stock === 0;
        }

        if (matchesSearch && matchesCategory && matchesStock) {
            filteredInventory[key] = item;
        }
    });

    renderInventoryTable();
}

// Open product modal
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');

    form.reset();
    
    if (productId) {
        const product = inventory.find(p => p.id === productId);
        if (!product) return;

        title.textContent = 'Edit Product';
        document.getElementById('form-product-id').value = product.id;
        document.getElementById('form-product-name').value = product.name;
        document.getElementById('form-product-category').value = product.category;
        document.getElementById('form-product-description').value = product.description || '';
        document.getElementById('form-product-stock').value = product.stock;
        document.getElementById('form-product-low-stock').value = product.lowStockThreshold;
        document.getElementById('form-product-price').value =
            typeof product.price === 'number' ? formatPriceDisplay(product.price) : '';
    } else {
        title.textContent = 'Add New Product';
        document.getElementById('form-product-id').value = '';
    }

    modal.style.display = 'flex';
}

// Close product modal
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Handle product form submit
function handleProductFormSubmit(e) {
    e.preventDefault();

    const ingredientId = document.getElementById('form-product-id').value;
    const name = document.getElementById('form-product-name').value.trim();
    const unit = document.getElementById('form-product-unit').value.trim();
    const stock = parseInt(document.getElementById('form-product-stock').value);
    const lowStockThreshold = parseInt(document.getElementById('form-product-low-stock').value);

    if (!name || !unit || isNaN(stock) || isNaN(lowStockThreshold)) {
        showToast('Please fill all required fields with valid values.');
        return;
    }

    if (ingredientId && inventory[ingredientId]) {
        // Update existing ingredient
        inventory[ingredientId] = {
            ...inventory[ingredientId],
            name,
            unit,
            stock,
            lowStockThreshold,
            lastUpdated: new Date().toISOString()
        };
        showToast('Ingredient updated successfully!');
    } else {
        // Add new ingredient (if needed in future)
        showToast('Add new ingredient feature coming soon!');
    }

    saveInventory();
    closeProductModal();
    updateDashboard();
    checkStockAlerts();
    renderInventoryTable();
}

// Generate unique product ID
function generateProductId(category) {
    const prefix = category.substring(0, 2).toLowerCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
}

// Edit ingredient
function editProduct(ingredientId) {
    const ingredient = inventory[ingredientId];
    if (!ingredient) return;

    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');

    title.textContent = 'Edit Ingredient';
    document.getElementById('form-product-id').value = ingredientId;
    document.getElementById('form-product-name').value = ingredient.name || '';
    document.getElementById('form-product-unit').value = ingredient.unit || '';
    document.getElementById('form-product-stock').value = ingredient.stock || 0;
    document.getElementById('form-product-low-stock').value = ingredient.lowStockThreshold || 20;

    modal.style.display = 'flex';
}

// Delete product
function deleteProduct(productId) {
    const product = inventory.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        inventory = inventory.filter(p => p.id !== productId);
        saveInventory();
        applyFilters();
        updateDashboard();
        checkStockAlerts();
        showToast('Product deleted successfully!');
    }
}

// Update stock
// Update stock for an ingredient
function updateStock(ingredientId, newStock) {
    if (inventory[ingredientId]) {
        inventory[ingredientId].stock = newStock;
        inventory[ingredientId].lastUpdated = new Date().toISOString();
        saveInventory();
        updateDashboard();
        checkStockAlerts();
        renderInventoryTable();
    }
}

// Delete an ingredient
function deleteProduct(ingredientId) {
    if (!confirm(`Are you sure you want to delete ${inventory[ingredientId]?.name || ingredientId}?`)) {
        return;
    }
    
    delete inventory[ingredientId];
    delete filteredInventory[ingredientId];
    saveInventory();
    updateDashboard();
    checkStockAlerts();
    renderInventoryTable();
    showToast('Ingredient deleted successfully');
}

// Check and display stock alerts
function checkStockAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;

    const inventoryArray = Object.entries(inventory).map(([key, item]) => ({ id: key, ...item }));
    const lowStockItems = inventoryArray.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
    const outOfStockItems = inventoryArray.filter(p => p.stock === 0);

    alertsContainer.innerHTML = '';

    if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
        alertsContainer.innerHTML = '<div class="alert alert-success">✅ All ingredients are well stocked!</div>';
        return;
    }

    if (outOfStockItems.length > 0) {
        outOfStockItems.forEach(item => {
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger';
            alert.innerHTML = `<strong>❌ Out of Stock:</strong> ${item.name} (${item.unit})`;
            alertsContainer.appendChild(alert);
        });
    }

    if (lowStockItems.length > 0) {
        lowStockItems.forEach(item => {
            const alert = document.createElement('div');
            alert.className = 'alert alert-warning';
            alert.innerHTML = `<strong>⚠️ Low Stock:</strong> ${item.name} - ${item.stock.toFixed(2)} ${item.unit} remaining`;
            alertsContainer.appendChild(alert);
        });
    }
}

// Display focused modal listing low or out-of-stock products
function openStockStatusModal(title, products) {
    const modal = document.getElementById('stock-status-modal');
    const modalTitle = document.getElementById('stock-modal-title');
    const modalBody = document.getElementById('stock-modal-body');

    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = '';

    if (products.length === 0) {
        const emptyState = document.createElement('p');
        emptyState.className = 'stock-modal-empty';
        emptyState.textContent = 'No products to display right now.';
        modalBody.appendChild(emptyState);
    } else {
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'stock-modal-item';
            const statusClass = product.stock === 0 ? 'stock-modal-item--danger' : 'stock-modal-item--warning';
            item.classList.add(statusClass);
            item.dataset.productId = product.id;
            item.tabIndex = 0;

            item.innerHTML = `
                <h3>${product.name}</h3>
                <p class="stock-modal-meta">${product.category}</p>
                <p><strong>Stock:</strong> ${product.stock}</p>
                <p><strong>Low Stock Threshold:</strong> ${product.lowStockThreshold}</p>
                <p><strong>Ingredient Cost:</strong> ₱${formatPriceDisplay(product.price)}</p>
            `;

            item.addEventListener('click', () => focusProductRow(product.id));
            item.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    focusProductRow(product.id);
                }
            });

            modalBody.appendChild(item);
        });
    }

    modal.style.display = 'flex';
}

// Close the stock status modal
function closeStockStatusModal() {
    const modal = document.getElementById('stock-status-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Scroll to a product row and highlight it temporarily
function focusProductRow(productId) {
    const targetRow = ensureProductRowVisible(productId);
    if (!targetRow) {
        showToast('Product is hidden by current filters.');
        return;
    }

    closeStockStatusModal();
    targetRow.classList.add('highlight-focus');
    targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const rowReference = targetRow;
    setTimeout(() => {
        rowReference.classList.remove('highlight-focus');
    }, 2000);
}

// Make sure the product row exists in the table by resetting filters if needed
function ensureProductRowVisible(productId) {
    let row = document.querySelector(`#inventory-tbody tr[data-product-id="${productId}"]`);
    if (row) {
        return row;
    }

    let filtersChanged = false;
    const searchInput = document.getElementById('search-inventory');
    const categorySelect = document.getElementById('filter-category');
    const stockSelect = document.getElementById('filter-stock');

    if (searchInput && searchInput.value) {
        searchInput.value = '';
        filtersChanged = true;
    }

    if (categorySelect && categorySelect.value !== 'all') {
        categorySelect.value = 'all';
        filtersChanged = true;
    }

    if (stockSelect && stockSelect.value !== 'all') {
        stockSelect.value = 'all';
        filtersChanged = true;
    }

    if (filtersChanged) {
        applyFilters();
    }

    return document.querySelector(`#inventory-tbody tr[data-product-id="${productId}"]`);
}

// Update price from inline editor
function updatePrice(productId, newPrice) {
    if (isNaN(newPrice) || newPrice < 0) {
        showToast('Please enter a valid price.');
        renderInventoryTable();
        return;
    }

    const product = inventory.find(p => p.id === productId);
    if (!product) {
        return;
    }

    product.price = newPrice;
    product.lastUpdated = new Date().toISOString();
    saveInventory();
    updateDashboard();
    checkStockAlerts();
    renderInventoryTable();
    showToast('Ingredient cost updated.');
}

// Normalize inventory items to ensure single price value
function normalizeInventoryData() {
    if (!Array.isArray(inventory)) {
        inventory = [];
        return;
    }

    inventory.forEach(item => {
        if (item.prices && typeof item.prices === 'object') {
            if (!item.sellingPrices) {
                item.sellingPrices = { ...item.prices };
            }
            delete item.prices;
        }

        if (item.sellingPrices && typeof item.sellingPrices === 'object') {
            Object.keys(item.sellingPrices).forEach(key => {
                const parsed = parseFloat(item.sellingPrices[key]);
                if (!isNaN(parsed)) {
                    item.sellingPrices[key] = parsed;
                }
            });
        }

        if (!item.sellingPrices && item.id && DEFAULT_SELLING_PRICES[item.id]) {
            item.sellingPrices = { ...DEFAULT_SELLING_PRICES[item.id] };
        }

        if (typeof item.price !== 'number' || isNaN(item.price)) {
            let derived = NaN;
            if (!isNaN(parseFloat(item.price))) {
                derived = parseFloat(item.price);
            }
            if (isNaN(derived) && item.sellingPrices) {
                const values = Object.values(item.sellingPrices).map(Number).filter(v => !isNaN(v));
                derived = values.length > 0 ? values[0] : NaN;
            }
            item.price = !isNaN(derived) && derived >= 0 ? derived : 0;
        }
    });
}

function formatPriceDisplay(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0.00';
    }
    return value.toFixed(2);
}

// Export inventory to JSON
function exportInventory() {
    const dataStr = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meraki-inventory-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Inventory exported successfully!');
}

// Import inventory from JSON
function importInventory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData)) {
                        inventory = importedData;
                        normalizeInventoryData();
                        saveInventory();
                        filteredInventory = [...inventory];
                        applyFilters();
                        updateDashboard();
                        checkStockAlerts();
                        showToast('Inventory imported successfully!');
                    } else {
                        alert('Invalid inventory file format.');
                    }
                } catch (error) {
                    alert('Error reading file: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.background = '#28a745';
    toast.style.color = '#fff';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.zIndex = '10000';
    toast.style.fontWeight = '500';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Setup order synchronization
function setupOrderSync() {
    const syncBtn = document.getElementById('btn-sync-orders');
    const addIngredientBtn = document.getElementById('btn-add-ingredient');
    
    if (syncBtn) {
        syncBtn.addEventListener('click', processWebsiteOrders);
    }
    
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', () => {
            const ingredientKey = prompt('Enter ingredient key (e.g., chocolate_syrup):');
            if (!ingredientKey) return;
            
            const name = prompt('Enter ingredient name:');
            const unit = prompt('Enter unit (e.g., kg, liters, servings):');
            const stock = parseInt(prompt('Enter initial stock:'));
            const lowThreshold = parseInt(prompt('Enter low stock threshold:'));
            
            if (name && unit && !isNaN(stock) && !isNaN(lowThreshold)) {
                inventory[ingredientKey] = {
                    name,
                    unit,
                    stock,
                    lowStockThreshold: lowThreshold,
                    lastUpdated: new Date().toISOString()
                };
                saveInventory();
                updateDashboard();
                checkStockAlerts();
                renderInventoryTable();
                showToast('Ingredient added successfully');
            }
        });
    }
    
    // Check for pending orders on load
    checkPendingOrders();
}

// Check if there are pending orders
function checkPendingOrders() {
    const ORDERS_KEY = 'meraki_orders';
    try {
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
        const pendingCount = orders.filter(o => !o.processed && o.status === 'pending_fulfillment').length;
        
        if (pendingCount > 0) {
            const syncBtn = document.getElementById('btn-sync-orders');
            if (syncBtn) {
                syncBtn.textContent = `🔄 Process Orders (${pendingCount})`;
                syncBtn.classList.add('pulse');
            }
        }
    } catch (e) {
        console.error('Failed to check pending orders:', e);
    }
}

// Process website orders
function processWebsiteOrders() {
    if (!window.MerakiInventorySync) {
        showToast('Inventory sync module not loaded', 'error');
        return;
    }
    
    const results = window.MerakiInventorySync.processPendingOrders();
    
    if (results.length === 0) {
        showToast('No pending orders to process', 'info');
        return;
    }
    
    // Show results
    let successCount = 0;
    let errorCount = 0;
    let totalDeductions = 0;
    
    results.forEach(result => {
        if (result.success) {
            successCount++;
        } else {
            errorCount++;
        }
        totalDeductions += result.deductions.length;
    });
    
    const message = `Processed ${results.length} order(s): ${successCount} successful, ${errorCount} with warnings. ${totalDeductions} ingredient(s) deducted.`;
    showToast(message, errorCount > 0 ? 'warning' : 'success');
    
    // Reset button
    const syncBtn = document.getElementById('btn-sync-orders');
    if (syncBtn) {
        syncBtn.textContent = '🔄 Process Website Orders';
        syncBtn.classList.remove('pulse');
    }
    
    // Show detailed results in console
    console.log('Order processing results:', results);
    
    // Show modal with details
    showOrderProcessingResults(results);
}

// Show order processing results modal
function showOrderProcessingResults(results) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white;border-radius:16px;padding:0;max-width:700px;max-height:85vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    
    let html = `
        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:2rem;color:white;">
            <h2 style="margin:0;font-size:1.75rem;font-weight:600;">📦 Order Processing Results</h2>
            <p style="margin:0.5rem 0 0 0;opacity:0.9;font-size:0.95rem;">${results.length} order${results.length !== 1 ? 's' : ''} processed successfully</p>
        </div>
        <div style="padding:1.5rem;max-height:60vh;overflow-y:auto;">
    `;
    
    results.forEach((result, index) => {
        const successColor = result.success ? '#10b981' : '#f59e0b';
        const bgColor = result.success ? '#ecfdf5' : '#fffbeb';
        const borderColor = result.success ? '#d1fae5' : '#fef3c7';
        
        html += `
            <div style="margin-bottom:1.25rem;border-radius:12px;overflow:hidden;border:2px solid ${borderColor};background:${bgColor};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="padding:1rem;background:${successColor};color:white;display:flex;align-items:center;gap:0.75rem;">
                    <div style="font-size:1.5rem;">${result.success ? '✅' : '⚠️'}</div>
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:0.95rem;">Order ${result.orderId}</div>
                        <div style="font-size:0.85rem;opacity:0.95;margin-top:0.25rem;">${result.deductions.length} ingredient${result.deductions.length !== 1 ? 's' : ''} deducted</div>
                    </div>
                </div>
                
                <div style="padding:1.25rem;">
                    <div style="font-weight:600;color:#374151;margin-bottom:0.75rem;font-size:0.9rem;">📊 Stock Deductions:</div>
                    <div style="display:grid;gap:0.75rem;">
                        ${result.deductions.map(d => {
                            const stockPercent = Math.min(100, (d.newStock / 50) * 100);
                            const barColor = stockPercent > 40 ? '#10b981' : stockPercent > 20 ? '#f59e0b' : '#ef4444';
                            return `
                                <div style="background:white;padding:0.875rem;border-radius:8px;border:1px solid #e5e7eb;">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                                        <span style="font-weight:500;color:#1f2937;font-size:0.9rem;">${d.name}</span>
                                        <span style="background:#f3f4f6;padding:0.25rem 0.625rem;border-radius:6px;font-size:0.8rem;font-weight:600;color:#6b7280;">
                                            ${d.ingredient.unit || 'units'}
                                        </span>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
                                        <span style="color:#ef4444;font-weight:600;font-size:0.85rem;">−${Math.round(d.deducted)}</span>
                                        <div style="flex:1;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
                                            <div style="height:100%;background:${barColor};width:${stockPercent}%;transition:width 0.3s ease;"></div>
                                        </div>
                                        <span style="color:#10b981;font-weight:600;font-size:0.85rem;">${Math.round(d.newStock)}</span>
                                    </div>
                                    <div style="font-size:0.75rem;color:#6b7280;text-align:center;">
                                        Stock: ${Math.round(d.newStock)} ${d.ingredient.unit || 'units'} remaining
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${result.errors && result.errors.length > 0 ? `
                        <div style="margin-top:1rem;padding:0.875rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
                            <div style="font-weight:600;color:#dc2626;margin-bottom:0.5rem;font-size:0.85rem;">⚠️ Warnings:</div>
                            <ul style="margin:0;padding-left:1.25rem;color:#991b1b;font-size:0.85rem;">
                                ${result.errors.map(e => `<li style="margin:0.25rem 0;">${e}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        <div style="padding:1.5rem;background:#f9fafb;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;">
            <button id="close-results-modal" class="btn btn-primary" style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border:none;padding:0.75rem 2rem;border-radius:8px;font-weight:600;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 12px rgba(102,126,234,0.4);">
                Close
            </button>
        </div>
    `;
    
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const closeBtn = document.getElementById('close-results-modal');
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'translateY(-2px)';
        closeBtn.style.boxShadow = '0 6px 16px rgba(102,126,234,0.5)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'translateY(0)';
        closeBtn.style.boxShadow = '0 4px 12px rgba(102,126,234,0.4)';
    });
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Show ingredients inventory modal
function showIngredientsModal() {
    if (!window.MerakiInventorySync) {
        showToast('Inventory sync module not loaded', 'error');
        return;
    }
    
    const ingredients = window.MerakiInventorySync.getIngredientsInventory();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white;border-radius:12px;padding:2rem;max-width:800px;max-height:80vh;overflow-y:auto;';
    
    let html = '<h2>Ingredients Inventory</h2>';
    html += '<div style="margin-top: 1rem;">';
    
    Object.entries(ingredients).forEach(([key, item]) => {
        const stockPercent = (item.stock / (item.lowStockThreshold * 3)) * 100;
        const stockColor = item.stock <= item.lowStockThreshold ? '#dc3545' : 
                          item.stock <= item.lowStockThreshold * 2 ? '#ffc107' : '#28a745';
        
        html += `
            <div style="margin: 0.75rem 0; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${item.name}</strong>
                    <div style="font-size: 0.9rem; color: #666;">${key}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: ${stockColor};">
                        ${item.stock.toFixed(2)} ${item.unit}
                    </div>
                    <div style="font-size: 0.85rem; color: #666;">
                        Low: ${item.lowStockThreshold} ${item.unit}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    html += '<button id="close-ingredients-modal" class="btn btn-primary" style="margin-top: 1rem;">Close</button>';
    
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    document.getElementById('close-ingredients-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Enhanced showToast with type support
function showToast(message, type = 'success') {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.background = colors[type] || colors.success;
    toast.style.color = type === 'warning' ? '#000' : '#fff';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.zIndex = '10000';
    toast.style.fontWeight = '500';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
