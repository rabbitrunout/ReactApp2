<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once('../config/config.php');
require_once('../config/database.php');

$reservationsPerPage = 6;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;
$offset = ($page - 1) * $reservationsPerPage;

// Подсчет общего числа бронирований
$countQuery = "SELECT COUNT(*) as total FROM reservations";
$countResult = $conn->query($countQuery);
$totalReservations = 0;
if ($countResult) {
    $row = $countResult->fetch_assoc();
    $totalReservations = (int)$row['total'];
}

// Запрос с LEFT JOIN и получением imageName
$query = "
    SELECT r.id, r.booking_date, r.start_time, r.end_time, r.status, r.imageName,
           res.name AS resource_name
    FROM reservations AS r
    LEFT JOIN resources AS res ON r.resource_id = res.id
    ORDER BY r.booking_date DESC
    LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'DB prepare failed: ' . $conn->error]);
    exit();
}

$stmt->bind_param("ii", $reservationsPerPage, $offset);
$stmt->execute();
$result = $stmt->get_result();

$reservations = [];
while ($row = $result->fetch_assoc()) {
    $reservations[] = [
        'id' => $row['id'],
        'booking_date' => $row['booking_date'],
        'start_time' => $row['start_time'],
        'end_time' => $row['end_time'],
        'status' => $row['status'],
        'resource_name' => $row['resource_name'] ?? 'Unknown',
        'imageName' => $row['imageName'] ?? null
    ];
}

echo json_encode([
    'status' => 'success',
    'reservations' => $reservations,
    'totalReservations' => $totalReservations
]);

$stmt->close();
$conn->close();

?>
