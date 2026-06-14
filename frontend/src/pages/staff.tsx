import React, { useState } from "react";
import { useListStaff, getListStaffQueryKey, useCreateStaff, useDeleteStaff } from "@/api";
import { useStoreContext } from "@/hooks/use-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Staff() {
  const { storeId, storeName } = useStoreContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Kasir");

  const { data: staffList, isLoading } = useListStaff({ store_id: storeId }, { query: { queryKey: getListStaffQueryKey({ store_id: storeId }) } });
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createStaff.mutate({ data: { name: newName, role: newRole, store_id: storeId } }, {
      onSuccess: () => {
        setNewName(""); setNewRole("Kasir");
        queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
        toast({ title: "Berhasil", description: "Staf berhasil ditambahkan" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus staf ini?")) {
      deleteStaff.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
          toast({ title: "Berhasil", description: "Staf berhasil dihapus" });
        }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Staf</h1>
        <p className="text-muted-foreground">Kelola staf untuk toko {storeName}</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Tambah Staf Baru</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1"><label className="text-sm font-medium">Nama Staf</label><Input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Contoh: Budi" /></div>
            <div className="space-y-2 flex-1"><label className="text-sm font-medium">Role / Jabatan</label><Input value={newRole} onChange={e => setNewRole(e.target.value)} required placeholder="Contoh: Kasir" /></div>
            <Button type="submit" disabled={createStaff.isPending}><UserPlus className="h-4 w-4 mr-2" /> Tambah</Button>
          </form>
        </CardContent>
      </Card>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead><TableHead>Role</TableHead><TableHead>Tgl Masuk</TableHead><TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : staffList?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Belum ada staf.</TableCell></TableRow>
            ) : (
              staffList?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.role}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
