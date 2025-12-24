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
CREATE TABLE `email_verification_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`secret_hash` blob NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_requests_user_id_unique` ON `email_verification_requests` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_requests_code_unique` ON `email_verification_requests` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_email_verification_requests__user_id_email` ON `email_verification_requests` (`user_id`,`email`);--> statement-breakpoint
CREATE TABLE `provider_accounts` (
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`user_id` text NOT NULL,
	`linked_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unq_provider_accounts__provider_account` ON `provider_accounts` (`provider`,`provider_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_provider_accounts__provider_user` ON `provider_accounts` (`provider`,`user_id`);--> statement-breakpoint
CREATE TABLE `provider_link_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`secret_hash` blob NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_link_requests_user_id_unique` ON `provider_link_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_provider_link_requests__expires_at` ON `provider_link_requests` (`expires_at`);--> statement-breakpoint
DROP TABLE `account_association_sessions`;--> statement-breakpoint
DROP TABLE `account_link_sessions`;--> statement-breakpoint
DROP TABLE `email_verification_sessions`;--> statement-breakpoint
DROP TABLE `external_identities`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`icon_url` text,
	`gender` text DEFAULT 'male' NOT NULL,
	`password_hash` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "email_verified", "name", "icon_url", "gender", "password_hash", "created_at", "updated_at") SELECT "id", "email", "email_verified", "name", "icon_url", "gender", "password_hash", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users__email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users__updated_at` ON `users` (`updated_at`);