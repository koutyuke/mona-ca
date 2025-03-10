ALTER TABLE `email_verifications` RENAME TO `email_verification_sessions`;--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
DROP INDEX IF EXISTS `email_verifications_user_id_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `email_verifications_code_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `unq_email_verifications__user_id_email`;--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_sessions_user_id_unique` ON `email_verification_sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_sessions_code_unique` ON `email_verification_sessions` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_email_verification_sessions__user_id_email` ON `email_verification_sessions` (`user_id`,`email`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/