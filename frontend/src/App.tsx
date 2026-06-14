import { useState, useEffect, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import ScanInput from "@/pages/scan-input";
import ScanSale from "@/pages/scan-sale";
import Sales from "@/pages/sales";
import Warranties from "@/pages/warranties";
import Staff from "@/pages/staff";
import Stores from "@/pages/stores";
import NotFound from "@/pages/not-found";
import { StoreContext } from "@/hooks/use-store";
import { listStores } from "@/api";

const queryClient = new QueryClient();

function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeId, setStoreId] = useState<number>(() => {
    const saved = localStorage.getItem("hpstinger_store_id");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [storeName, setStoreName] = useState<string>(() => {
    return localStorage.getItem("hpstinger_store_name") ?? "";
  });

  const { data: stores } = useQuery({
    queryKey: ["stores-init"],
    queryFn: () => listStores(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (stores && stores.length > 0 && storeId === 0) {
      const first = stores[0];
      setStoreId(first.id);
      setStoreName(first.name);
      localStorage.setItem("hpstinger_store_id", first.id.toString());
      localStorage.setItem("hpstinger_store_name", first.name);
    }
  }, [stores, storeId]);

  useEffect(() => {
    if (storeName) document.title = storeName;
  }, [storeName]);

  const setStore = useCallback((id: number, name: string) => {
    setStoreId(id);
    setStoreName(name);
    localStorage.setItem("hpstinger_store_id", id.toString());
    localStorage.setItem("hpstinger_store_name", name);
    document.title = name;
  }, []);

  return (
    <StoreContext.Provider value={{ storeId, storeName, setStore }}>
      {children}
    </StoreContext.Provider>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/scan-input" component={ScanInput} />
        <Route path="/scan-sale" component={ScanSale} />
        <Route path="/sales" component={Sales} />
        <Route path="/warranties" component={Warranties} />
        <Route path="/staff" component={Staff} />
        <Route path="/stores" component={Stores} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
