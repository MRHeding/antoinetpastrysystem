<?php
/**
 * Email Verification Handler
 * Handles email verification links sent to users
 */

// We'll handle the verification directly without including auth.php

// Get the verification token from URL
$token = isset($_GET['token']) ? $_GET['token'] : '';

if (empty($token)) {
    $error_message = "Invalid verification link. No token provided.";
    $show_resend = false;
} else {
    // Call the verify-email API endpoint
    $response = verifyEmailToken($token);
    
    if ($response['success']) {
        $success_message = $response['message'];
        $show_resend = false;
    } else {
        $error_message = $response['message'];
        $show_resend = true;
    }
}

/**
 * Verify email token directly with database
 */
function verifyEmailToken($token) {
    try {
        // Include database configuration
        require_once 'config/database.php';
        
        $database = new Database();
        $db = $database->getConnection();
        
        // Check if token exists and is not expired
        $stmt = $db->prepare("
            SELECT id, email, first_name, email_verification_expires 
            FROM users 
            WHERE email_verification_token = ? AND email_verified = 0
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Invalid or expired verification token. Please request a new verification email.'
            ];
        }
        
        // Check if token is expired
        if (strtotime($user['email_verification_expires']) < time()) {
            return [
                'success' => false,
                'message' => 'Verification token has expired. Please request a new verification email.'
            ];
        }
        
        // Update user as verified
        $stmt = $db->prepare("
            UPDATE users 
            SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL 
            WHERE id = ?
        ");
        $result = $stmt->execute([$user['id']]);
        
        if ($result) {
            // Send welcome email
            try {
                require_once 'api/email-service-smtp.php';
                $emailService = new SMTPEmailService();
                $emailService->sendWelcomeEmail($user['email'], $user['first_name']);
            } catch (Exception $e) {
                // Welcome email failed, but verification was successful
                error_log("Welcome email failed: " . $e->getMessage());
            }
            
            return [
                'success' => true,
                'message' => 'Your email has been successfully verified! You can now log in to your account.'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Failed to verify email. Please try again later.'
            ];
        }
        
    } catch (Exception $e) {
        error_log("Email verification error: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'An error occurred during verification. Please try again later.'
        ];
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Antoinette's Pastries</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .animate-bounce-slow {
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
        <!-- Logo -->
        <div class="text-center mb-8">
            <img src="Logo.png" alt="Antoinette's Pastries Logo" class="h-16 w-16 mx-auto mb-4 object-contain animate-bounce-slow">
            <h1 class="text-2xl font-bold text-gray-800">Antoinette's Pastries</h1>
        </div>

        <!-- Verification Card -->
        <div class="bg-white rounded-lg shadow-lg p-8">
            <?php if (isset($success_message)): ?>
                <!-- Success Message -->
                <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">Email Verified!</h2>
                    <p class="text-gray-600 mb-6"><?php echo htmlspecialchars($success_message); ?></p>
                    
                    <div class="space-y-3">
                        <a href="auth.html" class="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition duration-200 inline-block text-center">
                            <i class="fas fa-sign-in-alt mr-2"></i>Login to Your Account
                        </a>
                        <a href="index.html" class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 inline-block text-center">
                            <i class="fas fa-home mr-2"></i>Go to Homepage
                        </a>
                    </div>
                </div>
            <?php else: ?>
                <!-- Error Message -->
                <div class="text-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                    </div>
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
                    <p class="text-gray-600 mb-6"><?php echo htmlspecialchars($error_message); ?></p>
                    
                    <div class="space-y-3">
                        <?php if ($show_resend): ?>
                            <a href="auth.html" class="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition duration-200 inline-block text-center">
                                <i class="fas fa-paper-plane mr-2"></i>Request New Verification Email
                            </a>
                        <?php endif; ?>
                        <a href="auth.html" class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 inline-block text-center">
                            <i class="fas fa-arrow-left mr-2"></i>Back to Login
                        </a>
                        <a href="index.html" class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 inline-block text-center">
                            <i class="fas fa-home mr-2"></i>Go to Homepage
                        </a>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-gray-500 text-sm">
            <p>© 2025 Antoinette's Pastries. All rights reserved.</p>
            <p>Socorro Street, BRGY. Mercedes, Zamboanga City</p>
        </div>
    </div>

    <!-- Notification Container -->
    <div id="notification" class="fixed top-4 right-4 z-50 hidden">
        <div class="bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <div class="flex items-center">
                <div id="notification-icon" class="mr-3"></div>
                <div>
                    <p id="notification-message" class="text-sm font-medium"></p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Notification system
        function showNotification(message, type = 'info') {
            const notification = document.getElementById('notification');
            const icon = document.getElementById('notification-icon');
            const messageEl = document.getElementById('notification-message');
            
            // Set icon and colors based on type
            let iconClass = '';
            let bgColor = '';
            
            switch(type) {
                case 'success':
                    iconClass = 'fas fa-check-circle text-green-500';
                    bgColor = 'border-l-4 border-green-500';
                    break;
                case 'error':
                    iconClass = 'fas fa-exclamation-circle text-red-500';
                    bgColor = 'border-l-4 border-red-500';
                    break;
                case 'warning':
                    iconClass = 'fas fa-exclamation-triangle text-yellow-500';
                    bgColor = 'border-l-4 border-yellow-500';
                    break;
                default:
                    iconClass = 'fas fa-info-circle text-blue-500';
                    bgColor = 'border-l-4 border-blue-500';
            }
            
            icon.className = iconClass;
            messageEl.textContent = message;
            notification.className = `fixed top-4 right-4 z-50 ${bgColor}`;
            notification.classList.remove('hidden');
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 5000);
        }

        // Resend verification email
        async function resendVerification() {
            try {
                const response = await fetch('api/auth.php?action=resend-verification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: '<?php echo htmlspecialchars($token); ?>'
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showNotification(result.message, 'success');
                } else {
                    showNotification(result.message, 'error');
                }
            } catch (error) {
                console.error('Error resending verification:', error);
                showNotification('Failed to resend verification email. Please try again.', 'error');
            }
        }

        // Check if there's a message in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        const type = urlParams.get('type');
        
        if (message) {
            showNotification(decodeURIComponent(message), type || 'info');
        }
    </script>
</body>
</html>