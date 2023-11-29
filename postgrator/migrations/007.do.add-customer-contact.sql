ALTER TABLE `customers` ADD `contact_name` VARCHAR(100) NULL AFTER `coordinates`, ADD `contact_surname` VARCHAR(100) NULL AFTER `contact_name`;
ALTER TABLE `customers` ADD `contact_salutation` VARCHAR(10) NULL AFTER `contact_surname`;
