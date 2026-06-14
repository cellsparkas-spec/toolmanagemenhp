import { Router } from "express";
import { db, salesTable, phonesTable, storesTable, staffTable } from "../db/index.js";
import { eq, desc } from "drizzle-orm";

const router = Router();

const withJoins = () => db.select({
  id: salesTable.id, phone_id: salesTable.phone_id,
  phone_imei: phonesTable.imei, phone_brand: phonesTable.brand, phone_model: phonesTable.model,
  phone_color: phonesTable.color, phone_storage: phonesTable.storage,
  warranty_months: phonesTable.warranty_months,
  customer_name: salesTable.customer_name, customer_phone: salesTable.customer_phone,
  sale_price: salesTable.sale_price, fee_amount: salesTable.fee_amount,
  sale_staff_id: salesTable.sale_staff_id, sale_staff_name: staffTable.name,
  store_id: salesTable.store_id, store_name: storesTable.name,
  customer_photo: salesTable.customer_photo, warranty_expires_at: salesTable.warranty_expires_at,
  created_at: salesTable.created_at,
}).from(salesTable)
  .leftJoin(phonesTable, eq(salesTable.phone_id, phonesTable.id))
  .leftJoin(storesTable, eq(salesTable.store_id, storesTable.id))
  .leftJoin(staffTable, eq(salesTable.sale_staff_id, staffTable.id));

const fmt = (s: any) => ({
  ...s,
  sale_price: parseFloat(s.sale_price ?? "0"),
  fee_amount: parseFloat(s.fee_amount ?? "0"),
  created_at: s.created_at instanceof Date ? s.created_at.toISOString() : s.created_at,
  warranty_expires_at: s.warranty_expires_at instanceof Date ? s.warranty_expires_at.toISOString() : s.warranty_expires_at,
});

router.get("/sales", async (req, res) => {
  try {
    const { store_id, staff_id } = req.query as Record<string, string>;
    let rows = await withJoins().orderBy(desc(salesTable.created_at));
    if (store_id) rows = rows.filter(r => r.store_id === parseInt(store_id));
    if (staff_id) rows = rows.filter(r => r.sale_staff_id === parseInt(staff_id));
    res.json(rows.map(fmt));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/sales", async (req, res) => {
  try {
    const { phone_imei, customer_name, customer_phone, sale_price, fee_amount, sale_staff_id, store_id, customer_photo } = req.body;
    if (!phone_imei || !customer_name || sale_price === undefined || !sale_staff_id || !store_id)
      return res.status(400).json({ error: "Missing required fields" });
    const [phone] = await db.select().from(phonesTable).where(eq(phonesTable.imei, phone_imei));
    if (!phone) return res.status(404).json({ error: "HP tidak ditemukan" });
    if (phone.status === "sold") return res.status(400).json({ error: "HP sudah terjual" });
    const warrantyExpiresAt = new Date();
    warrantyExpiresAt.setMonth(warrantyExpiresAt.getMonth() + (phone.warranty_months ?? 12));
    const [sale] = await db.insert(salesTable).values({
      phone_id: phone.id, customer_name, customer_phone,
      sale_price: sale_price.toString(), fee_amount: (fee_amount ?? 0).toString(),
      sale_staff_id: parseInt(sale_staff_id), store_id: parseInt(store_id),
      customer_photo, warranty_expires_at: warrantyExpiresAt,
    }).returning();
    await db.update(phonesTable).set({ status: "sold" }).where(eq(phonesTable.id, phone.id));
    const [row] = await withJoins().where(eq(salesTable.id, sale.id));
    res.status(201).json(fmt(row));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.get("/sales/:id", async (req, res) => {
  try {
    const [row] = await withJoins().where(eq(salesTable.id, parseInt(req.params.id)));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.get("/warranties", async (req, res) => {
  try {
    const { store_id, search } = req.query as Record<string, string>;
    const rows = await withJoins().orderBy(desc(salesTable.warranty_expires_at));
    const now = new Date();
    let result = rows.filter(r => r.warranty_expires_at != null).map(r => {
      const exp = r.warranty_expires_at instanceof Date ? r.warranty_expires_at : new Date(r.warranty_expires_at!);
      return {
        sale_id: r.id, phone_id: r.phone_id, phone_imei: r.phone_imei,
        phone_brand: r.phone_brand, phone_model: r.phone_model,
        customer_name: r.customer_name, customer_phone: r.customer_phone,
        warranty_months: r.warranty_months,
        warranty_expires_at: exp.toISOString(),
        days_remaining: Math.ceil((exp.getTime() - now.getTime()) / 86400000),
        store_id: r.store_id, store_name: r.store_name,
        created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
      };
    });
    if (store_id) result = result.filter(r => r.store_id === parseInt(store_id));
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r =>
        r.phone_imei?.toLowerCase().includes(s) || r.customer_name.toLowerCase().includes(s) ||
        r.phone_brand?.toLowerCase().includes(s) || r.phone_model?.toLowerCase().includes(s)
      );
    }
    res.json(result);
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
