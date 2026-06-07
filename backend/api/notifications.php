<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$currentUser = JWTHelper::requireAuth();

switch ($method) {
    case 'GET':
        // Retrieve notifications for user (specific + global)
        try {
            $stmt = $db->prepare("
                SELECT * FROM notifications 
                WHERE user_id = :user_id OR user_id IS NULL 
                ORDER BY created_at DESC 
                LIMIT 20
            ");
            $stmt->execute([':user_id' => $currentUser['id']]);
            $notifications = $stmt->fetchAll();
            echo json_encode(["success" => true, "notifications" => $notifications]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Mark all as read
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        if ($action === 'read-all') {
            try {
                // Since user_id IS NULL are global notifications, we can't easily mark them read for a single user
                // unless we track per-user reads (which adds database complexity).
                // Let's mark all user-specific notifications as read.
                $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :user_id");
                $stmt->execute([':user_id' => $currentUser['id']]);

                echo json_encode(["success" => true, "message" => "All notifications marked as read."]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid action."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed."]);
        break;
}
?>
