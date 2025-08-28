<?php
// Разрешаем CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Обработка preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once('../config/config.php');     // подключение конфига
require_once('../config/database.php');   // подключение к базе

// Получаем JSON из тела запроса
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id']) || empty($data['status'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields']);
    exit();
}

$id = (int)$data['id'];
$status = filter_var($data['status'], FILTER_SANITIZE_STRING);

// Проверяем, что поле status существует в таблице
$stmt = $conn->prepare("UPDATE reservations SET status=? WHERE id=?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Status updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error updating status: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
