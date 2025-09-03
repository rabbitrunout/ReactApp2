<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once('../config/config.php');
require_once('../config/database.php');

// Проверка обязательных полей
if (!isset($_POST['bookingDate'], $_POST['startTime'], $_POST['endTime'], $_POST['resourceId'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

$booking_date = $_POST['bookingDate'];
$start_time   = $_POST['startTime'];
$end_time     = $_POST['endTime'];
$resource_id  = (int)$_POST['resourceId'];

// Папка для загрузки файлов
$uploadDir = __DIR__ . "/uploads/";

// Создаём папку, если её нет
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Обработка файла
$imageName = "placeholder_100.jpg"; // по умолчанию
if (!empty($_FILES['image']['name'])) {
    $originalName = basename($_FILES['image']['name']);
    $imageName = $originalName; // сохраняем оригинальное имя
    $targetFile = $uploadDir . $imageName;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Error uploading image",
            "php_error" => $_FILES['image']['error']
        ]);
        exit();
    }
} else {
    // Если нет файла, убедимся, что placeholder существует в папке
    $placeholderPath = $uploadDir . $imageName;
    if (!file_exists($placeholderPath)) {
        // Копируем placeholder из корня проекта или другой папки
        copy(__DIR__ . "/placeholder_100.jpg", $placeholderPath);
    }
}

// Вставка данных в таблицу
$stmt = $conn->prepare("
    INSERT INTO reservations (booking_date, start_time, end_time, resource_id, status, imageName)
    VALUES (?, ?, ?, ?, 'pending', ?)
");

// 5 параметров: date, time, time, int, string
$stmt->bind_param("sssis", $booking_date, $start_time, $end_time, $resource_id, $imageName);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Reservation created successfully",
        "reservation_id" => $stmt->insert_id,
        "imageName" => $imageName
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to create reservation",
        "error" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
