
CREATE TABLE `holdings` (
  `id` int(11) NOT NULL,
  `number` VARCHAR(50) NULL,
  `secret` VARCHAR(255) NULL,
  `name` varchar(255) NOT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `street_number` varchar(45) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zipcode` varchar(100) DEFAULT NULL,
  `country` varchar(2) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `coordinates` POINT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

UPDATE `holdings` SET `coordinates` = GeomFromText("POINT(13.3544978847131 52.51690187148509)") WHERE `holdings`.`id` = 1;

ALTER TABLE `holdings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `holdings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `suppliers` ADD `holding_id` INT AFTER `id`;
ALTER TABLE `suppliers` ADD KEY `fk_suppliers_1_idx` (`holding_id`);

ALTER TABLE `users` ADD `holding_id` INT AFTER `id`;
ALTER TABLE `users` ADD KEY `fk_users_2_idx` (`holding_id`);

ALTER TABLE `customers` ADD `holding_id` INT AFTER `id`;
ALTER TABLE `customers` ADD KEY `fk_customers_3_idx` (`holding_id`);

ALTER TABLE `tours` ADD `holding_id` INT AFTER `id`;
ALTER TABLE `tours` ADD KEY `fk_tours_4_idx` (`holding_id`);

ALTER TABLE `orders` ADD `holding_id` INT AFTER `id`;
ALTER TABLE `orders` ADD KEY `fk_orders_4_idx` (`holding_id`);

ALTER TABLE `routes` ADD `holding_id` INT AFTER `id`;
ALTER TABLE `routes` ADD KEY `fk_routes_2_idx` (`holding_id`);

ALTER TABLE `suppliers`
  ADD CONSTRAINT `fk_suppliers_1` FOREIGN KEY (`holding_id`) REFERENCES `holdings` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_2` FOREIGN KEY (`holding_id`) REFERENCES `holdings` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customers_3` FOREIGN KEY (`holding_id`) REFERENCES `holdings` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `tours`
  ADD CONSTRAINT `fk_tours_4` FOREIGN KEY (`holding_id`) REFERENCES `holdings` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_4` FOREIGN KEY (`holding_id`) REFERENCES `holdings` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `routes`
  ADD CONSTRAINT `fk_routes_2` FOREIGN KEY (`holding_id`) REFERENCES `holdings` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
