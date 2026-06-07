<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Pre-flight options request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/jwt_helper.php';

// Instantiate database & get connection
$database = new Database();
$db = $database->getConnection();

// Core helper for logging user actions
function logActivity($conn, $userId, $action, $details = null) {
    try {
        $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (:user_id, :action, :details)");
        $stmt->execute([
            ':user_id' => $userId,
            ':action' => $action,
            ':details' => $details
        ]);
    } catch (Exception $e) {
        // Log silently
    }
}

// Core helper for creating notification
function addNotification($conn, $userId, $type, $message) {
    try {
        $stmt = $conn->prepare("INSERT INTO notifications (user_id, type, message) VALUES (:user_id, :type, :message)");
        $stmt->execute([
            ':user_id' => $userId,
            ':type' => $type,
            ':message' => $message
        ]);
    } catch (Exception $e) {
        // Log silently
    }
}
?>
