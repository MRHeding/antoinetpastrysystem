// Admin Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in as admin
    checkAdminAuth();
    
    // Setup form event listener
    document.getElementById('admin-login').addEventListener('submit', handleAdminLogin);
});

// Check if user is already authenticated as admin
async function checkAdminAuth() {
    try {
        const response = await fetch('../api/auth.php?action=check');
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
            // User is already logged in as admin, redirect to admin panel
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.log('Not authenticated as admin');
    }
}

// Handle admin login form submission
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    showLoading(true);
    hideError();
    
    try {
        const response = await fetch('../api/auth.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Check if user is admin
            if (result.user.role === 'admin') {
                showSuccess('Login successful! Redirecting to admin panel...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showError('Access denied. Admin privileges required.');
            }
        } else {
            showError(result.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Show loading indicator
function showLoading(show) {
    const loading = document.getElementById('loading');
    const form = document.getElementById('admin-login');
    
    if (show) {
        loading.classList.remove('hidden');
        form.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
        form.classList.remove('hidden');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Hide error message
function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.classList.add('hidden');
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'bg-green-50 border border-green-200 rounded-lg p-4 mb-4';
    successDiv.innerHTML = `
        <div class="flex">
            <i class="fas fa-check-circle text-green-400 mr-3 mt-0.5"></i>
            <div>
                <h3 class="text-sm font-medium text-green-800">Success</h3>
                <p class="mt-1 text-sm text-green-700">${message}</p>
            </div>
        </div>
    `;
    
    const container = document.querySelector('.max-w-md');
    container.insertBefore(successDiv, container.firstChild);
}
