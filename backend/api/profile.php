<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"), true);
$currentUser = JWTHelper::requireAuth();

switch ($action) {
    case 'update':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Method not allowed."]);
            break;
        }

        if (!isset($data['name']) || !isset($data['email'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Name and email are required."]);
            break;
        }

        $name = trim($data['name']);
        $email = trim($data['email']);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid email format."]);
            break;
        }

        // Check email uniqueness, excluding current user
        $check = $db->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
        $check->execute([':email' => $email, ':id' => $currentUser['id']]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Email is already in use by another user."]);
            break;
        }

        try {
            $stmt = $db->prepare("UPDATE users SET name = :name, email = :email WHERE id = :id");
            $stmt->execute([
                ':name' => $name,
                ':email' => $email,
                ':id' => $currentUser['id']
            ]);

            logActivity($db, $currentUser['id'], "Profile Updated", "Updated name to '$name' and email to '$email'");

            echo json_encode(["success" => true, "message" => "Profile updated successfully.", "user" => ["name" => $name, "email" => $email]]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'upload-avatar':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Method not allowed."]);
            break;
        }

        if (!isset($_FILES['avatar'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Avatar image file is required."]);
            break;
        }

        $file = $_FILES['avatar'];
        $fileName = $file['name'];
        $fileTmp = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];

        if ($fileError !== 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Upload error. Code: $fileError"]);
            break;
        }

        // Limit size to 2MB
        if ($fileSize > 2 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Avatar size too large (max 2MB)."]);
            break;
        }

        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'png', 'jpeg'];

        if (!in_array($fileExt, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid image type. Allowed: JPG, PNG, JPEG."]);
            break;
        }

        // Upload path
        $uploadDir = __DIR__ . '/../uploads/avatars/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $newFileName = 'avatar_' . $currentUser['id'] . '_' . uniqid() . '.' . $fileExt;
        $destination = $uploadDir . $newFileName;

        // Fetch old avatar to delete it and save space
        $old_stmt = $db->prepare("SELECT profile_pic FROM users WHERE id = :id");
        $old_stmt->execute([':id' => $currentUser['id']]);
        $oldUser = $old_stmt->fetch();

        if (move_uploaded_file($fileTmp, $destination)) {
            $relativePath = 'uploads/avatars/' . $newFileName;

            try {
                $stmt = $db->prepare("UPDATE users SET profile_pic = :profile_pic WHERE id = :id");
                $stmt->execute([
                    ':profile_pic' => $relativePath,
                    ':id' => $currentUser['id']
                ]);

                // Delete old profile pic if it was local
                if ($oldUser && !empty($oldUser['profile_pic'])) {
                    $oldPath = __DIR__ . '/../' . $oldUser['profile_pic'];
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                    }
                }

                logActivity($db, $currentUser['id'], "Avatar Uploaded", "Uploaded new profile photo");

                echo json_encode([
                    "success" => true,
                    "message" => "Avatar uploaded successfully.",
                    "profile_pic" => $relativePath
                ]);
            } catch (Exception $e) {
                if (file_exists($destination)) {
                    unlink($destination);
                }
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to save avatar image on server."]);
        }
        break;

    case 'change-password':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Method not allowed."]);
            break;
        }

        if (!isset($data['current_password']) || !isset($data['new_password'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Current password and new password are required."]);
            break;
        }

        $current_pwd = $data['current_password'];
        $new_pwd = $data['new_password'];

        if (strlen($new_pwd) < 6) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "New password must be at least 6 characters."]);
            break;
        }

        try {
            // Get user current hashed password
            $stmt = $db->prepare("SELECT password FROM users WHERE id = :id");
            $stmt->execute([':id' => $currentUser['id']]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($current_pwd, $user['password'])) {
                http_response_code(401);
                echo json_encode(["success" => false, "message" => "Incorrect current password."]);
                break;
            }

            // Hash new password and update
            $new_hashed = password_hash($new_pwd, PASSWORD_BCRYPT);
            $update = $db->prepare("UPDATE users SET password = :password WHERE id = :id");
            $update->execute([
                ':password' => $new_hashed,
                ':id' => $currentUser['id']
            ]);

            logActivity($db, $currentUser['id'], "Password Changed", "User updated account password successfully");
            addNotification($db, $currentUser['id'], "general", "Your password was updated successfully.");

            echo json_encode(["success" => true, "message" => "Password changed successfully."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Action not found."]);
        break;
}
?>
