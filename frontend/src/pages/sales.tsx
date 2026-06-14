import React, { useState } from "react";
import { useListSales, getListSalesQueryKey, useGetStore, getGetStoreQueryKey } from "@/api";
import { useStoreContext } from "@/hooks/use-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ReceiptModal, type ReceiptData } from "@/components/receipt-modal";

export default function Sales() {
  const { storeId, storeName } = useStoreContext();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const { data: sales, isLoading } = useListSales({ store_id: storeId }, { query: { queryKey: getListSalesQueryKey({ store_id: storeId }) } });
  const { data: storeDetail } = useGetStore(storeId, { query: { enabled: storeId > 0, queryKey: getGetStoreQueryKey(storeId) } });

  const handlePrintReceipt = (sale: NonNullable<typeof sales>[number]) => {
    setReceiptData({ saleId: sale.id, storeName: storeDetail?.name ?? storeName, storeAddress: storeDetail?.address, storePhone: storeDetail?.phone, createdAt: sale.created_at, phoneBrand: sale.phone_brand ?? "", phoneModel: sale.phone_model ?? "", phoneImei: sale.phone_imei, warrantyExpiresAt: sale.warranty_expires_at, customerName: sale.customer_name, customerPhone: sale.customer_phone, customerPhoto: sale.customer_photo, salePrice: sale.sale_price, feeAmount: sale.fee_amount, staffName: sale.sale_staff_name });
    setReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Penjualan</h1>
        <p className="text-muted-foreground">Semua transaksi di toko {storeName}</p>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Item (HP)</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Staf</TableHead>
              <TableHead className="text-right">Harga Jual</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Nota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
            ) : sales?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Belum ada transaksi.</TableCell></TableRow>
            ) : (
              sales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })}</TableCell>
                  <TableCell>
                    <div className="font-medium">{sale.phone_brand} {sale.phone_model}</div>
                    <div className="font-mono text-xs text-muted-foreground">{sale.phone_imei}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sale.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{sale.customer_phone || "-"}</div>
                  </TableCell>
                  <TableCell>{sale.sale_staff_name}</TableCell>
                  <TableCell className="text-right font-medium">Rp {sale.sale_price.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-right text-muted-foreground">Rp {sale.fee_amount.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handlePrintReceipt(sale)} className="gap-1.5">
                      <Printer className="h-3.5 w-3.5" /> Cetak
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {receiptData && <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} data={receiptData} />}
    </div>
  );
}
