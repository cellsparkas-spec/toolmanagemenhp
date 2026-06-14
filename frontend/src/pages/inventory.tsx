import React, { useState } from "react";
import { useListPhones, getListPhonesQueryKey, useDeletePhone, ListPhonesStatus } from "@/api";
import { useStoreContext } from "@/hooks/use-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { storeId, storeName } = useStoreContext();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListPhonesStatus>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: phones, isLoading } = useListPhones(
    { store_id: storeId, search: search || undefined, status },
    { query: { queryKey: getListPhonesQueryKey({ store_id: storeId, search: search || undefined, status }) } }
  );

  const deletePhone = useDeletePhone();

  const handleDelete = (id: number) => {
    if (confirm("Hapus data HP ini?")) {
      deletePhone.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPhonesQueryKey() });
          toast({ title: "Berhasil", description: "Data HP berhasil dihapus" });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Daftar HP di {storeName}</p>
        </div>
        <Link href="/scan-input" className="w-full sm:w-auto">
          <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Input HP Baru</Button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Cari IMEI atau merek..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant={status === "all" ? "default" : "outline"} onClick={() => setStatus("all")}>Semua</Button>
          <Button variant={status === "in_stock" ? "default" : "outline"} onClick={() => setStatus("in_stock")}>In Stock</Button>
          <Button variant={status === "sold" ? "default" : "outline"} onClick={() => setStatus("sold")}>Terjual</Button>
        </div>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IMEI</TableHead>
              <TableHead>Merek/Model</TableHead>
              <TableHead>Spek</TableHead>
              <TableHead>Harga Jual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : phones?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Tidak ada data HP.</TableCell></TableRow>
            ) : (
              phones?.map((phone) => (
                <TableRow key={phone.id}>
                  <TableCell className="font-mono text-xs">{phone.imei}</TableCell>
                  <TableCell className="font-medium">{phone.brand} {phone.model}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{phone.color} • {phone.storage}</TableCell>
                  <TableCell>Rp {phone.selling_price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={phone.status === "in_stock" ? "secondary" : "default"}>
                      {phone.status === "in_stock" ? "In Stock" : "Terjual"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(phone.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
