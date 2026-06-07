<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        // Fetch courses (Student & Admin)
        $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;
        $category = isset($_GET['category']) ? trim($_GET['category']) : null;
        
        $query = "SELECT * FROM courses WHERE 1=1";
        $params = [];

        if ($search) {
            $query .= " AND (title LIKE :search OR description LIKE :search OR instructor LIKE :search)";
            $params[':search'] = $search;
        }

        if ($category && $category !== 'All') {
            $query .= " AND category = :category";
            $params[':category'] = $category;
        }

        $query .= " ORDER BY created_at DESC";

        try {
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $courses = $stmt->fetchAll();
            echo json_encode(["success" => true, "courses" => $courses]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create course (Admin only)
        $currentUser = JWTHelper::requireAdmin();
        
        if (!isset($data['title']) || !isset($data['description']) || !isset($data['instructor']) || !isset($data['duration']) || !isset($data['category'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required fields."]);
            break;
        }

        $title = trim($data['title']);
        $description = trim($data['description']);
        $instructor = trim($data['instructor']);
        $duration = trim($data['duration']);
        $category = trim($data['category']);
        $image_url = isset($data['image_url']) ? trim($data['image_url']) : null;

        try {
            $stmt = $db->prepare("INSERT INTO courses (title, description, instructor, duration, category, image_url) VALUES (:title, :description, :instructor, :duration, :category, :image_url)");
            $stmt->execute([
                ':title' => $title,
                ':description' => $description,
                ':instructor' => $instructor,
                ':duration' => $duration,
                ':category' => $category,
                ':image_url' => $image_url
            ]);
            $courseId = $db->lastInsertId();

            logActivity($db, $currentUser['id'], "Created Course", "Created course: $title");
            addNotification($db, null, "general", "New Course Available: '$title' by $instructor.");

            echo json_encode(["success" => true, "message" => "Course created successfully.", "id" => $courseId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update course (Admin only)
        $currentUser = JWTHelper::requireAdmin();
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid course ID."]);
            break;
        }

        if (!isset($data['title']) || !isset($data['description']) || !isset($data['instructor']) || !isset($data['duration']) || !isset($data['category'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required fields."]);
            break;
        }

        $title = trim($data['title']);
        $description = trim($data['description']);
        $instructor = trim($data['instructor']);
        $duration = trim($data['duration']);
        $category = trim($data['category']);
        $image_url = isset($data['image_url']) ? trim($data['image_url']) : null;

        try {
            $stmt = $db->prepare("UPDATE courses SET title = :title, description = :description, instructor = :instructor, duration = :duration, category = :category, image_url = :image_url WHERE id = :id");
            $stmt->execute([
                ':title' => $title,
                ':description' => $description,
                ':instructor' => $instructor,
                ':duration' => $duration,
                ':category' => $category,
                ':image_url' => $image_url,
                ':id' => $id
            ]);

            logActivity($db, $currentUser['id'], "Updated Course", "Updated course details for: $title");

            echo json_encode(["success" => true, "message" => "Course updated successfully."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete course (Admin only)
        $currentUser = JWTHelper::requireAdmin();
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid course ID."]);
            break;
        }

        try {
            // Retrieve course title first for logging
            $stmt = $db->prepare("SELECT title FROM courses WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $course = $stmt->fetch();

            if (!$course) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Course not found."]);
                break;
            }

            $del = $db->prepare("DELETE FROM courses WHERE id = :id");
            $del->execute([':id' => $id]);

            logActivity($db, $currentUser['id'], "Deleted Course", "Deleted course: " . $course['title']);

            echo json_encode(["success" => true, "message" => "Course deleted successfully."]);
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
