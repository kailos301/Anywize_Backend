ALTER TABLE `customers` ADD `deposit_agreement` VARCHAR(20) NOT NULL DEFAULT 'NONE' AFTER `country`,
ADD `keybox_code` VARCHAR(100) NULL AFTER `deposit_agreement`;