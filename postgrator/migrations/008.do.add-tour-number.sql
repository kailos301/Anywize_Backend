ALTER TABLE `tours` ADD `number` VARCHAR(20) NULL AFTER `transport_agent_id`;
ALTER TABLE `suppliers` ADD `number` VARCHAR(50) NOT NULL AFTER `id`;
