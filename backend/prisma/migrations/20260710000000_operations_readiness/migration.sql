ALTER TABLE `tours`
  ADD COLUMN `currency` ENUM('PEN', 'USD') NOT NULL DEFAULT 'PEN',
  ADD COLUMN `payment_mode` ENUM('FULL', 'DEPOSIT') NOT NULL DEFAULT 'FULL',
  ADD COLUMN `deposit_percent` INTEGER NULL,
  ADD COLUMN `image_credit` VARCHAR(255) NULL;

CREATE TABLE `tour_departures` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `tour_id` INTEGER NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `capacity` INTEGER NOT NULL,
  `available_slots` INTEGER NOT NULL,
  `status` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  UNIQUE INDEX `tour_departures_tour_id_start_date_key`(`tour_id`, `start_date`),
  PRIMARY KEY (`id`),
  CONSTRAINT `tour_departures_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE `reservations` ADD COLUMN `departure_id` INTEGER NULL;
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_departure_id_fkey` FOREIGN KEY (`departure_id`) REFERENCES `tour_departures`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `testimonials`
  ADD COLUMN `source` VARCHAR(255) NULL,
  ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `business_settings` (
  `id` INTEGER NOT NULL DEFAULT 1,
  `legal_name` VARCHAR(180) NULL,
  `trade_name` VARCHAR(120) NOT NULL DEFAULT 'Jhon Tours',
  `tax_id` VARCHAR(30) NULL,
  `address` VARCHAR(255) NULL,
  `support_email` VARCHAR(120) NULL,
  `whatsapp_number` VARCHAR(30) NULL,
  `domain` VARCHAR(180) NULL,
  `cancellation_policy` LONGTEXT NULL,
  `refund_policy` LONGTEXT NULL,
  `terms` LONGTEXT NULL,
  `privacy_policy` LONGTEXT NULL,
  `cookie_policy` LONGTEXT NULL,
  `complaints_book_url` TEXT NULL,
  `policies_published` BOOLEAN NOT NULL DEFAULT false,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
);
