// User Support Widget JavaScript

let supportPollInterval = null;
let lastMessageId = 0;
let isSupportOpen = false;

// Initialize support widget on page load
document.addEventListener('DOMContentLoaded', function() {
    initSupportWidget();
});

function initSupportWidget() {
    const supportToggleBtn = document.getElementById('support-toggle-btn');
    const supportCloseBtn = document.getElementById('support-close-btn');
    const supportForm = document.getElementById('support-form');
    const supportLoginBtn = document.getElementById('support-login-btn');
    const supportImageBtn = document.getElementById('support-image-btn');
    const supportImageInput = document.getElementById('support-image-input');
    const supportRemoveImage = document.getElementById('support-remove-image');

    if (supportToggleBtn) {
        supportToggleBtn.addEventListener('click', toggleSupport);
    }

    if (supportCloseBtn) {
        supportCloseBtn.addEventListener('click', closeSupport);
    }

    if (supportForm) {
        supportForm.addEventListener('submit', sendUserMessage);
    }

    if (supportLoginBtn) {
        supportLoginBtn.addEventListener('click', function() {
            // Trigger login modal
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.click();
            }
            closeSupport();
        });
    }

    if (supportImageBtn && supportImageInput) {
        supportImageBtn.addEventListener('click', function() {
            supportImageInput.click();
        });
    }

    if (supportImageInput) {
        supportImageInput.addEventListener('change', handleImageSelect);
    }

    if (supportRemoveImage) {
        supportRemoveImage.addEventListener('click', removeImagePreview);
    }

    // Check if user is logged in
    checkSupportAuth();

    // Poll for unread messages
    setInterval(updateUnreadBadge, 10000); // Check every 10 seconds
}

async function toggleSupport() {
    const supportWindow = document.getElementById('support-window');
    
    if (supportWindow.classList.contains('hidden')) {
        supportWindow.classList.remove('hidden');
        isSupportOpen = true;
        
        // Check auth and load messages if logged in
        const user = await getCurrentUser();
        if (user) {
            loadSupportMessages();
            startSupportPolling();
            markMessagesAsRead();
            updateUnreadBadge();
        }
    } else {
        closeSupport();
    }
}

function closeSupport() {
    const supportWindow = document.getElementById('support-window');
    supportWindow.classList.add('hidden');
    isSupportOpen = false;
    stopSupportPolling();
}

async function checkSupportAuth() {
    const supportLoginRequired = document.getElementById('support-login-required');
    const supportContent = document.getElementById('support-content');

    try {
        const response = await fetch('api/auth.php?action=check', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.user) {
            // User is logged in
            if (supportLoginRequired) supportLoginRequired.classList.add('hidden');
            if (supportContent) supportContent.classList.remove('hidden');
            updateUnreadBadge();
            return data.user;
        } else {
            // User is not logged in
            if (supportLoginRequired) supportLoginRequired.classList.remove('hidden');
            if (supportContent) supportContent.classList.add('hidden');
            return null;
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        // User is not logged in
        if (supportLoginRequired) supportLoginRequired.classList.remove('hidden');
        if (supportContent) supportContent.classList.add('hidden');
        return null;
    }
}

async function getCurrentUser() {
    try {
        const response = await fetch('api/auth.php?action=check', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.user) {
            return data.user;
        }
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

async function loadSupportMessages() {
    try {
        const response = await fetch('api/support.php?action=get_messages', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            const messagesContainer = document.getElementById('support-messages');
            messagesContainer.innerHTML = '';

            // Add welcome message
            addWelcomeMessage();

            // Add messages
            if (data.data && data.data.length > 0) {
                data.data.forEach(message => {
                    appendSupportMessage(message, false);
                    lastMessageId = Math.max(lastMessageId, message.id);
                });
            }

            scrollSupportToBottom();
        }
    } catch (error) {
        console.error('Error loading support messages:', error);
    }
}

function addWelcomeMessage() {
    const messagesContainer = document.getElementById('support-messages');
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'flex justify-start';
    welcomeDiv.innerHTML = `
        <div class="bg-white rounded-lg px-4 py-2 max-w-xs shadow-sm">
            <p class="text-sm text-gray-800">Hello! How can we help you today?</p>
            <span class="text-xs text-gray-400 mt-1 block">Support Team</span>
        </div>
    `;
    messagesContainer.appendChild(welcomeDiv);
}

function appendSupportMessage(message, animate = true) {
    const messagesContainer = document.getElementById('support-messages');
    const messageDiv = document.createElement('div');
    
    const isUser = message.sender_type === 'user';
    const alignClass = isUser ? 'justify-end' : 'justify-start';
    const bgClass = isUser ? 'bg-amber-600 text-white' : 'bg-white text-gray-800';
    const animateClass = animate ? 'support-message-enter' : '';

    const time = new Date(message.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    // Build message content
    let messageContent = '';
    if (message.image_path) {
        messageContent += `<img src="${escapeHtml(message.image_path)}" alt="Support image" class="max-w-full rounded-lg mb-2" style="max-height: 300px; object-fit: contain;">`;
    }
    if (message.message) {
        messageContent += `<p class="text-sm">${escapeHtml(message.message)}</p>`;
    }

    messageDiv.className = `flex ${alignClass} ${animateClass}`;
    messageDiv.innerHTML = `
        <div class="${bgClass} rounded-lg px-4 py-2 max-w-xs shadow-sm">
            ${messageContent}
            <span class="text-xs ${isUser ? 'text-amber-100' : 'text-gray-400'} mt-1 block">${time}</span>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
}

let selectedImageFile = null;

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showSupportError('Please select a valid image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showSupportError('Image size must be less than 5MB');
        return;
    }

    selectedImageFile = file;

    // Show preview
    const preview = document.getElementById('support-image-preview');
    const previewImg = document.getElementById('support-preview-img');
    const reader = new FileReader();

    reader.onload = function(e) {
        previewImg.src = e.target.result;
        preview.classList.remove('hidden');
    };

    reader.readAsDataURL(file);
}

function removeImagePreview() {
    selectedImageFile = null;
    const preview = document.getElementById('support-image-preview');
    const previewImg = document.getElementById('support-preview-img');
    const imageInput = document.getElementById('support-image-input');
    
    preview.classList.add('hidden');
    previewImg.src = '';
    if (imageInput) {
        imageInput.value = '';
    }
}

async function sendUserMessage(e) {
    e.preventDefault();

    const input = document.getElementById('support-input');
    const message = input.value.trim();

    // Must have either message or image
    if (!message && !selectedImageFile) return;

    try {
        const formData = new FormData();
        formData.append('message', message || '');
        if (selectedImageFile) {
            formData.append('image', selectedImageFile);
        }

        const response = await fetch('api/support.php?action=send_message', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            appendSupportMessage(data.data, true);
            input.value = '';
            removeImagePreview();
            scrollSupportToBottom();
            lastMessageId = Math.max(lastMessageId, data.data.id);
        } else {
            showSupportError(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showSupportError('Failed to send message. Please try again.');
    }
}

async function checkNewMessages() {
    try {
        const response = await fetch('api/support.php?action=get_messages', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success && data.data) {
            const newMessages = data.data.filter(msg => msg.id > lastMessageId);
            
            newMessages.forEach(message => {
                appendSupportMessage(message, true);
                lastMessageId = Math.max(lastMessageId, message.id);
            });

            if (newMessages.length > 0) {
                scrollSupportToBottom();
                if (isSupportOpen) {
                    markMessagesAsRead();
                }
            }
        }
    } catch (error) {
        console.error('Error checking new messages:', error);
    }
}

async function markMessagesAsRead() {
    try {
        await fetch('api/support.php?action=mark_as_read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({})
        });
        updateUnreadBadge();
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

async function updateUnreadBadge() {
    const user = await getCurrentUser();
    if (!user) return;

    try {
        const response = await fetch('api/support.php?action=get_unread_count', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            const badge = document.getElementById('support-badge');
            if (badge) {
                const count = data.unread_count || 0;
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        }
    } catch (error) {
        console.error('Error updating unread badge:', error);
    }
}

function startSupportPolling() {
    if (supportPollInterval) return;
    supportPollInterval = setInterval(checkNewMessages, 5000); // Check every 5 seconds
}

function stopSupportPolling() {
    if (supportPollInterval) {
        clearInterval(supportPollInterval);
        supportPollInterval = null;
    }
}

function scrollSupportToBottom() {
    const messagesContainer = document.getElementById('support-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function showSupportError(message) {
    const messagesContainer = document.getElementById('support-messages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'flex justify-center';
    errorDiv.innerHTML = `
        <div class="bg-red-100 text-red-700 rounded-lg px-4 py-2 text-sm">
            ${escapeHtml(message)}
        </div>
    `;
    messagesContainer.appendChild(errorDiv);
    scrollSupportToBottom();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Re-check auth when user logs in/out
window.addEventListener('userAuthChanged', async function() {
    await checkSupportAuth();
    const user = await getCurrentUser();
    if (user) {
        updateUnreadBadge();
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
/* Support message animations */
.support-message-enter {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Support messages scrollbar */
#support-messages::-webkit-scrollbar {
    width: 6px;
}

#support-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
}

#support-messages::-webkit-scrollbar-thumb {
    background: #d97706;
    border-radius: 3px;
}

#support-messages::-webkit-scrollbar-thumb:hover {
    background: #b45309;
}
`;
document.head.appendChild(style);

