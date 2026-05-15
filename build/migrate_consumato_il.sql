-- Esegui solo se il database esiste già senza la colonna consumato_il
ALTER TABLE account_alcol
  ADD COLUMN IF NOT EXISTS consumato_il DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER data_consumo;

ALTER TABLE account_stato_sazieta
  ADD COLUMN IF NOT EXISTS consumato_il DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER data_consumo;

UPDATE account_alcol SET consumato_il = CONCAT(data_consumo, ' 20:00:00') WHERE consumato_il IS NULL;
UPDATE account_stato_sazieta SET consumato_il = CONCAT(data_consumo, ' 12:00:00') WHERE consumato_il IS NULL;
