<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

// ✅ Универсальные CORS-заголовки
header("Access-Control-Allow-Origin: http://localhost:3000"); // твой фронтенд
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// ✅ Обработка preflight-запроса (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once('../config/config.php');
require_once('../config/database.php');

// ✅ Require authentication
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

// ✅ Only allow admin
if ($_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Forbidden: Admins only"]);
    exit();
}

// ✅ Parse JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'], $data['status'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing ID or status"]);
    exit();
}

$id = intval($data['id']);
$status = trim($data['status']);

// ✅ Allowed statuses
$allowedStatuses = ['confirmed', 'cancelled', 'pending'];
if (!in_array($status, $allowedStatuses, true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid status"]);
    exit();
}

// ✅ Update reservation
$stmt = $conn->prepare("UPDATE reservations SET status = ? WHERE id = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    exit();
}

$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Status updated successfully"]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Reservation not found"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to update status"]);
}

$stmt->close();
$conn->close();
?>
