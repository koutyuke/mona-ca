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
CREATE TABLE `provider_link_proposals` (
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
CREATE INDEX `idx_provider_link_proposals__expires_at` ON `provider_link_proposals` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_provider_link_proposals__provider_user` ON `provider_link_proposals` (`provider`,`user_id`);--> statement-breakpoint
CREATE TABLE `provider_link_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`secret_hash` blob NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_link_requests_user_id_unique` ON `provider_link_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_provider_link_requests__expires_at` ON `provider_link_requests` (`expires_at`);--> statement-breakpoint
DROP TABLE `account_link_sessions`;--> statement-breakpoint
DROP TABLE `email_verification_sessions`;--> statement-breakpoint
DROP TABLE `provider_connection_tickets`;