import { Router } from "express";
import { db, staffTable, storesTable } from "../db/index.js";
import { eq } from "drizzle-orm";

const router = Router();

const withStore = () => db.select({
  id: staffTable.id, name: staffTable.name, role: staffTable.role,
  store_id: staffTable.store_id, store_name: storesTable.name, created_at: staffTable.created_at,
}).from(staffTable).leftJoin(storesTable, eq(staffTable.store_id, storesTable.id));

const fmt = (r: any) => ({ ...r, created_at: r.created_at.toISOString() });

router.get("/staff", async (req, res) => {
  try {
    const storeId = req.query.store_id ? parseInt(req.query.store_id as string) : undefined;
    let rows = await withStore().orderBy(staffTable.name);
    if (storeId) rows = rows.filter(r => r.store_id === storeId);
    res.json(rows.map(fmt));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/staff", async (req, res) => {
  try {
    const { name, role, store_id } = req.body;
    if (!name || !role || !store_id) return res.status(400).json({ error: "name, role, store_id required" });
    const [staff] = await db.insert(staffTable).values({ name, role, store_id: parseInt(store_id) }).returning();
    const [store] = await db.select({ name: storesTable.name }).from(storesTable).where(eq(storesTable.id, staff.store_id));
    res.status(201).json({ ...fmt(staff), store_name: store?.name ?? null });
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/staff/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, role, store_id } = req.body;
    const [staff] = await db.update(staffTable).set({
      ...(name && { name }), ...(role && { role }), ...(store_id && { store_id: parseInt(store_id) }),
    }).where(eq(staffTable.id, id)).returning();
    if (!staff) return res.status(404).json({ error: "Not found" });
    const [store] = await db.select({ name: storesTable.name }).from(storesTable).where(eq(storesTable.id, staff.store_id));
    res.json({ ...fmt(staff), store_name: store?.name ?? null });
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/staff/:id", async (req, res) => {
  try {
    await db.delete(staffTable).where(eq(staffTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
