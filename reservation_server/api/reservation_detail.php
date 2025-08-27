<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once('../config/config.php');
require_once('../config/database.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Получаем ID бронирования из URL
    $requestUri = $_SERVER['REQUEST_URI'];
    $parts = explode('/', $requestUri);
    $id = (int)end($parts); // Преобразуем в число для безопасности

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid reservation ID']);
        exit();
    }

    // Запрос с подготовленным выражением
    $query = "SELECT r.*,
        (SELECT COUNT(*) FROM reservation_votes WHERE reservation_id = r.id AND vote_type = 'like') AS numLikes,
        (SELECT COUNT(*) FROM reservation_votes WHERE reservation_id = r.id AND vote_type = 'dislike') AS numDislikes
        FROM reservations AS r
        WHERE r.id = ?";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['message' => 'Database prepare error: ' . $conn->error]);
        exit();
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['message' => 'Reservation not found']);
    } else {
        $reservation = $result->fetch_assoc();
        echo json_encode(['reservation' => $reservation]);
    }

    $stmt->close();
    $conn->close();
}
?>
