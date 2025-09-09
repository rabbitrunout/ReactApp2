<?php
// Заголовки для CORS и JSON
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Обработка preflight OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once('../config/config.php');
require_once('../config/database.php');

// Получение списка ресурсов
$result = $conn->query("SELECT id, name FROM resources ORDER BY name ASC");
$resources = [];
while ($row = $result->fetch_assoc()) {
    $resources[] = $row;
}

// Возврат JSON
echo json_encode(['status' => 'success', 'resources' => $resources]);

$conn->close();
?>
