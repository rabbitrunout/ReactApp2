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

// ✅ Получаем данные
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['userName'], $data['password'])) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

$userName = $data['userName'];
$password = $data['password'];

// ✅ Поиск пользователя
$stmt = $conn->prepare("SELECT registrationID, userName, password, emailAddress FROM registrations WHERE userName = ?");
$stmt->bind_param("s", $userName);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password'])) {
        $_SESSION['user'] = [
            "registrationID" => $row['registrationID'],
            "userName" => $row['userName'],
            "emailAddress" => $row['emailAddress']
        ];
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "user" => $_SESSION['user']  // возвращаем пользователя
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}

$stmt->close();
$conn->close();

?>