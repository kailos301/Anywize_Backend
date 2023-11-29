ALTER TABLE `routes` ADD `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `driver_phone`;
UPDATE routes set created_at = routes.start_date WHERE routes.start_date IS NOT NULL;
