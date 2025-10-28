// Admin Chat JavaScript

let currentChatUserId = null;
let lastAdminMessageId = 0;
let adminChatPollInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initAdminChat();
});

function initAdminChat() {
    loadConversations();
    
    const adminChatForm = document.getElementById('admin-chat-form');
    if (adminChatForm) {
        adminChatForm.addEventListener('submit', sendAdminMessage);
    }

    // Poll for new messages
    startAdminChatPolling();
}

async function loadConversations() {
    try {
        const response = await fetch('../api/chat.php?action=get_conversations', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            displayConversations(data.data);
        } else {
            console.error('Failed to load conversations:', data.message);
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

function displayConversations(conversations) {
    const conversationsList = document.getElementById('conversations-list');
    const totalConversations = document.getElementById('total-conversations');

    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center p-6">
                    <i class="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
                    <p>No conversations yet</p>
                    <p class="text-xs text-gray-400 mt-1">Customers will appear here when they send a message</p>
                </div>
            </div>
        `;
        totalConversations.textContent = '0';
        return;
    }

    totalConversations.textContent = conversations.length;
    conversationsList.innerHTML = '';

    conversations.forEach(conversation => {
        const conversationDiv = document.createElement('div');
        conversationDiv.className = 'conversation-item px-4 py-3 border-b border-gray-200 cursor-pointer';
        conversationDiv.dataset.userId = conversation.user_id;

        const initials = (conversation.first_name.charAt(0) + conversation.last_name.charAt(0)).toUpperCase();
        const unreadBadge = conversation.unread_admin_count > 0 
            ? `<span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">${conversation.unread_admin_count}</span>`
            : '';
        
        const lastMessagePreview = conversation.last_message 
            ? `<p class="text-xs text-gray-500 mt-1 truncate">${conversation.last_sender === 'user' ? '' : 'You: '}${escapeHtml(conversation.last_message)}</p>`
            : '';

        const timeAgo = getTimeAgo(new Date(conversation.last_message_at));

        conversationDiv.innerHTML = `
            <div class="flex items-start">
                <div class="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-semibold mr-3 flex-shrink-0">
                    ${initials}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <h4 class="font-semibold text-gray-800 truncate">${escapeHtml(conversation.first_name + ' ' + conversation.last_name)}</h4>
                        ${unreadBadge}
                    </div>
                    ${lastMessagePreview}
                    <p class="text-xs text-gray-400 mt-1">${timeAgo}</p>
                </div>
            </div>
        `;

        conversationDiv.addEventListener('click', function() {
            openConversation(conversation);
        });

        conversationsList.appendChild(conversationDiv);
    });
}

async function openConversation(conversation) {
    currentChatUserId = conversation.user_id;

    // Update UI
    document.getElementById('no-conversation').classList.add('hidden');
    document.getElementById('active-chat').classList.remove('hidden');

    // Update header
    const initials = (conversation.first_name.charAt(0) + conversation.last_name.charAt(0)).toUpperCase();
    document.getElementById('chat-user-avatar').textContent = initials;
    document.getElementById('chat-user-name').textContent = conversation.first_name + ' ' + conversation.last_name;
    document.getElementById('chat-user-email').textContent = conversation.email;

    // Highlight active conversation
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.conversation-item[data-user-id="${conversation.user_id}"]`).classList.add('active');

    // Load messages
    await loadConversationMessages(conversation.user_id);

    // Mark messages as read
    await markAdminMessagesAsRead(conversation.user_id);

    // Refresh conversations to update unread count
    loadConversations();
}

async function loadConversationMessages(userId) {
    try {
        const response = await fetch(`../api/chat.php?action=get_messages&user_id=${userId}`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            const messagesContainer = document.getElementById('admin-chat-messages');
            messagesContainer.innerHTML = '';

            if (data.data && data.data.length > 0) {
                data.data.forEach(message => {
                    appendAdminChatMessage(message, false);
                    lastAdminMessageId = Math.max(lastAdminMessageId, message.id);
                });
            }

            scrollAdminChatToBottom();
        }
    } catch (error) {
        console.error('Error loading conversation messages:', error);
    }
}

function appendAdminChatMessage(message, animate = true) {
    const messagesContainer = document.getElementById('admin-chat-messages');
    const messageDiv = document.createElement('div');
    
    const isAdmin = message.sender_type === 'admin';
    const alignClass = isAdmin ? 'justify-end' : 'justify-start';
    const bgClass = isAdmin ? 'bg-amber-600 text-white' : 'bg-white text-gray-800';
    const animateClass = animate ? 'chat-message-enter' : '';

    const time = new Date(message.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    const senderLabel = isAdmin ? 'You' : message.first_name;

    messageDiv.className = `flex ${alignClass} ${animateClass}`;
    messageDiv.innerHTML = `
        <div class="${bgClass} rounded-lg px-4 py-2 max-w-md shadow-sm">
            <p class="text-xs font-semibold mb-1 ${isAdmin ? 'text-amber-100' : 'text-gray-600'}">${senderLabel}</p>
            <p class="text-sm">${escapeHtml(message.message)}</p>
            <span class="text-xs ${isAdmin ? 'text-amber-100' : 'text-gray-400'} mt-1 block">${time}</span>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
}

async function sendAdminMessage(e) {
    e.preventDefault();

    if (!currentChatUserId) {
        return;
    }

    const input = document.getElementById('admin-chat-input');
    const message = input.value.trim();

    if (!message) return;

    try {
        const response = await fetch('../api/chat.php?action=send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
                message,
                target_user_id: currentChatUserId
            })
        });

        const data = await response.json();

        if (data.success) {
            appendAdminChatMessage(data.data, true);
            input.value = '';
            scrollAdminChatToBottom();
            lastAdminMessageId = Math.max(lastAdminMessageId, data.data.id);
            
            // Refresh conversations list
            loadConversations();
        } else {
            alert(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}

async function checkAdminNewMessages() {
    if (!currentChatUserId) return;

    try {
        const response = await fetch(`../api/chat.php?action=get_messages&user_id=${currentChatUserId}`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success && data.data) {
            const newMessages = data.data.filter(msg => msg.id > lastAdminMessageId);
            
            newMessages.forEach(message => {
                appendAdminChatMessage(message, true);
                lastAdminMessageId = Math.max(lastAdminMessageId, message.id);
            });

            if (newMessages.length > 0) {
                scrollAdminChatToBottom();
                markAdminMessagesAsRead(currentChatUserId);
            }
        }
    } catch (error) {
        console.error('Error checking new messages:', error);
    }

    // Also refresh conversations list periodically
    loadConversations();
}

async function markAdminMessagesAsRead(userId) {
    try {
        await fetch('../api/chat.php?action=mark_as_read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ user_id: userId })
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

function startAdminChatPolling() {
    if (adminChatPollInterval) return;
    adminChatPollInterval = setInterval(checkAdminNewMessages, 5000); // Check every 5 seconds
}

function scrollAdminChatToBottom() {
    const messagesContainer = document.getElementById('admin-chat-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Logout function for admin
function adminLogout() {
    fetch('../api/auth.php?action=logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'login.html';
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    });
}

