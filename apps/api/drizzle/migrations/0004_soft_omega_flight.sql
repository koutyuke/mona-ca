CREATE TABLE `email_verification_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `email_verifications`;--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_sessions_user_id_unique` ON `email_verification_sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_sessions_code_unique` ON `email_verification_sessions` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_email_verification_sessions__user_id_email` ON `email_verification_sessions` (`user_id`,`email`);