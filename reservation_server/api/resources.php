<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");

require_once('../config/config.php');
require_once('../config/database.php');

$result = $conn->query("SELECT id, name FROM resources ORDER BY name ASC");
$resources = [];
while ($row = $result->fetch_assoc()) {
    $resources[] = $row;
}

echo json_encode(['resources' => $resources]);

$conn->close();
?>
