// Orders JavaScript for Antoinette's Pastries
let currentUser = null;
let orders = [];
let filteredOrders = [];
let currentPage = 1;
let ordersPerPage = 10;
let currentFilter = '';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    // Load navigation
    loadNavigation();
    
    // Load user orders
    loadOrders();
    
    // Setup event listeners
    setupEventListeners();
});

// Load navigation component
async function loadNavigation() {
    try {
        const response = await fetch('components/navigation.html');
        const html = await response.text();
        document.getElementById('navigation-container').innerHTML = html;
        
        // Initialize navigation functionality
        initNavigation();
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Status filter
    document.getElementById('status-filter').addEventListener('change', function() {
        currentFilter = this.value;
        filterOrders();
    });
    
    // Search input
    document.getElementById('search-orders').addEventListener('input', function() {
        currentSearch = this.value.toLowerCase();
        filterOrders();
    });
    
    // Pagination
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayOrders();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayOrders();
        }
    });
}

// Load user orders
async function loadOrders() {
    showLoading(true);
    hideError();
    hideEmptyState();
    hideOrdersContent();
    
    try {
        // First check if user is authenticated
        const authResponse = await fetch('api/auth.php?action=check');
        const authData = await authResponse.json();
        
        if (!authData.success) {
            window.location.href = 'auth.html';
            return;
        }
        
        currentUser = authData.user;
        
        // Load orders
        const response = await fetch('api/orders.php?action=get_user_orders');
        const data = await response.json();
        
        if (data.success) {
            orders = data.orders || [];
            filteredOrders = [...orders];
            displayOrders();
            showOrdersContent();
        } else {
            if (data.message === 'Authentication required') {
                window.location.href = 'auth.html';
            } else {
                showError(data.message);
            }
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Filter orders based on status and search
function filterOrders() {
    filteredOrders = orders.filter(order => {
        const matchesStatus = !currentFilter || order.status === currentFilter;
        const matchesSearch = !currentSearch || 
            order.order_number.toLowerCase().includes(currentSearch) ||
            order.status.toLowerCase().includes(currentSearch) ||
            order.total_amount.toString().includes(currentSearch);
        
        return matchesStatus && matchesSearch;
    });
    
    currentPage = 1;
    displayOrders();
}

// Display orders
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    const ordersCount = document.getElementById('orders-count');
    const pagination = document.getElementById('pagination');
    
    // Update count
    ordersCount.textContent = `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} found`;
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '';
        pagination.classList.add('hidden');
        if (orders.length === 0) {
            showEmptyState();
        }
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, filteredOrders.length);
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    // Display orders
    ordersList.innerHTML = pageOrders.map(order => createOrderCard(order)).join('');
    
    // Update pagination
    updatePagination(totalPages);
}

// Create order card HTML
function createOrderCard(order) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        preparing: 'bg-orange-100 text-orange-800',
        ready: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    
    const statusIcons = {
        pending: 'fa-clock',
        confirmed: 'fa-check-circle',
        preparing: 'fa-utensils',
        ready: 'fa-bell',
        completed: 'fa-check-double',
        cancelled: 'fa-times-circle'
    };
    
    const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800';
    const statusIcon = statusIcons[order.status] || 'fa-question-circle';
    
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div class="p-6">
                <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h3 class="text-lg font-semibold text-gray-900 truncate">Order #${order.order_number}</h3>
                            <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColor} inline-flex items-center w-fit">
                                <i class="fas ${statusIcon} mr-1"></i>
                                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div class="flex items-center">
                                <i class="fas fa-calendar mr-2 text-gray-400"></i>
                                <span>Ordered: ${formatDate(order.order_date)}</span>
                            </div>
                            ${order.pickup_date ? `
                                <div class="flex items-center">
                                    <i class="fas fa-calendar-check mr-2 text-gray-400"></i>
                                    <span>Pickup: ${formatDate(order.pickup_date)}</span>
                                </div>
                            ` : ''}
                            <div class="flex items-center">
                                <i class="fas fa-dollar-sign mr-2 text-gray-400"></i>
                                <span class="font-semibold text-gray-900">Total: $${(typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount)).toFixed(2)}</span>
                            </div>
                            ${order.notes ? `
                                <div class="flex items-start col-span-2">
                                    <i class="fas fa-sticky-note mr-2 text-gray-400 mt-0.5"></i>
                                    <span class="text-xs">${order.notes}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4 lg:flex-col lg:min-w-fit">
                        <button onclick="viewOrderDetails(${order.id})" class="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors text-sm font-medium inline-flex items-center justify-center">
                            <i class="fas fa-eye mr-2"></i>View Details
                        </button>
                        ${order.status === 'pending' ? `
                            <button onclick="cancelOrder(${order.id})" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium inline-flex items-center justify-center">
                                <i class="fas fa-times mr-2"></i>Cancel Order
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update pagination controls
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    
    if (totalPages <= 1) {
        pagination.classList.add('hidden');
        pagination.classList.remove('flex');
        return;
    }
    
    pagination.classList.remove('hidden');
    pagination.classList.add('flex');
    
    // Update prev/next buttons
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    
    // Generate page numbers
    let pageNumbersHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pageNumbersHTML += `
            <button onclick="goToPage(${i})" class="px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                isActive 
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }">
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pageNumbersHTML;
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    displayOrders();
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`api/orders.php?action=get_order_details&order_id=${orderId}`);
        const data = await response.json();
        
        if (data.success) {
            displayOrderModal(data.order);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Failed to load order details', 'error');
    }
}

// Display order details modal
function displayOrderModal(order) {
    const modal = document.getElementById('order-modal');
    const content = document.getElementById('order-details-content');
    
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        preparing: 'bg-orange-100 text-orange-800',
        ready: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    
    const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800';
    
    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Order Info -->
            <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Order Information</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Order Number:</span>
                            <span class="font-medium">#${order.order_number}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Status:</span>
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Order Date:</span>
                            <span class="font-medium">${formatDate(order.order_date)}</span>
                        </div>
                        ${order.pickup_date ? `
                            <div class="flex justify-between">
                                <span class="text-gray-600">Pickup Date:</span>
                                <span class="font-medium">${formatDate(order.pickup_date)}</span>
                            </div>
                        ` : ''}
                         <div class="flex justify-between">
                             <span class="text-gray-600">Total Amount:</span>
                             <span class="font-bold text-lg">$${(typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount)).toFixed(2)}</span>
                         </div>
                    </div>
                </div>
                
                ${order.notes ? `
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">Order Notes</h4>
                        <p class="text-sm text-gray-600">${order.notes}</p>
                    </div>
                ` : ''}
            </div>
            
            <!-- Order Items -->
            <div>
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div class="space-y-3">
                        ${order.items.map(item => `
                            <div class="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100">
                                ${item.product_image ? `
                                    <img src="${item.product_image}" alt="Product" class="w-16 h-16 object-cover rounded-md">
                                ` : `
                                    <div class="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                        <i class="fas fa-image text-gray-400"></i>
                                    </div>
                                `}
                                <div class="flex-1 min-w-0">
                                    <h5 class="font-semibold text-gray-900 text-lg mb-1">${item.product_name}</h5>
                                    <p class="text-sm text-gray-600 mb-2">Quantity: ${item.quantity}</p>
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-500">Unit Price: $${(typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price)).toFixed(2)}</span>
                                        <span class="font-bold text-lg text-gray-900">$${(typeof item.total_price === 'number' ? item.total_price : parseFloat(item.total_price)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close order modal
function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

// Cancel order
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    try {
        const response = await fetch('api/orders.php?action=cancel_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order_id: orderId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Order cancelled successfully', 'success');
            loadOrders(); // Reload orders
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification('Failed to cancel order', 'error');
    }
}

// Show loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
        loading.classList.add('flex');
    } else {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

// Show error state
function showError(message) {
    const errorState = document.getElementById('error-state');
    const errorMessage = errorState.querySelector('p');
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
}

// Hide error state
function hideError() {
    document.getElementById('error-state').classList.add('hidden');
}

// Show empty state
function showEmptyState() {
    document.getElementById('empty-state').classList.remove('hidden');
}

// Hide empty state
function hideEmptyState() {
    document.getElementById('empty-state').classList.add('hidden');
}

// Show orders content
function showOrdersContent() {
    document.getElementById('orders-content').classList.remove('hidden');
}

// Hide orders content
function hideOrdersContent() {
    document.getElementById('orders-content').classList.add('hidden');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' :
                   type === 'error' ? 'bg-red-500' :
                   type === 'warning' ? 'bg-yellow-500' :
                   'bg-blue-500';
    
    const icon = type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle';
    
    notification.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-4 flex items-center`;
    notification.innerHTML = `
        <i class="fas ${icon} mr-3"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
