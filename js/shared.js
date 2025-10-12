// Shared JavaScript functionality for multi-page website

// Initialize common functionality on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Initialize authentication
    initAuth();
    
    // Initialize cart display
    updateCartDisplay();
    
    // Initialize scroll to top
    initScrollToTop();
    
    // Set active navigation link
    setActiveNavLink();
    
    // Initialize mobile menu after a short delay to ensure components are loaded
    setTimeout(() => {
        initMobileMenu();
    }, 500);
    
    // Also try to initialize mobile menu when the page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            initMobileMenu();
        }, 100);
    });
    
    // Handle window resize to reinitialize mobile menu when switching between desktop/mobile
    window.addEventListener('resize', function() {
        // Debounce the resize event
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            if (window.innerWidth < 768) {
                // Switched to mobile - initialize mobile menu
                initMobileMenu();
            } else {
                // Switched to desktop - close mobile menu if open
                closeMobileMenu();
            }
        }, 250);
    });
});

// Navigation functionality
function initNavigation() {
    // Handle navigation link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('text-amber-600', 'bg-amber-50');
                navLink.classList.add('text-gray-800');
            });
            
            // Add active class to clicked link
            this.classList.add('text-amber-600', 'bg-amber-50');
            this.classList.remove('text-gray-800');
        });
    });
}

// Mobile menu functionality
function initMobileMenu() {
    // Only initialize mobile menu on mobile devices (screen width < 768px)
    if (window.innerWidth >= 768) {
        console.log('Desktop view detected, skipping mobile menu initialization');
        return;
    }
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    console.log('Initializing mobile menu...', { mobileMenuButton, mobileMenu });
    
    if (mobileMenuButton && mobileMenu) {
        console.log('Mobile menu elements found, setting up event listeners');
        
        // Remove any existing event listeners to prevent duplicates
        const newButton = mobileMenuButton.cloneNode(true);
        mobileMenuButton.parentNode.replaceChild(newButton, mobileMenuButton);
        
        // Add click event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu button clicked');
            toggleMobileMenu();
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!newButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Close mobile menu when window is resized to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                closeMobileMenu();
            }
        });
        
        console.log('Mobile menu initialized successfully');
    } else {
        console.log('Mobile menu elements not found, retrying...');
        // Retry after a short delay if elements are not found
        setTimeout(() => {
            initMobileMenu();
        }, 200);
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    console.log('Toggle mobile menu called', { mobileMenu, mobileMenuButton });
    
    if (mobileMenu && mobileMenuButton) {
        const isHidden = mobileMenu.classList.contains('hidden');
        console.log('Menu is hidden:', isHidden);
        
        if (isHidden) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    } else {
        console.log('Mobile menu elements not found in toggle function');
    }
}

function openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    console.log('Opening mobile menu', { mobileMenu, mobileMenuButton });
    
    if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.remove('hidden');
        mobileMenuButton.innerHTML = '<i class="fas fa-times text-xl"></i>';
        mobileMenuButton.setAttribute('aria-expanded', 'true');
        console.log('Mobile menu opened successfully');
    } else {
        console.log('Cannot open mobile menu - elements not found');
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    console.log('Closing mobile menu', { mobileMenu, mobileMenuButton });
    
    if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.innerHTML = '<i class="fas fa-bars text-xl"></i>';
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        console.log('Mobile menu closed successfully');
    } else {
        console.log('Cannot close mobile menu - elements not found');
    }
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPage = getCurrentPage();
    const activeLink = document.querySelector(`[data-page="${currentPage}"]`);
    
    if (activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('text-amber-600', 'bg-amber-50');
            navLink.classList.add('text-gray-800');
        });
        
        // Add active class to current page link
        activeLink.classList.add('text-amber-600', 'bg-amber-50');
        activeLink.classList.remove('text-gray-800');
    }
}

// Get current page name from URL
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (filename === 'index.html' || filename === '' || filename === '/') {
        return 'home';
    } else if (filename === 'products.html') {
        return 'products';
    } else if (filename === 'about.html') {
        return 'about';
    } else if (filename === 'contact.html') {
        return 'contact';
    }
    return 'home';
}


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
    const userMenu = document.getElementById('user-menu');
    const userLoggedIn = document.getElementById('user-logged-in');
    const userName = document.getElementById('user-name');
    
    // Mobile menu elements
    const mobileUserMenu = document.getElementById('mobile-user-menu');
    const mobileUserLoggedIn = document.getElementById('mobile-user-logged-in');
    const mobileUserName = document.getElementById('mobile-user-name');
    
    if (userMenu && userLoggedIn && userName) {
        userMenu.classList.add('hidden');
        userLoggedIn.classList.remove('hidden');
        userLoggedIn.classList.add('flex');
        userName.textContent = user.first_name;
        
        // Check if user is admin
        if (user.role === 'admin') {
            // Replace dropdown with dashboard link
            const dropdownBtn = document.getElementById('user-dropdown-btn');
            const dropdown = document.getElementById('user-dropdown');
            
            if (dropdownBtn && dropdown) {
                // Change button to dashboard link
                dropdownBtn.innerHTML = '<i class="fas fa-tachometer-alt mr-2"></i>Dashboard';
                dropdownBtn.onclick = function() {
                    window.location.href = 'admin/index.php';
                };
            }
        } else {
            // Setup user dropdown for regular users
            const dropdownBtn = document.getElementById('user-dropdown-btn');
            const dropdown = document.getElementById('user-dropdown');
            
            if (dropdownBtn && dropdown) {
                dropdownBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    dropdown.classList.toggle('hidden');
                });
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function() {
                    dropdown.classList.add('hidden');
                });
            }
        }
    }
    
    // Handle mobile menu
    if (mobileUserMenu && mobileUserLoggedIn && mobileUserName) {
        mobileUserMenu.classList.add('hidden');
        mobileUserLoggedIn.classList.remove('hidden');
        mobileUserName.textContent = user.first_name;
        
        // Check if user is admin for mobile menu
        if (user.role === 'admin') {
            const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
            const mobileDropdown = document.getElementById('mobile-user-dropdown');
            
            if (mobileDashboardLink && mobileDropdown) {
                mobileDropdown.classList.add('hidden');
                mobileDashboardLink.classList.remove('hidden');
                mobileDashboardLink.onclick = function() {
                    window.location.href = 'admin/index.php';
                };
            }
        }
    }
}

function showLoginButton() {
    const userMenu = document.getElementById('user-menu');
    const userLoggedIn = document.getElementById('user-logged-in');
    const loginBtn = document.getElementById('login-btn');
    
    // Mobile menu elements
    const mobileUserMenu = document.getElementById('mobile-user-menu');
    const mobileUserLoggedIn = document.getElementById('mobile-user-logged-in');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    
    if (userMenu && userLoggedIn) {
        userMenu.classList.remove('hidden');
        userLoggedIn.classList.add('hidden');
        userLoggedIn.classList.remove('flex');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                window.location.href = 'auth.html';
            });
        }
    }
    
    // Handle mobile menu
    if (mobileUserMenu && mobileUserLoggedIn) {
        mobileUserMenu.classList.remove('hidden');
        mobileUserLoggedIn.classList.add('hidden');
        
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', function() {
                window.location.href = 'auth.html';
            });
        }
    }
}

async function logout() {
    try {
        const response = await fetch('api/auth.php?action=logout', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Clear cart when user logs out
            localStorage.removeItem('cart');
            showNotification('Logged out successfully', 'success');
            showLoginButton();
            updateCartDisplay();
        } else {
            showNotification('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// Cart functionality
async function addToCart(productId) {
    // Check if user is logged in first
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        if (!data.success) {
            showNotification('Please log in to add items to your cart', 'error');
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 2000);
            return;
        }
        
        // User is logged in, proceed with adding to cart
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
    } catch (error) {
        console.error('Error checking authentication:', error);
        showNotification('Please log in to add items to your cart', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
    }
}

async function updateCartDisplay() {
    // Check if user is logged in
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        if (data.success) {
            // User is logged in, show cart items
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            const cartButtons = document.querySelectorAll('a[class*="bg-amber-600"], button[class*="bg-amber-600"]');
            cartButtons.forEach(button => {
                if (button.innerHTML.includes('Cart')) {
                    button.innerHTML = `<i class="fas fa-shopping-cart mr-2"></i>Cart (${totalItems})`;
                }
            });
        } else {
            // User is not logged in, show empty cart
            const cartButtons = document.querySelectorAll('a[class*="bg-amber-600"], button[class*="bg-amber-600"]');
            cartButtons.forEach(button => {
                if (button.innerHTML.includes('Cart')) {
                    button.innerHTML = `<i class="fas fa-shopping-cart mr-2"></i>Cart (0)`;
                }
            });
        }
    } catch (error) {
        console.error('Error checking authentication for cart display:', error);
        // Show empty cart on error
        const cartButtons = document.querySelectorAll('a[class*="bg-amber-600"], button[class*="bg-amber-600"]');
        cartButtons.forEach(button => {
            if (button.innerHTML.includes('Cart')) {
                button.innerHTML = `<i class="fas fa-shopping-cart mr-2"></i>Cart (0)`;
            }
        });
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

// Notification system
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

// Global function to manually initialize mobile menu (for debugging)
window.initMobileMenuManually = function() {
    console.log('Manually initializing mobile menu...');
    if (window.innerWidth < 768) {
        initMobileMenu();
    } else {
        console.log('Desktop view detected, mobile menu not needed');
    }
};

// Utility function to load HTML components
async function loadComponent(componentPath, targetElementId) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        const targetElement = document.getElementById(targetElementId);
        
        if (targetElement) {
            targetElement.innerHTML = html;
            
            // Re-initialize shared functionality after loading components
            setTimeout(() => {
                initAuth();
                updateCartDisplay();
                setActiveNavLink();
                initScrollToTop();
                initMobileMenu();
            }, 200);
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}
