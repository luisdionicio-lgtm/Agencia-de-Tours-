ALTER TABLE `users`
  MODIFY `role` ENUM('ADMIN', 'WORKER', 'CLIENT') NOT NULL DEFAULT 'CLIENT';

ALTER TABLE `reservations`
  ADD COLUMN `public_token` VARCHAR(191) NULL;

UPDATE `reservations`
SET `public_token` = CONCAT(
  LOWER(HEX(RANDOM_BYTES(4))), '-',
  LOWER(HEX(RANDOM_BYTES(2))), '-4',
  SUBSTRING(LOWER(HEX(RANDOM_BYTES(2))), 2), '-a',
  SUBSTRING(LOWER(HEX(RANDOM_BYTES(2))), 2), '-',
  LOWER(HEX(RANDOM_BYTES(6)))
)
WHERE `public_token` IS NULL;

ALTER TABLE `reservations`
  MODIFY `public_token` VARCHAR(191) NOT NULL,
  ADD UNIQUE INDEX `reservations_public_token_key` (`public_token`);
