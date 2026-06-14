import { Router } from "express";
import { db, phonesTable, salesTable, staffTable, storesTable } from "../db/index.js";
import { eq, count, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard", async (req, res) => {
  try {
    const storeId = req.query.store_id ? parseInt(req.query.store_id as string) : undefined;
    const [allPhones, allSales, totalStaff, totalStores] = await Promise.all([
      db.select().from(phonesTable),
      db.select().from(salesTable),
      db.select({ count: count() }).from(staffTable),
      db.select({ count: count() }).from(storesTable),
    ]);
    const phones = storeId ? allPhones.filter(p => p.store_id === storeId) : allPhones;
    const sales = storeId ? allSales.filter(s => s.store_id === storeId) : allSales;
    const recentRows = await db.select({
      id: salesTable.id, phone_id: salesTable.phone_id,
      phone_imei: phonesTable.imei, phone_brand: phonesTable.brand, phone_model: phonesTable.model,
      customer_name: salesTable.customer_name, customer_phone: salesTable.customer_phone,
      sale_price: salesTable.sale_price, fee_amount: salesTable.fee_amount,
      sale_staff_id: salesTable.sale_staff_id, sale_staff_name: staffTable.name,
      store_id: salesTable.store_id, store_name: storesTable.name,
      customer_photo: salesTable.customer_photo, warranty_expires_at: salesTable.warranty_expires_at,
      created_at: salesTable.created_at,
    }).from(salesTable)
      .leftJoin(phonesTable, eq(salesTable.phone_id, phonesTable.id))
      .leftJoin(storesTable, eq(salesTable.store_id, storesTable.id))
      .leftJoin(staffTable, eq(salesTable.sale_staff_id, staffTable.id))
      .orderBy(desc(salesTable.created_at)).limit(5);
    const recentSales = (storeId ? recentRows.filter(r => r.store_id === storeId) : recentRows).map(s => ({
      ...s,
      sale_price: parseFloat(s.sale_price ?? "0"),
      fee_amount: parseFloat(s.fee_amount ?? "0"),
      created_at: s.created_at instanceof Date ? s.created_at.toISOString() : s.created_at,
      warranty_expires_at: s.warranty_expires_at instanceof Date ? s.warranty_expires_at.toISOString() : s.warranty_expires_at,
    }));
    const brandMap: Record<string, number> = {};
    phones.forEach(p => { brandMap[p.brand] = (brandMap[p.brand] || 0) + 1; });
    res.json({
      total_phones: phones.length,
      phones_in_stock: phones.filter(p => p.status === "in_stock").length,
      phones_sold: phones.filter(p => p.status === "sold").length,
      total_sales_revenue: sales.reduce((acc, s) => acc + parseFloat(s.sale_price ?? "0"), 0),
      total_fees: sales.reduce((acc, s) => acc + parseFloat(s.fee_amount ?? "0"), 0),
      total_staff: totalStaff[0]?.count ?? 0,
      total_stores: totalStores[0]?.count ?? 0,
      recent_sales: recentSales,
      top_brands: Object.entries(brandMap).map(([brand, count]) => ({ brand, count })).sort((a, b) => b.count - a.count).slice(0, 5),
    });
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
