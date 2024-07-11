CREATE TABLE `oauth_accounts` (
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hashed_token` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`icon_url` text,
	`hashed_password` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_accounts_provider_id_unique` ON `oauth_accounts` (`provider_id`);--> statement-breakpoint
CREATE INDEX `idx_oauth_accounts_updated_at` ON `oauth_accounts` (`updated_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_oauth_accounts_provider_account` ON `oauth_accounts` (`provider`,`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_oauth_accounts_provider_user` ON `oauth_accounts` (`provider`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_tokens_hashed_token_unique` ON `password_reset_tokens` (`hashed_token`);--> statement-breakpoint
CREATE INDEX `idx_password_reset_token_hashed_token` ON `password_reset_tokens` (`hashed_token`);--> statement-breakpoint
CREATE INDEX `idx_password_reset_token_expires_at` ON `password_reset_tokens` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_session_expires_at` ON `session` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_updated_at` ON `users` (`updated_at`);