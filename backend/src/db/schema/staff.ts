import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores.js";

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  store_id: integer("store_id").notNull().references(() => storesTable.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Staff = typeof staffTable.$inferSelect;
export type InsertStaff = typeof staffTable.$inferInsert;
