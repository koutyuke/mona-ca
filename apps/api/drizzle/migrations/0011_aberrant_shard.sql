CREATE TABLE `external_identities` (
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`user_id` text NOT NULL,
	`linked_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unq_external_identities__provider_account` ON `external_identities` (`provider`,`provider_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_external_identities__provider_user` ON `external_identities` (`provider`,`user_id`);--> statement-breakpoint
DROP TABLE `oauth_accounts`;--> statement-breakpoint
ALTER TABLE `account_association_sessions` ADD `provider_user_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `account_association_sessions` DROP COLUMN `provider_id`;