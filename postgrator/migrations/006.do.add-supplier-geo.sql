ALTER TABLE `suppliers` ADD `coordinates` POINT NULL AFTER `phone`;
UPDATE `suppliers` SET `coordinates` = GeomFromText("POINT(13.3544978847131 52.51690187148509)") WHERE `suppliers`.`id` = 1;
