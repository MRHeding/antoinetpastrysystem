<?php
// Test script for orders API
header('Content-Type: text/html; charset=utf-8');

echo "<h1>Orders API Test</h1>";

// Test 1: Check if orders API is accessible
echo "<h2>Test 1: API Accessibility</h2>";
$url = 'http://localhost:8000/api/orders.php?action=get_user_orders';
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Cookie: session_token=test_token'
    ]
]);

$response = @file_get_contents($url, false, $context);
if ($response === false) {
    echo "<p style='color: red;'>❌ API not accessible</p>";
} else {
    echo "<p style='color: green;'>✅ API accessible</p>";
    $data = json_decode($response, true);
    echo "<pre>" . print_r($data, true) . "</pre>";
}

// Test 2: Check database connection
echo "<h2>Test 2: Database Connection</h2>";
try {
    require_once 'config/database.php';
    $database = Database::getInstance();
    $db = $database->getConnection();
    echo "<p style='color: green;'>✅ Database connection successful</p>";
    
    // Test 3: Check if orders table exists and has data
    echo "<h2>Test 3: Orders Table</h2>";
    $stmt = $db->query("SELECT COUNT(*) as count FROM orders");
    $result = $stmt->fetch();
    echo "<p>Orders in database: " . $result['count'] . "</p>";
    
    if ($result['count'] > 0) {
        echo "<p style='color: green;'>✅ Orders table has data</p>";
        
        // Show sample orders
        $stmt = $db->query("SELECT id, order_number, total_amount, status FROM orders LIMIT 5");
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Sample Orders:</h3>";
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>Order Number</th><th>Total Amount</th><th>Status</th></tr>";
        foreach ($orders as $order) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($order['id']) . "</td>";
            echo "<td>" . htmlspecialchars($order['order_number']) . "</td>";
            echo "<td>" . htmlspecialchars($order['total_amount']) . "</td>";
            echo "<td>" . htmlspecialchars($order['status']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: orange;'>⚠️ Orders table is empty</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// Test 4: Check if sample data exists
echo "<h2>Test 4: Sample Data</h2>";
if (file_exists('database/insert_sample_orders.sql')) {
    echo "<p style='color: green;'>✅ Sample data script exists</p>";
    echo "<p>To insert sample data, run the SQL script in your database:</p>";
    echo "<pre>" . htmlspecialchars(file_get_contents('database/insert_sample_orders.sql')) . "</pre>";
} else {
    echo "<p style='color: red;'>❌ Sample data script not found</p>";
}

echo "<h2>Instructions</h2>";
echo "<ol>";
echo "<li>Make sure XAMPP is running</li>";
echo "<li>Import the database from database/antoinettes_pastries.sql</li>";
echo "<li>Run the sample data script: database/insert_sample_orders.sql</li>";
echo "<li>Update the database structure: database/update_orders_structure.sql</li>";
echo "<li>Test the orders page at: <a href='http://localhost:8000/orders.html'>http://localhost:8000/orders.html</a></li>";
echo "</ol>";
?>
