# Meraki Sipside - Shop Inventory Management System

A comprehensive web application for managing coffee shop inventory, built for Meraki Sipside. This system allows you to track products, monitor stock levels, manage multiple size variants, and receive alerts for low or out-of-stock items.

## Features

### 📊 Dashboard
- Real-time overview of inventory status
- Total products count
- In-stock items tracking
- Low stock alerts
- Out-of-stock notifications

### 📦 Inventory Management
- **Add New Products**: Create products with single or multiple size variants
- **Edit Products**: Update product details, prices, and stock levels
- **Delete Products**: Remove products from inventory
- **Stock Updates**: Quick inline stock quantity updates
- **Multi-size Support**: Handle products with different sizes (G/V, R/M/L, etc.)

### 🔍 Search & Filter
- Search products by name, ID, or category
- Filter by category (Milktea, Iced Coffee, Cheesecake, etc.)
- Filter by stock status (In Stock, Low Stock, Out of Stock)

### ⚠️ Alert System
- Automatic low stock warnings
- Out-of-stock notifications
- Customizable low stock thresholds per product

### 💾 Data Management
- **Export**: Download inventory data as JSON
- **Import**: Upload and restore inventory from JSON files
- **Reset**: Restore default Meraki Sipside product catalog
- **Auto-save**: Automatic localStorage persistence

### 📱 Menu Display
- Public-facing menu page
- Category filtering
- Real-time stock status display
- Responsive design for mobile and desktop

## Project Structure

```
WebApp/
├── index.html          # Landing page with navigation
├── inventory.html      # Inventory management interface
├── menu.html           # Public menu display
├── inventory.js        # Inventory management logic
├── menu.js            # Menu display logic
├── styles.css         # Complete stylesheet
└── README.md          # This file
```

## Getting Started

### Installation

1. Download or clone the project files to your computer
2. Open `index.html` in a web browser
3. Navigate to the Inventory page to begin managing products

### First Time Setup

When you first open the inventory page, it will automatically initialize with default Meraki Sipside products including:
- 8 Milktea varieties (Grande/Venti sizes)
- 6 Iced Coffee options
- 5 Cheesecake flavors (Grande/Venti sizes)
- 7 Fruit Tea selections
- 6 Soda varieties (Grande/Venti sizes)
- 6 Frappe options
- 11 Snack items
- 4 Fries varieties

## Usage Guide

### Managing Inventory

1. **View Dashboard**: See real-time statistics at the top of the inventory page
2. **Add Product**: Click "➕ Add New Product" button
   - Fill in product details
   - Choose single price or multiple sizes
   - Set stock quantity and low stock threshold
3. **Edit Product**: Click the ✏️ icon next to any product
4. **Update Stock**: Change the number directly in the stock column
5. **Delete Product**: Click the 🗑️ icon (requires confirmation)

### Using Filters

- **Search**: Type in the search box to find products by name/ID
- **Category Filter**: Select a category from the dropdown
- **Stock Filter**: Choose between All, In Stock, Low Stock, or Out of Stock

### Data Backup & Restore

- **Export**: Click "📥 Export Data" to download your inventory as JSON
- **Import**: Click "📤 Import Data" to restore from a JSON file
- **Reset**: Click "🔄 Reset to Default" to restore original products

### Viewing Menu

1. Navigate to the Menu page from the navigation bar
2. Browse products by category
3. View current stock status for each item
4. See all price variants for multi-size products

## Default Product Categories

- **Milktea**: Classic milk teas with tapioca pearls
- **Iced Coffee**: Premium coffee beverages
- **Cheesecake**: Delicious cheesecake varieties
- **Fruit Tea**: Refreshing fruit-infused teas
- **Soda**: Sparkling flavored sodas
- **Frappe**: Blended frozen drinks
- **Snacks**: Burgers, hotdogs, corndogs, and sandwiches
- **Fries**: Various flavored fries

## Technical Details

### Technologies Used
- HTML5
- CSS3 (Flexbox & Grid)
- Vanilla JavaScript (ES6+)
- LocalStorage API

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Edge
- Safari

### Data Storage
- All data is stored in browser localStorage
- Data persists between sessions
- Maximum storage: ~5-10MB (browser dependent)

### Responsive Design
- Mobile-friendly interface
- Tablet optimized
- Desktop full-featured experience

## Tips & Best Practices

1. **Regular Backups**: Export your inventory data regularly
2. **Stock Monitoring**: Check the alerts section daily for low stock items
3. **Threshold Settings**: Set appropriate low stock thresholds based on product popularity
4. **Data Management**: Use meaningful product IDs for easy tracking
5. **Multi-tab Updates**: Changes sync automatically across browser tabs

## Troubleshooting

**Problem**: Menu shows no items  
**Solution**: Go to Inventory page first to initialize default products

**Problem**: Changes not saving  
**Solution**: Ensure localStorage is enabled in browser settings

**Problem**: Export/Import not working  
**Solution**: Check browser permissions for file downloads/uploads

**Problem**: Lost data  
**Solution**: Import from a previous backup JSON file

## Future Enhancements

Potential features for future versions:
- Sales tracking and analytics
- Purchase order management
- Supplier information
- Barcode scanning
- Multi-user access
- Cloud synchronization
- Mobile app version

## License

This project is created for Meraki Sipside coffee shop.

## Support

For issues or questions about this inventory system, please contact the development team.

---

**Last Updated**: November 17, 2025  
**Version**: 1.0.0
