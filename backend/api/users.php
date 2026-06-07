<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$currentUser = JWTHelper::requireAdmin();
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        // List all users
        try {
            $stmt = $db->query("SELECT id, name, email, role, profile_pic, is_verified, created_at FROM users ORDER BY created_at DESC");
            $users = $stmt->fetchAll();
            echo json_encode(["success" => true, "users" => $users]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update user (e.g. toggle admin role or verification)
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id <= 0 || !isset($data['role'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid parameters."]);
            break;
        }

        $role = trim($data['role']);
        if (!in_array($role, ['student', 'admin'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid role."]);
            break;
        }

        try {
            // Prevent deleting or modifying own role
            if ($id === $currentUser['id']) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "You cannot modify your own administrative role."]);
                break;
            }

            $stmt = $db->prepare("UPDATE users SET role = :role WHERE id = :id");
            $stmt->execute([':role' => $role, ':id' => $id]);

            logActivity($db, $currentUser['id'], "Modified User Role", "Updated user ID $id role to '$role'");

            echo json_encode(["success" => true, "message" => "User role updated successfully."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete user
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid user ID."]);
            break;
        }

        if ($id === $currentUser['id']) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "You cannot delete your own admin account."]);
            break;
        }

        try {
            $check = $db->prepare("SELECT name FROM users WHERE id = :id");
            $check->execute([':id' => $id]);
            $userToDelete = $check->fetch();

            if (!$userToDelete) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "User not found."]);
                break;
            }

            $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $id]);

            logActivity($db, $currentUser['id'], "Deleted User Account", "Deleted user: " . $userToDelete['name']);

            echo json_encode(["success" => true, "message" => "User account deleted successfully."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed."]);
        break;
}
?>
