<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Обработка preflight-запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once('../config/config.php');
require_once('../config/database.php');

// Получаем JSON из POST
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'], $data['status'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing ID or status']);
    exit();
}

$id = (int)$data['id'];
$status = $data['status'];

// Проверка статуса
$allowedStatuses = ['confirmed', 'cancelled', 'pending'];
if (!in_array($status, $allowedStatuses)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid status']);
    exit();
}

// Обновляем статус в базе
$stmt = $conn->prepare("UPDATE reservations SET status = ? WHERE id = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
    exit();
}

$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Status updated']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to update status']);
}

$stmt->close();
$conn->close();


?>
