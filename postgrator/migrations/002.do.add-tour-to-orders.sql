ALTER TABLE `orders` ADD `route_id` INT NULL AFTER `customer_id`;
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_2` FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE `orders` ADD `supplier_id` INT NOT NULL AFTER `id`;
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE `drivers_positions` CHANGE `position` `location` POINT NULL DEFAULT NULL;
RENAME TABLE `drivers_positions` TO `drivers_locations`;
ALTER TABLE `routes` ADD `uuid` VARCHAR(255) NOT NULL AFTER `tour_id`;
ALTER TABLE `routes` CHANGE `route` `pathway` JSON NULL DEFAULT NULL;
ALTER TABLE `customers` ADD `coordinates` POINT NULL AFTER `country`;