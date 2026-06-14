import React from "react";
import { useGetDashboard, getGetDashboardQueryKey } from "@/api";
import { useStoreContext } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ShoppingCart, DollarSign, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { storeId, storeName } = useStoreContext();
  const { data: stats, isLoading } = useGetDashboard({ store_id: storeId }, { query: { queryKey: getGetDashboardQueryKey({ store_id: storeId }) } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan performa untuk {storeName}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="HP di Stok" value={stats?.phones_in_stock} icon={<Smartphone className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="HP Terjual" value={stats?.phones_sold} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="Total Pendapatan" value={stats?.total_sales_revenue ? `Rp ${stats.total_sales_revenue.toLocaleString()}` : "Rp 0"} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="Total Fee" value={stats?.total_fees ? `Rp ${stats.total_fees.toLocaleString()}` : "Rp 0"} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Penjualan Terbaru</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="space-y-4">
                {stats?.recent_sales?.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{sale.phone_brand} {sale.phone_model}</p>
                      <p className="text-sm text-muted-foreground">{sale.customer_name} • {new Date(sale.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rp {sale.sale_price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Fee: Rp {sale.fee_amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {(!stats?.recent_sales || stats.recent_sales.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">Belum ada penjualan.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader><CardTitle>Brand Terlaris</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="space-y-4">
                {stats?.top_brands?.map((brand, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="font-medium">{brand.brand}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{brand.count}</span>
                      <span className="text-muted-foreground text-sm">unit</span>
                    </div>
                  </div>
                ))}
                {(!stats?.top_brands || stats.top_brands.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">Belum ada data.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isLoading }: { title: string; value?: React.ReactNode; icon: React.ReactNode; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value ?? 0}</div>}
      </CardContent>
    </Card>
  );
}
