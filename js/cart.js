/**
 * Cart functionality for Antoinette's Pastries
 */

let cart = [];
let products = [];

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', async function() {
    loadCart();
    
    // Debug: Show cart status
    if (cart.length === 0) {
        console.log('Cart is empty');
    } else {
        console.log('Cart has items:', cart);
    }
    
    await loadProducts();
    displayCartItems();
    updateCartSummary();
    updateCartDisplay(); // Update navigation cart counter
});

/**
 * Load cart from localStorage
 */
function loadCart() {
    const cartData = localStorage.getItem('cart');
    console.log('Raw cart data from localStorage:', cartData);
    if (cartData) {
        cart = JSON.parse(cartData);
        console.log('Parsed cart:', cart);
    } else {
        console.log('No cart data found in localStorage');
        cart = [];
    }
}

/**
 * Load products from API
 */
async function loadProducts() {
    try {
        const response = await fetch('api/products.php');
        const data = await response.json();
        
        if (data.success) {
            products = data.products;
            console.log('Products loaded successfully:', products);
            // Refresh cart display now that products are loaded
            displayCartItems();
            updateCartSummary();
        } else {
            console.error('Failed to load products:', data.message);
            // Use fallback products for testing
            products = [
                { id: 1, name: "Strawberry Shortcake", description: "Light sponge cake layered with fresh strawberries and whipped cream.", price: 22.00 },
                { id: 2, name: "Chocolate Croissant", description: "Buttery croissant filled with rich chocolate.", price: 18.00 },
                { id: 3, name: "Blueberry Muffin", description: "Fresh blueberry muffin with a golden top.", price: 15.00 },
                { id: 4, name: "Vanilla Cupcake", description: "Moist vanilla cupcake with buttercream frosting.", price: 12.00 },
                { id: 5, name: "Apple Pie", description: "Classic apple pie with flaky crust.", price: 25.00 },
                { id: 6, name: "Chocolate Chip Cookie", description: "Soft and chewy chocolate chip cookies.", price: 8.00 },
                { id: 7, name: "Cinnamon Roll", description: "Sweet cinnamon roll with cream cheese glaze.", price: 16.00 },
                { id: 8, name: "Lemon Tart", description: "Tangy lemon tart with meringue topping.", price: 20.00 },
                { id: 9, name: "Red Velvet Cake", description: "Rich red velvet cake with cream cheese frosting.", price: 28.00 },
                { id: 10, name: "Tiramisu", description: "Classic Italian dessert with coffee and mascarpone.", price: 24.00 },
                { id: 11, name: "Cheesecake", description: "New York style cheesecake with berry compote.", price: 26.00 },
                { id: 12, name: "Eclair", description: "French pastry filled with vanilla cream.", price: 14.00 }
            ];
            console.log('Using fallback products:', products);
            displayCartItems();
            updateCartSummary();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Use fallback products for testing
        products = [
            { id: 1, name: "Strawberry Shortcake", description: "Light sponge cake layered with fresh strawberries and whipped cream.", price: 22.00 },
            { id: 2, name: "Chocolate Croissant", description: "Buttery croissant filled with rich chocolate.", price: 18.00 },
            { id: 3, name: "Blueberry Muffin", description: "Fresh blueberry muffin with a golden top.", price: 15.00 },
            { id: 4, name: "Vanilla Cupcake", description: "Moist vanilla cupcake with buttercream frosting.", price: 12.00 },
            { id: 5, name: "Apple Pie", description: "Classic apple pie with flaky crust.", price: 25.00 },
            { id: 6, name: "Chocolate Chip Cookie", description: "Soft and chewy chocolate chip cookies.", price: 8.00 },
            { id: 7, name: "Cinnamon Roll", description: "Sweet cinnamon roll with cream cheese glaze.", price: 16.00 },
            { id: 8, name: "Lemon Tart", description: "Tangy lemon tart with meringue topping.", price: 20.00 },
            { id: 9, name: "Red Velvet Cake", description: "Rich red velvet cake with cream cheese frosting.", price: 28.00 },
            { id: 10, name: "Tiramisu", description: "Classic Italian dessert with coffee and mascarpone.", price: 24.00 },
            { id: 11, name: "Cheesecake", description: "New York style cheesecake with berry compote.", price: 26.00 },
            { id: 12, name: "Eclair", description: "French pastry filled with vanilla cream.", price: 14.00 }
        ];
        console.log('Using fallback products due to error:', products);
        displayCartItems();
        updateCartSummary();
    }
}

/**
 * Display cart items
 */
function displayCartItems() {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    
    console.log('Cart items:', cart);
    console.log('Products loaded:', products);
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <i class="fas fa-shopping-cart text-6xl mb-4"></i>
                <h3 class="text-2xl font-semibold mb-2">Your cart is empty</h3>
                <p class="text-gray-600 mb-6">Add some delicious pastries to get started!</p>
                <a href="products.html" class="btn-primary">
                    <i class="fas fa-utensils mr-2"></i>Browse Products
                </a>
            </div>
        `;
        summary.classList.add('hidden');
        return;
    }
    
    let html = '<div class="space-y-6">';
    
    cart.forEach((item, index) => {
        const product = products.find(p => p.id === item.id);
        console.log(`Looking for product ID ${item.id}, found:`, product);
        if (product) {
            html += `
                <div class="flex items-center space-x-6 p-6 border border-gray-200 rounded-lg">
                    <div class="flex-shrink-0">
                        <img src="Logo.png" alt="${product.name}" class="h-20 w-20 object-contain rounded-lg">
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-semibold text-gray-800">${product.name}</h3>
                        <p class="text-gray-600">${product.description}</p>
                        <p class="text-amber-600 font-bold text-lg">₱${product.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <button onclick="updateQuantity(${index}, ${item.quantity - 1})" 
                                class="w-8 h-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition duration-200">
                            <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span class="w-12 text-center font-semibold">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, ${item.quantity + 1})" 
                                class="w-8 h-8 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition duration-200">
                            <i class="fas fa-plus text-sm"></i>
                        </button>
                    </div>
                    <div class="text-right">
                        <p class="text-xl font-bold text-gray-800">₱${(product.price * item.quantity).toFixed(2)}</p>
                        <button onclick="removeFromCart(${index})" 
                                class="text-red-600 hover:text-red-800 transition duration-200 mt-2">
                            <i class="fas fa-trash mr-1"></i>Remove
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Fallback for when product data isn't loaded yet
            html += `
                <div class="flex items-center space-x-6 p-6 border border-gray-200 rounded-lg">
                    <div class="flex-shrink-0">
                        <img src="Logo.png" alt="Product" class="h-20 w-20 object-contain rounded-lg">
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-semibold text-gray-800">Product ID: ${item.id}</h3>
                        <p class="text-gray-600">Loading product details...</p>
                        <p class="text-amber-600 font-bold text-lg">₱0.00</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <button onclick="updateQuantity(${index}, ${item.quantity - 1})" 
                                class="w-8 h-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition duration-200">
                            <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span class="w-12 text-center font-semibold">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, ${item.quantity + 1})" 
                                class="w-8 h-8 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition duration-200">
                            <i class="fas fa-plus text-sm"></i>
                        </button>
                    </div>
                    <div class="text-right">
                        <p class="text-xl font-bold text-gray-800">₱0.00</p>
                        <button onclick="removeFromCart(${index})" 
                                class="text-red-600 hover:text-red-800 transition duration-200 mt-2">
                            <i class="fas fa-trash mr-1"></i>Remove
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
    summary.classList.remove('hidden');
}

/**
 * Update quantity of an item
 */
function updateQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(index);
        return;
    }
    
    cart[index].quantity = newQuantity;
    saveCart();
    displayCartItems();
    updateCartSummary();
    updateCartDisplay();
}

/**
 * Remove item from cart
 */
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    displayCartItems();
    updateCartSummary();
    updateCartDisplay();
    
    showNotification('Item removed from cart', 'success');
}

/**
 * Update cart summary
 */
function updateCartSummary() {
    let subtotal = 0;
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            subtotal += product.price * item.quantity;
        }
    });
    
    const tax = subtotal * 0.12; // 12% tax
    const delivery = 50.00;
    const total = subtotal + tax + delivery;
    
    document.getElementById('cart-subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `₱${tax.toFixed(2)}`;
    document.getElementById('cart-delivery').textContent = `₱${delivery.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `₱${total.toFixed(2)}`;
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Update cart display in navigation
    updateCartDisplay();
}

/**
 * Clear entire cart
 */
function clearCart() {
    cart = [];
    saveCart();
    displayCartItems();
    updateCartSummary();
    updateCartDisplay();
    showNotification('Cart cleared', 'success');
}

/**
 * Proceed to checkout
 */
function proceedToCheckout() {
    // Check if user is logged in
    fetch('api/auth.php?action=check')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // User is logged in, proceed to checkout
                if (cart.length === 0) {
                    showNotification('Your cart is empty', 'warning');
                    return;
                }
                
                // For now, just show a success message
                // In a real application, this would redirect to a checkout page
                showNotification('Checkout functionality coming soon!', 'info');
                
                // You could redirect to a checkout page here:
                // window.location.href = 'checkout.html';
                
            } else {
                // User is not logged in, redirect to login
                showNotification('Please log in to proceed with checkout', 'warning');
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error checking authentication:', error);
            showNotification('Please log in to proceed with checkout', 'warning');
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 2000);
        });
}

// Add event listener for checkout button
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
});

/**
 * Update cart display in navigation (from cart page)
 */
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartButtons = document.querySelectorAll('a[class*="bg-amber-600"], button[class*="bg-amber-600"]');
    cartButtons.forEach(button => {
        if (button.innerHTML.includes('Cart')) {
            button.innerHTML = `<i class="fas fa-shopping-cart mr-2"></i>Cart (${totalItems})`;
        }
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notification-icon');
    const messageEl = document.getElementById('notification-message');
    
    // Set icon and colors based on type
    let iconClass = '';
    let bgColor = '';
    
    switch(type) {
        case 'success':
            iconClass = 'fas fa-check-circle text-green-500';
            bgColor = 'border-l-4 border-green-500';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle text-red-500';
            bgColor = 'border-l-4 border-red-500';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle text-yellow-500';
            bgColor = 'border-l-4 border-yellow-500';
            break;
        default:
            iconClass = 'fas fa-info-circle text-blue-500';
            bgColor = 'border-l-4 border-blue-500';
    }
    
    icon.className = iconClass;
    messageEl.textContent = message;
    notification.className = `fixed top-4 right-4 z-50 ${bgColor}`;
    notification.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}
