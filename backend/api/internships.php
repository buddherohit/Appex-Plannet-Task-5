<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        // Retrieve Internship listings
        $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;
        $location = isset($_GET['location']) ? trim($_GET['location']) : null;

        $query = "SELECT * FROM internships WHERE 1=1";
        $params = [];

        if ($search) {
            $query .= " AND (title LIKE :search OR company LIKE :search OR description LIKE :search OR requirements LIKE :search)";
            $params[':search'] = $search;
        }

        if ($location && $location !== 'All') {
            $query .= " AND location = :location";
            $params[':location'] = $location;
        }

        $query .= " ORDER BY created_at DESC";

        try {
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $internships = $stmt->fetchAll();
            echo json_encode(["success" => true, "internships" => $internships]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create new internship posting (Admin only)
        $currentUser = JWTHelper::requireAdmin();

        if (!isset($data['title']) || !isset($data['company']) || !isset($data['description']) || !isset($data['requirements']) || !isset($data['duration']) || !isset($data['stipend']) || !isset($data['location']) || !isset($data['deadline'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required fields."]);
            break;
        }

        $title = trim($data['title']);
        $company = trim($data['company']);
        $description = trim($data['description']);
        $requirements = trim($data['requirements']);
        $duration = trim($data['duration']);
        $stipend = trim($data['stipend']);
        $location = trim($data['location']);
        $deadline = trim($data['deadline']);

        try {
            $stmt = $db->prepare("INSERT INTO internships (title, company, description, requirements, duration, stipend, location, deadline) VALUES (:title, :company, :description, :requirements, :duration, :stipend, :location, :deadline)");
            $stmt->execute([
                ':title' => $title,
                ':company' => $company,
                ':description' => $description,
                ':requirements' => $requirements,
                ':duration' => $duration,
                ':stipend' => $stipend,
                ':location' => $location,
                ':deadline' => $deadline
            ]);
            $internshipId = $db->lastInsertId();

            logActivity($db, $currentUser['id'], "Created Internship", "Created internship posting: $title at $company");
            addNotification($db, null, "internship", "New Internship: '$title' at $company. Apply before $deadline.");

            echo json_encode(["success" => true, "message" => "Internship posting created successfully.", "id" => $internshipId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update internship posting (Admin only)
        $currentUser = JWTHelper::requireAdmin();
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid internship ID."]);
            break;
        }

        if (!isset($data['title']) || !isset($data['company']) || !isset($data['description']) || !isset($data['requirements']) || !isset($data['duration']) || !isset($data['stipend']) || !isset($data['location']) || !isset($data['deadline'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required fields."]);
            break;
        }

        $title = trim($data['title']);
        $company = trim($data['company']);
        $description = trim($data['description']);
        $requirements = trim($data['requirements']);
        $duration = trim($data['duration']);
        $stipend = trim($data['stipend']);
        $location = trim($data['location']);
        $deadline = trim($data['deadline']);

        try {
            $stmt = $db->prepare("UPDATE internships SET title = :title, company = :company, description = :description, requirements = :requirements, duration = :duration, stipend = :stipend, location = :location, deadline = :deadline WHERE id = :id");
            $stmt->execute([
                ':title' => $title,
                ':company' => $company,
                ':description' => $description,
                ':requirements' => $requirements,
                ':duration' => $duration,
                ':stipend' => $stipend,
                ':location' => $location,
                ':deadline' => $deadline,
                ':id' => $id
            ]);

            logActivity($db, $currentUser['id'], "Updated Internship", "Updated internship posting details for: $title at $company");

            echo json_encode(["success" => true, "message" => "Internship posting updated successfully."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete internship posting (Admin only)
        $currentUser = JWTHelper::requireAdmin();
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid internship ID."]);
            break;
        }

        try {
            $stmt = $db->prepare("SELECT title, company FROM internships WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $internship = $stmt->fetch();

            if (!$internship) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Internship posting not found."]);
                break;
            }

            $del = $db->prepare("DELETE FROM internships WHERE id = :id");
            $del->execute([':id' => $id]);

            logActivity($db, $currentUser['id'], "Deleted Internship", "Deleted internship: " . $internship['title'] . " at " . $internship['company']);

            echo json_encode(["success" => true, "message" => "Internship posting deleted successfully."]);
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
