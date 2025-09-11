<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

// ✅ Универсальные CORS-заголовки
header("Access-Control-Allow-Origin: http://localhost:3000"); // твой фронтенд
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// ✅ Обработка preflight-запроса (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require_once('../config/config.php');
require_once('../config/database.php');

// 🔒 Require authentication
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

// Проверка обязательных полей
if (!isset($_POST['bookingDate'], $_POST['startTime'], $_POST['endTime'], $_POST['resourceId'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

$booking_date = $_POST['bookingDate'];
$start_time   = $_POST['startTime'];
$end_time     = $_POST['endTime'];
$resource_id  = (int)$_POST['resourceId'];

// Папка для загрузки файлов
$uploadDir = __DIR__ . "/uploads/";
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

// Обработка файла
$imageName = "placeholder_100.jpg";
if (!empty($_FILES['image']['name'])) {
    $imageName = basename($_FILES['image']['name']);
    $targetFile = $uploadDir . $imageName;
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error uploading image"]);
        exit();
    }
}

// Вставка в таблицу
$stmt = $conn->prepare("
    INSERT INTO reservations (booking_date, start_time, end_time, resource_id, status, imageName)
    VALUES (?, ?, ?, ?, 'pending', ?)
");
$stmt->bind_param("sssis", $booking_date, $start_time, $end_time, $resource_id, $imageName);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Reservation created successfully",
        "reservation_id" => $stmt->insert_id,
        "imageName" => $imageName
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to create reservation", "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
