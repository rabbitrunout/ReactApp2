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

// Проверяем обязательные поля
$required = ['id', 'booking_date', 'start_time', 'end_time', 'resource_id'];
foreach ($required as $field) {
    if (!isset($_POST[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit;
    }
}

$id = intval($_POST['id']);
$booking_date = $_POST['booking_date'];
$start_time = $_POST['start_time'];
$end_time = $_POST['end_time'];
$resource_id = intval($_POST['resource_id']);

// Обработка изображения
$imageName = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
    $uploadDir = __DIR__ . "/uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $imageName = basename($_FILES['image']['name']);
    $targetFile = $uploadDir . $imageName;
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to upload image']);
        exit;
    }
}

// Подготовка SQL
if ($imageName) {
    $stmt = $conn->prepare("UPDATE reservations SET booking_date=?, start_time=?, end_time=?, resource_id=?, imageName=? WHERE id=?");
    $stmt->bind_param("sssisi", $booking_date, $start_time, $end_time, $resource_id, $imageName, $id);
} else {
    $stmt = $conn->prepare("UPDATE reservations SET booking_date=?, start_time=?, end_time=?, resource_id=? WHERE id=?");
    $stmt->bind_param("sssii", $booking_date, $start_time, $end_time, $resource_id, $id);
}

// Выполнение запроса
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Reservation updated successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
