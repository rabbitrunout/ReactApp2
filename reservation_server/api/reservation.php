<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");

require_once('../config/config.php');
require_once('../config/database.php');

$id = null;

// Получаем ID резервации из GET или из URI (если RESTful)
if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int)$_GET['id'];
} else {
    // Попытка получить ID из URL: /reservation.php/123
    $requestUri = $_SERVER['REQUEST_URI'];
    $parts = explode('/', trim($requestUri, '/'));
    $idCandidate = end($parts);
    if (is_numeric($idCandidate)) {
        $id = (int)$idCandidate;
    }
}

if (!$id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid reservation ID']);
    exit();
}

// Запрос к базе с LEFT JOIN на ресурс
$query = "
    SELECT r.id, r.booking_date, r.start_time, r.end_time, r.status, r.imageName,
           res.name AS resource_name
    FROM reservations r
    LEFT JOIN resources res ON r.resource_id = res.id
    WHERE r.id = ?
";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $reservation = $result->fetch_assoc();

    // Формируем читаемый JSON
    $response = [
        'status' => 'success',
        'data' => [
            'id' => $reservation['id'],
            'booking_date' => $reservation['booking_date'],
            'start_time' => $reservation['start_time'],
            'end_time' => $reservation['end_time'],
            'status' => $reservation['status'],
            'resource_name' => $reservation['resource_name'] ?? 'Unknown',
            'imageName' => $reservation['imageName'] ?? null
        ]
    ];

    echo json_encode($response);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Reservation not found']);
}

$stmt->close();
$conn->close();
?>
