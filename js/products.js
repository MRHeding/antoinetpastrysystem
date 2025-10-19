// Products page specific JavaScript

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

document.addEventListener('DOMContentLoaded', function() {
    // Load navigation and footer components
    loadComponent('components/navigation.html', 'navigation-container');
    loadComponent('components/footer.html', 'footer-container');
    
    // Load all products
    loadProducts();
    
    // Initialize search and filter functionality
    initSearchAndFilter();
    
    // Initialize pagination
    initPagination();
    
    // Initialize modal controls
    initModalControls();
    
    // Check admin status and disable cart functionality if needed
    checkAdminStatus();
});

// Check admin status and update UI accordingly
async function checkAdminStatus() {
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
            // Store admin status globally for use in other functions
            window.isAdmin = true;
        } else {
            window.isAdmin = false;
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        window.isAdmin = false;
    }
}

// Initialize modal controls
function initModalControls() {
    // Close modal when clicking the close button
    const closeBtn = document.getElementById('close-product-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideProductModal);
    }
    
    // Close modal when clicking outside the modal content
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                hideProductModal();
            }
        });
    }
    
    // Initialize quantity controls
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('product-quantity');
    
    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
        
        // Ensure quantity is always at least 1
        quantityInput.addEventListener('change', function() {
            if (this.value < 1 || !this.value) {
                this.value = 1;
            }
        });
    }
}

// Load products from backend
async function loadProducts() {
    try {
        const response = await fetch('api/products.php');
        const products = await response.json();
        
        if (products.success) {
            allProducts = products.data;
            filteredProducts = [...allProducts];
            
            // Ensure admin status is checked before displaying products
            await checkAdminStatus();
            displayProducts();
            updatePagination();
        } else {
            console.error('Error loading products:', products.message);
            displayError('Failed to load products. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        displayError('Network error. Please check your connection.');
    }
}

// Initialize search and filter functionality
function initSearchAndFilter() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProducts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterProducts();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            sortProducts();
        });
    }
}

// Filter products based on search and category
function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm) ||
                            product.category.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !category || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    currentPage = 1;
    displayProducts();
    updatePagination();
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sort-filter').value;
    
    switch (sortBy) {
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'category':
            filteredProducts.sort((a, b) => a.category.localeCompare(b.category));
            break;
    }
    
    currentPage = 1;
    displayProducts();
    updatePagination();
}

// Display products with pagination
function displayProducts() {
    const container = document.getElementById('products-container');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (!productsToShow || productsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center text-gray-500 py-12">
                <i class="fas fa-search text-4xl mb-4"></i>
                <p class="text-lg">No products found matching your criteria.</p>
                <button onclick="clearFilters()" class="mt-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors">
                    Clear Filters
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = productsToShow.map(product => {
        // Determine image source
        const imageSrc = product.image_url 
            ? product.image_url 
            : 'Logo.png';
            
        return `
        <div class="card group" id="product-${product.id}">
            <div class="h-48 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative overflow-hidden cursor-pointer" onclick="viewProductDetails(${product.id})">
                <img src="${imageSrc}" alt="${product.name}" class="h-full w-full object-cover">
                <div class="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                    ${product.category}
                </div>
                <div class="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                    Fresh
                </div>
            </div>
            <div class="p-6">
                <h4 class="text-xl font-bold text-gray-800 mb-3 group-hover:text-amber-600 transition-colors cursor-pointer" onclick="viewProductDetails(${product.id})">${product.name}</h4>
                <p class="text-gray-600 mb-5 line-clamp-3 leading-relaxed">${product.description}</p>
                <div class="flex justify-between items-center mb-5">
                    <span class="text-2xl font-bold text-amber-600">₱${product.price}</span>
                    <div class="flex items-center text-yellow-500 space-x-1">
                        <i class="fas fa-star text-sm"></i>
                        <i class="fas fa-star text-sm"></i>
                        <i class="fas fa-star text-sm"></i>
                        <i class="fas fa-star text-sm"></i>
                        <i class="fas fa-star text-sm"></i>
                        <span class="text-gray-500 text-sm ml-2">(4.8)</span>
                    </div>
                </div>
                <div class="flex space-x-3">
                    ${window.isAdmin ? 
                        `<button disabled class="w-32 bg-gray-400 text-white py-2.5 px-4 rounded-md cursor-not-allowed opacity-50">
                            <i class="fas fa-ban mr-2"></i>Admin Mode
                        </button>` :
                        `<button onclick="addToCart(${product.id})" 
                                class="w-32 bg-amber-600 text-white py-2.5 px-4 rounded-md hover:bg-amber-700 transition-all duration-200 transform hover:scale-105">
                            <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                        </button>`
                    }
                    <button onclick="viewProductDetails(${product.id})" 
                            class="bg-gray-200 text-gray-700 py-2.5 px-4 rounded-md hover:bg-gray-300 transition-colors">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Initialize pagination
function initPagination() {
    // Pagination will be handled by updatePagination function
}

// Update pagination controls
function updatePagination() {
    const container = document.getElementById('pagination-container');
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="flex items-center space-x-2">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="goToPage(${currentPage - 1})" 
                    class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="goToPage(${i})" 
                    class="px-3 py-2 border border-gray-300 rounded-md transition-colors ${
                        i === currentPage ? 'bg-amber-600 text-white border-amber-600' : 'hover:bg-gray-50'
                    }">
                ${i}
            </button>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <button onclick="goToPage(${currentPage + 1})" 
                    class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    displayProducts();
    updatePagination();
    
    // Scroll to top of products section
    document.getElementById('products-container').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('sort-filter').value = 'name';
    
    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProducts();
    updatePagination();
}

// Display error message
function displayError(message) {
    const container = document.getElementById('products-container');
    container.innerHTML = `
        <div class="col-span-full text-center text-red-500 py-12">
            <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p class="text-lg">${message}</p>
            <button onclick="loadProducts()" class="mt-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors">
                Try Again
            </button>
        </div>
    `;
}

// View product details
async function viewProductDetails(productId) {
    try {
        // Find product in already loaded products first
        let product = allProducts.find(p => p.id == productId);
        
        // If not found or we need fresh data, fetch from API
        if (!product) {
            const response = await fetch(`api/products.php?id=${productId}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                product = result.data;
            } else {
                showNotification('Error loading product details', 'error');
                return;
            }
        }
        
        // Populate modal with product details
        document.getElementById('modal-product-name').textContent = product.name;
        document.getElementById('modal-product-category').textContent = product.category;
        document.getElementById('modal-product-price').textContent = product.price;
        document.getElementById('modal-product-description').textContent = product.description;
        
        // Set product image
        const modalImage = document.getElementById('modal-product-image');
        modalImage.src = product.image_url ? product.image_url : 'Logo.png';
        modalImage.alt = product.name;
        
        // Reset quantity to 1
        document.getElementById('product-quantity').value = 1;
        
        // Set up add to cart button
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        
        // Update button appearance and functionality based on admin status
        if (window.isAdmin) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-ban mr-2"></i>Admin Mode';
            addToCartBtn.className = 'flex-1 bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed opacity-50';
            addToCartBtn.onclick = null;
        } else {
            addToCartBtn.disabled = false;
            addToCartBtn.innerHTML = 'Add to Cart';
            addToCartBtn.className = 'flex-1 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors';
            addToCartBtn.onclick = async function() {
                const quantity = parseInt(document.getElementById('product-quantity').value);
                addToCartWithQuantity(productId, quantity);
                hideProductModal();
            };
        }
        
        // Show modal
        document.getElementById('product-details-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching product details:', error);
        showNotification('Network error loading product details', 'error');
    }
}

// Hide product details modal
function hideProductModal() {
    document.getElementById('product-details-modal').classList.add('hidden');
}

// Add to cart function (for direct button clicks)
async function addToCart(productId) {
    // Check if user is admin
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
            showNotification('Admin users cannot add items to cart', 'error');
            return;
        }
        
        // Proceed with adding to cart if not admin
        addToCartWithQuantity(productId, 1);
    } catch (error) {
        console.error('Error checking admin status:', error);
        // If there's an error checking admin status, proceed normally
        addToCartWithQuantity(productId, 1);
    }
}

// Add to cart with quantity
async function addToCartWithQuantity(productId, quantity) {
    // Check if user is admin
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
            showNotification('Admin users cannot add items to cart', 'error');
            return;
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        // If there's an error checking admin status, proceed normally
    }
    
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Get existing cart or initialize new one
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url || 'Logo.png',
            quantity: quantity
        });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count - call the shared function
    if (typeof updateCartDisplay === 'function') {
        updateCartDisplay();
    } else {
        // Fallback: manually update cart display
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
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
    
    // Show notification
    showNotification(`${quantity} ${product.name} added to cart!`, 'success');
}

// Handle URL hash for direct product linking
window.addEventListener('hashchange', function() {
    const hash = window.location.hash;
    if (hash.startsWith('#product-')) {
        const productId = hash.replace('#product-', '');
        // Scroll to the product after a short delay to ensure it's rendered
        setTimeout(() => {
            const productElement = document.getElementById(`product-${productId}`);
            if (productElement) {
                productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a highlight effect
                productElement.classList.add('ring-4', 'ring-amber-300');
                setTimeout(() => {
                    productElement.classList.remove('ring-4', 'ring-amber-300');
                }, 3000);
            }
        }, 100);
    }
});

// Check for hash on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#product-')) {
            window.dispatchEvent(new Event('hashchange'));
        }
    }, 500);
});
