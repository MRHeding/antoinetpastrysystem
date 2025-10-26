// Audit Log JavaScript
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', function() {
    loadAuditLog();
    
    // Setup enter key for filters
    document.getElementById('filter-product-id').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    
    document.getElementById('filter-admin').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
});

// Load audit log entries
async function loadAuditLog(page = 1, filters = {}) {
    try {
        showLoadingState();
        
        const params = new URLSearchParams({
            page: page,
            limit: 20,
            ...filters
        });
        
        const response = await fetch(`../api/audit-log.php?${params}`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAuditLog(data.entries);
            updatePagination(data.pagination);
            currentPage = page;
            currentFilters = filters;
        } else {
            showNotification(data.message || 'Failed to load audit log', 'error');
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Error loading audit log:', error);
        showNotification('Error loading audit log', 'error');
        showEmptyState();
    }
}

// Display audit log entries
function displayAuditLog(entries) {
    const tbody = document.getElementById('audit-log-tbody');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    
    loadingState.style.display = 'none';
    
    if (!entries || entries.length === 0) {
        showEmptyState();
        return;
    }
    
    emptyState.classList.add('hidden');
    
    tbody.innerHTML = entries.map(entry => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">
                        Product #${entry.product_id}
                    </div>
                    ${entry.product_name ? `
                        <div class="text-sm text-gray-500 ml-2">
                            ${entry.product_name}
                        </div>
                    ` : ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.old_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${entry.old_status}
                    </span>
                    <i class="fas fa-arrow-right mx-2 text-gray-400"></i>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.new_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${entry.new_status}
                    </span>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                    ${entry.reason || '<em class="text-gray-400">No reason provided</em>'}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <i class="fas fa-user-shield text-amber-500 mr-2"></i>
                    <div class="text-sm font-medium text-gray-900">
                        ${entry.admin_username || `User #${entry.changed_by}`}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex flex-col">
                    <span>${formatDate(entry.changed_at)}</span>
                    <span class="text-xs text-gray-400">${formatTime(entry.changed_at)}</span>
                </div>
            </td>
        </tr>
    `).join('');
}

// Apply filters
function applyFilters() {
    const filters = {};
    
    const productId = document.getElementById('filter-product-id').value.trim();
    if (productId) filters.product_id = productId;
    
    const status = document.getElementById('filter-status').value;
    if (status) filters.new_status = status;
    
    const admin = document.getElementById('filter-admin').value.trim();
    if (admin) filters.admin = admin;
    
    loadAuditLog(1, filters);
}

// Update pagination
function updatePagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const showingFrom = document.getElementById('showing-from');
    const showingTo = document.getElementById('showing-to');
    const totalEntries = document.getElementById('total-entries');
    
    if (pagination.total > 0) {
        paginationDiv.classList.remove('hidden');
        
        showingFrom.textContent = pagination.from;
        showingTo.textContent = pagination.to;
        totalEntries.textContent = pagination.total;
        
        prevButton.disabled = pagination.current_page <= 1;
        nextButton.disabled = pagination.current_page >= pagination.total_pages;
        
        totalPages = pagination.total_pages;
    } else {
        paginationDiv.classList.add('hidden');
    }
}

// Change page
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        loadAuditLog(newPage, currentFilters);
    }
}

// Show loading state
function showLoadingState() {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('audit-log-tbody').innerHTML = '';
    document.getElementById('pagination').classList.add('hidden');
}

// Show empty state
function showEmptyState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('audit-log-tbody').innerHTML = '';
    document.getElementById('pagination').classList.add('hidden');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Admin logout function
async function adminLogout() {
    if (confirm('Are you sure you want to logout from the admin panel?')) {
        try {
            const response = await fetch('../api/auth.php?action=logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                showNotification('Logout failed', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Logout failed', 'error');
        }
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 
                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notification.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-4 flex items-center transform transition-all duration-300 translate-x-full`;
    notification.innerHTML = `
        <i class="fas ${icon} mr-2"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}