import React, { useState } from "react";
import { useListWarranties, getListWarrantiesQueryKey } from "@/api";
import { useStoreContext } from "@/hooks/use-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Warranties() {
  const { storeId, storeName } = useStoreContext();
  const [search, setSearch] = useState("");
  const { data: warranties, isLoading } = useListWarranties(
    { store_id: storeId, search: search || undefined },
    { query: { queryKey: getListWarrantiesQueryKey({ store_id: storeId, search: search || undefined }) } }
  );

  const getWarrantyBadge = (days?: number) => {
    if (days === undefined) return <Badge variant="secondary">Expired</Badge>;
    if (days < 0) return <Badge variant="secondary" className="bg-gray-200 text-gray-800">Expired</Badge>;
    if (days < 10) return <Badge variant="destructive">{days} hari lagi</Badge>;
    if (days <= 30) return <Badge className="bg-yellow-500 hover:bg-yellow-600">{days} hari lagi</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600">{days} hari lagi</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Garansi Aktif</h1>
        <p className="text-muted-foreground">Daftar garansi pelanggan di toko {storeName}</p>
      </div>
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Cari IMEI atau nama pembeli..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Item (HP)</TableHead>
              <TableHead>Tgl Habis</TableHead>
              <TableHead>Status Garansi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : warranties?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Tidak ada garansi ditemukan.</TableCell></TableRow>
            ) : (
              warranties?.map((w) => (
                <TableRow key={w.sale_id}>
                  <TableCell>
                    <div className="font-medium">{w.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{w.customer_phone || "-"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{w.phone_brand} {w.phone_model}</div>
                    <div className="font-mono text-xs text-muted-foreground">{w.phone_imei}</div>
                  </TableCell>
                  <TableCell>{new Date(w.warranty_expires_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{getWarrantyBadge(w.days_remaining)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
