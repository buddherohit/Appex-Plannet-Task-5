<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        // Retrieve placement prep resources (Requires auth)
        $currentUser = JWTHelper::requireAuth();
        
        $category = isset($_GET['category']) ? trim($_GET['category']) : null;
        $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;

        $query = "SELECT * FROM placement_prep WHERE 1=1";
        $params = [];

        if ($category && in_array($category, ['dsa', 'aptitude', 'interview'])) {
            $query .= " AND category = :category";
            $params[':category'] = $category;
        }

        if ($search) {
            $query .= " AND (title LIKE :search OR content LIKE :search)";
            $params[':search'] = $search;
        }

        $query .= " ORDER BY created_at DESC";

        try {
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $resources = $stmt->fetchAll();
            echo json_encode(["success" => true, "resources" => $resources]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Add resource (Admin only)
        $currentUser = JWTHelper::requireAdmin();

        if (!isset($data['title']) || !isset($data['category']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Title, category, and content are required."]);
            break;
        }

        $title = trim($data['title']);
        $category = trim($data['category']);
        $content = trim($data['content']);
        $resource_url = isset($data['resource_url']) ? trim($data['resource_url']) : null;

        if (!in_array($category, ['dsa', 'aptitude', 'interview'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid category. Must be 'dsa', 'aptitude', or 'interview'."]);
            break;
        }

        try {
            $stmt = $db->prepare("INSERT INTO placement_prep (title, category, content, resource_url) VALUES (:title, :category, :content, :resource_url)");
            $stmt->execute([
                ':title' => $title,
                ':category' => $category,
                ':content' => $content,
                ':resource_url' => $resource_url
            ]);
            $resourceId = $db->lastInsertId();

            logActivity($db, $currentUser['id'], "Created Placement Resource", "Created '$category' material: $title");
            addNotification($db, null, "general", "New placement preparation material added: '$title' in " . strtoupper($category));

            echo json_encode(["success" => true, "message" => "Placement resource created successfully.", "id" => $resourceId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete resource (Admin only)
        $currentUser = JWTHelper::requireAdmin();
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid resource ID."]);
            break;
        }

        try {
            $stmt = $db->prepare("SELECT title FROM placement_prep WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $res = $stmt->fetch();

            if (!$res) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Placement resource not found."]);
                break;
            }

            $del = $db->prepare("DELETE FROM placement_prep WHERE id = :id");
            $del->execute([':id' => $id]);

            logActivity($db, $currentUser['id'], "Deleted Placement Resource", "Deleted placement resource: " . $res['title']);

            echo json_encode(["success" => true, "message" => "Placement resource deleted successfully."]);
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
