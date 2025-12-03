// Meraki Sipside Menu Display
// Loads inventory data and displays it as a menu

document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
});

function loadMenu() {
    // Load inventory from localStorage
    const inventory = JSON.parse(localStorage.getItem('meraki_inventory') || '[]');
    
    if (inventory.length === 0) {
        // Initialize with default data if empty
        initializeDefaultInventory();
        return;
    }

    // Get unique categories
    const categories = ['All', ...new Set(inventory.map(item => item.category))];
    
    // Render category filters
    renderCategoryFilters(categories, inventory);
    
    // Render all items initially
    renderMenuItems(inventory);
}

function renderCategoryFilters(categories, inventory) {
    const filterContainer = document.getElementById('category-filter');
    filterContainer.innerHTML = '';

    categories.forEach((category, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn' + (index === 0 ? ' active' : '');
        btn.textContent = category;
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter items
            if (category === 'All') {
                renderMenuItems(inventory);
            } else {
                const filtered = inventory.filter(item => item.category === category);
                renderMenuItems(filtered);
            }
        });
        filterContainer.appendChild(btn);
    });
}

function renderMenuItems(items) {
    const menuGrid = document.getElementById('menu-grid');
    menuGrid.innerHTML = '';

    if (items.length === 0) {
        menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">No items available in this category.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item';

        // Format price display
        let priceDisplay = '';
        const sellingPrices = item.sellingPrices || item.prices;
        if (sellingPrices && typeof sellingPrices === 'object') {
            const priceList = Object.entries(sellingPrices)
                .map(([size, price]) => `${size}: ₱${formatPriceValue(price)}`)
                .join(' | ');
            priceDisplay = priceList;
        } else {
            priceDisplay = `₱${formatPriceValue(item.price)}`;
        }

        // Determine stock status
        let stockStatus = '';
        let stockClass = '';
        if (item.stock === 0) {
            stockStatus = '❌ Out of Stock';
            stockClass = 'out-of-stock';
        } else if (item.stock <= item.lowStockThreshold) {
            stockStatus = `⚠️ Low Stock (${item.stock} left)`;
            stockClass = 'low-stock';
        } else {
            stockStatus = `✅ In Stock (${item.stock} available)`;
            stockClass = 'in-stock';
        }

        card.innerHTML = `
            <h3>${item.name}</h3>
            <div class="category">${item.category}</div>
            <p>${item.description || 'Delicious and freshly prepared'}</p>
            <div class="price">${priceDisplay}</div>
            <div class="stock-status ${stockClass}">${stockStatus}</div>
        `;

        menuGrid.appendChild(card);
    });
}

function initializeDefaultInventory() {
    // If no inventory exists, prompt to go to inventory page
    const menuGrid = document.getElementById('menu-grid');
    menuGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <h3>No menu items available</h3>
            <p style="margin: 1rem 0; color: #666;">Please initialize the inventory first</p>
            <a href="inventory.html" class="btn btn-primary">Go to Inventory</a>
        </div>
    `;
}

// Listen for inventory updates (if viewing menu while inventory is open in another tab)
window.addEventListener('storage', (e) => {
    if (e.key === 'meraki_inventory') {
        loadMenu();
    }
});

function formatPriceValue(value) {
    const numeric = parseFloat(value);
    if (isNaN(numeric)) {
        return '0.00';
    }
    return numeric.toFixed(2);
}
