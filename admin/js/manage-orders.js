// Manage Orders JavaScript
let allOrders = [];
let filteredOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    
    // Setup event listeners
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
});

// Load all orders
async function loadOrders() {
    try {
        const response = await fetch('../api/orders.php?action=get_all_orders', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            allOrders = data.orders;
            filteredOrders = [...allOrders];
            displayOrders();
            updateStatistics();
        } else {
            displayError('Failed to load orders: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        displayError('Network error loading orders');
    }
}

// Display orders
function displayOrders() {
    const container = document.getElementById('orders-list');
    const countElement = document.getElementById('orders-count');
    
    if (!filteredOrders || filteredOrders.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <i class="fas fa-shopping-cart text-6xl mb-4 opacity-50"></i>
                <p class="text-xl">No orders found</p>
                <p class="text-sm mt-2">Try adjusting your filters</p>
            </div>
        `;
        countElement.textContent = '0 orders';
        return;
    }
    
    countElement.textContent = `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`;
    
    container.innerHTML = filteredOrders.map(order => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
            'preparing': 'bg-orange-100 text-orange-800 border-orange-200',
            'ready': 'bg-green-100 text-green-800 border-green-200',
            'completed': 'bg-green-100 text-green-800 border-green-200',
            'cancelled': 'bg-red-100 text-red-800 border-red-200'
        };
        
        const paymentStatusColors = {
            'paid': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'failed': 'bg-red-100 text-red-800'
        };
        
        const statusIcons = {
            'pending': 'fa-clock',
            'confirmed': 'fa-check',
            'preparing': 'fa-fire',
            'ready': 'fa-box-open',
            'completed': 'fa-check-circle',
            'cancelled': 'fa-times-circle'
        };
        
        return `
            <div class="border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-md transition-shadow bg-white">
                <div class="flex flex-col lg:flex-row justify-between gap-4">
                    <!-- Order Info -->
                    <div class="flex-1">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                            <h3 class="text-xl font-bold text-gray-900">
                                <i class="fas fa-receipt mr-2 text-purple-600"></i>${order.order_number}
                            </h3>
                            <div class="flex gap-2 flex-wrap">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'} border">
                                    <i class="fas ${statusIcons[order.status]} mr-1"></i>${order.status.toUpperCase()}
                                </span>
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}">
                                    <i class="fas fa-money-bill mr-1"></i>${order.payment_status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span class="text-gray-600"><i class="fas fa-user mr-2"></i>Customer:</span>
                                <span class="font-semibold text-gray-900">${order.customer_name || 'Guest'}</span>
                            </div>
                            <div>
                                <span class="text-gray-600"><i class="fas fa-envelope mr-2"></i>Email:</span>
                                <span class="font-semibold text-gray-900">${order.customer_email || 'N/A'}</span>
                            </div>
                            <div>
                                <span class="text-gray-600"><i class="fas fa-calendar mr-2"></i>Order Date:</span>
                                <span class="font-semibold text-gray-900">${new Date(order.order_date).toLocaleString()}</span>
                            </div>
                            <div>
                                <span class="text-gray-600"><i class="fas fa-box mr-2"></i>Items:</span>
                                <span class="font-semibold text-gray-900">${order.total_items || 0}</span>
                            </div>
                            ${order.pickup_date ? `
                            <div>
                                <span class="text-gray-600"><i class="fas fa-clock mr-2"></i>Pickup:</span>
                                <span class="font-semibold text-gray-900">${new Date(order.pickup_date).toLocaleString()}</span>
                            </div>
                            ` : ''}
                            <div>
                                <span class="text-gray-600"><i class="fas fa-credit-card mr-2"></i>Payment:</span>
                                <span class="font-semibold text-gray-900">${order.payment_method || 'N/A'}</span>
                            </div>
                        </div>
                        
                        ${order.notes ? `
                        <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p class="text-sm text-gray-700">
                                <i class="fas fa-sticky-note mr-2 text-blue-600"></i>
                                <strong>Notes:</strong> ${order.notes}
                            </p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex flex-col gap-3 lg:ml-6 lg:min-w-[200px]">
                        <div class="text-right lg:text-left">
                            <p class="text-sm text-gray-600 mb-1">Total Amount</p>
                            <p class="text-3xl font-bold text-amber-600">₱${parseFloat(order.total_amount).toFixed(2)}</p>
                        </div>
                        
                        <div class="flex flex-col gap-2">
                            <button onclick="viewOrderDetails(${order.id})" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                                <i class="fas fa-eye mr-2"></i>View Details
                            </button>
                            
                            ${order.status !== 'completed' && order.status !== 'cancelled' ? `
                                <div class="relative">
                                    <select onchange="updateOrderStatus(${order.id}, this.value)" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm appearance-none cursor-pointer">
                                        <option value="">Change Status</option>
                                        ${order.status !== 'confirmed' ? '<option value="confirmed">Confirm Order</option>' : ''}
                                        ${order.status !== 'preparing' ? '<option value="preparing">Start Preparing</option>' : ''}
                                        ${order.status !== 'ready' ? '<option value="ready">Mark as Ready</option>' : ''}
                                        ${order.status !== 'completed' ? '<option value="completed">Complete Order</option>' : ''}
                                        <option value="cancelled">Cancel Order</option>
                                    </select>
                                    <i class="fas fa-chevron-down absolute right-3 top-3 text-gray-400 pointer-events-none"></i>
                                </div>
                            ` : ''}
                            
                            ${order.payment_status === 'pending' ? `
                                <button onclick="markAsPaid(${order.id})" class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                                    <i class="fas fa-check-circle mr-2"></i>Mark as Paid
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update statistics
function updateStatistics() {
    const stats = {
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        preparing: allOrders.filter(o => o.status === 'preparing').length,
        completed: allOrders.filter(o => o.status === 'completed').length,
        revenue: allOrders
            .filter(o => o.payment_status === 'paid')
            .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
    };
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-preparing').textContent = stats.preparing;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-revenue').textContent = '₱' + stats.revenue.toFixed(2);
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value.toLowerCase();
    const paymentFilter = document.getElementById('payment-filter').value.toLowerCase();
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    filteredOrders = allOrders.filter(order => {
        const matchesStatus = !statusFilter || order.status.toLowerCase() === statusFilter;
        const matchesPayment = !paymentFilter || order.payment_status.toLowerCase() === paymentFilter;
        const matchesSearch = !searchTerm || 
            order.order_number.toLowerCase().includes(searchTerm) ||
            (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm)) ||
            (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm));
        
        return matchesStatus && matchesPayment && matchesSearch;
    });
    
    displayOrders();
}

// Reset filters
function resetFilters() {
    document.getElementById('status-filter').value = '';
    document.getElementById('payment-filter').value = '';
    document.getElementById('search-input').value = '';
    filteredOrders = [...allOrders];
    displayOrders();
}

// View order details
async function viewOrderDetails(orderId) {
    document.getElementById('order-details-modal').classList.remove('hidden');
    
    try {
        const response = await fetch(`../api/orders.php?action=get_order_details&order_id=${orderId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            displayOrderDetails(data.order);
        } else {
            showNotification('Failed to load order details: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Network error loading order details', 'error');
    }
}

// Display order details in modal
function displayOrderDetails(order) {
    const container = document.getElementById('order-details-content');
    
    const statusColors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-blue-100 text-blue-800',
        'preparing': 'bg-orange-100 text-orange-800',
        'ready': 'bg-green-100 text-green-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    
    const paymentStatusColors = {
        'paid': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'failed': 'bg-red-100 text-red-800'
    };
    
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
        itemsHTML = order.items.map(item => `
            <div class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <img src="../${item.product_image || 'uploads/products/placeholder.jpg'}" 
                     alt="${item.product_name}" 
                     class="w-20 h-20 object-cover rounded-lg border border-gray-200"
                     onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${item.product_name}</h4>
                    ${item.size_name ? `<p class="text-sm text-gray-600">Size: ${item.size_name}</p>` : ''}
                    <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                    <p class="text-sm text-gray-600">Unit Price: ₱${parseFloat(item.unit_price).toFixed(2)}</p>
                </div>
                <div class="text-right">
                    <p class="text-lg font-bold text-gray-900">₱${parseFloat(item.total_price).toFixed(2)}</p>
                </div>
            </div>
        `).join('');
    } else {
        itemsHTML = '<p class="text-center text-gray-500 py-4">No items found</p>';
    }
    
    container.innerHTML = `
        <!-- Order Header -->
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
            <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">${order.order_number}</h2>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}">
                            ${order.status.toUpperCase()}
                        </span>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}">
                            ${order.payment_status.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p class="text-3xl font-bold text-amber-600">₱${parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-purple-200">
                <div>
                    <p class="text-sm text-gray-600"><i class="fas fa-user mr-2"></i>Customer</p>
                    <p class="font-semibold text-gray-900">${order.customer_name || 'Guest Customer'}</p>
                    ${order.customer_email ? `<p class="text-sm text-gray-600">${order.customer_email}</p>` : ''}
                    ${order.customer_phone ? `<p class="text-sm text-gray-600"><i class="fas fa-phone mr-2"></i>${order.customer_phone}</p>` : ''}
                </div>
                <div>
                    <p class="text-sm text-gray-600"><i class="fas fa-calendar mr-2"></i>Order Date</p>
                    <p class="font-semibold text-gray-900">${new Date(order.order_date).toLocaleString()}</p>
                    ${order.pickup_date ? `
                        <p class="text-sm text-gray-600 mt-2"><i class="fas fa-clock mr-2"></i>Pickup Date</p>
                        <p class="font-semibold text-gray-900">${new Date(order.pickup_date).toLocaleString()}</p>
                    ` : ''}
                </div>
            </div>
            
            ${order.delivery_address ? `
                <div class="mt-4 pt-4 border-t border-purple-200">
                    <p class="text-sm text-gray-600"><i class="fas fa-map-marker-alt mr-2"></i>Delivery Address</p>
                    <p class="font-semibold text-gray-900">${order.delivery_address}</p>
                </div>
            ` : ''}
            
            ${order.notes ? `
                <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p class="text-sm text-gray-700">
                        <i class="fas fa-sticky-note mr-2 text-blue-600"></i>
                        <strong>Notes:</strong> ${order.notes}
                    </p>
                </div>
            ` : ''}
        </div>
        
        <!-- Payment Information -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">
                <i class="fas fa-credit-card mr-2 text-purple-600"></i>Payment Information
            </h3>
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="text-gray-600">Payment Method:</span>
                        <span class="ml-2 font-semibold text-gray-900">${order.payment_method || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Payment Status:</span>
                        <span class="ml-2 px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}">
                            ${order.payment_status.toUpperCase()}
                        </span>
                    </div>
                    ${order.paid_at ? `
                    <div>
                        <span class="text-gray-600">Paid At:</span>
                        <span class="ml-2 font-semibold text-gray-900">${new Date(order.paid_at).toLocaleString()}</span>
                    </div>
                    ` : ''}
                    ${order.payment_intent_id ? `
                    <div class="col-span-2">
                        <span class="text-gray-600">Payment Intent ID:</span>
                        <span class="ml-2 font-mono text-xs text-gray-900">${order.payment_intent_id}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <!-- Order Items -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">
                <i class="fas fa-box mr-2 text-purple-600"></i>Order Items
            </h3>
            <div class="space-y-3">
                ${itemsHTML}
            </div>
        </div>
        
        <!-- Order Summary -->
        <div class="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
            <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-900">Order Total</span>
                <span class="text-2xl font-bold text-amber-600">₱${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
        </div>
    `;
}

// Hide order details modal
function hideOrderDetailsModal() {
    document.getElementById('order-details-modal').classList.add('hidden');
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;
    
    // Reset the select dropdown
    event.target.value = '';
    
    if (!confirm(`Are you sure you want to change the order status to "${newStatus}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`../api/orders.php?action=update_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                order_id: orderId,
                status: newStatus
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Order status updated to ${newStatus}`, 'success');
            loadOrders(); // Reload orders
        } else {
            showNotification('Failed to update order status: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Network error updating order status', 'error');
    }
}

// Mark order as paid
async function markAsPaid(orderId) {
    if (!confirm('Are you sure you want to mark this order as paid?')) {
        return;
    }
    
    try {
        const response = await fetch(`../api/orders.php?action=update_payment_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                order_id: orderId,
                payment_status: 'paid'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Order marked as paid successfully', 'success');
            loadOrders(); // Reload orders
        } else {
            showNotification('Failed to update payment status: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
        showNotification('Network error updating payment status', 'error');
    }
}

// Display error
function displayError(message) {
    const container = document.getElementById('orders-list');
    container.innerHTML = `
        <div class="text-center text-red-500 py-12">
            <i class="fas fa-exclamation-circle text-6xl mb-4"></i>
            <p class="text-xl mb-2">${message}</p>
            <button onclick="loadOrders()" class="mt-4 bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700">
                <i class="fas fa-redo mr-2"></i>Try Again
            </button>
        </div>
    `;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Admin logout function (if not already defined in admin.js)
async function adminLogout() {
    if (confirm('Are you sure you want to logout from the admin panel?')) {
        try {
            const response = await fetch('../api/auth.php?action=logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                showNotification('Logout failed', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Logout failed', 'error');
        }
    }
}

