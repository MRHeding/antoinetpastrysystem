// Main JavaScript for Antoinette's Pastries
document.addEventListener('DOMContentLoaded', function() {
    // Load products when page loads
    loadProducts();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize authentication
    initAuth();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
});

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            if (mobileMenu.classList.contains('hidden')) {
                openMobileMenu();
            } else {
                closeMobileMenu();
            }
        });
    }
}

function openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.remove('hidden');
        mobileMenuButton.innerHTML = '<i class="fas fa-times text-xl"></i>';
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.innerHTML = '<i class="fas fa-bars text-xl"></i>';
    }
}

// Load products from backend
async function loadProducts() {
    try {
        const response = await fetch('api/products.php');
        const products = await response.json();
        
        if (products.success) {
            displayProducts(products.data);
        } else {
            console.error('Error loading products:', products.message);
            displayError('Failed to load products. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        displayError('Network error. Please check your connection.');
    }
}

// Display products on the page
function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center text-gray-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>No products available at the moment.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="card group">
            <div class="h-48 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                <i class="fas fa-birthday-cake text-6xl text-amber-600 group-hover:scale-110 transition-transform duration-300"></i>
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

// Display error message
function displayError(message) {
    const container = document.getElementById('products-container');
    container.innerHTML = `
        <div class="col-span-full text-center text-red-500">
            <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p>${message}</p>
            <button onclick="loadProducts()" class="mt-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors">
                Try Again
            </button>
        </div>
    `;
}

// Add product to cart
function addToCart(productId) {
    // Simple cart functionality - in a real app, this would be more sophisticated
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Show success message
    showNotification('Product added to cart!', 'success');
}

// Update cart display
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartButton = document.querySelector('button[class*="bg-amber-600"]');
    if (cartButton) {
        cartButton.innerHTML = `<i class="fas fa-shopping-cart mr-2"></i>Cart (${totalItems})`;
    }
}

// View product details
function viewProduct(productId) {
    // In a real app, this would open a modal or navigate to a product detail page
    showNotification('Product details coming soon!', 'info');
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

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
    initScrollToTop();
});

// Authentication functionality
async function initAuth() {
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        if (data.success) {
            showUserMenu(data.user);
        } else {
            showLoginButton();
        }
    } catch (error) {
        console.log('Authentication check failed');
        showLoginButton();
    }
}

function showUserMenu(user) {
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('user-logged-in').classList.remove('hidden');
    document.getElementById('user-name').textContent = user.first_name;
    
    // Setup user dropdown
    const dropdownBtn = document.getElementById('user-dropdown-btn');
    const dropdown = document.getElementById('user-dropdown');
    
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdown.classList.add('hidden');
    });
}

function showLoginButton() {
    document.getElementById('user-menu').classList.remove('hidden');
    document.getElementById('user-logged-in').classList.add('hidden');
    
    // Setup login button
    document.getElementById('login-btn').addEventListener('click', function() {
        window.location.href = 'auth.html';
    });
}

async function logout() {
    try {
        const response = await fetch('api/auth.php?action=logout', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Logged out successfully', 'success');
            showLoginButton();
        } else {
            showNotification('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// Scroll to top functionality
function initScrollToTop() {
    const scrollToTopButton = document.getElementById('scroll-to-top');
    
    if (scrollToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopButton.classList.remove('opacity-0', 'invisible');
                scrollToTopButton.classList.add('opacity-100', 'visible');
            } else {
                scrollToTopButton.classList.add('opacity-0', 'invisible');
                scrollToTopButton.classList.remove('opacity-100', 'visible');
            }
        });
        
        // Scroll to top when clicked
        scrollToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}


