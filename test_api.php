<?php

$BASE_URL = getenv('API_BASE_URL') ?: 'http://localhost:8080';
$username = 'testuser_' . bin2hex(random_bytes(4));

function request($method, $url, $data = null)
{
    global $BASE_URL;

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $BASE_URL . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
    }

    if ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    }

    $headers = ['Accept: application/json'];

    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    curl_close($ch);

    echo "\n=============================\n";
    echo "$method $url\n";
    echo "HTTP: $httpCode\n";

    if ($curlError !== '') {
        echo "cURL error: $curlError\n";
        echo "Verifica che l'API sia avviata: docker compose up -d\n";
        return null;
    }

    echo "Response:\n$response\n";

    return ['code' => $httpCode, 'body' => $response];
}

echo "Base URL: $BASE_URL\n";
echo "Username di test: $username\n";

/*
|--------------------------------------------------------------------------
| TEST SEQUENZA COMPLETA
|--------------------------------------------------------------------------
*/

// 1 CREATE ACCOUNT
$create = request('POST', '/accounts/create', [
    'username' => $username,
    'password' => 'test123',
    'altezza' => 180,
    'peso' => 75,
    'genere' => 'M',
]);

if (!$create || $create['code'] !== 200) {
    fwrite(STDERR, "\nCreazione account fallita. Interrompo i test.\n");
    exit(1);
}

// 2 LOGIN
$login = request('POST', '/accounts/login', [
    'username' => $username,
    'password' => 'test123',
]);

if (!$login || $login['code'] !== 200) {
    fwrite(STDERR, "\nLogin fallito. Interrompo i test.\n");
    exit(1);
}

$loginData = json_decode($login['body'], true);
$accountId = $loginData['user_id'] ?? 1;

// 3 GET ACCOUNT
request('GET', "/accounts/$accountId");

// 4 UPDATE ACCOUNT
request('PUT', "/accounts/$accountId", [
    'altezza' => 181,
    'peso' => 76,
    'genere' => 'M',
]);

// 5 INSERT ALCOL
request('POST', '/alcol', [
    'account_id' => $accountId,
    'alcol_id' => 1,
    'data_consumo' => date('Y-m-d'),
]);

// 6 GET ALCOL
request('GET', "/alcol/$accountId");

// 7 INSERT SAZIETA
request('POST', '/sazieta', [
    'account_id' => $accountId,
    'stato_sazieta_id' => 1,
    'data_consumo' => date('Y-m-d'),
]);

// 8 GET SAZIETA
request('GET', "/sazieta/$accountId");

echo "\n\nTest completati\n";
