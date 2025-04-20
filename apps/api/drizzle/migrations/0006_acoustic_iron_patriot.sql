DROP INDEX IF EXISTS `idx_oauth_accounts__updated_at`;--> statement-breakpoint
ALTER TABLE `oauth_accounts` ADD `linked_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL;--> statement-breakpoint
ALTER TABLE `oauth_accounts` DROP COLUMN `created_at`;--> statement-breakpoint
ALTER TABLE `oauth_accounts` DROP COLUMN `updated_at`;