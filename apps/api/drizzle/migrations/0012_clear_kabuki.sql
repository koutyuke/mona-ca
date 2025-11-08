CREATE TABLE `account_link_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`secret_hash` blob NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_link_sessions_user_id_unique` ON `account_link_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_account_link_sessions__expires_at` ON `account_link_sessions` (`expires_at`);