import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Smartphone, ScanLine, ShoppingCart, ListOrdered, ShieldCheck, Users, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreContext } from "@/hooks/use-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Smartphone },
  { href: "/scan-input", label: "Input HP", icon: ScanLine },
  { href: "/scan-sale", label: "Proses Jual", icon: ShoppingCart },
  { href: "/sales", label: "Riwayat Jual", icon: ListOrdered },
  { href: "/warranties", label: "Garansi", icon: ShieldCheck },
  { href: "/staff", label: "Staf", icon: Users },
  { href: "/stores", label: "Toko", icon: Store },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { storeName } = useStoreContext();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r bg-card flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground leading-tight">
              <ScanLine className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">{storeName}</span>
            </div>
            <span className="text-xs text-muted-foreground ml-7">powered by HPStinger</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b bg-card flex items-center px-6 md:hidden">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground leading-tight">
              <ScanLine className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">{storeName}</span>
            </div>
            <span className="text-xs text-muted-foreground ml-7">powered by HPStinger</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
