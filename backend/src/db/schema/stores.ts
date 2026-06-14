import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const storesTable = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo_url: text("logo_url"),
  address: text("address"),
  phone: text("phone"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Store = typeof storesTable.$inferSelect;
export type InsertStore = typeof storesTable.$inferInsert;
