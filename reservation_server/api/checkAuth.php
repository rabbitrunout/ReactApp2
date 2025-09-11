<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (isset($_SESSION['user'])) {
    echo json_encode([
        "success" => true,
        "user" => [
            "registrationID" => $_SESSION['user']['registrationID'],
            "userName" => $_SESSION['user']['userName'],
            "emailAddress" => $_SESSION['user']['emailAddress'],
            "role" => $_SESSION['user']['role']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Not authenticated"]);
}
?>
