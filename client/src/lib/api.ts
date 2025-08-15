import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type {
  Product, ProductWithDetails, Category, Supplier, Customer,
  Sale, SaleWithDetails, DashboardMetrics, CartItem,
  InsertProduct, InsertCategory, InsertSupplier, InsertCustomer,
  InsertSale, InsertSaleItem
} from "@shared/schema";

// Dashboard API
export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });
}

export function useTopProducts(limit = 5) {
  return useQuery<Array<{ product: Product; totalSold: number; revenue: number }>>({
    queryKey: ["/api/dashboard/top-products", { limit }],
  });
}

export function useSalesData(days = 7) {
  return useQuery<Array<{ date: string; sales: number; transactions: number }>>({
    queryKey: ["/api/dashboard/sales-data", { days }],
  });
}

// Products API
export function useProducts(filters?: {
  search?: string;
  category?: string;
  supplier?: string;
  stock_status?: string;
}) {
  // Filter out undefined values to avoid malformed query parameters
  const cleanFilters = filters ? Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
  ) : {};
  
  const params = new URLSearchParams(cleanFilters);
  const queryString = params.toString();
  
  return useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", queryString],
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });
}

export function useProductByBarcode(barcode: string) {
  return useQuery<Product>({
    queryKey: ["/api/products/barcode", barcode],
    enabled: !!barcode,
  });
}

export function useLowStockProducts() {
  return useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products/low-stock"],
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: InsertProduct): Promise<Product> => {
      const response = await apiRequest("POST", "/api/products", product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<InsertProduct> & { id: string }): Promise<Product> => {
      const response = await apiRequest("PUT", `/api/products/${id}`, product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quantity, reason }: { id: string; quantity: number; reason?: string }): Promise<void> => {
      await apiRequest("POST", `/api/products/${id}/adjust-stock`, { quantity, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

// Categories API
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: InsertCategory): Promise<Category> => {
      const response = await apiRequest("POST", "/api/categories", category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...category }: { id: string } & Partial<InsertCategory>): Promise<Category> => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });
}

// Suppliers API
export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplier: InsertSupplier): Promise<Supplier> => {
      const response = await apiRequest("POST", "/api/suppliers", supplier);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...supplier }: { id: string } & Partial<InsertSupplier>): Promise<Supplier> => {
      const response = await apiRequest("PUT", `/api/suppliers/${id}`, supplier);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
  });
}

// Customers API
export function useCustomers(search?: string) {
  const params = search ? new URLSearchParams({ search }) : new URLSearchParams();
  const queryString = params.toString();
  return useQuery<Customer[]>({
    queryKey: ["/api/customers", queryString],
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: InsertCustomer): Promise<Customer> => {
      const response = await apiRequest("POST", "/api/customers", customer);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });
}

// Sales API
export function useSales(filters?: {
  start_date?: string;
  end_date?: string;
  customer_id?: string;
}) {
  const cleanFilters = filters ? Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
  ) : {};
  
  const params = new URLSearchParams(cleanFilters);
  const queryString = params.toString();
  return useQuery<SaleWithDetails[]>({
    queryKey: ["/api/sales", queryString],
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      sale: Omit<InsertSale, 'invoiceNumber' | 'userId'>;
      items: InsertSaleItem[];
    }): Promise<Sale> => {
      const response = await apiRequest("POST", "/api/sales", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}
