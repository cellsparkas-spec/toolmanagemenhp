import React, { useState } from "react";
import { useGetPhoneByImei, getGetPhoneByImeiQueryKey, useCreateSale, useListStaff, getListStaffQueryKey, useGetStore, getGetStoreQueryKey, getListSalesQueryKey } from "@/api";
import { useStoreContext } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CameraCapture } from "@/components/camera-capture";
import { ScanLine, Smartphone } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ReceiptModal, type ReceiptData } from "@/components/receipt-modal";

export default function ScanSale() {
  const { storeId } = useStoreContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [imei, setImei] = useState("");
  const [scannedImei, setScannedImei] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [feeAmount, setFeeAmount] = useState("0");
  const [staffId, setStaffId] = useState("");
  const [customerPhoto, setCustomerPhoto] = useState<string>("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const { data: phone, isError, isLoading } = useGetPhoneByImei(scannedImei, {
    query: { enabled: scannedImei.length === 15, queryKey: getGetPhoneByImeiQueryKey(scannedImei), retry: false },
  });
  const { data: staffList } = useListStaff({ store_id: storeId }, { query: { queryKey: getListStaffQueryKey({ store_id: storeId }) } });
  const { data: storeDetail } = useGetStore(storeId, { query: { enabled: storeId > 0, queryKey: getGetStoreQueryKey(storeId) } });
  const createSale = useCreateSale();

  const handleScan = (e: React.FormEvent) => { e.preventDefault(); if (imei.length === 15) setScannedImei(imei); };

  React.useEffect(() => { if (phone) setSalePrice(phone.selling_price.toString()); }, [phone]);

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) { toast({ title: "Error", description: "Pilih staf yang melayani", variant: "destructive" }); return; }
    if (!customerPhoto) { toast({ title: "Error", description: "Foto wajah pembeli wajib diisi", variant: "destructive" }); return; }
    if (!phone) return;
    const selectedStaff = staffList?.find((s) => s.id.toString() === staffId);
    createSale.mutate({ data: { phone_imei: phone.imei, customer_name: customerName, customer_phone: customerPhone, sale_price: Number(salePrice), fee_amount: Number(feeAmount), sale_staff_id: Number(staffId), store_id: storeId, customer_photo: customerPhoto } }, {
      onSuccess: (sale) => {
        setReceiptData({ saleId: sale.id, storeName: storeDetail?.name ?? sale.store_name ?? "Toko", storeAddress: storeDetail?.address, storePhone: storeDetail?.phone, createdAt: sale.created_at, phoneBrand: phone.brand, phoneModel: phone.model, phoneImei: phone.imei, phoneColor: phone.color, phoneStorage: phone.storage, warrantyMonths: phone.warranty_months, warrantyExpiresAt: sale.warranty_expires_at, customerName, customerPhone, customerPhoto, salePrice: Number(salePrice), feeAmount: Number(feeAmount), staffName: selectedStaff?.name ?? null });
        setReceiptOpen(true);
        setImei(""); setScannedImei(""); setCustomerName(""); setCustomerPhone(""); setSalePrice(""); setFeeAmount("0"); setStaffId(""); setCustomerPhoto("");
        queryClient.invalidateQueries({ queryKey: getGetPhoneByImeiQueryKey(scannedImei) });
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
      },
      onError: (err: any) => { toast({ title: "Gagal", description: err.message || "Gagal memproses penjualan", variant: "destructive" }); }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proses Penjualan</h1>
        <p className="text-muted-foreground">Scan IMEI dan lengkapi data pembeli</p>
      </div>
      <Card className="border-primary/50 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleScan} className="space-y-4">
            <Label htmlFor="imei" className="text-lg">Scan IMEI HP yang dijual</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ScanLine className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
                <Input id="imei" value={imei} onChange={(e) => { setImei(e.target.value); if (e.target.value.length === 15) setScannedImei(e.target.value); }} className="pl-12 text-2xl font-mono h-14" placeholder="xxxxxxxxxxxxxxx" maxLength={15} autoFocus />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      {isLoading && <div className="text-center py-4">Mencari data HP...</div>}
      {isError && <Card className="border-destructive"><CardContent className="pt-6 text-destructive">Data HP dengan IMEI tersebut tidak ditemukan atau sudah terjual.</CardContent></Card>}
      {phone && phone.status === "in_stock" && (
        <Card>
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />{phone.brand} {phone.model}</CardTitle>
            <CardDescription>IMEI: <span className="font-mono text-foreground">{phone.imei}</span> • Spek: {phone.color} {phone.storage}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitSale} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Data Customer</h3>
                  <div className="space-y-2"><Label>Nama Pembeli</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>No HP / WA</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Staf yang Melayani</Label>
                    <Select value={staffId} onValueChange={setStaffId} required>
                      <SelectTrigger><SelectValue placeholder="Pilih staf..." /></SelectTrigger>
                      <SelectContent>{staffList?.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.name} - {s.role}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Transaksi</h3>
                  <div className="space-y-2">
                    <Label>Harga Jual (Rp)</Label>
                    <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required />
                    <p className="text-xs text-muted-foreground">Rekomendasi harga: Rp {Number(phone.selling_price).toLocaleString("id-ID")}</p>
                  </div>
                  <div className="space-y-2"><Label>Fee Tambahan (Rp)</Label><Input type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} required /></div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Verifikasi (Wajib)</h3>
                <Label>Foto Wajah Pembeli bersama HP</Label>
                <CameraCapture onCapture={setCustomerPhoto} />
                {customerPhoto && <p className="text-sm text-green-600 font-medium mt-2">Foto berhasil ditangkap</p>}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={createSale.isPending || !customerPhoto}>
                {createSale.isPending ? "Memproses..." : "Konfirmasi Penjualan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      {phone && phone.status === "sold" && <Card className="border-amber-500"><CardContent className="pt-6 text-amber-700">HP dengan IMEI ini sudah berstatus TERJUAL.</CardContent></Card>}
      {receiptData && <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} data={receiptData} />}
    </div>
  );
}
