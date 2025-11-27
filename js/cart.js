/**
 * Cart functionality for Antonette's Pastries
 */

let cart = [];
let products = [];

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', async function () {
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

    // If products aren't loaded yet, show loading state
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
                <p class="text-lg">Loading cart items...</p>
            </div>
        `;
        summary.classList.add('hidden');
        return;
    }

    let html = '<div class="space-y-6">';
    let hasValidItems = false;

    cart.forEach((item, index) => {
        // Handle both old format (id, quantity) and new format (id, name, price, image, quantity)
        const product = products.find(p => p.id === item.id);
        console.log(`Looking for product ID ${item.id}, found:`, product);

        if (product) {
            hasValidItems = true;

            // Get size display text
            const sizeText = item.size_name || (item.size ? item.size : 'Standard');

            html += `
                <div class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div class="flex items-start sm:items-center gap-4 flex-1">
                        <div class="flex-shrink-0">
                            <img src="${product.image_url || 'Logo.png'}" alt="${product.name}" class="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg border border-gray-200">
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">${product.name}</h3>
                            <div class="flex items-center space-x-3 mb-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    Size: ${sizeText}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed hidden sm:block">${product.description}</p>
                            <p class="text-amber-600 font-bold text-base sm:text-lg">₱${parseFloat(product.price).toFixed(2)} each</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div class="flex items-center space-x-3">
                            <button onclick="updateQuantity(${index}, ${item.quantity - 1})" 
                                    class="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition duration-200 flex items-center justify-center">
                                <i class="fas fa-minus text-sm"></i>
                            </button>
                            <span class="w-10 sm:w-12 text-center font-semibold text-base sm:text-lg">${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, ${item.quantity + 1})" 
                                    class="w-9 h-9 sm:w-10 sm:h-10 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition duration-200 flex items-center justify-center">
                                <i class="fas fa-plus text-sm"></i>
                            </button>
                        </div>
                        <div class="text-right">
                            <p class="text-lg sm:text-xl font-bold text-gray-800 mb-2">₱${(parseFloat(product.price) * item.quantity).toFixed(2)}</p>
                            <button onclick="removeFromCart(${index})" 
                                    class="text-red-600 hover:text-red-800 transition duration-200 text-sm">
                                <i class="fas fa-trash mr-1"></i>Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (item.name) {
            // Handle cart items with stored product data (from products.js)
            hasValidItems = true;

            // Get size display text
            const sizeText = item.size_name || (item.size ? item.size : 'Standard');

            html += `
                <div class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div class="flex items-start sm:items-center gap-4 flex-1">
                        <div class="flex-shrink-0">
                            <img src="${item.image || 'Logo.png'}" alt="${item.name}" class="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg border border-gray-200">
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">${item.name}</h3>
                            <div class="flex items-center space-x-3 mb-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    Size: ${sizeText}
                                </span>
                            </div>
                            <p class="text-amber-600 font-bold text-base sm:text-lg">₱${parseFloat(item.price).toFixed(2)} each</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div class="flex items-center space-x-3">
                            <button onclick="updateQuantity(${index}, ${item.quantity - 1})" 
                                    class="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition duration-200 flex items-center justify-center">
                                <i class="fas fa-minus text-sm"></i>
                            </button>
                            <span class="w-10 sm:w-12 text-center font-semibold text-base sm:text-lg">${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, ${item.quantity + 1})" 
                                    class="w-9 h-9 sm:w-10 sm:h-10 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition duration-200 flex items-center justify-center">
                                <i class="fas fa-plus text-sm"></i>
                            </button>
                        </div>
                        <div class="text-right">
                            <p class="text-lg sm:text-xl font-bold text-gray-800 mb-2">₱${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                            <button onclick="removeFromCart(${index})" 
                                    class="text-red-600 hover:text-red-800 transition duration-200 text-sm">
                                <i class="fas fa-trash mr-1"></i>Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Remove invalid cart items (products that no longer exist)
            console.log(`Removing invalid cart item with ID ${item.id}`);
            cart.splice(index, 1);
        }
    });

    html += '</div>';

    // If no valid items remain, clear the cart
    if (!hasValidItems) {
        cart = [];
        saveCart();
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
        // Handle both old format (id, quantity) and new format (id, name, price, image, quantity)
        if (item.price) {
            // Cart item has stored price data
            subtotal += parseFloat(item.price) * item.quantity;
        } else {
            // Cart item only has id, need to find product
            const product = products.find(p => p.id === item.id);
            if (product) {
                subtotal += parseFloat(product.price) * item.quantity;
            }
        }
    });

    const delivery = 50.00;
    const total = subtotal + delivery;

    document.getElementById('cart-subtotal').textContent = `₱${subtotal.toFixed(2)}`;
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
    // Check if cart is empty
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }

    // Check if user is logged in first
    fetch('api/auth.php?action=check')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // User is logged in, show checkout modal
                showCheckoutModal();
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

/**
 * Show checkout confirmation modal
 */
function showCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const summary = document.getElementById('checkout-summary');

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        if (item.price) {
            // Cart item has stored price data
            return sum + (parseFloat(item.price) * item.quantity);
        } else {
            // Cart item only has id, need to find product
            const product = products.find(p => p.id === item.id);
            return sum + (product ? parseFloat(product.price) * item.quantity : 0);
        }
    }, 0);
    const delivery = 50.00;
    const total = subtotal + delivery;

    // Generate summary HTML
    let summaryHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div class="space-y-2">
    `;

    cart.forEach(item => {
        // Get size display text
        const sizeText = item.size_name || (item.size ? item.size : 'Standard');

        if (item.name) {
            // Cart item has stored product data
            summaryHTML += `
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <div class="flex-1">
                        <p class="font-medium text-gray-900">${item.name}</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                Size: ${sizeText}
                            </span>
                            <span class="text-sm text-gray-600">Qty: ${item.quantity}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-medium">₱${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `;
        } else {
            // Cart item only has id, need to find product
            const product = products.find(p => p.id === item.id);
            if (product) {
                summaryHTML += `
                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                        <div class="flex-1">
                            <p class="font-medium text-gray-900">${product.name}</p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                    Size: ${sizeText}
                                </span>
                                <span class="text-sm text-gray-600">Qty: ${item.quantity}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-medium">₱${(parseFloat(product.price) * item.quantity).toFixed(2)}</p>
                        </div>
                    </div>
                `;
            }
        }
    });

    // Get selected payment method
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
    const paymentMethodText = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment';

    summaryHTML += `
                </div>
            </div>
            </div>
            
            <!-- Order Summary -->
            <div>
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Order Summary</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Subtotal:</span>
                            <span class="font-medium">₱${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Delivery Fee:</span>
                            <span class="font-medium">₱${delivery.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Payment Method:</span>
                            <span class="font-medium text-amber-600">${paymentMethodText}</span>
                        </div>
                        <hr class="border-gray-300">
                        <div class="flex justify-between text-lg font-bold">
                            <span class="text-gray-900">Total:</span>
                            <span class="text-amber-600">₱${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    summary.innerHTML = summaryHTML;
    modal.classList.remove('hidden');
}

/**
 * Close checkout modal
 */
function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

/**
 * Confirm checkout and place order
 */
async function confirmCheckout() {
    // Check if user is logged in
    try {
        const authResponse = await fetch('api/auth.php?action=check');
        const authData = await authResponse.json();

        if (!authData.success) {
            showNotification('Please log in to proceed with checkout', 'warning');
            closeCheckoutModal();
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 2000);
            return;
        }

        // Show loading state
        const confirmBtn = document.querySelector('button[onclick="confirmCheckout()"]');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing Order...';
        confirmBtn.disabled = true;

        // Get selected payment method
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

        // Prepare order data
        const orderItems = cart.map(item => {
            if (item.price) {
                return {
                    product_id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: parseFloat(item.price)
                };
            } else {
                const product = products.find(p => p.id === item.id);
                return {
                    product_id: item.id,
                    name: product ? product.name : 'Product',
                    quantity: item.quantity,
                    unit_price: product ? parseFloat(product.price) : 0
                };
            }
        });

        if (paymentMethod === 'cod') {
            // Handle COD Order
            const orderData = {
                items: orderItems,
                notes: 'Cash on Delivery Order'
            };

            const response = await fetch('api/orders.php?action=create_cod_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                // Clear cart
                cart = [];
                saveCart();

                // Store order info for success page
                localStorage.setItem('pending_order', JSON.stringify({
                    order_id: result.order_id,
                    order_number: result.order_number,
                    payment_method: 'cod'
                }));

                // Redirect to success page
                window.location.href = 'payment-success.html';
            } else {
                showNotification(`Failed to create order: ${result.message}`, 'error');
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }

        } else {
            // Handle Online Payment (PayMongo)

            // Calculate totals for notes
            let subtotal = 0;
            cart.forEach(item => {
                if (item.price) {
                    subtotal += parseFloat(item.price) * item.quantity;
                } else {
                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        subtotal += parseFloat(product.price) * item.quantity;
                    }
                }
            });

            const delivery = 50.00;
            const total = subtotal + delivery;

            // Create checkout session with PayMongo
            const checkoutData = {
                items: orderItems,
                notes: `Order total: ₱${total.toFixed(2)} (Subtotal: ₱${subtotal.toFixed(2)}, Delivery: ₱${delivery.toFixed(2)})`
            };

            const paymentResponse = await fetch('api/payment.php?action=create_checkout_session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(checkoutData)
            });

            const paymentResult = await paymentResponse.json();

            if (paymentResult.success) {
                // Store order info AND checkout session ID in localStorage for success page
                localStorage.setItem('pending_order', JSON.stringify({
                    order_id: paymentResult.order_id,
                    order_number: paymentResult.order_number,
                    checkout_session_id: paymentResult.checkout_session_id
                }));

                // Redirect to PayMongo checkout page
                window.location.href = paymentResult.checkout_url;

            } else {
                showNotification(`Failed to create payment session: ${paymentResult.message}`, 'error');
                // Restore button state
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }
        }

    } catch (error) {
        console.error('Error during checkout:', error);
        showNotification('An error occurred during checkout. Please try again.', 'error');
        // Restore button state
        const confirmBtn = document.querySelector('button[onclick="confirmCheckout()"]');
        if (confirmBtn) {
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
        }
    }
}

// Add event listener for checkout button
document.addEventListener('DOMContentLoaded', function () {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
});

/**
 * Update cart display in navigation (from cart page)
 * This function is now consistent with shared.js
 */
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Update all cart buttons
    const cartButtons = document.querySelectorAll('a[href="cart.html"]');
    cartButtons.forEach(button => {
        if (button.innerHTML.includes('Cart')) {
            // Check if it's the mobile button with different structure
            if (button.innerHTML.includes('mr-1')) {
                button.innerHTML = `<i class="fas fa-shopping-cart mr-1"></i><span class="hidden sm:inline">Cart (${totalItems})</span>`;
            } else {
                button.innerHTML = `<i class="fas fa-shopping-cart mr-2"></i>Cart (${totalItems})`;
            }
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

    switch (type) {
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
