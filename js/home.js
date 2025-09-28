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
            <div class="col-span-full text-center text-gray-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>No featured products available at the moment.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="card group">
            <div class="h-48 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                <img src="Logo.png" alt="Antoinette's Pastries Logo" class="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-300">
                <div class="absolute top-2 right-2 bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    ${product.category}
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
                    <button onclick="viewProduct(${product.id})" 
                            class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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
