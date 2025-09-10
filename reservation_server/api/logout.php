<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// ✅ CORS-заголовки
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// ✅ Обработка preflight-запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ Очистка всех переменных сессии
$_SESSION = [];

// ✅ Удаление куки PHP сессии
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// ✅ Уничтожение сессии на сервере
session_destroy();

// ✅ Ответ фронтенду
echo json_encode([
    "success" => true,
    "message" => "Logged out successfully"
]);
?>
