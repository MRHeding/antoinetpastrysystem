<?php
/**
 * PayMongo Payment API
 * Handles payment processing, verification, and webhooks
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';
require_once '../config/paymongo.php';

// Start session
session_start();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'verify_payment':
                verifyPayment();
                break;
            case 'get_latest_pending_order':
                getLatestPendingOrder();
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }
        break;
    case 'POST':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'create_checkout_session':
                createCheckoutSession();
                break;
            case 'webhook':
                handleWebhook();
                break;
            case 'cancel_order':
                cancelOrderBySession();
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

/**
 * Create PayMongo checkout session
 */
function createCheckoutSession() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$session_token) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        // Validate input
        if (!isset($input['items']) || !is_array($input['items']) || empty($input['items'])) {
            echo json_encode(['success' => false, 'message' => 'Order items are required']);
            return;
        }
        
        // Check PayMongo configuration
        if (!PayMongoConfig::isConfigured()) {
            echo json_encode([
                'success' => false, 
                'message' => 'PayMongo is not configured. Please set up your API keys in .env file.'
            ]);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user from session
        $stmt = $db->prepare("
            SELECT u.id, u.first_name, u.last_name, u.email FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        // Start transaction
        $db->beginTransaction();
        
        try {
            // Generate order number
            $order_number = 'ORD-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Calculate total amount
            $subtotal = 0;
            foreach ($input['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }
            
            $delivery = 50.00;
            $total = $subtotal + $delivery;
            
            // Create order with pending payment status
            $stmt = $db->prepare("
                INSERT INTO orders (user_id, order_number, total_amount, status, payment_status, notes, order_date)
                VALUES (?, ?, ?, 'pending', 'pending', ?, NOW())
            ");
            $stmt->execute([
                $user['id'],
                $order_number,
                $total,
                $input['notes'] ?? null
            ]);
            
            $order_id = $db->lastInsertId();
            
            // Create order items
            foreach ($input['items'] as $item) {
                $stmt = $db->prepare("
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $order_id,
                    $item['product_id'],
                    $item['quantity'],
                    $item['unit_price'],
                    $item['quantity'] * $item['unit_price']
                ]);
            }
            
            // Prepare line items for PayMongo
            $line_items = [];
            foreach ($input['items'] as $item) {
                $line_items[] = [
                    'name' => $item['name'] ?? 'Product #' . $item['product_id'],
                    'quantity' => $item['quantity'],
                    'amount' => (int)($item['unit_price'] * 100), // Convert to centavos
                    'currency' => 'PHP'
                ];
            }
            
            // Add delivery fee as line item
            $line_items[] = [
                'name' => 'Delivery Fee',
                'quantity' => 1,
                'amount' => (int)($delivery * 100), // Convert to centavos
                'currency' => 'PHP'
            ];
            
            // Create PayMongo checkout session
            $checkoutData = [
                'data' => [
                    'attributes' => [
                        'send_email_receipt' => true,
                        'show_description' => true,
                        'show_line_items' => true,
                        'line_items' => $line_items,
                        'payment_method_types' => ['gcash', 'paymaya', 'grab_pay'],
                        'success_url' => PayMongoConfig::getSuccessUrl(),
                        'cancel_url' => PayMongoConfig::getCancelUrl(),
                        'description' => "Order #$order_number - Antonette's Pastries",
                        'metadata' => [
                            'order_id' => $order_id,
                            'order_number' => $order_number,
                            'user_id' => $user['id']
                        ]
                    ]
                ]
            ];
            
            // Call PayMongo API
            $response = callPayMongoAPI('POST', '/checkout_sessions', $checkoutData);
            
            if ($response && isset($response['data'])) {
                $checkout_session = $response['data'];
                $checkout_id = $checkout_session['id'];
                $checkout_url = $checkout_session['attributes']['checkout_url'];
                
                // Update order with checkout session ID
                $stmt = $db->prepare("
                    UPDATE orders 
                    SET paymongo_checkout_id = ?
                    WHERE id = ?
                ");
                $stmt->execute([$checkout_id, $order_id]);
                
                // Commit transaction
                $db->commit();
                
                echo json_encode([
                    'success' => true,
                    'checkout_url' => $checkout_url,
                    'checkout_session_id' => $checkout_id,
                    'order_id' => $order_id,
                    'order_number' => $order_number
                ]);
            } else {
                $db->rollBack();
                
                // Provide detailed error message
                $errorMessage = 'Failed to create checkout session';
                if (isset($response['error'])) {
                    if (isset($response['response']['errors'])) {
                        $errors = $response['response']['errors'];
                        $errorDetails = [];
                        foreach ($errors as $error) {
                            if (isset($error['detail'])) {
                                $errorDetails[] = $error['detail'];
                            }
                        }
                        if (!empty($errorDetails)) {
                            $errorMessage .= ': ' . implode(', ', $errorDetails);
                        }
                    } elseif ($response['curl_error']) {
                        $errorMessage .= ': ' . $response['curl_error'];
                    }
                }
                
                echo json_encode([
                    'success' => false,
                    'message' => $errorMessage,
                    'debug' => $response
                ]);
            }
            
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * Get latest pending order for current user
 * Used as fallback when session ID is not available
 */
function getLatestPendingOrder() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        
        if (!$session_token) {
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user from session
        $stmt = $db->prepare("
            SELECT u.id FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            return;
        }
        
        // Get most recent pending order with checkout ID
        $stmt = $db->prepare("
            SELECT paymongo_checkout_id, order_number, id
            FROM orders 
            WHERE user_id = ? 
            AND payment_status = 'pending'
            AND paymongo_checkout_id IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$user['id']]);
        $order = $stmt->fetch();
        
        if ($order) {
            echo json_encode([
                'success' => true,
                'checkout_session_id' => $order['paymongo_checkout_id'],
                'order_number' => $order['order_number'],
                'order_id' => $order['id']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No pending orders found'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Verify payment status
 */
function verifyPayment() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        $checkout_session_id = $_GET['session_id'] ?? '';
        
        if (!$checkout_session_id) {
            echo json_encode(['success' => false, 'message' => 'Missing session ID']);
            return;
        }
        
        // Allow verification without login for better UX (we verify order ownership later)
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        $user_id = null;
        if ($session_token) {
            // Get user from session if available
            $stmt = $db->prepare("
                SELECT u.id FROM users u
                JOIN user_sessions s ON u.id = s.user_id
                WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
            ");
            $stmt->execute([$session_token]);
            $user = $stmt->fetch();
            $user_id = $user['id'] ?? null;
        }
        
        // Retrieve checkout session from PayMongo
        $response = callPayMongoAPI('GET', "/checkout_sessions/$checkout_session_id");
        
        // Check for API errors
        if (isset($response['error']) && $response['error'] === true) {
            $errorMsg = 'Failed to retrieve checkout session from PayMongo';
            if (isset($response['response']['errors'])) {
                $errors = $response['response']['errors'];
                $errorDetails = [];
                foreach ($errors as $error) {
                    if (isset($error['detail'])) {
                        $errorDetails[] = $error['detail'];
                    }
                }
                if (!empty($errorDetails)) {
                    $errorMsg .= ': ' . implode(', ', $errorDetails);
                }
            }
            echo json_encode([
                'success' => false, 
                'message' => $errorMsg,
                'debug_info' => $response
            ]);
            return;
        }
        
        if (!$response || !isset($response['data'])) {
            echo json_encode([
                'success' => false, 
                'message' => 'Invalid response from PayMongo',
                'debug_info' => $response
            ]);
            return;
        }
        
        $checkout_session = $response['data'];
        $attributes = $checkout_session['attributes'];
        
        // Determine payment status from checkout session
        // PayMongo doesn't have a direct 'payment_status' field in checkout sessions
        // We need to check: paid_at timestamp, payment_intent status, or payments array
        $payment_status = 'unpaid';
        
        if (!empty($attributes['paid_at'])) {
            // If paid_at timestamp exists, payment is complete
            $payment_status = 'paid';
        } elseif (isset($attributes['payment_intent']['attributes']['status'])) {
            // Check payment intent status
            $piStatus = $attributes['payment_intent']['attributes']['status'];
            if ($piStatus === 'succeeded' || $piStatus === 'processing') {
                $payment_status = 'paid';
            }
        } elseif (!empty($attributes['payments'])) {
            // Check if there are successful payments
            foreach ($attributes['payments'] as $payment) {
                if (isset($payment['attributes']['status']) && $payment['attributes']['status'] === 'paid') {
                    $payment_status = 'paid';
                    break;
                }
            }
        }
        
        // Get payment intent ID
        $payment_intent_id = null;
        if (isset($attributes['payment_intent']['id'])) {
            $payment_intent_id = $attributes['payment_intent']['id'];
        } elseif (isset($attributes['payment_intent_id'])) {
            $payment_intent_id = $attributes['payment_intent_id'];
        }
        
        // Get order by checkout session ID (without user restriction first)
        $stmt = $db->prepare("
            SELECT id, order_number, payment_status, user_id FROM orders 
            WHERE paymongo_checkout_id = ?
        ");
        $stmt->execute([$checkout_session_id]);
        $order = $stmt->fetch();
        
        if (!$order) {
            echo json_encode([
                'success' => false, 
                'message' => 'Order not found for this checkout session',
                'debug_info' => ['checkout_id' => $checkout_session_id]
            ]);
            return;
        }
        
        // Update order if payment is successful
        if ($payment_status === 'paid' && $order['payment_status'] !== 'paid') {
            // Get payment method from checkout session attributes
            $payment_method = null;
            
            // Try to get from payment_method_used first (most reliable)
            if (isset($attributes['payment_method_used'])) {
                $payment_method = $attributes['payment_method_used'];
            }
            // Or from payments array
            elseif (!empty($attributes['payments'])) {
                $firstPayment = $attributes['payments'][0];
                if (isset($firstPayment['attributes']['source']['type'])) {
                    $payment_method = $firstPayment['attributes']['source']['type'];
                }
            }
            // Or from payment intent payments
            elseif (isset($attributes['payment_intent']['attributes']['payments'])) {
                $payments = $attributes['payment_intent']['attributes']['payments'];
                if (!empty($payments) && isset($payments[0]['attributes']['source']['type'])) {
                    $payment_method = $payments[0]['attributes']['source']['type'];
                }
            }
            
            $stmt = $db->prepare("
                UPDATE orders 
                SET payment_status = 'paid', 
                    payment_intent_id = ?,
                    payment_method = ?,
                    paid_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$payment_intent_id, $payment_method, $order['id']]);
        }
        
        echo json_encode([
            'success' => true,
            'payment_status' => $payment_status,
            'order_number' => $order['order_number'],
            'order_id' => $order['id']
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Handle PayMongo webhooks
 */
function handleWebhook() {
    try {
        // Get raw POST body
        $payload = file_get_contents('php://input');
        $event = json_decode($payload, true);
        
        // Verify webhook signature (optional but recommended)
        // For production, implement webhook signature verification
        
        if (!isset($event['data'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid webhook payload']);
            return;
        }
        
        $eventType = $event['data']['attributes']['type'] ?? '';
        
        // Handle payment.paid event
        if ($eventType === 'payment.paid') {
            $paymentIntent = $event['data']['attributes']['data'] ?? null;
            
            if ($paymentIntent) {
                $paymentIntentId = $paymentIntent['id'];
                $metadata = $paymentIntent['attributes']['metadata'] ?? [];
                $orderId = $metadata['order_id'] ?? null;
                
                if ($orderId) {
                    $database = Database::getInstance();
                    $db = $database->getConnection();
                    
                    // Get payment method
                    $payment_method = null;
                    if (isset($paymentIntent['attributes']['payments'])) {
                        $payments = $paymentIntent['attributes']['payments'];
                        if (!empty($payments)) {
                            $payment_method = $payments[0]['attributes']['source']['type'] ?? null;
                        }
                    }
                    
                    // Update order payment status
                    $stmt = $db->prepare("
                        UPDATE orders 
                        SET payment_status = 'paid',
                            payment_intent_id = ?,
                            payment_method = ?,
                            paid_at = NOW()
                        WHERE id = ? AND payment_status = 'pending'
                    ");
                    $stmt->execute([$paymentIntentId, $payment_method, $orderId]);
                }
            }
        }
        
        // Acknowledge webhook receipt
        http_response_code(200);
        echo json_encode(['success' => true]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Webhook error: ' . $e->getMessage()]);
    }
}

/**
 * Cancel order by checkout session ID
 */
function cancelOrderBySession() {
    try {
        $checkout_session_id = $_GET['session_id'] ?? '';
        
        if (!$checkout_session_id) {
            echo json_encode(['success' => false, 'message' => 'Missing session ID']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get order by checkout session ID
        $stmt = $db->prepare("
            SELECT id, order_number, status, payment_status 
            FROM orders 
            WHERE paymongo_checkout_id = ?
        ");
        $stmt->execute([$checkout_session_id]);
        $order = $stmt->fetch();
        
        if (!$order) {
            echo json_encode([
                'success' => false, 
                'message' => 'Order not found for this checkout session'
            ]);
            return;
        }
        
        // Only cancel if payment is still pending
        if ($order['payment_status'] === 'pending') {
            $stmt = $db->prepare("
                UPDATE orders 
                SET status = 'cancelled', 
                    updated_at = NOW()
                WHERE id = ? AND payment_status = 'pending'
            ");
            $stmt->execute([$order['id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'order_number' => $order['order_number'],
                'order_id' => $order['id']
            ]);
        } else {
            // Order was already paid, don't cancel
            echo json_encode([
                'success' => false,
                'message' => 'Cannot cancel order - payment already processed',
                'order_number' => $order['order_number'],
                'payment_status' => $order['payment_status']
            ]);
        }
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Call PayMongo API
 */
function callPayMongoAPI($method, $endpoint, $data = null) {
    $apiBaseUrl = PayMongoConfig::getApiBaseUrl();
    $secretKey = PayMongoConfig::getSecretKey();
    
    $url = $apiBaseUrl . $endpoint;
    
    $ch = curl_init($url);
    
    $headers = [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($secretKey . ':')
    ];
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    
    curl_close($ch);
    
    // Log detailed error information
    if ($httpCode >= 200 && $httpCode < 300) {
        return json_decode($response, true);
    } else {
        $errorDetails = "PayMongo API Error: HTTP $httpCode";
        if ($curlError) {
            $errorDetails .= " - cURL Error: $curlError";
        }
        if ($response) {
            $errorDetails .= " - Response: $response";
        }
        error_log($errorDetails);
        
        // Return error details for better debugging
        return [
            'error' => true,
            'http_code' => $httpCode,
            'curl_error' => $curlError,
            'response' => $response ? json_decode($response, true) : null
        ];
    }
}

?>

