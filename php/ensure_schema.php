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

$check = $db->query("SHOW COLUMNS FROM `account` LIKE 'email'");
if (!$check || $check->num_rows === 0) {
    $db->query("
        ALTER TABLE `account`
        ADD COLUMN email VARCHAR(255) NULL
        AFTER username
    ");

    $db->query("
        UPDATE `account`
        SET email = CONCAT('account-', id, '@local.invalid')
        WHERE email IS NULL OR email = ''
    ");

    $db->query("
        ALTER TABLE `account`
        MODIFY COLUMN email VARCHAR(255) NOT NULL
    ");
}

$index = $db->query("SHOW INDEX FROM `account` WHERE Column_name = 'email' AND Non_unique = 0");
if (!$index || $index->num_rows === 0) {
    $db->query("ALTER TABLE `account` ADD UNIQUE KEY `uniq_account_email` (`email`)");
}

$index = $db->query("SHOW INDEX FROM `account` WHERE Column_name = 'username' AND Non_unique = 0");
if (!$index || $index->num_rows === 0) {
    $db->query("ALTER TABLE `account` ADD UNIQUE KEY `uniq_account_username` (`username`)");
}

$db->query("ALTER TABLE `alcol` MODIFY COLUMN gradazione DECIMAL(4,1) NOT NULL");

$alcolCatalog = [
    ['Birra Piccola', 200, 4.5],
    ['Birra Media', 400, 5],
    ['Birra Grande', 500, 5],
    ['Birra Artigianale IPA', 330, 6.5],
    ['Birra Weiss', 500, 5.4],
    ['Birra Rossa', 400, 6],
    ['Birra Strong', 500, 8],
    ['Vino Bianco', 150, 12],
    ['Vino Rosso', 150, 13],
    ['Vino Rosé', 150, 12],
    ['Vino Frizzante', 150, 11],
    ['Prosecco', 125, 11],
    ['Champagne', 125, 12],
    ['Spumante Dolce', 125, 7.5],
    ['Passito', 100, 14],
    ['Vino Liquoroso', 100, 18],
    ['Spritz Aperol', 200, 9],
    ['Spritz Campari', 200, 10],
    ['Hugo Spritz', 200, 8],
    ['Americano', 150, 16],
    ['Negroni', 100, 24],
    ['Negroni Sbagliato', 120, 18],
    ['Campari Soda', 100, 10],
    ['Martini Bianco', 100, 15],
    ['Martini Rosso', 100, 15],
    ['Gin Tonic', 200, 10],
    ['Gin Lemon', 200, 10],
    ['Vodka Lemon', 200, 10],
    ['Vodka Red Bull', 250, 12],
    ['Rum Cola', 200, 10],
    ['Cuba Libre', 200, 11],
    ['Whisky Cola', 200, 12],
    ['Mojito', 250, 11],
    ['Mojito alla Fragola', 250, 11],
    ['Caipirinha', 200, 13],
    ['Caipiroska', 200, 13],
    ['Margarita', 150, 15],
    ['Daiquiri', 150, 14],
    ['Bloody Mary', 200, 14],
    ['Sex on the Beach', 250, 11],
    ['Tequila Sunrise', 250, 12],
    ['Cosmopolitan', 150, 20],
    ['Long Island', 250, 22],
    ['Piña Colada', 250, 13],
    ['Shot Vodka', 40, 40],
    ['Shot Gin', 40, 40],
    ['Shot Rum Bianco', 40, 40],
    ['Shot Rum Scuro', 40, 40],
    ['Shot Whisky', 40, 40],
    ['Shot Bourbon', 40, 45],
    ['Shot Tequila', 40, 38],
    ['Shot Brandy', 40, 40],
    ['Shot Cognac', 40, 40],
    ['Shot Jägermeister', 40, 35],
    ['Shot Sambuca', 40, 42],
    ['Shot Limoncello', 40, 30],
    ['Shot Fireball', 40, 33],
    ['Shot Assenzio', 40, 70],
    ['Amaro Montenegro', 50, 23],
    ['Amaro Lucano', 50, 28],
    ['Fernet', 50, 39],
    ['Jägermeister (Bicchiere)', 50, 35],
    ['Limoncello (Bicchiere)', 50, 30],
    ['Baileys', 50, 17],
    ['Malibu', 50, 21],
    ['Cointreau', 50, 40],
    ['Grand Marnier', 50, 40],
];

$checkDrink = $db->prepare("SELECT COUNT(*) AS total FROM `alcol` WHERE nome = ?");
$insertDrink = $db->prepare("INSERT INTO `alcol` (`nome`, `quantita`, `gradazione`) VALUES (?, ?, ?)");

foreach ($alcolCatalog as [$drinkName, $quantity, $abv]) {
    $checkDrink->bind_param('s', $drinkName);
    $checkDrink->execute();
    $exists = (int) $checkDrink->get_result()->fetch_assoc()['total'];

    if ($exists > 0) {
        continue;
    }

    $insertDrink->bind_param('sid', $drinkName, $quantity, $abv);
    $insertDrink->execute();
}

echo "ensure_schema: schema ok\n";
