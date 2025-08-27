<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once('../config/config.php');
require_once('../config/database.php');

// Настройки
$maxReservationsPerPage = 20;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $maxReservationsPerPage;

// Считаем общее количество бронирований
$countQuery = "SELECT COUNT(*) AS totalReservations FROM reservations";
$countResult = mysqli_query($conn, $countQuery);
if (!$countResult) {
    http_response_code(500);
    echo json_encode(['message' => 'Error querying database for total reservations: ' . mysqli_error($conn)]);
    mysqli_close($conn);
    exit();
}
$countRow = mysqli_fetch_assoc($countResult);
$totalReservations = $countRow['totalReservations'] ?? 0;

// Получаем бронирования с пагинацией и сортировкой
$query = "SELECT * FROM reservations ORDER BY booking_date DESC, start_time ASC LIMIT $offset, $maxReservationsPerPage";
$result = mysqli_query($conn, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode(['message' => 'Error querying database for reservations: ' . mysqli_error($conn)]);
    mysqli_close($conn);
    exit();
}

$reservations = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Проверяем наличие данных
if (empty($reservations)) {
    http_response_code(404);
    echo json_encode(['message' => 'No reservations found', 'totalReservations' => $totalReservations]);
} else {
    echo json_encode(['reservations' => $reservations, 'totalReservations' => $totalReservations]);
}

// Закрываем соединение
mysqli_close($conn);
?>
