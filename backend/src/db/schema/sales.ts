import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores.js";
import { staffTable } from "./staff.js";
import { phonesTable } from "./phones.js";

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  phone_id: integer("phone_id").notNull().references(() => phonesTable.id),
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone"),
  sale_price: numeric("sale_price", { precision: 15, scale: 2 }).notNull(),
  fee_amount: numeric("fee_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  sale_staff_id: integer("sale_staff_id").notNull().references(() => staffTable.id),
  store_id: integer("store_id").notNull().references(() => storesTable.id),
  customer_photo: text("customer_photo"),
  warranty_expires_at: timestamp("warranty_expires_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Sale = typeof salesTable.$inferSelect;
export type InsertSale = typeof salesTable.$inferInsert;
