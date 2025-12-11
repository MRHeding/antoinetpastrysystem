<?php
require_once 'config/database.php';

try {
    $database = Database::getInstance();
    $db = $database->getConnection();

    $sql = file_get_contents('database/create_product_reviews_table.sql');

    // Remove comments and split by semicolon to execute multiple statements if any
    $statements = array_filter(array_map('trim', explode(';', $sql)));

    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $db->exec($statement);
            echo "Executed: " . substr($statement, 0, 50) . "...\n";
        }
    }

    echo "Product reviews table setup completed successfully.";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
