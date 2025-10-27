// Home page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load navigation and footer components
    loadComponent('components/navigation.html', 'navigation-container');
    loadComponent('components/footer.html', 'footer-container');
    
    // Load featured products
    loadFeaturedProducts();
});

// Load featured products (first 4 products)
async function loadFeaturedProducts() {
    try {
        const response = await fetch('api/products.php');
        const products = await response.json();
        
        if (products.success) {
            // Take only the first 4 products for featured section
            const featuredProducts = products.data.slice(0, 4);
            displayFeaturedProducts(featuredProducts);
        } else {
            console.error('Error loading products:', products.message);
            displayFeaturedError('Failed to load featured products. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        displayFeaturedError('Network error. Please check your connection.');
    }
}

// Display featured products on the home page
function displayFeaturedProducts(products) {
    const container = document.getElementById('featured-products-container');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-cookie-bite text-4xl text-amber-300 mb-4"></i>
                <p class="text-gray-600">No featured products available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => {
        // Determine image source
        const imageSrc = product.image_url 
            ? product.image_url 
            : 'Logo.png';
            
        // Determine availability status badge
        const isAvailable = product.availability_status === 'available';
        const statusBadge = isAvailable 
            ? '<div class="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center"><i class="fas fa-check-circle mr-1"></i>Available</div>'
            : '<div class="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center"><i class="fas fa-times-circle mr-1"></i>Unavailable</div>';
            
        return `
        <div class="product-card group ${!isAvailable ? 'opacity-90' : ''}" id="product-${product.id}">
            <div class="product-card-image" onclick="viewProduct(${product.id})">
                <img src="${imageSrc}" alt="${product.name}" class="h-full w-full object-cover ${!isAvailable ? 'grayscale brightness-75' : ''}">
                <div class="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                    ${product.category}
                </div>
                ${statusBadge}
                ${!isAvailable ? '<div class="absolute inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center"><div class="bg-red-600 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-lg">Currently Unavailable</div></div>' : ''}
            </div>
            <div class="product-card-content">
                <h4 class="product-card-title" onclick="viewProduct(${product.id})">${product.name}</h4>
                <p class="product-card-description">${product.description}</p>
                ${!isAvailable && product.unavailable_reason ? `<p class="text-sm text-red-600 mb-2"><i class="fas fa-info-circle mr-1"></i>${product.unavailable_reason}</p>` : ''}
                <div class="product-card-price-section">
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
                <div class="product-card-buttons">
                    <button onclick="addToCart(${product.id})" 
                            class="w-32 bg-amber-600 text-white py-2.5 px-4 rounded-md hover:bg-amber-700 transition-all duration-200 transform hover:scale-105">
                        <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                    </button>
                    <button onclick="viewProduct(${product.id})" 
                            class="bg-gray-200 text-gray-700 py-2.5 px-4 rounded-md hover:bg-gray-300 transition-colors">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Display error message for featured products
function displayFeaturedError(message) {
    const container = document.getElementById('featured-products-container');
    container.innerHTML = `
        <div class="col-span-full text-center text-red-500">
            <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p>${message}</p>
            <button onclick="loadFeaturedProducts()" class="mt-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors">
                Try Again
            </button>
        </div>
    `;
}

// View product details
function viewProduct(productId) {
    // Redirect to products page with the specific product highlighted
    window.location.href = `products.html#product-${productId}`;
}
