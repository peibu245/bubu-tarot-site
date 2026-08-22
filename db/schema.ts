import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteContent = sqliteTable("site_content", {
  id: integer("id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("updated_by").notNull(),
});

export const siteOwners = sqliteTable("site_owners", {
  email: text("email").primaryKey(),
  claimedAt: text("claimed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
