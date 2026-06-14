import { Router } from "express";
import { db, storesTable } from "../db/index.js";
import { eq } from "drizzle-orm";

const router = Router();

const fmt = (s: any) => ({ ...s, created_at: s.created_at.toISOString() });

router.get("/stores", async (_req, res) => {
  try {
    const rows = await db.select().from(storesTable).orderBy(storesTable.created_at);
    res.json(rows.map(fmt));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/stores", async (req, res) => {
  try {
    const { name, slug, logo_url, address, phone } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "name and slug required" });
    const [store] = await db.insert(storesTable).values({ name, slug, logo_url, address, phone }).returning();
    res.status(201).json(fmt(store));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.get("/stores/:id", async (req, res) => {
  try {
    const [store] = await db.select().from(storesTable).where(eq(storesTable.id, parseInt(req.params.id)));
    if (!store) return res.status(404).json({ error: "Not found" });
    res.json(fmt(store));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/stores/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, logo_url, address, phone } = req.body;
    const [store] = await db.update(storesTable).set({
      ...(name && { name }), ...(logo_url !== undefined && { logo_url }),
      ...(address !== undefined && { address }), ...(phone !== undefined && { phone }),
    }).where(eq(storesTable.id, id)).returning();
    if (!store) return res.status(404).json({ error: "Not found" });
    res.json(fmt(store));
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
