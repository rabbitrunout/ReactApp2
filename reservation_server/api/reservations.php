<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once('../config/config.php');
require_once('../config/database.php');

$reservationsPerPage = 4;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;
$offset = ($page - 1) * $reservationsPerPage;

$countQuery = "SELECT COUNT(*) as total FROM reservations";
$countResult = $conn->query($countQuery);
$totalReservations = 0;
if ($countResult) {
    $row = $countResult->fetch_assoc();
    $totalReservations = (int)$row['total'];
}

$query = "
    SELECT r.id, r.booking_date, r.start_time, r.end_time, res.name AS resource_name
    FROM reservations AS r
    LEFT JOIN resources AS res ON r.resource_id = res.id
    ORDER BY r.booking_date DESC
    LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $reservationsPerPage, $offset);
$stmt->execute();
$result = $stmt->get_result();

$reservations = [];
while ($row = $result->fetch_assoc()) {
    $reservations[] = $row;
}

echo json_encode([
    'status' => 'success',
    'reservations' => $reservations,
    'totalReservations' => $totalReservations
]);

$stmt->close();
$conn->close();
?>
