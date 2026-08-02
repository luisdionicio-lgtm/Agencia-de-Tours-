ALTER TABLE `business_settings`
  MODIFY `trade_name` VARCHAR(120) NOT NULL DEFAULT 'JohnToursPerú';

UPDATE `business_settings`
SET `trade_name` = 'JohnToursPerú'
WHERE `trade_name` IN ('JhonToursPerú', 'Jhon Tours Perú', 'John Tours', 'John Tours Perú');
