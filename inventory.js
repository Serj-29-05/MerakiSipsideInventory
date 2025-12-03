// Meraki Sipside Inventory Management System
// Handles product CRUD operations, stock tracking, and alerts

const INVENTORY_STORAGE_KEY = 'meraki_inventory';
const INVENTORY_HISTORY_KEY = 'meraki_inventory_history';

let inventory = [];
let filteredInventory = [];

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
    loadInventory();
    initializeUI();
    updateDashboard();
    renderInventoryTable();
    checkStockAlerts();
    setupDashboardInteractions();
});

// Load inventory from localStorage
function loadInventory() {
    try {
        const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (stored) {
            inventory = JSON.parse(stored);
            normalizeInventoryData();
        } else {
            // Initialize with default products
            inventory = getDefaultInventory();
            saveInventory();
        }
        filteredInventory = [...inventory];
    } catch (e) {
        console.error('Failed to load inventory:', e);
        inventory = [];
        filteredInventory = [];
    }
}

// Save inventory to localStorage
function saveInventory() {
    try {
        normalizeInventoryData();
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
        
        // Log history entry
        const history = {
            timestamp: new Date().toISOString(),
            action: 'update',
            snapshot: inventory.length
        };
        logInventoryHistory(history);
    } catch (e) {
        console.error('Failed to save inventory:', e);
    }
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
        const items = inventory.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
        openStockStatusModal('Low Stock Products', items);
    });

    outOfStockCard?.addEventListener('click', () => {
        const items = inventory.filter(p => p.stock === 0);
        openStockStatusModal('Out of Stock Products', items);
    });
}

// Update dashboard statistics
function updateDashboard() {
    const totalProducts = inventory.length;
    const inStock = inventory.filter(p => p.stock > p.lowStockThreshold).length;
    const lowStock = inventory.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStock = inventory.filter(p => p.stock === 0).length;

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

    if (filteredInventory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No products found.</td></tr>';
        return;
    }

    filteredInventory.forEach(product => {
        const row = document.createElement('tr');
        row.className = getStockStatusClass(product);
        row.dataset.productId = product.id;

        const priceValue = typeof product.price === 'number' ? product.price : 0;

        const statusBadge = getStatusBadge(product);
        const lastUpdated = new Date(product.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        row.innerHTML = `
            <td>${product.id}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>
                <div class="price-input-wrapper">
                    <span class="currency-symbol">₱</span>
                    <input type="number" min="0" step="0.01" value="${formatPriceDisplay(priceValue)}"
                           class="price-input" data-id="${product.id}">
                </div>
            </td>
            <td>
                <input type="number" min="0" value="${product.stock}" 
                       class="stock-input" data-id="${product.id}">
            </td>
            <td>${statusBadge}</td>
            <td>${lastUpdated}</td>
            <td>
                <button class="btn-action btn-edit" data-id="${product.id}" title="Edit">✏️</button>
                <button class="btn-action btn-delete" data-id="${product.id}" title="Delete">🗑️</button>
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

// Get stock status class for row styling
function getStockStatusClass(product) {
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock <= product.lowStockThreshold) return 'low-stock';
    return 'in-stock';
}

// Get status badge HTML
function getStatusBadge(product) {
    if (product.stock === 0) {
        return '<span class="badge badge-danger">Out of Stock</span>';
    }
    if (product.stock <= product.lowStockThreshold) {
        return '<span class="badge badge-warning">Low Stock</span>';
    }
    return '<span class="badge badge-success">In Stock</span>';
}

// Apply search and filters
function applyFilters() {
    const searchTerm = document.getElementById('search-inventory')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('filter-category')?.value || 'all';
    const stockFilter = document.getElementById('filter-stock')?.value || 'all';

    filteredInventory = inventory.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.id.toLowerCase().includes(searchTerm) ||
                            product.category.toLowerCase().includes(searchTerm);

        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

        let matchesStock = true;
        if (stockFilter === 'in-stock') {
            matchesStock = product.stock > product.lowStockThreshold;
        } else if (stockFilter === 'low-stock') {
            matchesStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
        } else if (stockFilter === 'out-of-stock') {
            matchesStock = product.stock === 0;
        }

        return matchesSearch && matchesCategory && matchesStock;
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

    const productId = document.getElementById('form-product-id').value;
    const name = document.getElementById('form-product-name').value.trim();
    const category = document.getElementById('form-product-category').value;
    const description = document.getElementById('form-product-description').value.trim();
    const stock = parseInt(document.getElementById('form-product-stock').value);
    const lowStockThreshold = parseInt(document.getElementById('form-product-low-stock').value);
    const price = parseFloat(document.getElementById('form-product-price').value);
    if (isNaN(price) || price < 0) {
        showToast('Please enter a valid ingredient cost.');
        return;
    }

    if (productId) {
        // Update existing product
        const index = inventory.findIndex(p => p.id === productId);
        if (index !== -1) {
            inventory[index] = {
                ...inventory[index],
                name,
                category,
                description,
                stock,
                lowStockThreshold,
                price,
                lastUpdated: new Date().toISOString()
            };
        }
    } else {
        // Add new product
        const newId = generateProductId(category);
        const newProduct = {
            id: newId,
            name,
            category,
            description,
            stock,
            lowStockThreshold,
            price,
            lastUpdated: new Date().toISOString()
        };
        inventory.push(newProduct);
    }

    saveInventory();
    closeProductModal();
    applyFilters();
    updateDashboard();
    checkStockAlerts();

    showToast(productId ? 'Product updated successfully!' : 'Product added successfully!');
}

// Generate unique product ID
function generateProductId(category) {
    const prefix = category.substring(0, 2).toLowerCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
}

// Edit product
function editProduct(productId) {
    openProductModal(productId);
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
function updateStock(productId, newStock) {
    const product = inventory.find(p => p.id === productId);
    if (product) {
        product.stock = newStock;
        product.lastUpdated = new Date().toISOString();
        saveInventory();
        updateDashboard();
        checkStockAlerts();
        renderInventoryTable();
    }
}

// Check and display stock alerts
function checkStockAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;

    const lowStockItems = inventory.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
    const outOfStockItems = inventory.filter(p => p.stock === 0);

    alertsContainer.innerHTML = '';

    if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
        alertsContainer.innerHTML = '<div class="alert alert-success">✅ All products are well stocked!</div>';
        return;
    }

    if (outOfStockItems.length > 0) {
        outOfStockItems.forEach(item => {
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger';
            alert.innerHTML = `<strong>❌ Out of Stock:</strong> ${item.name} (${item.category})`;
            alertsContainer.appendChild(alert);
        });
    }

    if (lowStockItems.length > 0) {
        lowStockItems.forEach(item => {
            const alert = document.createElement('div');
            alert.className = 'alert alert-warning';
            alert.innerHTML = `<strong>⚠️ Low Stock:</strong> ${item.name} (${item.category}) - Only ${item.stock} left`;
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
