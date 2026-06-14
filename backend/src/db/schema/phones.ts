import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { storesTable } from "./stores.js";
import { staffTable } from "./staff.js";

export const phoneStatusEnum = pgEnum("phone_status", ["in_stock", "sold"]);

export const phonesTable = pgTable("phones", {
  id: serial("id").primaryKey(),
  imei: text("imei").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  color: text("color"),
  storage: text("storage"),
  purchase_price: numeric("purchase_price", { precision: 15, scale: 2 }).notNull().default("0"),
  selling_price: numeric("selling_price", { precision: 15, scale: 2 }).notNull(),
  warranty_months: integer("warranty_months").notNull().default(12),
  status: phoneStatusEnum("status").notNull().default("in_stock"),
  store_id: integer("store_id").notNull().references(() => storesTable.id),
  input_staff_id: integer("input_staff_id").notNull().references(() => staffTable.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Phone = typeof phonesTable.$inferSelect;
export type InsertPhone = typeof phonesTable.$inferInsert;
