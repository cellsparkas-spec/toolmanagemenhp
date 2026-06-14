import React, { useState } from "react";
import { useListStores, getListStoresQueryKey, useCreateStore } from "@/api";
import { useStoreContext } from "@/hooks/use-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store as StoreIcon, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Stores() {
  const { storeId, setStore } = useStoreContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const { data: stores, isLoading } = useListStores({ query: { queryKey: getListStoresQueryKey() } });
  const createStore = useCreateStore();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createStore.mutate({ data: { name: newName, slug: newSlug || newName.toLowerCase().replace(/\s+/g, '-'), address: newAddress } }, {
      onSuccess: () => {
        setNewName(""); setNewSlug(""); setNewAddress("");
        queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
        toast({ title: "Berhasil", description: "Toko berhasil ditambahkan" });
      }
    });
  };

  const handleSwitchStore = (id: number, name: string) => {
    setStore(id, name);
    toast({ title: "Ganti Toko", description: `Sekarang aktif di toko: ${name}` });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Toko</h1>
        <p className="text-muted-foreground">Kelola cabang toko dan ganti instansi aktif</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Tambah Toko Baru</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2"><label className="text-sm font-medium">Nama Toko</label><Input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Contoh: Cabang Roxy" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Slug (URL)</label><Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="cabang-roxy" /></div>
            <div className="space-y-2 md:col-span-2 flex gap-4 items-end">
              <div className="space-y-2 flex-1"><label className="text-sm font-medium">Alamat Lengkap</label><Input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Alamat..." /></div>
              <Button type="submit" disabled={createStore.isPending}><Plus className="h-4 w-4 mr-2" /> Tambah</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nama Toko</TableHead><TableHead>Alamat</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
            ) : stores?.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Belum ada toko.</TableCell></TableRow>
            ) : (
              stores?.map((store) => (
                <TableRow key={store.id} className={storeId === store.id ? "bg-muted/50" : ""}>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      <StoreIcon className="h-4 w-4 text-muted-foreground" />
                      {store.name}
                      {storeId === store.id && <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary hover:bg-primary/30">Aktif</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{store.address || "-"}</TableCell>
                  <TableCell className="text-right">
                    {storeId !== store.id && (
                      <Button variant="outline" size="sm" onClick={() => handleSwitchStore(store.id, store.name)}>
                        <Check className="h-4 w-4 mr-2" /> Jadikan Aktif
                      </Button>
                    )}
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
