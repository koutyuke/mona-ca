CREATE TABLE `account_link_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`secret_hash` blob NOT NULL,
	`code` text,
	`email` text NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_account_link_proposals__expires_at` ON `account_link_proposals` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_account_link_proposals__provider_user` ON `account_link_proposals` (`provider`,`user_id`);--> statement-breakpoint
DROP TABLE `provider_link_proposals`;--> statement-breakpoint
ALTER TABLE `provider_link_requests` ADD `provider` text NOT NULL;