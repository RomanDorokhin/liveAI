CREATE TABLE `pets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegramId` varchar(64) NOT NULL,
	`petState` text NOT NULL,
	`modelWeights` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pets_id` PRIMARY KEY(`id`),
	CONSTRAINT `pets_telegramId_unique` UNIQUE(`telegramId`)
);
