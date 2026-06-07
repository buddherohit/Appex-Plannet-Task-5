<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Read active notes (requires auth)
        $currentUser = JWTHelper::requireAuth();
        
        $category = isset($_GET['category']) ? trim($_GET['category']) : null;
        $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;

        $query = "SELECT n.*, u.name AS uploader_name FROM notes n JOIN users u ON n.uploader_id = u.id WHERE 1=1";
        $params = [];

        if ($category && $category !== 'All') {
            $query .= " AND n.category = :category";
            $params[':category'] = $category;
        }

        if ($search) {
            $query .= " AND (n.title LIKE :search OR n.description LIKE :search)";
            $params[':search'] = $search;
        }

        $query .= " ORDER BY n.created_at DESC";

        try {
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $notes = $stmt->fetchAll();
            echo json_encode(["success" => true, "notes" => $notes]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Upload Notes (Requires auth)
        $currentUser = JWTHelper::requireAuth();

        if (!isset($_POST['title']) || !isset($_POST['category']) || !isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Title, category, and file are required."]);
            break;
        }

        $title = trim($_POST['title']);
        $description = isset($_POST['description']) ? trim($_POST['description']) : "";
        $category = trim($_POST['category']);
        
        $file = $_FILES['file'];
        $fileName = $file['name'];
        $fileTmp = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];

        if ($fileError !== 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Error uploading file. Error code: $fileError"]);
            break;
        }

        // Validate file size (e.g. limit to 10MB)
        if ($fileSize > 10 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "File size is too large (max 10MB)."]);
            break;
        }

        // Extract extension and validate
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = ['pdf', 'docx', 'pptx', 'jpg', 'png'];

        if (!in_array($fileExt, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid file extension. Allowed extensions: " . implode(', ', $allowedExtensions)]);
            break;
        }

        // Setup upload directory
        $uploadDir = __DIR__ . '/../uploads/notes/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Create a unique name to prevent collisions
        $newFileName = uniqid('note_', true) . '.' . $fileExt;
        $destination = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmp, $destination)) {
            // Save in database
            // Store relative path for frontend access
            $relativePath = 'uploads/notes/' . $newFileName;

            try {
                $stmt = $db->prepare("INSERT INTO notes (title, description, category, file_path, file_type, uploader_id) VALUES (:title, :description, :category, :file_path, :file_type, :uploader_id)");
                $stmt->execute([
                    ':title' => $title,
                    ':description' => $description,
                    ':category' => $category,
                    ':file_path' => $relativePath,
                    ':file_type' => $fileExt,
                    ':uploader_id' => $currentUser['id']
                ]);
                $noteId = $db->lastInsertId();

                logActivity($db, $currentUser['id'], "Uploaded Notes", "Uploaded notes document: $title");
                addNotification($db, null, "notes", "New Notes uploaded: '$title' in $category.");

                echo json_encode(["success" => true, "message" => "File uploaded successfully.", "id" => $noteId]);
            } catch (Exception $e) {
                // Delete uploaded file if DB fails
                if (file_exists($destination)) {
                    unlink($destination);
                }
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to save file onto the server."]);
        }
        break;

    case 'DELETE':
        // Delete Notes (Uploader or Admin only)
        $currentUser = JWTHelper::requireAuth();
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid notes ID."]);
            break;
        }

        try {
            $stmt = $db->prepare("SELECT uploader_id, file_path, title FROM notes WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $note = $stmt->fetch();

            if (!$note) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Notes file not found."]);
                break;
            }

            // Check permissions: must be uploader or admin
            if ($note['uploader_id'] !== $currentUser['id'] && $currentUser['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "You do not have permission to delete this file."]);
                break;
            }

            // Delete physical file
            $filePath = __DIR__ . '/../' . $note['file_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Delete from database
            $del = $db->prepare("DELETE FROM notes WHERE id = :id");
            $del->execute([':id' => $id]);

            logActivity($db, $currentUser['id'], "Deleted Notes", "Deleted notes document: " . $note['title']);

            echo json_encode(["success" => true, "message" => "Notes document deleted successfully."]);
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
