<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once('../config/config.php');
require_once('../config/database.php');

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['bookingDate']) || empty($data['startTime']) || empty($data['endTime']) || empty($data['resourceId'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields']);
    exit();
}

$bookingDate = filter_var($data['bookingDate'], FILTER_SANITIZE_STRING);
$startTime   = filter_var($data['startTime'], FILTER_SANITIZE_STRING);
$endTime     = filter_var($data['endTime'], FILTER_SANITIZE_STRING);
$resourceId  = (int)$data['resourceId'];

$stmt = $conn->prepare("INSERT INTO reservations (booking_date, start_time, end_time, resource_id) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $bookingDate, $startTime, $endTime, $resourceId);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(["message" => "Reservation created successfully", "id" => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error creating reservation: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
