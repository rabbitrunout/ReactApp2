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