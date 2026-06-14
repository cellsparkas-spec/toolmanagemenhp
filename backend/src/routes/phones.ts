import { Router } from "express";
import { db, phonesTable, storesTable, staffTable } from "../db/index.js";
import { eq } from "drizzle-orm";

const router = Router();

const withJoins = () => db.select({
  id: phonesTable.id, imei: phonesTable.imei, brand: phonesTable.brand,
  model: phonesTable.model, color: phonesTable.color, storage: phonesTable.storage,
  purchase_price: phonesTable.purchase_price, selling_price: phonesTable.selling_price,
  warranty_months: phonesTable.warranty_months, status: phonesTable.status,
  store_id: phonesTable.store_id, store_name: storesTable.name,
  input_staff_id: phonesTable.input_staff_id, input_staff_name: staffTable.name,
  created_at: phonesTable.created_at,
}).from(phonesTable)
  .leftJoin(storesTable, eq(phonesTable.store_id, storesTable.id))
  .leftJoin(staffTable, eq(phonesTable.input_staff_id, staffTable.id));

const fmt = (p: any) => ({
  ...p,
  purchase_price: parseFloat(p.purchase_price ?? "0"),
  selling_price: parseFloat(p.selling_price ?? "0"),
  created_at: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
});

router.get("/phones", async (req, res) => {
  try {
    const { status, store_id, search } = req.query as Record<string, string>;
    let rows = await withJoins().orderBy(phonesTable.created_at);
    if (status && status !== "all") rows = rows.filter(r => r.status === status);
    if (store_id) rows = rows.filter(r => r.store_id === parseInt(store_id));
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r => r.imei.toLowerCase().includes(s) || r.brand.toLowerCase().includes(s) || r.model.toLowerCase().includes(s));
    }
    res.json(rows.map(fmt));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/phones", async (req, res) => {
  try {
    const { imei, brand, model, color, storage, purchase_price, selling_price, warranty_months, store_id, input_staff_id } = req.body;
    if (!imei || !brand || !model || !selling_price || !store_id || !input_staff_id)
      return res.status(400).json({ error: "Missing required fields" });
    const [phone] = await db.insert(phonesTable).values({
      imei, brand, model, color, storage,
      purchase_price: (purchase_price ?? 0).toString(), selling_price: selling_price.toString(),
      warranty_months: parseInt(warranty_months) || 12,
      store_id: parseInt(store_id), input_staff_id: parseInt(input_staff_id),
    }).returning();
    const [row] = await withJoins().where(eq(phonesTable.id, phone.id));
    res.status(201).json(fmt(row));
  } catch (err: any) {
    if (err?.code === "23505") return res.status(400).json({ error: "IMEI sudah terdaftar" });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/phones/by-imei/:imei", async (req, res) => {
  try {
    const [row] = await withJoins().where(eq(phonesTable.imei, req.params.imei));
    if (!row) return res.status(404).json({ error: "HP tidak ditemukan" });
    res.json(fmt(row));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.get("/phones/:id", async (req, res) => {
  try {
    const [row] = await withJoins().where(eq(phonesTable.id, parseInt(req.params.id)));
    if (!row) return res.status(404).json({ error: "HP tidak ditemukan" });
    res.json(fmt(row));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/phones/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { brand, model, color, storage, purchase_price, selling_price, warranty_months } = req.body;
    await db.update(phonesTable).set({
      ...(brand && { brand }), ...(model && { model }),
      ...(color !== undefined && { color }), ...(storage !== undefined && { storage }),
      ...(purchase_price !== undefined && { purchase_price: purchase_price.toString() }),
      ...(selling_price !== undefined && { selling_price: selling_price.toString() }),
      ...(warranty_months !== undefined && { warranty_months: parseInt(warranty_months) }),
    }).where(eq(phonesTable.id, id));
    const [row] = await withJoins().where(eq(phonesTable.id, id));
    if (!row) return res.status(404).json({ error: "HP tidak ditemukan" });
    res.json(fmt(row));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/phones/:id", async (req, res) => {
  try {
    await db.delete(phonesTable).where(eq(phonesTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
