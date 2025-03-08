CREATE TABLE `email_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX IF EXISTS `idx_oauth_accounts_updated_at`;--> statement-breakpoint
DROP INDEX IF EXISTS `unique_oauth_accounts_provider_account`;--> statement-breakpoint
DROP INDEX IF EXISTS `unique_oauth_accounts_provider_user`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_session_expires_at`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_users_email`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_users_updated_at`;--> statement-breakpoint
ALTER TABLE `users` ADD `password_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `email_verifications_user_id_unique` ON `email_verifications` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_verifications_code_unique` ON `email_verifications` (`code`);--> statement-breakpoint
CREATE INDEX `idx_oauth_accounts__updated_at` ON `oauth_accounts` (`updated_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_oauth_accounts__provider_account` ON `oauth_accounts` (`provider`,`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_oauth_accounts__provider_user` ON `oauth_accounts` (`provider`,`user_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions__expires_at` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_users__email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users__updated_at` ON `users` (`updated_at`);