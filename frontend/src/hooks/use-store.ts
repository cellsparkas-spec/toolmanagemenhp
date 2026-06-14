import { createContext, useContext } from "react";

export interface StoreContextValue {
  storeId: number;
  storeName: string;
  setStore: (id: number, name: string) => void;
}

export const StoreContext = createContext<StoreContextValue>({
  storeId: 1,
  storeName: "Toko Aktif",
  setStore: () => {},
});

export function useStoreContext() {
  return useContext(StoreContext);
}
