CREATE TABLE `zipcode_tour` (
  `id` int(11) NOT NULL,
  `holding_id` int(11) DEFAULT NULL,
  `tour_id` int(11) NOT NULL,
  `zipcode` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `zipcode_tour`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `zipcode_tour`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `zipcode_tour`
    ADD KEY `fk_zipcode_tour_1_idx` (`holding_id`);
    ADD `holding_id` INT AFTER `id`;
    ADD CONSTRAINT `fk_zipcode_tour_1` FOREIGN KEY (`holding_id`) REFERENCES `holdings` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `zipcode_tour`
    ADD KEY `fk_zipcode_tour_2_idx` (`tour_id`);
    ADD `tour_id` INT AFTER `id`;
    ADD CONSTRAINT `fk_zipcode_tour_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;