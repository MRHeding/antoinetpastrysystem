// Profile Dashboard JavaScript for Antonette's Pastries
let currentUser = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', function() {
    // Load navigation
    loadNavigation();
    
    // Load user profile
    loadProfile();
    
    // Setup form event listeners
    setupFormListeners();
});

// Load navigation component
async function loadNavigation() {
    try {
        const response = await fetch('components/navigation.html');
        const html = await response.text();
        document.getElementById('navigation-container').innerHTML = html;
        
        // Initialize all navigation functionality
        initNavigation();
        initAuth();
        updateCartDisplay();
        setActiveNavLink();
        
        // Initialize mobile menu after a short delay
        setTimeout(() => {
            initMobileMenu();
        }, 200);
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

// Load user profile data
async function loadProfile() {
    showLoading(true);
    hideError();
    hideProfileContent();
    
    try {
        const response = await fetch('api/auth.php?action=profile');
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            displayProfile(data.user);
            showProfileContent();
        } else {
            if (data.message === 'Authentication required') {
                // Redirect to login
                window.location.href = 'auth.html';
            } else {
                showError(data.message);
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display profile data
function displayProfile(user) {
    // Update profile overview
    document.getElementById('profile-name').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('member-since').textContent = formatDate(user.created_at);
    
    // Update form fields
    document.getElementById('first_name').value = user.first_name || '';
    document.getElementById('last_name').value = user.last_name || '';
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('address').value = user.address || '';
    document.getElementById('city').value = user.city || '';
    document.getElementById('state').value = user.state || '';
    document.getElementById('zip_code').value = user.zip_code || '';
}

// Setup form event listeners
function setupFormListeners() {
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    
    // Address form
    document.getElementById('address-form').addEventListener('submit', handleAddressUpdate);
    
    // Password form
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const inputs = document.querySelectorAll('#profile-form input, #address-form input');
    const editButton = document.querySelector('button[onclick="toggleEditMode()"]');
    const formActions = document.getElementById('form-actions');
    
    if (isEditMode) {
        // Enable editing
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.classList.add('bg-white');
            input.classList.remove('bg-gray-50');
        });
        
        editButton.innerHTML = '<i class="fas fa-times mr-2"></i>Cancel Edit';
        editButton.onclick = cancelEdit;
        formActions.classList.remove('hidden');
        formActions.classList.add('flex');
    } else {
        // Disable editing
        inputs.forEach(input => {
            input.setAttribute('readonly', 'readonly');
            input.classList.remove('bg-white');
            input.classList.add('bg-gray-50');
        });
        
        editButton.innerHTML = '<i class="fas fa-edit mr-2"></i>Edit Profile';
        editButton.onclick = toggleEditMode;
        formActions.classList.add('hidden');
        formActions.classList.remove('flex');
    }
}

// Cancel edit mode
function cancelEdit() {
    // Reset form data
    displayProfile(currentUser);
    toggleEditMode();
}

// Save profile changes
async function saveProfile() {
    const profileData = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip_code: document.getElementById('zip_code').value
    };
    
    // Validate required fields
    if (!profileData.first_name || !profileData.last_name) {
        showNotification('First name and last name are required', 'error');
        return;
    }
    
    try {
        console.log('Sending profile update request:', profileData);
        
        const response = await fetch('api/auth.php?action=update_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            showNotification('Profile updated successfully!', 'success');
            currentUser = { ...currentUser, ...profileData };
            toggleEditMode();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile. Please try again.', 'error');
    }
}

// Handle profile form submission
function handleProfileUpdate(e) {
    e.preventDefault();
    saveProfile();
}

// Handle address form submission
function handleAddressUpdate(e) {
    e.preventDefault();
    saveProfile();
}

// Change password
function changePassword() {
    document.getElementById('password-modal').classList.remove('hidden');
    document.getElementById('password-form').reset();
}

// Close password modal
function closePasswordModal() {
    document.getElementById('password-modal').classList.add('hidden');
    document.getElementById('password-form').reset();
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const currentPassword = formData.get('current_password');
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('New password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch('api/auth.php?action=change_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Password changed successfully!', 'success');
            closePasswordModal();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Failed to change password. Please try again.', 'error');
    }
}

// View orders
function viewOrders() {
    window.location.href = 'orders.html';
}

// Download data (placeholder)
function downloadData() {
    showNotification('Data download feature coming soon!', 'info');
}

// Show loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
        loading.classList.add('flex');
    } else {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

// Show error state
function showError(message) {
    const errorState = document.getElementById('error-state');
    const errorMessage = errorState.querySelector('p');
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
}

// Hide error state
function hideError() {
    document.getElementById('error-state').classList.add('hidden');
}

// Show profile content
function showProfileContent() {
    document.getElementById('profile-content').classList.remove('hidden');
}

// Hide profile content
function hideProfileContent() {
    document.getElementById('profile-content').classList.add('hidden');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' :
                   type === 'error' ? 'bg-red-500' :
                   type === 'warning' ? 'bg-yellow-500' :
                   'bg-blue-500';
    
    const icon = type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle';
    
    notification.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-4 flex items-center`;
    notification.innerHTML = `
        <i class="fas ${icon} mr-3"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
