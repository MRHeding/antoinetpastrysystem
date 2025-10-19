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
            
        return `
        <div class="card group">
            <div class="h-48 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                <img src="${imageSrc}" alt="${product.name}" class="h-full w-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-orange-200/40"></div>
                <div class="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                    ${product.category}
                </div>
            </div>
            <div class="p-6">
                <h4 class="text-xl font-bold text-gray-800 mb-3 group-hover:text-amber-600 transition-colors">${product.name}</h4>
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
