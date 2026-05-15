<?php

$BASE_URL = "http://localhost:8080"; // 🔁 cambia con la tua URL

function request($method, $url, $data = null)
{
    global $BASE_URL;

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $BASE_URL . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    if ($method === "POST") {
        curl_setopt($ch, CURLOPT_POST, true);
    }

    if ($method === "PUT") {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    }

    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json"
        ]);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    echo "\n=============================\n";
    echo "$method $url\n";
    echo "HTTP: $httpCode\n";
    echo "Response:\n$response\n";

    return $response;
}

/*
|--------------------------------------------------------------------------
| 🧪 TEST SEQUENZA COMPLETA
|--------------------------------------------------------------------------
*/

// 1️⃣ CREATE ACCOUNT
$account = request("POST", "/accounts/create", [
    "username" => "testuser",
    "password" => "test123",
    "altezza" => 180,
    "peso" => 75,
    "genere" => "M"
]);

// 2️⃣ LOGIN
$login = request("POST", "/accounts/login", [
    "username" => "testuser",
    "password" => "test123"
]);

// 3️⃣ GET ACCOUNT (id 1 o cambia se serve)
$acc = request("GET", "/accounts/1");

// 4️⃣ UPDATE ACCOUNT
$update = request("PUT", "/accounts/1", [
    "altezza" => 181,
    "peso" => 76,
    "genere" => "M"
]);

// 5️⃣ INSERT ALCOL
$alcol = request("POST", "/alcol", [
    "account_id" => 1,
    "alcol_id" => 1,
    "data_consumo" => date("Y-m-d")
]);

// 6️⃣ GET ALCOL
$alcolGet = request("GET", "/alcol/1");

// 7️⃣ INSERT SAZIETA
$saz = request("POST", "/sazieta", [
    "account_id" => 1,
    "cibo_id" => 1,
    "data_consumo" => date("Y-m-d")
]);

// 8️⃣ GET SAZIETA
$sazGet = request("GET", "/sazieta/1");

echo "\n\n✅ TEST COMPLETATI\n";