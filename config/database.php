<?php
// Database configuration for Antoinette's Pastries
class Database {
    private $host = 'localhost';
    private $db_name = 'antoinettes_pastries';
    private $username = 'root';
    private $password = '';
    private $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
    
    // Test database connection
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            if ($conn) {
                return [
                    'success' => true,
                    'message' => 'Database connection successful'
                ];
            }
        } catch(PDOException $exception) {
            return [
                'success' => false,
                'message' => 'Connection error: ' . $exception->getMessage()
            ];
        }
    }
}
?>
