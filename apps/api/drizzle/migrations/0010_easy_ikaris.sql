CREATE TABLE `signup_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`code` text NOT NULL,
	`secret_hash` blob NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_signup_sessions__expires_at` ON `signup_sessions` (`expires_at`);