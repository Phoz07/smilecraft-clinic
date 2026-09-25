CREATE TABLE `account` (
	`id` text PRIMARY KEY,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL UNIQUE,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `appointment` (
	`id` text PRIMARY KEY,
	`booking_code` text NOT NULL,
	`patient_name` text NOT NULL,
	`patient_phone` text NOT NULL,
	`medical_notes` text,
	`dentist_id` text NOT NULL,
	`service_id` text NOT NULL,
	`appointment_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`internal_notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_appointment_dentist_id_dentist_id_fk` FOREIGN KEY (`dentist_id`) REFERENCES `dentist`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_appointment_service_id_service_id_fk` FOREIGN KEY (`service_id`) REFERENCES `service`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `dentist` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`specialization` text NOT NULL,
	`avatar_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dentist_service` (
	`id` text PRIMARY KEY,
	`dentist_id` text NOT NULL,
	`service_id` text NOT NULL,
	CONSTRAINT `fk_dentist_service_dentist_id_dentist_id_fk` FOREIGN KEY (`dentist_id`) REFERENCES `dentist`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_dentist_service_service_id_service_id_fk` FOREIGN KEY (`service_id`) REFERENCES `service`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `duty_schedule` (
	`id` text PRIMARY KEY,
	`dentist_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	CONSTRAINT `fk_duty_schedule_dentist_id_dentist_id_fk` FOREIGN KEY (`dentist_id`) REFERENCES `dentist`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `schedule_block` (
	`id` text PRIMARY KEY,
	`dentist_id` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`reason` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_schedule_block_dentist_id_dentist_id_fk` FOREIGN KEY (`dentist_id`) REFERENCES `dentist`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `service` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`price` integer NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `appointment_date_idx` ON `appointment` (`appointment_date`);--> statement-breakpoint
CREATE INDEX `appointment_dentist_idx` ON `appointment` (`dentist_id`);--> statement-breakpoint
CREATE INDEX `appointment_phone_idx` ON `appointment` (`patient_phone`);--> statement-breakpoint
CREATE INDEX `appointment_booking_code_idx` ON `appointment` (`booking_code`);--> statement-breakpoint
CREATE INDEX `dentist_service_dentist_idx` ON `dentist_service` (`dentist_id`);--> statement-breakpoint
CREATE INDEX `dentist_service_service_idx` ON `dentist_service` (`service_id`);--> statement-breakpoint
CREATE INDEX `duty_schedule_dentist_idx` ON `duty_schedule` (`dentist_id`);--> statement-breakpoint
CREATE INDEX `schedule_block_dentist_idx` ON `schedule_block` (`dentist_id`);--> statement-breakpoint
CREATE INDEX `schedule_block_date_idx` ON `schedule_block` (`date`);