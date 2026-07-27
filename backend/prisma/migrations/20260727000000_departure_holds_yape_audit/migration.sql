ALTER TABLE `reservations`
  ADD COLUMN `hold_expires_at` DATETIME(3) NULL,
  ADD COLUMN `slots_held` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `payments`
  ADD COLUMN `paid_at` DATETIME(3) NULL,
  ADD COLUMN `validated_at` DATETIME(3) NULL,
  ADD COLUMN `validated_by_id` INTEGER NULL;

CREATE TABLE `payment_proofs` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `payment_id` INTEGER NOT NULL,
  `file_name` VARCHAR(180) NOT NULL,
  `mime_type` VARCHAR(80) NOT NULL,
  `size_bytes` INTEGER NOT NULL,
  `data` LONGBLOB NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `payment_proofs_payment_id_key`(`payment_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `payment_proofs_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `payment_audits` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `payment_id` INTEGER NOT NULL,
  `action` ENUM('SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'HOLD_EXPIRED') NOT NULL,
  `actor_id` INTEGER NULL,
  `details` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `payment_audits_payment_id_created_at_idx`(`payment_id`, `created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `payment_audits_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payment_audits_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `payments`
  ADD CONSTRAINT `payments_validated_by_id_fkey` FOREIGN KEY (`validated_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
