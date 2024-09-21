CREATE TABLE `email_verification_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_codes_user_id_unique` ON `email_verification_codes` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_codes_code_unique` ON `email_verification_codes` (`code`);--> statement-breakpoint
CREATE INDEX `idx_email_verification_codes_code` ON `email_verification_codes` (`code`);