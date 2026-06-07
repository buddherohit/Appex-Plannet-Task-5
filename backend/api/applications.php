<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Retrieve applications (Requires auth)
        $currentUser = JWTHelper::requireAuth();

        try {
            if ($currentUser['role'] === 'admin') {
                // Admin sees all applications
                $query = "
                    SELECT a.*, u.name AS student_name, u.email AS student_email,
                    CASE 
                        WHEN a.type = 'job' THEN (SELECT title FROM jobs WHERE id = a.post_id)
                        WHEN a.type = 'internship' THEN (SELECT title FROM internships WHERE id = a.post_id)
                    END AS position_title,
                    CASE 
                        WHEN a.type = 'job' THEN (SELECT company FROM jobs WHERE id = a.post_id)
                        WHEN a.type = 'internship' THEN (SELECT company FROM internships WHERE id = a.post_id)
                    END AS company_name
                    FROM applications a
                    JOIN users u ON a.student_id = u.id
                    ORDER BY a.applied_at DESC
                ";
                $stmt = $db->prepare($query);
                $stmt->execute();
            } else {
                // Students see only their own applications
                $query = "
                    SELECT a.*,
                    CASE 
                        WHEN a.type = 'job' THEN (SELECT title FROM jobs WHERE id = a.post_id)
                        WHEN a.type = 'internship' THEN (SELECT title FROM internships WHERE id = a.post_id)
                    END AS position_title,
                    CASE 
                        WHEN a.type = 'job' THEN (SELECT company FROM jobs WHERE id = a.post_id)
                        WHEN a.type = 'internship' THEN (SELECT company FROM internships WHERE id = a.post_id)
                    END AS company_name
                    FROM applications a
                    WHERE a.student_id = :student_id
                    ORDER BY a.applied_at DESC
                ";
                $stmt = $db->prepare($query);
                $stmt->execute([':student_id' => $currentUser['id']]);
            }

            $applications = $stmt->fetchAll();
            echo json_encode(["success" => true, "applications" => $applications]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Apply for Job or Internship (Requires auth)
        $currentUser = JWTHelper::requireAuth();

        if (!isset($_POST['type']) || !isset($_POST['post_id']) || !isset($_FILES['resume'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Type, post ID, and resume file are required."]);
            break;
        }

        $type = trim($_POST['type']); // 'job' or 'internship'
        $post_id = intval($_POST['post_id']);
        
        if (!in_array($type, ['job', 'internship']) || $post_id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid parameters."]);
            break;
        }

        // Check if student has already applied
        $check = $db->prepare("SELECT id FROM applications WHERE student_id = :student_id AND type = :type AND post_id = :post_id");
        $check->execute([
            ':student_id' => $currentUser['id'],
            ':type' => $type,
            ':post_id' => $post_id
        ]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "You have already applied for this position."]);
            break;
        }

        // Validate post existence
        if ($type === 'job') {
            $checkPost = $db->prepare("SELECT title, company FROM jobs WHERE id = :id");
        } else {
            $checkPost = $db->prepare("SELECT title, company FROM internships WHERE id = :id");
        }
        $checkPost->execute([':id' => $post_id]);
        $post = $checkPost->fetch();

        if (!$post) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "The requested position does not exist."]);
            break;
        }

        // Handle Resume Upload
        $file = $_FILES['resume'];
        $fileName = $file['name'];
        $fileTmp = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];

        if ($fileError !== 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Error uploading resume. Error code: $fileError"]);
            break;
        }

        // Limit size to 5MB
        if ($fileSize > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Resume file is too large (max 5MB)."]);
            break;
        }

        // Validate extension (PDF or DOCX allowed for resumes)
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = ['pdf', 'docx'];

        if (!in_array($fileExt, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid extension. Allowed: PDF, DOCX."]);
            break;
        }

        // Prepare uploads folder
        $uploadDir = __DIR__ . '/../uploads/resumes/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $newFileName = uniqid('resume_' . $currentUser['id'] . '_', true) . '.' . $fileExt;
        $destination = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmp, $destination)) {
            $relativePath = 'uploads/resumes/' . $newFileName;

            try {
                $stmt = $db->prepare("INSERT INTO applications (student_id, type, post_id, resume_path, status) VALUES (:student_id, :type, :post_id, :resume_path, 'pending')");
                $stmt->execute([
                    ':student_id' => $currentUser['id'],
                    ':type' => $type,
                    ':post_id' => $post_id,
                    ':resume_path' => $relativePath
                ]);
                $applicationId = $db->lastInsertId();

                logActivity($db, $currentUser['id'], "Submitted Application", "Applied to $type: " . $post['title'] . " at " . $post['company']);
                addNotification($db, $currentUser['id'], "general", "Application submitted successfully for " . $post['title'] . " at " . $post['company'] . ".");

                echo json_encode(["success" => true, "message" => "Application submitted successfully.", "id" => $applicationId]);
            } catch (Exception $e) {
                if (file_exists($destination)) {
                    unlink($destination);
                }
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to save resume onto the server."]);
        }
        break;

    case 'PUT':
        // Update status of application (Admin only)
        $currentUser = JWTHelper::requireAdmin();
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        $data = json_decode(file_get_contents("php://input"), true);

        if ($id <= 0 || !isset($data['status'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Application ID and new status are required."]);
            break;
        }

        $status = trim($data['status']);
        if (!in_array($status, ['pending', 'reviewed', 'accepted', 'rejected'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid application status."]);
            break;
        }

        try {
            // Retrieve application info to push notification to student
            $query = "
                SELECT a.student_id, a.type, a.post_id, u.name AS student_name,
                CASE 
                    WHEN a.type = 'job' THEN (SELECT title FROM jobs WHERE id = a.post_id)
                    WHEN a.type = 'internship' THEN (SELECT title FROM internships WHERE id = a.post_id)
                END AS position_title,
                CASE 
                    WHEN a.type = 'job' THEN (SELECT company FROM jobs WHERE id = a.post_id)
                    WHEN a.type = 'internship' THEN (SELECT company FROM internships WHERE id = a.post_id)
                END AS company_name
                FROM applications a
                JOIN users u ON a.student_id = u.id
                WHERE a.id = :id
            ";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $id]);
            $application = $stmt->fetch();

            if (!$application) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Application not found."]);
                break;
            }

            // Update status
            $update = $db->prepare("UPDATE applications SET status = :status WHERE id = :id");
            $update->execute([':status' => $status, ':id' => $id]);

            logActivity($db, $currentUser['id'], "Updated Application Status", "Changed application status for " . $application['student_name'] . " to '$status'");
            
            // Send notification to student
            $message = "Your application for the position '" . $application['position_title'] . "' at " . $application['company_name'] . " has been updated to: " . strtoupper($status) . ".";
            addNotification($db, $application['student_id'], "general", $message);

            echo json_encode(["success" => true, "message" => "Application status updated successfully."]);
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
