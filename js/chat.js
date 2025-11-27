// User Chat Widget JavaScript

let chatPollInterval = null;
let lastMessageId = 0;
let isChatOpen = false;

// Initialize chat widget on page load
document.addEventListener('DOMContentLoaded', function() {
    initChatWidget();
});

function initChatWidget() {
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatForm = document.getElementById('chat-form');
    const chatLoginBtn = document.getElementById('chat-login-btn');
    const chatImageBtn = document.getElementById('chat-image-btn');
    const chatImageInput = document.getElementById('chat-image-input');
    const chatRemoveImage = document.getElementById('chat-remove-image');

    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', toggleChat);
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', closeChat);
    }

    if (chatForm) {
        chatForm.addEventListener('submit', sendUserMessage);
    }

    if (chatLoginBtn) {
        chatLoginBtn.addEventListener('click', function() {
            // Trigger login modal
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.click();
            }
            closeChat();
        });
    }

    if (chatImageBtn && chatImageInput) {
        chatImageBtn.addEventListener('click', function() {
            chatImageInput.click();
        });
    }

    if (chatImageInput) {
        chatImageInput.addEventListener('change', handleImageSelect);
    }

    if (chatRemoveImage) {
        chatRemoveImage.addEventListener('click', removeImagePreview);
    }

    // Check if user is logged in
    checkChatAuth();

    // Poll for unread messages
    setInterval(updateUnreadBadge, 10000); // Check every 10 seconds
}

async function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    
    if (chatWindow.classList.contains('hidden')) {
        chatWindow.classList.remove('hidden');
        isChatOpen = true;
        
        // Check auth and load messages if logged in
        const user = await getCurrentUser();
        if (user) {
            loadChatMessages();
            startChatPolling();
            markMessagesAsRead();
            updateUnreadBadge();
        }
    } else {
        closeChat();
    }
}

function closeChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.add('hidden');
    isChatOpen = false;
    stopChatPolling();
}

async function checkChatAuth() {
    const chatLoginRequired = document.getElementById('chat-login-required');
    const chatContent = document.getElementById('chat-content');

    try {
        const response = await fetch('api/auth.php?action=check', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.user) {
            // User is logged in
            if (chatLoginRequired) chatLoginRequired.classList.add('hidden');
            if (chatContent) chatContent.classList.remove('hidden');
            updateUnreadBadge();
            return data.user;
        } else {
            // User is not logged in
            if (chatLoginRequired) chatLoginRequired.classList.remove('hidden');
            if (chatContent) chatContent.classList.add('hidden');
            return null;
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        // User is not logged in
        if (chatLoginRequired) chatLoginRequired.classList.remove('hidden');
        if (chatContent) chatContent.classList.add('hidden');
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

async function loadChatMessages() {
    try {
        const response = await fetch('api/chat.php?action=get_messages', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.innerHTML = '';

            // Add welcome message
            addWelcomeMessage();

            // Add messages
            if (data.data && data.data.length > 0) {
                data.data.forEach(message => {
                    appendChatMessage(message, false);
                    lastMessageId = Math.max(lastMessageId, message.id);
                });
            }

            scrollChatToBottom();
        }
    } catch (error) {
        console.error('Error loading chat messages:', error);
    }
}

function addWelcomeMessage() {
    const messagesContainer = document.getElementById('chat-messages');
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

function appendChatMessage(message, animate = true) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    const isUser = message.sender_type === 'user';
    const alignClass = isUser ? 'justify-end' : 'justify-start';
    const bgClass = isUser ? 'bg-amber-600 text-white' : 'bg-white text-gray-800';
    const animateClass = animate ? 'chat-message-enter' : '';

    const time = new Date(message.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    // Build message content
    let messageContent = '';
    if (message.image_path) {
        messageContent += `<img src="${escapeHtml(message.image_path)}" alt="Chat image" class="max-w-full rounded-lg mb-2" style="max-height: 300px; object-fit: contain;">`;
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
        showChatError('Please select a valid image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showChatError('Image size must be less than 5MB');
        return;
    }

    selectedImageFile = file;

    // Show preview
    const preview = document.getElementById('chat-image-preview');
    const previewImg = document.getElementById('chat-preview-img');
    const reader = new FileReader();

    reader.onload = function(e) {
        previewImg.src = e.target.result;
        preview.classList.remove('hidden');
    };

    reader.readAsDataURL(file);
}

function removeImagePreview() {
    selectedImageFile = null;
    const preview = document.getElementById('chat-image-preview');
    const previewImg = document.getElementById('chat-preview-img');
    const imageInput = document.getElementById('chat-image-input');
    
    preview.classList.add('hidden');
    previewImg.src = '';
    if (imageInput) {
        imageInput.value = '';
    }
}

async function sendUserMessage(e) {
    e.preventDefault();

    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    // Must have either message or image
    if (!message && !selectedImageFile) return;

    try {
        const formData = new FormData();
        formData.append('message', message || '');
        if (selectedImageFile) {
            formData.append('image', selectedImageFile);
        }

        const response = await fetch('api/chat.php?action=send_message', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            appendChatMessage(data.data, true);
            input.value = '';
            removeImagePreview();
            scrollChatToBottom();
            lastMessageId = Math.max(lastMessageId, data.data.id);
        } else {
            showChatError(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showChatError('Failed to send message. Please try again.');
    }
}

async function checkNewMessages() {
    try {
        const response = await fetch('api/chat.php?action=get_messages', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success && data.data) {
            const newMessages = data.data.filter(msg => msg.id > lastMessageId);
            
            newMessages.forEach(message => {
                appendChatMessage(message, true);
                lastMessageId = Math.max(lastMessageId, message.id);
            });

            if (newMessages.length > 0) {
                scrollChatToBottom();
                if (isChatOpen) {
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
        await fetch('api/chat.php?action=mark_as_read', {
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
        const response = await fetch('api/chat.php?action=get_unread_count', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            const badge = document.getElementById('chat-badge');
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

function startChatPolling() {
    if (chatPollInterval) return;
    chatPollInterval = setInterval(checkNewMessages, 5000); // Check every 5 seconds
}

function stopChatPolling() {
    if (chatPollInterval) {
        clearInterval(chatPollInterval);
        chatPollInterval = null;
    }
}

function scrollChatToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function showChatError(message) {
    const messagesContainer = document.getElementById('chat-messages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'flex justify-center';
    errorDiv.innerHTML = `
        <div class="bg-red-100 text-red-700 rounded-lg px-4 py-2 text-sm">
            ${escapeHtml(message)}
        </div>
    `;
    messagesContainer.appendChild(errorDiv);
    scrollChatToBottom();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Re-check auth when user logs in/out
window.addEventListener('userAuthChanged', async function() {
    await checkChatAuth();
    const user = await getCurrentUser();
    if (user) {
        updateUnreadBadge();
    }
});

