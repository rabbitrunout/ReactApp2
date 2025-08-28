<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reservation_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['message' => 'Connection failed: ' . $conn->connect_error]));
}
?>