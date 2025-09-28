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
});

// Load products from backend
async function loadProducts() {
    try {
        const response = await fetch('api/products.php');
        const products = await response.json();
        
        if (products.success) {
            allProducts = products.data;
            filteredProducts = [...allProducts];
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
    const category = document.getElementById('category-filter').value.toLowerCase();
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm) ||
                            product.category.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !category || product.category.toLowerCase() === category;
        
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
    
    container.innerHTML = productsToShow.map(product => `
        <div class="card group" id="product-${product.id}">
            <div class="h-48 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                <img src="Logo.png" alt="Antoinette's Pastries Logo" class="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-300">
                <div class="absolute top-2 right-2 bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    ${product.category}
                </div>
                <div class="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Fresh
                </div>
            </div>
            <div class="p-6">
                <h4 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">${product.name}</h4>
                <p class="text-gray-600 mb-4 line-clamp-3">${product.description}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-2xl font-bold text-amber-600">₱${product.price}</span>
                    <div class="flex items-center text-yellow-500">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <span class="text-gray-500 text-sm ml-1">(4.8)</span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="addToCart(${product.id})" 
                            class="flex-1 bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-all duration-200 transform hover:scale-105">
                        <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                    </button>
                    <button onclick="viewProductDetails(${product.id})" 
                            class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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

// View product details (placeholder for future modal or detail page)
function viewProductDetails(productId) {
    showNotification('Product details coming soon!', 'info');
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
