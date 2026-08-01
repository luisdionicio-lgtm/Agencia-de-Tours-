ALTER TABLE `business_settings`
  MODIFY `trade_name` VARCHAR(120) NOT NULL DEFAULT 'JhonToursPerú';

UPDATE `business_settings`
SET `trade_name` = 'JhonToursPerú'
WHERE `trade_name` IN ('John Tours', 'John Tours Perú', 'Jhon Tours Perú');
