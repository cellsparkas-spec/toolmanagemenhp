import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";

const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Store {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  created_at: string;
}
export interface StoreInput { name: string; slug: string; logo_url?: string; address?: string; phone?: string; }
export interface StoreUpdate { name?: string; logo_url?: string; address?: string; phone?: string; }

export interface Staff {
  id: number;
  name: string;
  role: string;
  store_id: number;
  store_name?: string | null;
  created_at: string;
}
export interface StaffInput { name: string; role: string; store_id: number; }
export interface StaffUpdate { name?: string; role?: string; store_id?: number; }

export type ListPhonesStatus = "in_stock" | "sold" | "all";

export interface Phone {
  id: number;
  imei: string;
  brand: string;
  model: string;
  color?: string | null;
  storage?: string | null;
  purchase_price: number;
  selling_price: number;
  warranty_months: number;
  status: "in_stock" | "sold";
  store_id: number;
  store_name?: string | null;
  input_staff_id: number;
  input_staff_name?: string | null;
  created_at: string;
}
export interface PhoneInput {
  imei: string; brand: string; model: string; color?: string; storage?: string;
  purchase_price?: number; selling_price: number; warranty_months?: number;
  store_id: number; input_staff_id: number;
}
export interface PhoneUpdate {
  brand?: string; model?: string; color?: string; storage?: string;
  purchase_price?: number; selling_price?: number; warranty_months?: number;
}

export interface Sale {
  id: number;
  phone_id: number;
  phone_imei: string;
  phone_brand?: string | null;
  phone_model?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  sale_price: number;
  fee_amount: number;
  sale_staff_id: number;
  sale_staff_name?: string | null;
  store_id: number;
  store_name?: string | null;
  customer_photo?: string | null;
  warranty_expires_at?: string | null;
  created_at: string;
}
export interface SaleInput {
  phone_imei: string; customer_name: string; customer_phone?: string;
  sale_price: number; fee_amount: number; sale_staff_id: number;
  store_id: number; customer_photo?: string;
}

export interface Warranty {
  sale_id: number; phone_id: number; phone_imei: string;
  phone_brand?: string | null; phone_model?: string | null;
  customer_name: string; customer_phone?: string | null;
  warranty_months?: number; warranty_expires_at: string;
  days_remaining: number; store_id: number; store_name?: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_phones: number; phones_in_stock: number; phones_sold: number;
  total_sales_revenue: number; total_fees: number;
  total_staff: number; total_stores: number;
  recent_sales: Sale[];
  top_brands: { brand: string; count: number }[];
}

// ─── Raw fetch functions ───────────────────────────────────────────────────────

export const listStores = () => request<Store[]>("/stores");
export const getStore = (id: number) => request<Store>(`/stores/${id}`);
export const createStore = (data: StoreInput) => request<Store>("/stores", { method: "POST", body: JSON.stringify(data) });
export const updateStore = (id: number, data: StoreUpdate) => request<Store>(`/stores/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const listStaff = (params?: { store_id?: number }) => {
  const q = params?.store_id ? `?store_id=${params.store_id}` : "";
  return request<Staff[]>(`/staff${q}`);
};
export const createStaff = (data: StaffInput) => request<Staff>("/staff", { method: "POST", body: JSON.stringify(data) });
export const updateStaff = (id: number, data: StaffUpdate) => request<Staff>(`/staff/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteStaff = (id: number) => request<void>(`/staff/${id}`, { method: "DELETE" });

export const listPhones = (params?: { status?: ListPhonesStatus; store_id?: number; search?: string }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.store_id) q.set("store_id", String(params.store_id));
  if (params?.search) q.set("search", params.search);
  const qs = q.toString();
  return request<Phone[]>(`/phones${qs ? `?${qs}` : ""}`);
};
export const createPhone = (data: PhoneInput) => request<Phone>("/phones", { method: "POST", body: JSON.stringify(data) });
export const getPhoneByImei = (imei: string) => request<Phone>(`/phones/by-imei/${imei}`);
export const getPhone = (id: number) => request<Phone>(`/phones/${id}`);
export const updatePhone = (id: number, data: PhoneUpdate) => request<Phone>(`/phones/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deletePhone = (id: number) => request<void>(`/phones/${id}`, { method: "DELETE" });

export const listSales = (params?: { store_id?: number; staff_id?: number }) => {
  const q = new URLSearchParams();
  if (params?.store_id) q.set("store_id", String(params.store_id));
  if (params?.staff_id) q.set("staff_id", String(params.staff_id));
  const qs = q.toString();
  return request<Sale[]>(`/sales${qs ? `?${qs}` : ""}`);
};
export const createSale = (data: SaleInput) => request<Sale>("/sales", { method: "POST", body: JSON.stringify(data) });
export const getSale = (id: number) => request<Sale>(`/sales/${id}`);

export const listWarranties = (params?: { store_id?: number; search?: string }) => {
  const q = new URLSearchParams();
  if (params?.store_id) q.set("store_id", String(params.store_id));
  if (params?.search) q.set("search", params.search);
  const qs = q.toString();
  return request<Warranty[]>(`/warranties${qs ? `?${qs}` : ""}`);
};

export const getDashboard = (params?: { store_id?: number }) => {
  const q = params?.store_id ? `?store_id=${params.store_id}` : "";
  return request<DashboardStats>(`/dashboard${q}`);
};

// ─── Query key factories ───────────────────────────────────────────────────────

export const getListStoresQueryKey = () => ["stores"] as const;
export const getGetStoreQueryKey = (id: number) => ["stores", id] as const;
export const getListStaffQueryKey = (params?: { store_id?: number }) => ["staff", params] as const;
export const getListPhonesQueryKey = (params?: { status?: ListPhonesStatus; store_id?: number; search?: string }) => ["phones", params] as const;
export const getGetPhoneByImeiQueryKey = (imei: string) => ["phones", "by-imei", imei] as const;
export const getGetPhoneQueryKey = (id: number) => ["phones", id] as const;
export const getListSalesQueryKey = (params?: { store_id?: number; staff_id?: number }) => ["sales", params] as const;
export const getGetSaleQueryKey = (id: number) => ["sales", id] as const;
export const getListWarrantiesQueryKey = (params?: { store_id?: number; search?: string }) => ["warranties", params] as const;
export const getGetDashboardQueryKey = (params?: { store_id?: number }) => ["dashboard", params] as const;

// ─── Query hooks ──────────────────────────────────────────────────────────────

type QOpts<T> = { query?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> & { queryKey?: readonly unknown[] } };

export function useListStores(options?: QOpts<Store[]>) {
  return useQuery<Store[]>({ queryKey: getListStoresQueryKey(), queryFn: listStores, ...options?.query });
}
export function useGetStore(id: number, options?: QOpts<Store>) {
  return useQuery<Store>({ queryKey: getGetStoreQueryKey(id), queryFn: () => getStore(id), ...options?.query });
}
export function useListStaff(params?: { store_id?: number }, options?: QOpts<Staff[]>) {
  return useQuery<Staff[]>({ queryKey: getListStaffQueryKey(params), queryFn: () => listStaff(params), ...options?.query });
}
export function useListPhones(params?: { status?: ListPhonesStatus; store_id?: number; search?: string }, options?: QOpts<Phone[]>) {
  return useQuery<Phone[]>({ queryKey: getListPhonesQueryKey(params), queryFn: () => listPhones(params), ...options?.query });
}
export function useGetPhoneByImei(imei: string, options?: QOpts<Phone>) {
  return useQuery<Phone>({ queryKey: getGetPhoneByImeiQueryKey(imei), queryFn: () => getPhoneByImei(imei), ...options?.query });
}
export function useGetPhone(id: number, options?: QOpts<Phone>) {
  return useQuery<Phone>({ queryKey: getGetPhoneQueryKey(id), queryFn: () => getPhone(id), ...options?.query });
}
export function useListSales(params?: { store_id?: number; staff_id?: number }, options?: QOpts<Sale[]>) {
  return useQuery<Sale[]>({ queryKey: getListSalesQueryKey(params), queryFn: () => listSales(params), ...options?.query });
}
export function useGetSale(id: number, options?: QOpts<Sale>) {
  return useQuery<Sale>({ queryKey: getGetSaleQueryKey(id), queryFn: () => getSale(id), ...options?.query });
}
export function useListWarranties(params?: { store_id?: number; search?: string }, options?: QOpts<Warranty[]>) {
  return useQuery<Warranty[]>({ queryKey: getListWarrantiesQueryKey(params), queryFn: () => listWarranties(params), ...options?.query });
}
export function useGetDashboard(params?: { store_id?: number }, options?: QOpts<DashboardStats>) {
  return useQuery<DashboardStats>({ queryKey: getGetDashboardQueryKey(params), queryFn: () => getDashboard(params), ...options?.query });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateStore(options?: UseMutationOptions<Store, Error, { data: StoreInput }>) {
  return useMutation<Store, Error, { data: StoreInput }>({ mutationFn: ({ data }) => createStore(data), ...options });
}
export function useUpdateStore(options?: UseMutationOptions<Store, Error, { id: number; data: StoreUpdate }>) {
  return useMutation<Store, Error, { id: number; data: StoreUpdate }>({ mutationFn: ({ id, data }) => updateStore(id, data), ...options });
}
export function useCreateStaff(options?: UseMutationOptions<Staff, Error, { data: StaffInput }>) {
  return useMutation<Staff, Error, { data: StaffInput }>({ mutationFn: ({ data }) => createStaff(data), ...options });
}
export function useUpdateStaff(options?: UseMutationOptions<Staff, Error, { id: number; data: StaffUpdate }>) {
  return useMutation<Staff, Error, { id: number; data: StaffUpdate }>({ mutationFn: ({ id, data }) => updateStaff(id, data), ...options });
}
export function useDeleteStaff(options?: UseMutationOptions<void, Error, { id: number }>) {
  return useMutation<void, Error, { id: number }>({ mutationFn: ({ id }) => deleteStaff(id), ...options });
}
export function useCreatePhone(options?: UseMutationOptions<Phone, Error, { data: PhoneInput }>) {
  return useMutation<Phone, Error, { data: PhoneInput }>({ mutationFn: ({ data }) => createPhone(data), ...options });
}
export function useUpdatePhone(options?: UseMutationOptions<Phone, Error, { id: number; data: PhoneUpdate }>) {
  return useMutation<Phone, Error, { id: number; data: PhoneUpdate }>({ mutationFn: ({ id, data }) => updatePhone(id, data), ...options });
}
export function useDeletePhone(options?: UseMutationOptions<void, Error, { id: number }>) {
  return useMutation<void, Error, { id: number }>({ mutationFn: ({ id }) => deletePhone(id), ...options });
}
export function useCreateSale(options?: UseMutationOptions<Sale, Error, { data: SaleInput }>) {
  return useMutation<Sale, Error, { data: SaleInput }>({ mutationFn: ({ data }) => createSale(data), ...options });
}
