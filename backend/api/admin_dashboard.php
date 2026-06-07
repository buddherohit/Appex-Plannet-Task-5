<?php
require_once __DIR__ . '/../helpers/api_bootstrap.php';

$currentUser = JWTHelper::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

try {
    // 1. Overall Quick Counters
    $users_cnt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
    $courses_cnt = $db->query("SELECT COUNT(*) FROM courses")->fetchColumn();
    $notes_cnt = $db->query("SELECT COUNT(*) FROM notes")->fetchColumn();
    $jobs_cnt = $db->query("SELECT COUNT(*) FROM jobs")->fetchColumn();
    $internships_cnt = $db->query("SELECT COUNT(*) FROM internships")->fetchColumn();
    $apps_cnt = $db->query("SELECT COUNT(*) FROM applications")->fetchColumn();

    // 2. User Registrations Trend (Last 15 days)
    $reg_trend = $db->query("
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as reg_date, COUNT(*) as reg_count 
        FROM users 
        GROUP BY reg_date 
        ORDER BY reg_date ASC 
        LIMIT 15
    ")->fetchAll();

    // 3. Applications Breakdown (Job vs Internship)
    $apps_breakdown = $db->query("
        SELECT type, COUNT(*) as app_count 
        FROM applications 
        GROUP BY type
    ")->fetchAll();

    // 4. Notes Upload Trends by Category
    $notes_categories = $db->query("
        SELECT category, COUNT(*) as upload_count 
        FROM notes 
        GROUP BY category
    ")->fetchAll();

    // 5. Job vs Internship Postings Counts
    $posts_breakdown = [
        "jobs" => intval($jobs_cnt),
        "internships" => intval($internships_cnt)
    ];

    // 6. Recent Applications List
    $recent_apps = $db->query("
        SELECT a.id, u.name as student_name, a.type, a.status, a.applied_at,
        CASE 
            WHEN a.type = 'job' THEN (SELECT title FROM jobs WHERE id = a.post_id)
            WHEN a.type = 'internship' THEN (SELECT title FROM internships WHERE id = a.post_id)
        END AS position_title
        FROM applications a
        JOIN users u ON a.student_id = u.id
        ORDER BY a.applied_at DESC
        LIMIT 5
    ")->fetchAll();

    echo json_encode([
        "success" => true,
        "counters" => [
            "students" => intval($users_cnt),
            "courses" => intval($courses_cnt),
            "notes" => intval($notes_cnt),
            "jobs" => intval($jobs_cnt),
            "internships" => intval($internships_cnt),
            "applications" => intval($apps_cnt)
        ],
        "reg_trend" => $reg_trend,
        "apps_breakdown" => $apps_breakdown,
        "notes_categories" => $notes_categories,
        "posts_breakdown" => $posts_breakdown,
        "recent_applications" => $recent_apps
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
