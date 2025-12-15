// Inventory Sync Module for WebApp
// Processes orders from the website and deducts ingredients from inventory

const INGREDIENTS_STORAGE_KEY = 'meraki_ingredients_inventory';

// Initialize ingredients inventory with common items
function initializeIngredientsInventory() {
    const existingIngredients = getIngredientsInventory();
    if (Object.keys(existingIngredients).length > 0) {
        return existingIngredients; // Already initialized
    }

    const defaultIngredients = {
        // Bases
        'milk_tea_base': { name: 'Milk Tea Base', stock: 50, unit: 'servings', lowStockThreshold: 20 },
        'coffee_base': { name: 'Coffee Base', stock: 50, unit: 'servings', lowStockThreshold: 20 },
        'tea_base': { name: 'Tea Base', stock: 50, unit: 'servings', lowStockThreshold: 20 },
        'frappe_base': { name: 'Frappe Base', stock: 50, unit: 'servings', lowStockThreshold: 20 },
        'cheesecake_base': { name: 'Cheesecake Base', stock: 50, unit: 'servings', lowStockThreshold: 20 },
        'soda_water': { name: 'Soda Water', stock: 50, unit: 'servings', lowStockThreshold: 20 },

        // Powders & Syrups
        'chocolate_powder': { name: 'Chocolate Powder', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'matcha_powder': { name: 'Matcha Powder', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'red_velvet_powder': { name: 'Red Velvet Powder', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'cookies_cream_powder': { name: 'Cookies & Cream Powder', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'ube_powder': { name: 'Ube Powder', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'cheese_powder': { name: 'Cheese Powder', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'sour_cream_powder': { name: 'Sour Cream Powder', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        
        // Syrups
        'chocolate_syrup': { name: 'Chocolate Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'vanilla_syrup': { name: 'Vanilla Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'caramel_syrup': { name: 'Caramel Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'hazelnut_syrup': { name: 'Hazelnut Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'lychee_syrup': { name: 'Lychee Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'strawberry_syrup': { name: 'Strawberry Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'blueberry_syrup': { name: 'Blueberry Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'apple_syrup': { name: 'Apple Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'lime_syrup': { name: 'Lime Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'passion_fruit_syrup': { name: 'Passion Fruit Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'mixed_fruit_syrup': { name: 'Mixed Fruit Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'winter_melon_syrup': { name: 'Winter Melon Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'bubblegum_syrup': { name: 'Bubble Gum Syrup', stock: 50, unit: 'liters', lowStockThreshold: 20 },

        // Dairy & Liquids
        'milk': { name: 'Milk', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'condensed_milk': { name: 'Condensed Milk', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'cream': { name: 'Cream', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'orange_juice': { name: 'Orange Juice', stock: 50, unit: 'liters', lowStockThreshold: 20 },

        // Toppings & Add-ons
        'tapioca_pearls': { name: 'Tapioca Pearls', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'oreo_cookies': { name: 'Oreo Cookies', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'brown_sugar': { name: 'Brown Sugar', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'salt': { name: 'Salt', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'ice': { name: 'Ice', stock: 50, unit: 'kg', lowStockThreshold: 20 },

        // Fresh Items
        'mango_puree': { name: 'Mango Puree', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'avocado': { name: 'Avocado', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'blue_curacao': { name: 'Blue Curacao', stock: 50, unit: 'liters', lowStockThreshold: 20 },

        // Snack Ingredients
        'tortilla_chips': { name: 'Tortilla Chips', stock: 50, unit: 'packs', lowStockThreshold: 20 },
        'cheese_sauce': { name: 'Cheese Sauce', stock: 50, unit: 'kg', lowStockThreshold: 20 },
        'chicken_nuggets': { name: 'Chicken Nuggets', stock: 50, unit: 'servings', lowStockThreshold: 20 },
        'hotdog': { name: 'Hotdog', stock: 50, unit: 'pieces', lowStockThreshold: 20 },
        'bun': { name: 'Bun', stock: 50, unit: 'pieces', lowStockThreshold: 20 },
        'fish_fillet': { name: 'Fish Fillet', stock: 50, unit: 'pieces', lowStockThreshold: 20 },
        'chicken_wings': { name: 'Chicken Wings', stock: 50, unit: 'servings', lowStockThreshold: 20 },
        'beef_patty': { name: 'Beef Patty', stock: 50, unit: 'pieces', lowStockThreshold: 20 },
        'gravy': { name: 'Gravy', stock: 50, unit: 'liters', lowStockThreshold: 20 },
        'siopao': { name: 'Siopao', stock: 50, unit: 'pieces', lowStockThreshold: 20 },
        'potato': { name: 'Potato', stock: 50, unit: 'kg', lowStockThreshold: 20 }
    };

    saveIngredientsInventory(defaultIngredients);
    return defaultIngredients;
}

// Get ingredients inventory
function getIngredientsInventory() {
    try {
        return JSON.parse(localStorage.getItem(INGREDIENTS_STORAGE_KEY) || '{}');
    } catch (e) {
        console.error('Failed to load ingredients inventory:', e);
        return {};
    }
}

// Save ingredients inventory
function saveIngredientsInventory(inventory) {
    try {
        localStorage.setItem(INGREDIENTS_STORAGE_KEY, JSON.stringify(inventory));
        window.dispatchEvent(new CustomEvent('meraki:ingredients:updated'));
    } catch (e) {
        console.error('Failed to save ingredients inventory:', e);
    }
}

// Deduct ingredients based on order requirements
function deductIngredients(requirements) {
    const inventory = getIngredientsInventory();
    const deductions = [];
    const errors = [];

    Object.entries(requirements).forEach(([ingredient, amount]) => {
        if (!inventory[ingredient]) {
            errors.push(`Ingredient not found: ${ingredient}`);
            return;
        }

        const currentStock = inventory[ingredient].stock || 0;
        if (currentStock < amount) {
            errors.push(`Insufficient ${inventory[ingredient].name}: need ${amount}, have ${currentStock}`);
            // Still deduct what we have
            deductions.push({
                ingredient,
                name: inventory[ingredient].name,
                deducted: currentStock,
                required: amount,
                newStock: 0,
                ingredient: inventory[ingredient]
            });
            inventory[ingredient].stock = 0;
        } else {
            const newStock = currentStock - amount;
            deductions.push({
                ingredient,
                name: inventory[ingredient].name,
                deducted: amount,
                required: amount,
                newStock,
                ingredient: inventory[ingredient]
            });
            inventory[ingredient].stock = newStock;
        }
    });

    if (deductions.length > 0) {
        saveIngredientsInventory(inventory);
    }

    return { deductions, errors };
}

// Process pending orders from the website
function processPendingOrders() {
    const ORDERS_KEY = 'meraki_orders';
    const PRODUCT_RECIPES = window.PRODUCT_RECIPES || {};
    
    try {
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
        const pendingOrders = orders.filter(o => !o.processed && o.status === 'pending_fulfillment');
        
        const results = [];
        
        pendingOrders.forEach(order => {
            // Calculate ingredient requirements
            const requirements = {};
            
            order.items.forEach(item => {
                const productId = String(item.id).toLowerCase();
                const recipe = PRODUCT_RECIPES[productId];
                
                if (!recipe || !recipe.ingredients) {
                    console.warn(`No recipe for product: ${productId}`);
                    return;
                }
                
                const quantity = item.quantity || 1;
                Object.entries(recipe.ingredients).forEach(([ing, amt]) => {
                    requirements[ing] = (requirements[ing] || 0) + (amt * quantity);
                });
            });
            
            // Deduct ingredients
            const result = deductIngredients(requirements);
            
            // Mark order as processed
            order.processed = true;
            order.processedAt = new Date().toISOString();
            order.ingredientDeductions = result.deductions;
            if (result.errors.length > 0) {
                order.processingErrors = result.errors;
            }
            
            results.push({
                orderId: order.id,
                success: result.errors.length === 0,
                deductions: result.deductions,
                errors: result.errors
            });
        });
        
        // Save updated orders
        if (results.length > 0) {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        }
        
        return results;
    } catch (e) {
        console.error('Failed to process pending orders:', e);
        return [];
    }
}

// Get low stock ingredients
function getLowStockIngredients() {
    const inventory = getIngredientsInventory();
    return Object.entries(inventory)
        .filter(([key, item]) => item.stock <= item.lowStockThreshold)
        .map(([key, item]) => ({ key, ...item }));
}

// Export functions
if (typeof window !== 'undefined') {
    window.MerakiInventorySync = {
        initializeIngredientsInventory,
        getIngredientsInventory,
        saveIngredientsInventory,
        deductIngredients,
        processPendingOrders,
        getLowStockIngredients
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeIngredientsInventory,
        getIngredientsInventory,
        saveIngredientsInventory,
        deductIngredients,
        processPendingOrders,
        getLowStockIngredients
    };
}
