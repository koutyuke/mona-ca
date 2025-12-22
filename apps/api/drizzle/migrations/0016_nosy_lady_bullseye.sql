CREATE TABLE `account_link_requests` (
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
CREATE INDEX `idx_account_link_requests__expires_at` ON `account_link_requests` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_account_link_requests__provider_user` ON `account_link_requests` (`provider`,`user_id`);--> statement-breakpoint
DROP TABLE `account_link_proposals`;