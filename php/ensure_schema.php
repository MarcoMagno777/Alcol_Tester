<?php

$host = getenv('DB_HOST') ?: 'db';
$user = getenv('DB_USERNAME');
$pass = getenv('DB_PASSWORD');
$name = getenv('DB_DATABASE');

if (!$user || !$name) {
    fwrite(STDERR, "ensure_schema: DB_USERNAME o DB_DATABASE non impostati\n");
    exit(1);
}

$db = null;
for ($attempt = 0; $attempt < 30; $attempt++) {
    try {
        $db = new mysqli($host, $user, $pass, $name);
        if (!$db->connect_error) {
            break;
        }
    } catch (mysqli_sql_exception) {
        // DB non ancora pronto
    }
    sleep(1);
}

if (!$db || $db->connect_error) {
    fwrite(STDERR, "ensure_schema: impossibile connettersi al database\n");
    exit(1);
}

$migrations = [
    'account_alcol' => "20:00:00",
    'account_stato_sazieta' => "12:00:00",
];

foreach ($migrations as $table => $defaultTime) {
    $check = $db->query("SHOW COLUMNS FROM `{$table}` LIKE 'consumato_il'");
    if ($check && $check->num_rows > 0) {
        continue;
    }

    $db->query("
        ALTER TABLE `{$table}`
        ADD COLUMN consumato_il DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        AFTER data_consumo
    ");

    $db->query("
        UPDATE `{$table}`
        SET consumato_il = CONCAT(data_consumo, ' {$defaultTime}')
        WHERE consumato_il IS NULL OR consumato_il = '0000-00-00 00:00:00'
    ");
}

echo "ensure_schema: schema ok\n";
