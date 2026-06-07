<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$currentUser = JWTHelper::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

try {
    if ($currentUser['role'] === 'admin') {
        // Admins can see all logs or a specific user's logs
        $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
        
        if ($user_id > 0) {
            $stmt = $db->prepare("SELECT a.*, u.name as user_name FROM activity_logs a JOIN users u ON a.user_id = u.id WHERE a.user_id = :user_id ORDER BY a.created_at DESC LIMIT 50");
            $stmt->execute([':user_id' => $user_id]);
        } else {
            $stmt = $db->prepare("SELECT a.*, u.name as user_name FROM activity_logs a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 100");
            $stmt->execute();
        }
    } else {
        // Students can only see their own logs
        $stmt = $db->prepare("SELECT a.*, u.name as user_name FROM activity_logs a JOIN users u ON a.user_id = u.id WHERE a.user_id = :user_id ORDER BY a.created_at DESC LIMIT 30");
        $stmt->execute([':user_id' => $currentUser['id']]);
    }

    $logs = $stmt->fetchAll();
    echo json_encode(["success" => true, "logs" => $logs]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
