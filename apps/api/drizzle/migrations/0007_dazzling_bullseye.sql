CREATE TABLE `account_association_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX IF EXISTS `oauth_accounts_provider_id_unique`;--> statement-breakpoint
CREATE INDEX `idx_account_association_sessions__expires_at` ON `account_association_sessions` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_account_association_sessions__provider_user` ON `account_association_sessions` (`provider`,`user_id`);