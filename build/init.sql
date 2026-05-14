CREATE TABLE `account` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL UNIQUE, 
  `password` VARCHAR(255) NOT NULL,
  'altezza' INT(3) NOT NULL CHECK (`altezza` BETWEEN 0 AND 250),
  'peso' INT(3) NOT NULL CHECK (`peso` BETWEEN 0 AND 300),
  'genere' ENUM('M', 'F') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `alcol` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `quantità` INT(5) NOT NULL,
  `gradazione` INT(3) NOT NULL,
  PRIMARY KEY (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE 'account_alcol' (
  'id' INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` INT(11) NOT NULL,
  `alcol_id` INT(11) NOT NULL,
  'data_consumo' DATE NOT NULL,
  PRIMARY KEY ('id'),
  FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`alcol_id`) REFERENCES `alcol`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE 'account_stato_sazieta' (
  'id' INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` INT(11) NOT NULL,
  `cibo_id` INT(11) NOT NULL,
  'data_consumo' DATE NOT NULL,
  PRIMARY KEY ('id'),
  FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`cibo_id`) REFERENCES `cibo`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE 'stato_sazieta' (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descrizione` INT(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `alcol` (`nome`, `quantita`, `gradazione`) VALUES
('Birra', 250, 5),
('Birra', 500, 5),
('Prosecco', 125, 11);
('Vino', 150, 12),
('Spritz', 200, 9),
('Vodka + Soft Drink', 200, 10);
('Gin Tonic', 200, 10),
('Shot', 40, 40),
('Rum Cola', 200, 10);

INSERT INTO 'stato_sazieta' ('nome', 'descrizione') VALUES
('Stomaco vuoto', 'Non hai ancora mangiato nulla, forte sensazione di fame'),
('Mangiato un pochino', 'Hai mangiato poco, ma hai ancora fame'),
('Metà', 'Sei a metà sazietà, ti senti moderatamente pieno'),
('Pieno', 'Hai mangiato abbastanza o troppo, sei sazio');
