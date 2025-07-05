PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account_association_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`secret_hash` blob NOT NULL,
	`code` text,
	`email` text NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account_association_sessions`("id", "user_id", "secret_hash", "code", "email", "provider", "provider_id", "expires_at") SELECT "id", "user_id", "secret_hash", "code", "email", "provider", "provider_id", "expires_at" FROM `account_association_sessions`;--> statement-breakpoint
DROP TABLE `account_association_sessions`;--> statement-breakpoint
ALTER TABLE `__new_account_association_sessions` RENAME TO `account_association_sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_account_association_sessions__expires_at` ON `account_association_sessions` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_account_association_sessions__provider_user` ON `account_association_sessions` (`provider`,`user_id`);--> statement-breakpoint
ALTER TABLE `email_verification_sessions` ADD `secret_hash` blob NOT NULL;--> statement-breakpoint
ALTER TABLE `password_reset_sessions` ADD `secret_hash` blob NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `secret_hash` blob NOT NULL;
