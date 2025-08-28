<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");

require_once('../config/config.php');
require_once('../config/database.php');

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid reservation ID']);
    exit();
}

$id = (int)$_GET['id'];

$stmt = $conn->prepare("
    SELECT r.id, r.booking_date, r.start_time, r.end_time, res.name AS resource_name
    FROM reservations r
    LEFT JOIN resources res ON r.resource_id = res.id
    WHERE r.id = ?
");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$reservation = $result->fetch_assoc();

if ($reservation) {
    echo json_encode($reservation);
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Reservation not found']);
}

$stmt->close();
$conn->close();
?>
