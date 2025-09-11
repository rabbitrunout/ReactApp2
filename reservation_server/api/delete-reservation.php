<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

// ----------------- CORS -----------------
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once('../config/config.php');
require_once('../config/database.php');

// Проверка авторизации
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit;
}

// Только для admin
if ($_SESSION['role'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Access denied: admin only"]);
    exit;
}

// Получаем ID бронирования
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? intval($data['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid ID']);
    exit;
}

// ----------------- Получаем имя изображения -----------------
$stmt = $conn->prepare("SELECT imageName FROM reservations WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->bind_result($imageName);
$stmt->fetch();
$stmt->close();

// ----------------- Удаляем запись -----------------
$stmt = $conn->prepare("DELETE FROM reservations WHERE id=?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // ----------------- Удаляем файл изображения -----------------
    if ($imageName) {
        $filePath = __DIR__ . "/uploads/" . $imageName;
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
    echo json_encode(['success' => true, 'message' => 'Reservation deleted successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
