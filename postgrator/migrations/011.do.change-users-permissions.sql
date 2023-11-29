ALTER TABLE `users` ADD `permissions` JSON NULL AFTER `admin`;
UPDATE `users` SET `permissions` = JSON_OBJECT(
        "routesList", true,
        "routesMap", true,
        "routesCreateForDriver", true,
        "routesCreateDeliveryOrder", false,
        "ordersList", true,
        "orderListHolding", true,
        "ordersCreate", true,
        "customersCreate", true,
        "customersHideLocationRelatedFields", false,
        "toursCreate", true,
        "showMasterData", true
);

ALTER TABLE `orders` ADD `created_by_user_id` INT NULL AFTER `route_id`, ADD INDEX (`created_by_user_id`);
ALTER TABLE `routes` CHANGE `code` `code` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_general_ci NULL, CHANGE `password` `password` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;
