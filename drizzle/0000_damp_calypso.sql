CREATE TABLE `site_content` (
	`id` integer PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_owners` (
	`email` text PRIMARY KEY NOT NULL,
	`claimed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
