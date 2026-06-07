<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        // Retrieve project listings (Requires auth)
        $currentUser = JWTHelper::requireAuth();
        
        $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;
        $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;

        $query = "SELECT p.*, u.name AS student_name, u.email AS student_email FROM projects p JOIN users u ON p.student_id = u.id WHERE 1=1";
        $params = [];

        if ($student_id > 0) {
            $query .= " AND p.student_id = :student_id";
            $params[':student_id'] = $student_id;
        }

        if ($search) {
            $query .= " AND (p.title LIKE :search OR p.description LIKE :search OR p.tech_stack LIKE :search)";
            $params[':search'] = $search;
        }

        $query .= " ORDER BY p.created_at DESC";

        try {
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $projects = $stmt->fetchAll();
            echo json_encode(["success" => true, "projects" => $projects]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Upload a new project (Student only, or admin on student's behalf, but generally any logged-in user)
        $currentUser = JWTHelper::requireAuth();

        if (!isset($data['title']) || !isset($data['description']) || !isset($data['tech_stack'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Title, description, and tech stack are required."]);
            break;
        }

        $title = trim($data['title']);
        $description = trim($data['description']);
        $tech_stack = trim($data['tech_stack']);
        $github_url = isset($data['github_url']) ? trim($data['github_url']) : null;
        $demo_url = isset($data['demo_url']) ? trim($data['demo_url']) : null;

        try {
            $stmt = $db->prepare("INSERT INTO projects (student_id, title, description, tech_stack, github_url, demo_url) VALUES (:student_id, :title, :description, :tech_stack, :github_url, :demo_url)");
            $stmt->execute([
                ':student_id' => $currentUser['id'],
                ':title' => $title,
                ':description' => $description,
                ':tech_stack' => $tech_stack,
                ':github_url' => $github_url,
                ':demo_url' => $demo_url
            ]);
            $projectId = $db->lastInsertId();

            logActivity($db, $currentUser['id'], "Uploaded Project", "Uploaded project: $title");
            addNotification($db, null, "general", "New Project Showcase: '$title' uploaded by " . $currentUser['name'] . ".");

            echo json_encode(["success" => true, "message" => "Project uploaded successfully.", "id" => $projectId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete a project (Owner or Admin only)
        $currentUser = JWTHelper::requireAuth();
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid project ID."]);
            break;
        }

        try {
            $stmt = $db->prepare("SELECT student_id, title FROM projects WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $project = $stmt->fetch();

            if (!$project) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Project not found."]);
                break;
            }

            if ($project['student_id'] !== $currentUser['id'] && $currentUser['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "You do not have permission to delete this project."]);
                break;
            }

            $del = $db->prepare("DELETE FROM projects WHERE id = :id");
            $del->execute([':id' => $id]);

            logActivity($db, $currentUser['id'], "Deleted Project", "Deleted project: " . $project['title']);

            echo json_encode(["success" => true, "message" => "Project deleted successfully."]);
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
