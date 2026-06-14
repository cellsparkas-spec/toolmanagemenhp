import React, { useState, useEffect } from "react";
import { useCreatePhone, useListStaff, getListStaffQueryKey } from "@/api";
import { useStoreContext } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine } from "lucide-react";

export default function ScanInput() {
  const { storeId, storeName } = useStoreContext();
  const { toast } = useToast();
  const [imei, setImei] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("1");
  const [staffId, setStaffId] = useState("");

  const { data: staffList } = useListStaff({ store_id: storeId }, { query: { queryKey: getListStaffQueryKey({ store_id: storeId }) } });
  const createPhone = useCreatePhone();

  useEffect(() => {
    if (imei.length === 15) toast({ title: "IMEI terdeteksi", description: "Silakan isi detail HP" });
  }, [imei, toast]);

  const handleSimulateScan = () => {
    setImei(Math.floor(100000000000000 + Math.random() * 900000000000000).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) { toast({ title: "Error", description: "Pilih staf input terlebih dahulu", variant: "destructive" }); return; }
    createPhone.mutate({
      data: { imei, brand, model, color, storage, purchase_price: purchasePrice ? Number(purchasePrice) : undefined, selling_price: Number(sellingPrice), warranty_months: Number(warrantyMonths), store_id: storeId, input_staff_id: Number(staffId) }
    }, {
      onSuccess: () => {
        toast({ title: "Sukses", description: "HP berhasil diinput ke inventory!" });
        setImei(""); setBrand(""); setModel(""); setColor(""); setStorage(""); setPurchasePrice(""); setSellingPrice(""); setWarrantyMonths("1");
      },
      onError: (err: any) => { toast({ title: "Gagal", description: err.message || "Gagal menyimpan HP", variant: "destructive" }); }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Input HP Baru</h1>
        <p className="text-muted-foreground">Scan IMEI dan lengkapi detail untuk toko {storeName}</p>
      </div>
      <Card className="border-primary/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label htmlFor="imei" className="text-lg">Scan IMEI</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ScanLine className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
                <Input id="imei" value={imei} onChange={(e) => setImei(e.target.value)} className="pl-12 text-2xl font-mono h-14" placeholder="xxxxxxxxxxxxxxx" maxLength={15} autoFocus />
              </div>
              <Button type="button" onClick={handleSimulateScan} variant="outline" className="h-14">Test Scan</Button>
            </div>
            {imei.length > 0 && imei.length < 15 && <p className="text-sm text-amber-500">Membaca... {imei.length}/15 digit</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Detail Spesifikasi</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Merek</Label><Input value={brand} onChange={e => setBrand(e.target.value)} required placeholder="Contoh: Samsung" /></div>
              <div className="space-y-2"><Label>Model</Label><Input value={model} onChange={e => setModel(e.target.value)} required placeholder="Contoh: Galaxy S23" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Warna</Label><Input value={color} onChange={e => setColor(e.target.value)} placeholder="Contoh: Hitam" /></div>
              <div className="space-y-2"><Label>Storage / RAM</Label><Input value={storage} onChange={e => setStorage(e.target.value)} placeholder="Contoh: 8/256GB" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Harga Beli (Modal)</Label><Input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0" /></div>
              <div className="space-y-2"><Label>Harga Jual</Label><Input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} required placeholder="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Garansi (Bulan)</Label><Input type="number" value={warrantyMonths} onChange={e => setWarrantyMonths(e.target.value)} required min="0" /></div>
              <div className="space-y-2">
                <Label>Staf Input</Label>
                <Select value={staffId} onValueChange={setStaffId} required>
                  <SelectTrigger><SelectValue placeholder="Pilih staf..." /></SelectTrigger>
                  <SelectContent>{staffList?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name} - {s.role}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full" disabled={createPhone.isPending || imei.length !== 15}>
                {createPhone.isPending ? "Menyimpan..." : "Simpan HP ke Inventory"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
