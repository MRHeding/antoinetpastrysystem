// Authentication JavaScript for Antoinette's Pastries
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Setup form event listeners
    setupFormListeners();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        if (data.success) {
            // User is logged in, redirect to appropriate page
            if (data.user.role === 'admin') {
                window.location.href = 'admin/index.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.log('Not authenticated');
    }
}

// Setup form event listeners
function setupFormListeners() {
    // Login form
    document.getElementById('login').addEventListener('submit', handleLogin);
    
    // Registration form
    document.getElementById('register').addEventListener('submit', handleRegister);
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    showLoading(true);
    
    try {
        const response = await fetch('api/auth.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Login successful! Welcome back!', 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (result.user.role === 'admin') {
                    window.location.href = 'admin/index.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } else {
            // Check if it's an email verification issue
            if (result.email_verified === false) {
                showEmailVerificationMessage(result.message);
            } else {
                showNotification(result.message, 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle registration form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    // Validate password confirmation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: password,
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        phone: formData.get('phone')
    };
    
    showLoading(true);
    
    try {
        const response = await fetch('api/auth.php?action=register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (result.email_sent) {
                showEmailVerificationMessage(result.message);
            } else {
                showNotification(result.message, 'warning');
            }
            showLoginForm();
            e.target.reset();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Show login form
function showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

// Show registration form
function showRegisterForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

// Show/hide loading indicator
function showLoading(show) {
    const loading = document.getElementById('loading');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (show) {
        loading.classList.remove('hidden');
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
        if (registerForm.classList.contains('hidden')) {
            loginForm.classList.remove('hidden');
        } else {
            registerForm.classList.remove('hidden');
        }
    }
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
    }, 5000);
}

// Show email verification message with resend option
function showEmailVerificationMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 bg-amber-500 text-white max-w-md';
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="fas fa-envelope mr-3 mt-1"></i>
            <div class="flex-1">
                <p class="font-semibold mb-2">Email Verification Required</p>
                <p class="text-sm mb-3">${message}</p>
                <div class="flex space-x-2">
                    <button onclick="resendVerificationEmail()" class="bg-white text-amber-600 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-100">
                        Resend Email
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="bg-amber-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-amber-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// Resend verification email
async function resendVerificationEmail() {
    const email = prompt('Please enter your email address to resend the verification email:');
    
    if (!email) return;
    
    try {
        const response = await fetch('api/auth.php?action=resend-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Verification email sent successfully! Please check your email.', 'success');
        } else {
            showNotification('Error: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('An error occurred. Please try again.', 'error');
    }
}
