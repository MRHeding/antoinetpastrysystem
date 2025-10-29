// Admin Dashboard JavaScript
let productSizes = { add: [], edit: [] }; // Store sizes for add and edit modals

document.addEventListener('DOMContentLoaded', function() {
    // Only load dashboard-specific functions if we're on the dashboard page
    const isDashboardPage = document.getElementById('total-products') !== null;
    
    if (isDashboardPage) {
        loadDashboardData();
        loadProducts();
        loadRecentOrders();
        
        // Setup form submission
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', handleAddProduct);
        }
        
        // Setup status change handlers
        setupStatusChangeHandlers();
    }
    
    // Initialize mobile menu (available on all admin pages)
    initAdminMobileMenu();
});

// Load dashboard statistics
async function loadDashboardData() {
    try {
        const response = await fetch('../api/admin-stats.php', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            document.getElementById('total-products').textContent = stats.total_products;
            document.getElementById('total-orders').textContent = stats.total_orders;
            document.getElementById('total-customers').textContent = stats.total_customers;
            document.getElementById('total-revenue').textContent = '₱' + stats.total_revenue.toFixed(2);
        } else {
            console.error('Failed to load dashboard data:', data.message);
            // Fallback to showing dashes if API fails
            document.getElementById('total-products').textContent = '-';
            document.getElementById('total-orders').textContent = '-';
            document.getElementById('total-customers').textContent = '-';
            document.getElementById('total-revenue').textContent = '-';
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to showing dashes if API fails
        document.getElementById('total-products').textContent = '-';
        document.getElementById('total-orders').textContent = '-';
        document.getElementById('total-customers').textContent = '-';
        document.getElementById('total-revenue').textContent = '-';
    }
}

// Load products for management
async function loadProducts() {
    try {
        const response = await fetch('../api/products.php', {
            credentials: 'include'
        });
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
    
    // Check if container exists (might not exist on non-dashboard pages)
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-box-open text-4xl mb-4"></i>
                <p>No products found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => {
        // Determine image source
        const imageSrc = product.image_url 
            ? `../${product.image_url}` 
            : 'https://via.placeholder.com/150?text=No+Image';
        
        // Determine status badge
        const statusBadge = product.availability_status === 'available' 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><i class="fas fa-check-circle mr-1"></i>Available</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><i class="fas fa-times-circle mr-1"></i>Unavailable</span>';
            
        return `
        <div class="border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 hover:shadow-md transition-shadow bg-white">
            <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div class="flex-1 flex flex-col sm:flex-row gap-4 sm:space-x-6 w-full">
                    <div class="flex-shrink-0 mx-auto sm:mx-0">
                        <img src="${imageSrc}" alt="${product.name}" class="w-32 h-32 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 shadow-sm">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                            <h3 class="text-lg font-semibold text-gray-900">${product.name}</h3>
                            ${statusBadge}
                        </div>
                        <p class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">${product.description}</p>
                        ${product.unavailable_reason ? `<p class="text-sm text-red-600 mb-2"><i class="fas fa-info-circle mr-1"></i>Reason: ${product.unavailable_reason}</p>` : ''}
                        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                            <span class="flex items-center"><i class="fas fa-tag mr-2"></i>₱${product.price}</span>
                            <span class="flex items-center"><i class="fas fa-folder mr-2"></i>${product.category}</span>
                            <span class="flex items-center"><i class="fas fa-calendar mr-2"></i>${new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="flex flex-row sm:flex-col gap-2 w-full sm:w-auto sm:ml-6">
                    <button onclick="toggleProductStatus(${product.id}, '${product.availability_status}')" 
                            class="flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs font-medium rounded-md transition-colors ${product.availability_status === 'available' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}"
                            title="${product.availability_status === 'available' ? 'Mark as Unavailable' : 'Mark as Available'}">
                        <i class="fas ${product.availability_status === 'available' ? 'fa-times' : 'fa-check'} mr-1"></i>
                        ${product.availability_status === 'available' ? 'Unavailable' : 'Available'}
                    </button>
                    <div class="flex gap-2 flex-1 sm:flex-none">
                        <button onclick="editProduct(${product.id})" class="flex-1 sm:flex-none text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors border border-blue-200">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct(${product.id})" class="flex-1 sm:flex-none text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors border border-red-200">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const response = await fetch('../api/admin-stats.php', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.data.recent_orders) {
            displayRecentOrders(data.data.recent_orders);
        } else {
            displayRecentOrdersError('Failed to load recent orders');
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        displayRecentOrdersError('Network error loading orders');
    }
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recent-orders');
    
    // Check if container exists (might not exist on non-dashboard pages)
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-shopping-cart text-4xl mb-4"></i>
                <p>No orders found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="border-b border-gray-200 pb-3 mb-3 last:border-b-0">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-medium text-gray-900">Order #${order.order_number}</p>
                    <p class="text-sm text-gray-600">${order.customer_name || 'Guest Customer'}</p>
                    <p class="text-sm text-gray-500">₱${parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${order.status}
                </span>
            </div>
        </div>
    `).join('');
}

function displayRecentOrdersError(message) {
    const container = document.getElementById('recent-orders');
    
    // Check if container exists (might not exist on non-dashboard pages)
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center text-red-500 py-8">
            <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p>${message}</p>
            <button onclick="loadRecentOrders()" class="mt-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
                Try Again
            </button>
        </div>
    `;
}

// Add size row to the form
function addSizeRow(modalType) {
    const container = document.getElementById(`${modalType}-sizes-container`);
    const index = productSizes[modalType].length;
    
    const sizeRow = document.createElement('div');
    sizeRow.className = 'flex items-center space-x-2 bg-gray-50 p-2 rounded';
    sizeRow.setAttribute('data-index', index);
    
    sizeRow.innerHTML = `
        <input type="text" placeholder="Size name (e.g., Small, Medium)" 
               class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md" 
               data-field="size_name" required>
        <input type="text" placeholder="Code (S, M, L)" 
               class="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md" 
               data-field="size_code" maxlength="10" required>
        <input type="number" placeholder="Price" step="0.01" 
               class="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md" 
               data-field="price" required>
        <button type="button" onclick="removeSizeRow('${modalType}', ${index})" 
                class="text-red-600 hover:text-red-800 px-2">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    container.appendChild(sizeRow);
    productSizes[modalType].push({ size_name: '', size_code: '', price: 0 });
}

// Remove size row
function removeSizeRow(modalType, index) {
    const container = document.getElementById(`${modalType}-sizes-container`);
    const row = container.querySelector(`[data-index="${index}"]`);
    if (row) {
        row.remove();
        productSizes[modalType].splice(index, 1);
        // Update indices
        updateSizeIndices(modalType);
    }
}

// Update size row indices after deletion
function updateSizeIndices(modalType) {
    const container = document.getElementById(`${modalType}-sizes-container`);
    const rows = container.querySelectorAll('[data-index]');
    rows.forEach((row, idx) => {
        row.setAttribute('data-index', idx);
        const deleteBtn = row.querySelector('button');
        deleteBtn.setAttribute('onclick', `removeSizeRow('${modalType}', ${idx})`);
    });
}

// Get sizes from form
function getSizesFromForm(modalType) {
    const container = document.getElementById(`${modalType}-sizes-container`);
    const rows = container.querySelectorAll('[data-index]');
    const sizes = [];
    
    rows.forEach(row => {
        const size_name = row.querySelector('[data-field="size_name"]').value;
        const size_code = row.querySelector('[data-field="size_code"]').value;
        const price = row.querySelector('[data-field="price"]').value;
        const id = row.getAttribute('data-size-id');
        
        if (size_name && size_code && price) {
            const sizeData = {
                size_name: size_name,
                size_code: size_code,
                price: parseFloat(price),
                is_available: 1
            };
            
            if (id) {
                sizeData.id = id;
            }
            
            sizes.push(sizeData);
        }
    });
    
    return sizes;
}

// Show add product modal
function showAddProductModal() {
    document.getElementById('add-product-modal').classList.remove('hidden');
    // Reset the image preview when opening the modal
    const imagePreviewContainer = document.getElementById('image-preview-container');
    if (imagePreviewContainer) {
        imagePreviewContainer.classList.add('hidden');
    }
    document.getElementById('file-name-display').textContent = 'No file selected';
    
    // Reset sizes
    productSizes.add = [];
    document.getElementById('add-sizes-container').innerHTML = '';
    // Add one default size row
    addSizeRow('add');
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
    
    // Check if we have an image file
    const hasImageFile = formData.get('product_image') && formData.get('product_image').size > 0;
    
    try {
        let response;
        
        if (hasImageFile) {
            // Use FormData directly for file upload
            response = await fetch('../api/products.php', {
                method: 'POST',
                credentials: 'include',
                body: formData // FormData automatically sets the correct Content-Type
            });
        } else {
            // No image, use JSON as before
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                availability_status: formData.get('availability_status')
            };
            
            // Add unavailable reason if status is unavailable
            const status = formData.get('availability_status');
            if (status === 'unavailable') {
                productData.unavailable_reason = formData.get('unavailable_reason');
            }
            
            response = await fetch('../api/products.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(productData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Save product sizes
            const sizes = getSizesFromForm('add');
            if (sizes.length > 0) {
                await saveProductSizes(result.id, sizes);
            }
            
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

// Save product sizes
async function saveProductSizes(productId, sizes) {
    try {
        for (const size of sizes) {
            const sizeData = {
                product_id: productId,
                ...size
            };
            
            if (size.id) {
                // Update existing size
                await fetch(`../api/product-sizes.php?id=${size.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(size)
                });
            } else {
                // Create new size
                await fetch('../api/product-sizes.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(sizeData)
                });
            }
        }
    } catch (error) {
        console.error('Error saving product sizes:', error);
    }
}

// Initialize image preview functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only set up forms if we're on the dashboard page
    const isDashboardPage = document.getElementById('total-products') !== null;
    
    if (isDashboardPage) {
        // Setup form submission - ensure this is properly attached
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', handleAddProduct);
        } else {
            console.error('Add product form not found!');
        }
        
        // Setup edit product form submission
        const editProductForm = document.getElementById('edit-product-form');
        if (editProductForm) {
            editProductForm.addEventListener('submit', handleEditProduct);
        } else {
            console.error('Edit product form not found!');
        }
        
        // Setup image preview
        initImagePreview();
    }
});

// Initialize image preview functionality
function initImagePreview() {
    const imageInput = document.getElementById('product-image-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                fileNameDisplay.textContent = file.name;
                
                // Show image preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                fileNameDisplay.textContent = 'No file selected';
                imagePreviewContainer.classList.add('hidden');
            }
        });
    }
}

// Edit product
async function editProduct(productId) {
    try {
        const response = await fetch(`../api/products.php?id=${productId}`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            const product = result.data;
            
            // Populate form fields
            document.getElementById('edit-product-id').value = product.id;
            document.getElementById('edit-product-name').value = product.name;
            document.getElementById('edit-product-description').value = product.description;
            document.getElementById('edit-product-price').value = product.price;
            document.getElementById('edit-product-category').value = product.category;
            
            // Set availability status
            const statusSelect = document.getElementById('edit-product-status');
            if (statusSelect) {
                statusSelect.value = product.availability_status || 'available';
            }
            
            // Handle unavailable reason
            const reasonField = document.getElementById('edit-unavailable-reason-container');
            const reasonInput = document.getElementById('edit-product-reason');
            if (product.availability_status === 'unavailable') {
                if (reasonField) reasonField.style.display = 'block';
                if (reasonInput) reasonInput.value = product.unavailable_reason || '';
            } else {
                if (reasonField) reasonField.style.display = 'none';
                if (reasonInput) reasonInput.value = '';
            }
            
            // Handle image preview
            const imagePreview = document.getElementById('edit-image-preview');
            if (product.image_url) {
                imagePreview.src = `../${product.image_url}`;
                document.getElementById('edit-image-preview-container').classList.remove('hidden');
                document.getElementById('edit-file-name-display').textContent = product.image_url.split('/').pop();
            } else {
                imagePreview.src = 'https://via.placeholder.com/150?text=No+Image';
                document.getElementById('edit-file-name-display').textContent = 'No image';
            }
            
            // Load product sizes
            await loadProductSizesForEdit(productId);
            
            // Show modal
            document.getElementById('edit-product-modal').classList.remove('hidden');
            
            // Setup image preview for new uploads
            initEditImagePreview();
        } else {
            showNotification('Error loading product details', 'error');
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        showNotification('Network error loading product details', 'error');
    }
}

// Load product sizes for editing
async function loadProductSizesForEdit(productId) {
    try {
        const response = await fetch(`../api/product-sizes.php?product_id=${productId}`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        // Reset sizes container
        productSizes.edit = [];
        const container = document.getElementById('edit-sizes-container');
        container.innerHTML = '';
        
        if (result.success && result.data && result.data.length > 0) {
            // Add existing sizes
            result.data.forEach(size => {
                const index = productSizes.edit.length;
                const sizeRow = document.createElement('div');
                sizeRow.className = 'flex items-center space-x-2 bg-gray-50 p-2 rounded';
                sizeRow.setAttribute('data-index', index);
                sizeRow.setAttribute('data-size-id', size.id);
                
                sizeRow.innerHTML = `
                    <input type="text" placeholder="Size name (e.g., Small, Medium)" 
                           value="${size.size_name}"
                           class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md" 
                           data-field="size_name" required>
                    <input type="text" placeholder="Code (S, M, L)" 
                           value="${size.size_code}"
                           class="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md" 
                           data-field="size_code" maxlength="10" required>
                    <input type="number" placeholder="Price" step="0.01" 
                           value="${size.price}"
                           class="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md" 
                           data-field="price" required>
                    <button type="button" onclick="removeSizeRow('edit', ${index})" 
                            class="text-red-600 hover:text-red-800 px-2">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                container.appendChild(sizeRow);
                productSizes.edit.push({ ...size });
            });
        } else {
            // Add one default size row if no sizes exist
            addSizeRow('edit');
        }
    } catch (error) {
        console.error('Error loading product sizes:', error);
        // Add one default size row on error
        addSizeRow('edit');
    }
}

// Initialize edit image preview functionality
function initEditImagePreview() {
    const imageInput = document.getElementById('edit-product-image-input');
    const fileNameDisplay = document.getElementById('edit-file-name-display');
    const imagePreviewContainer = document.getElementById('edit-image-preview-container');
    const imagePreview = document.getElementById('edit-image-preview');
    
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                fileNameDisplay.textContent = file.name;
                
                // Show image preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Hide edit product modal
function hideEditProductModal() {
    document.getElementById('edit-product-modal').classList.add('hidden');
}

// Handle edit product form submission
async function handleEditProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productId = formData.get('product_id');
    
    // Check if we have an image file
    const hasImageFile = formData.get('product_image') && formData.get('product_image').size > 0;
    
    try {
        let response;
        
        if (hasImageFile) {
            // Use FormData directly for file upload
            formData.append('_method', 'PUT'); // Simulate PUT request
            response = await fetch(`../api/products.php?id=${productId}`, {
                method: 'POST',
                credentials: 'include',
                body: formData // FormData automatically sets the correct Content-Type
            });
        } else {
            // No image, use JSON as before
            const productData = {
                id: productId,
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                availability_status: formData.get('availability_status')
            };
            
            // Add unavailable reason if status is unavailable
            const status = formData.get('availability_status');
            if (status === 'unavailable') {
                productData.unavailable_reason = formData.get('unavailable_reason');
            }
            
            response = await fetch(`../api/products.php?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(productData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Save product sizes
            const sizes = getSizesFromForm('edit');
            if (sizes.length > 0) {
                await saveProductSizes(productId, sizes);
            }
            
            showNotification('Product updated successfully!', 'success');
            hideEditProductModal();
            loadProducts();
        } else {
            showNotification('Error updating product: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Network error updating product', 'error');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`../api/products.php?id=${productId}`, {
            method: 'DELETE',
            credentials: 'include'
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
    
    // Check if container exists (might not exist on non-dashboard pages)
    if (!container) return;
    
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

// Admin mobile menu functionality
function initAdminMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleAdminMobileMenu();
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                closeAdminMobileMenu();
            }
        });
        
        // Close mobile menu when window is resized to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                closeAdminMobileMenu();
            }
        });
    }
}

function toggleAdminMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenu && mobileMenuButton) {
        const isHidden = mobileMenu.classList.contains('hidden');
        
        if (isHidden) {
            openAdminMobileMenu();
        } else {
            closeAdminMobileMenu();
        }
    }
}

function openAdminMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.remove('hidden');
        mobileMenuButton.innerHTML = '<i class="fas fa-times text-xl"></i>';
        mobileMenuButton.setAttribute('aria-expanded', 'true');
    }
}

function closeAdminMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.innerHTML = '<i class="fas fa-bars text-xl"></i>';
        mobileMenuButton.setAttribute('aria-expanded', 'false');
    }
}

// Setup status change handlers
function setupStatusChangeHandlers() {
    // Handle status dropdown changes in modals
    const addStatusSelect = document.getElementById('add-availability-status');
    const editStatusSelect = document.getElementById('edit-availability-status');
    
    if (addStatusSelect) {
        addStatusSelect.addEventListener('change', function() {
            const reasonField = document.getElementById('add-unavailable-reason-field');
            if (this.value === 'unavailable') {
                reasonField.classList.remove('hidden');
            } else {
                reasonField.classList.add('hidden');
                document.getElementById('add-unavailable-reason').value = '';
            }
        });
    }
    
    if (editStatusSelect) {
        editStatusSelect.addEventListener('change', function() {
            const reasonField = document.getElementById('edit-unavailable-reason-field');
            if (this.value === 'unavailable') {
                reasonField.classList.remove('hidden');
            } else {
                reasonField.classList.add('hidden');
                document.getElementById('edit-unavailable-reason').value = '';
            }
        });
    }
}

// Toggle product status
async function toggleProductStatus(productId, currentStatus) {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    let reason = '';
    
    // If marking as unavailable, prompt for reason
    if (newStatus === 'unavailable') {
        reason = prompt('Please provide a reason for marking this product as unavailable:');
        if (reason === null) return; // User cancelled
        if (!reason.trim()) {
            showNotification('Please provide a reason for unavailability', 'error');
            return;
        }
    }
    
    // Show loading state
    const statusButton = document.querySelector(`[onclick="toggleProductStatus(${productId}, '${currentStatus}')"]`);
    const originalText = statusButton ? statusButton.innerHTML : '';
    if (statusButton) {
        statusButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Updating...';
        statusButton.disabled = true;
    }
    
    try {
        const requestData = {
            status: newStatus
        };
        if (reason) {
            requestData.reason = reason;
        }
        
        const response = await fetch(`../api/products.php?id=${productId}&action=status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Product status updated to ${newStatus}`, 'success');
            
            // Broadcast status change to other tabs/windows
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('product_status_updates');
                channel.postMessage({
                    type: 'status_update',
                    productId: productId,
                    status: newStatus,
                    reason: reason
                });
            }
            
            loadProducts(); // Refresh the product list
        } else {
            throw new Error(result.message || 'Failed to update product status');
        }
    } catch (error) {
        console.error('Error updating product status:', error);
        showNotification(`Network error updating product status: ${error.message}`, 'error');
        
        // Restore button state
        if (statusButton) {
            statusButton.innerHTML = originalText;
            statusButton.disabled = false;
        }
    }
}



// Listen for real-time status updates from other tabs/windows
if (typeof BroadcastChannel !== 'undefined') {
    const statusChannel = new BroadcastChannel('product_status_updates');
    statusChannel.addEventListener('message', function(event) {
        if (event.data.type === 'status_update') {
            // Update the product in the local array
            const productIndex = products.findIndex(p => p.id == event.data.productId);
            if (productIndex !== -1) {
                products[productIndex].availability_status = event.data.status;
                products[productIndex].unavailable_reason = event.data.reason || null;
                products[productIndex].status_updated_at = new Date().toISOString();
                
                // Refresh the display
                displayProducts();
                
                // Show notification
                showNotification(`Product status updated to ${event.data.status} by another admin`, 'info');
            }
        }
    });
}

// =============================================
// USER MANAGEMENT FUNCTIONS
// =============================================

// Show users section
function showUsersSection() {
    document.getElementById('users-modal').classList.remove('hidden');
    loadAllUsers();
}

// Hide users modal
function hideUsersModal() {
    document.getElementById('users-modal').classList.add('hidden');
}

// Load all users
async function loadAllUsers(role = '') {
    try {
        const url = role ? `../api/users.php?action=list&role=${role}` : '../api/users.php?action=list';
        const response = await fetch(url, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            displayUsers(data.data);
        } else {
            showNotification('Failed to load users: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Network error loading users', 'error');
    }
}

// Display users list
function displayUsers(users) {
    const container = document.getElementById('users-list');
    const countElement = document.getElementById('total-users-count');
    
    countElement.textContent = users.length;
    
    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-users text-4xl mb-4"></i>
                <p>No users found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = users.map(user => {
        const statusBadge = user.is_active == 1 
            ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"><i class="fas fa-check-circle mr-1"></i>Active</span>'
            : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"><i class="fas fa-times-circle mr-1"></i>Inactive</span>';
        
        const roleBadge = user.role === 'admin'
            ? '<span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800"><i class="fas fa-shield-alt mr-1"></i>Admin</span>'
            : '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"><i class="fas fa-user mr-1"></i>Customer</span>';
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div class="flex-1 w-full">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-3 mb-3">
                            <h4 class="text-lg font-semibold text-gray-900">${user.first_name} ${user.last_name}</h4>
                            <div class="flex flex-wrap gap-2">
                                ${roleBadge}
                                ${statusBadge}
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div class="truncate"><i class="fas fa-user mr-2 text-gray-400"></i><strong>Username:</strong> ${user.username}</div>
                            <div class="truncate"><i class="fas fa-envelope mr-2 text-gray-400"></i><strong>Email:</strong> ${user.email}</div>
                            <div><i class="fas fa-phone mr-2 text-gray-400"></i><strong>Phone:</strong> ${user.phone || 'N/A'}</div>
                            <div><i class="fas fa-map-marker-alt mr-2 text-gray-400"></i><strong>City:</strong> ${user.city || 'N/A'}</div>
                        </div>
                        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                            <span><i class="fas fa-shopping-cart mr-1"></i>Orders: <strong>${user.total_orders}</strong></span>
                            <span>Total Spent: <strong>₱${parseFloat(user.total_spent).toFixed(2)}</strong></span>
                            <span><i class="fas fa-calendar mr-1"></i>Joined: <strong>${new Date(user.created_at).toLocaleDateString()}</strong></span>
                        </div>
                    </div>
                    <div class="flex flex-row sm:flex-col gap-2 w-full sm:w-auto sm:ml-4">
                        <button onclick="viewUserProfile(${user.id})" class="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm whitespace-nowrap">
                            <i class="fas fa-eye mr-2"></i>View Profile
                        </button>
                        ${user.role !== 'admin' ? `
                            <button onclick="toggleUserStatus(${user.id}, ${user.is_active})" 
                                    class="flex-1 sm:flex-none px-4 py-2 ${user.is_active == 1 ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md transition-colors text-sm whitespace-nowrap">
                                <i class="fas ${user.is_active == 1 ? 'fa-ban' : 'fa-check'} mr-2"></i>${user.is_active == 1 ? 'Deactivate' : 'Activate'}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter users by role
function filterUsersByRole() {
    const roleFilter = document.getElementById('user-role-filter').value;
    loadAllUsers(roleFilter);
}

// Toggle user active status
async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus == 1 ? 0 : 1;
    const action = newStatus == 1 ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }
    
    try {
        const response = await fetch(`../api/users.php?user_id=${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                is_active: newStatus
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`User ${action}d successfully`, 'success');
            // Reload users with current filter
            const roleFilter = document.getElementById('user-role-filter').value;
            loadAllUsers(roleFilter);
        } else {
            showNotification('Error updating user status: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        showNotification('Network error updating user status', 'error');
    }
}

// View user profile
async function viewUserProfile(userId) {
    // Show profile modal
    document.getElementById('user-profile-modal').classList.remove('hidden');
    
    try {
        const response = await fetch(`../api/users.php?action=profile&user_id=${userId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            displayUserProfile(data.data);
        } else {
            showNotification('Failed to load user profile: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        showNotification('Network error loading user profile', 'error');
    }
}

// Display user profile
function displayUserProfile(profileData) {
    const user = profileData.user;
    const orders = profileData.recent_orders;
    const orderStats = profileData.order_stats;
    const lastLogin = profileData.last_login;
    
    const container = document.getElementById('user-profile-content');
    
    // Build order statistics HTML
    let statsHTML = '';
    if (orderStats && orderStats.length > 0) {
        statsHTML = orderStats.map(stat => {
            const statusColors = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'confirmed': 'bg-blue-100 text-blue-800',
                'preparing': 'bg-orange-100 text-orange-800',
                'ready': 'bg-green-100 text-green-800',
                'completed': 'bg-green-100 text-green-800',
                'cancelled': 'bg-red-100 text-red-800'
            };
            
            return `
                <div class="p-4 border border-gray-200 rounded-lg ${statusColors[stat.status] || 'bg-gray-100 text-gray-800'}">
                    <div class="text-sm font-medium capitalize">${stat.status}</div>
                    <div class="text-2xl font-bold mt-1">${stat.count}</div>
                    <div class="text-sm mt-1">₱${parseFloat(stat.total).toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }
    
    // Build recent orders HTML
    let ordersHTML = '';
    if (orders && orders.length > 0) {
        ordersHTML = orders.map(order => {
            const statusColors = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'confirmed': 'bg-blue-100 text-blue-800',
                'preparing': 'bg-orange-100 text-orange-800',
                'ready': 'bg-green-100 text-green-800',
                'completed': 'bg-green-100 text-green-800',
                'cancelled': 'bg-red-100 text-red-800'
            };
            
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-semibold text-gray-900">${order.order_number}</div>
                            <div class="text-sm text-gray-600 mt-1">
                                <i class="fas fa-calendar mr-1"></i>${new Date(order.order_date).toLocaleString()}
                            </div>
                            <div class="text-sm text-gray-600">
                                <i class="fas fa-box mr-1"></i>${order.items_count} items
                            </div>
                            ${order.notes ? `<div class="text-sm text-gray-600 mt-1"><i class="fas fa-sticky-note mr-1"></i>${order.notes}</div>` : ''}
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-gray-900">₱${parseFloat(order.total_amount).toFixed(2)}</div>
                            <span class="inline-block px-2 py-1 text-xs rounded-full mt-2 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}">
                                ${order.status}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        ordersHTML = '<div class="text-center text-gray-500 py-8">No orders found</div>';
    }
    
    container.innerHTML = `
        <!-- User Info Section -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">${user.first_name} ${user.last_name}</h2>
                    <p class="text-gray-600">@${user.username}</p>
                </div>
                <div class="text-right">
                    ${user.role === 'admin' 
                        ? '<span class="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold"><i class="fas fa-shield-alt mr-1"></i>Admin</span>'
                        : '<span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold"><i class="fas fa-user mr-1"></i>Customer</span>'
                    }
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <div class="text-sm text-gray-600 mb-1"><i class="fas fa-envelope mr-2"></i>Email</div>
                    <div class="font-medium text-gray-900">${user.email}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600 mb-1"><i class="fas fa-phone mr-2"></i>Phone</div>
                    <div class="font-medium text-gray-900">${user.phone || 'Not provided'}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600 mb-1"><i class="fas fa-map-marker-alt mr-2"></i>Address</div>
                    <div class="font-medium text-gray-900">${user.address || 'Not provided'}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600 mb-1"><i class="fas fa-city mr-2"></i>City, State, ZIP</div>
                    <div class="font-medium text-gray-900">${user.city || 'N/A'}, ${user.state || 'N/A'} ${user.zip_code || ''}</div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-200">
                <div>
                    <div class="text-sm text-gray-600 mb-1"><i class="fas fa-calendar-plus mr-2"></i>Member Since</div>
                    <div class="font-medium text-gray-900">${new Date(user.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600 mb-1"><i class="fas fa-sign-in-alt mr-2"></i>Last Login</div>
                    <div class="font-medium text-gray-900">${lastLogin ? new Date(lastLogin).toLocaleString() : 'Never'}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600 mb-1"><i class="fas fa-toggle-on mr-2"></i>Account Status</div>
                    <div class="font-medium ${user.is_active == 1 ? 'text-green-600' : 'text-red-600'}">
                        ${user.is_active == 1 ? 'Active' : 'Inactive'}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Order Statistics -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4"><i class="fas fa-chart-bar mr-2"></i>Order Statistics</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="p-4 border border-gray-200 rounded-lg bg-blue-50">
                    <div class="text-sm font-medium text-gray-700">Total Orders</div>
                    <div class="text-2xl font-bold text-blue-600 mt-1">${user.total_orders}</div>
                </div>
                <div class="p-4 border border-gray-200 rounded-lg bg-green-50">
                    <div class="text-sm font-medium text-gray-700">₱ Total Spent</div>
                    <div class="text-2xl font-bold text-green-600 mt-1">₱${parseFloat(user.total_spent).toFixed(2)}</div>
                </div>
                ${statsHTML}
            </div>
        </div>
        
        <!-- Recent Orders -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4"><i class="fas fa-shopping-cart mr-2"></i>Recent Orders</h3>
            <div class="space-y-3 max-h-96 overflow-y-auto">
                ${ordersHTML}
            </div>
        </div>
    `;
}

// Hide user profile modal
function hideUserProfileModal() {
    document.getElementById('user-profile-modal').classList.add('hidden');
}


