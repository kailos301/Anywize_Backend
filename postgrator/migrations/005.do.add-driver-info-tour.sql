ALTER TABLE `routes` ADD `active_driver_jwt` VARCHAR(255) NULL AFTER `password`,
ADD `driver_name` VARCHAR(255) NULL AFTER `active_driver_jwt`,
ADD `driver_phone` VARCHAR(100) NULL AFTER `driver_name`;

ALTER TABLE `stops` ADD `driver_phone` VARCHAR(100) NOT NULL AFTER `driver_name`;

CREATE TABLE `routes_navigations` (
  `id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `navigation` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `routes_navigations`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `routes_navigations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `routes_navigations` ADD FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `routes_navigations` ADD FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
