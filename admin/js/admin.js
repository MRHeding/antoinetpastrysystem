// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    loadProducts();
    loadRecentOrders();
    
    // Setup form submission
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
});

// Load dashboard statistics
async function loadDashboardData() {
    try {
        // In a real app, you'd have separate API endpoints for these stats
        const response = await fetch('../api/products.php');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('total-products').textContent = data.data.length;
        }
        
        // Mock data for other stats (in real app, these would come from separate API calls)
        document.getElementById('total-orders').textContent = '24';
        document.getElementById('total-customers').textContent = '156';
        document.getElementById('total-revenue').textContent = '$2,847';
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load products for management
async function loadProducts() {
    try {
        const response = await fetch('../api/products.php');
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data);
        } else {
            displayError('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        displayError('Network error loading products');
    }
}

// Display products in admin interface
function displayProducts(products) {
    const container = document.getElementById('products-list');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-box-open text-4xl mb-4"></i>
                <p>No products found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">${product.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">${product.description}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span><i class="fas fa-tag mr-1"></i>$${product.price}</span>
                        <span><i class="fas fa-folder mr-1"></i>${product.category}</span>
                        <span><i class="fas fa-calendar mr-1"></i>${new Date(product.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load recent orders (mock data for now)
function loadRecentOrders() {
    const container = document.getElementById('recent-orders');
    
    // Mock recent orders data
    const mockOrders = [
        { id: 1, customer: 'John Doe', total: 24.50, status: 'pending', date: '2024-01-15' },
        { id: 2, customer: 'Jane Smith', total: 18.75, status: 'confirmed', date: '2024-01-15' },
        { id: 3, customer: 'Bob Johnson', total: 32.00, status: 'ready', date: '2024-01-14' },
        { id: 4, customer: 'Alice Brown', total: 15.25, status: 'completed', date: '2024-01-14' },
        { id: 5, customer: 'Charlie Wilson', total: 28.50, status: 'preparing', date: '2024-01-13' }
    ];
    
    container.innerHTML = mockOrders.map(order => `
        <div class="border-b border-gray-200 pb-3 mb-3 last:border-b-0">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-medium text-gray-900">Order #${order.id}</p>
                    <p class="text-sm text-gray-600">${order.customer}</p>
                    <p class="text-sm text-gray-500">$${order.total}</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${order.status}
                </span>
            </div>
        </div>
    `).join('');
}

// Show add product modal
function showAddProductModal() {
    document.getElementById('add-product-modal').classList.remove('hidden');
}

// Hide add product modal
function hideAddProductModal() {
    document.getElementById('add-product-modal').classList.add('hidden');
    document.getElementById('add-product-form').reset();
}

// Handle add product form submission
async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category')
    };
    
    try {
        const response = await fetch('../api/products.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product added successfully!', 'success');
            hideAddProductModal();
            loadProducts();
            loadDashboardData();
        } else {
            showNotification('Error adding product: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Network error adding product', 'error');
    }
}

// Edit product
function editProduct(productId) {
    showNotification('Edit functionality coming soon!', 'info');
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`../api/products.php?id=${productId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product deleted successfully!', 'success');
            loadProducts();
            loadDashboardData();
        } else {
            showNotification('Error deleting product: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Network error deleting product', 'error');
    }
}

// Display error message
function displayError(message) {
    const container = document.getElementById('products-list');
    container.innerHTML = `
        <div class="text-center text-red-500 py-8">
            <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p>${message}</p>
            <button onclick="loadProducts()" class="mt-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
                Try Again
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

// Admin logout function
async function adminLogout() {
    if (confirm('Are you sure you want to logout from the admin panel?')) {
        try {
            const response = await fetch('../api/auth.php?action=logout', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
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


