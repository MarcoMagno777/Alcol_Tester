CREATE TABLE `account` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `altezza` INT(3) NOT NULL CHECK (`altezza` BETWEEN 0 AND 250),
  `peso` INT(3) NOT NULL CHECK (`peso` BETWEEN 0 AND 300),
  `genere` ENUM('M', 'F') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `alcol` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `quantita` INT(5) NOT NULL,
  `gradazione` INT(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `account_alcol` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` INT(11) NOT NULL,
  `alcol_id` INT(11) NOT NULL,
  `data_consumo` DATE NOT NULL,
  `consumato_il` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`alcol_id`) REFERENCES `alcol`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `stato_sazieta` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descrizione` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `account_stato_sazieta` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` INT(11) NOT NULL,
  `stato_sazieta_id` INT(11) NOT NULL,
  `data_consumo` DATE NOT NULL,
  `consumato_il` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`stato_sazieta_id`) REFERENCES `stato_sazieta`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `stato_sazieta` (`nome`, `descrizione`) VALUES
('Stomaco vuoto', 'Non hai ancora mangiato nulla, forte sensazione di fame'),
('Mangiato un pochino', 'Hai mangiato poco, ma hai ancora fame'),
('Meta', 'Sei a meta sazieta, ti senti moderatamente pieno'),
('Pieno', 'Hai mangiato abbastanza o troppo, sei sazio');

INSERT INTO `alcol` (`nome`, `quantita`, `gradazione`) VALUES
-- BIRRE
('Birra Piccola', 200, 4.5),
('Birra Media', 400, 5),
('Birra Grande', 500, 5),
('Birra Artigianale IPA', 330, 6.5),
('Birra Weiss', 500, 5.4),
('Birra Rossa', 400, 6),
('Birra Strong', 500, 8),

-- VINI
('Vino Bianco', 150, 12),
('Vino Rosso', 150, 13),
('Vino Rosé', 150, 12),
('Vino Frizzante', 150, 11),
('Prosecco', 125, 11),
('Champagne', 125, 12),
('Spumante Dolce', 125, 7.5),
('Passito', 100, 14),
('Vino Liquoroso', 100, 18),

-- APERITIVI
('Spritz Aperol', 200, 9),
('Spritz Campari', 200, 10),
('Hugo Spritz', 200, 8),
('Americano', 150, 16),
('Negroni', 100, 24),
('Negroni Sbagliato', 120, 18),
('Campari Soda', 100, 10),
('Martini Bianco', 100, 15),
('Martini Rosso', 100, 15),

-- COCKTAIL CLASSICI
('Gin Tonic', 200, 10),
('Gin Lemon', 200, 10),
('Vodka Lemon', 200, 10),
('Vodka Red Bull', 250, 12),
('Rum Cola', 200, 10),
('Cuba Libre', 200, 11),
('Whisky Cola', 200, 12),
('Mojito', 250, 11),
('Mojito alla Fragola', 250, 11),
('Caipirinha', 200, 13),
('Caipiroska', 200, 13),
('Margarita', 150, 15),
('Daiquiri', 150, 14),
('Bloody Mary', 200, 14),
('Sex on the Beach', 250, 11),
('Tequila Sunrise', 250, 12),
('Cosmopolitan', 150, 20),
('Long Island', 250, 22),
('Piña Colada', 250, 13),

-- SHOT (Superalcolici Classici e Speciali)
('Shot Vodka', 40, 40),
('Shot Gin', 40, 40),
('Shot Rum Bianco', 40, 40),
('Shot Rum Scuro', 40, 40),
('Shot Whisky', 40, 40),
('Shot Bourbon', 40, 45),
('Shot Tequila', 40, 38),
('Shot Brandy', 40, 40),
('Shot Cognac', 40, 40),
('Shot Jägermeister', 40, 35),
('Shot Sambuca', 40, 42),
('Shot Limoncello', 40, 30),
('Shot Fireball', 40, 33),
('Shot Assenzio', 40, 70),

-- LIQUORI & AMARI (Serviti in bicchiere da degustazione/amaro)
('Amaro Montenegro', 50, 23),
('Amaro Lucano', 50, 28),
('Fernet', 50, 39),
('Jägermeister (Bicchiere)', 50, 35),
('Limoncello (Bicchiere)', 50, 30),
('Baileys', 50, 17),
('Malibu', 50, 21),
('Cointreau', 50, 40),
('Grand Marnier', 50, 40);
