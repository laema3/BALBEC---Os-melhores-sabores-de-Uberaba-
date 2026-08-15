import { Product, Client, Order, StoreSettings, NotificationLog, OrderStatus, ClientStatus } from "../types";

// BroadcastChannel for cross-tab real-time sync (Totem -> Admin -> Call Display)
const syncChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("balbec_sync") : null;

export function subscribeToSyncEvents(callback: (event: { type: string; payload?: any }) => void) {
  if (!syncChannel) return () => {};
  const handler = (ev: MessageEvent) => {
    if (ev.data) callback(ev.data);
  };
  syncChannel.addEventListener("message", handler);
  return () => {
    syncChannel.removeEventListener("message", handler);
  };
}

export function notifySyncEvent(type: string, payload?: any) {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, payload });
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }
  }
}

// Helper to make API requests with graceful fallback
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err);
    return null;
  }
}

// API methods
export async function getProducts(): Promise<Product[]> {
  const res = await fetchApi<{ success: boolean; data: Product[] }>("/api/bluefocus/products");
  if (res && res.data) return res.data;
  return [];
}

export async function syncBlueFocusProducts(): Promise<{ success: boolean; syncedAt: string; productsCount: number }> {
  const res = await fetchApi<any>("/api/bluefocus/sync", { method: "POST" });
  if (res) {
    notifySyncEvent("PRODUCTS_UPDATED");
    return res;
  }
  return { success: false, syncedAt: new Date().toISOString(), productsCount: 0 };
}

export async function updateProductStock(id: string, stock: number): Promise<boolean> {
  const res = await fetchApi<any>(`/api/bluefocus/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stock })
  });
  if (res && res.success) {
    notifySyncEvent("PRODUCTS_UPDATED");
    return true;
  }
  return false;
}

export async function createProduct(productData: Partial<Product>): Promise<Product | null> {
  const res = await fetchApi<{ success: boolean; product: Product }>("/api/bluefocus/products", {
    method: "POST",
    body: JSON.stringify(productData)
  });
  if (res && res.product) {
    notifySyncEvent("PRODUCTS_UPDATED");
    return res.product;
  }
  return null;
}

export async function getClients(): Promise<Client[]> {
  const res = await fetchApi<{ success: boolean; data: Client[] }>("/api/clients");
  if (res && res.data) return res.data;
  return [];
}

export async function loginClient(cnpj: string, password: string): Promise<{ success: boolean; client?: Client; error?: string }> {
  try {
    const res = await fetch("/api/clients/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cnpj, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "CNPJ ou senha inválidos." };
    }
    return { success: true, client: data.client };
  } catch (err: any) {
    return { success: false, error: err.message || "Falha na conexão com o servidor." };
  }
}

export async function registerClient(clientData: {
  name: string;
  phone: string;
  email?: string;
  cnpj?: string;
  password?: string;
  minDailyOrders?: number;
  minWeeklyOrders?: number;
  address?: any;
}): Promise<{ success: boolean; client?: Client; error?: string }> {
  try {
    const res = await fetch("/api/clients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Erro ao registrar cliente." };
    }
    notifySyncEvent("CLIENTS_UPDATED");
    return { success: true, client: data.client };
  } catch (err: any) {
    return { success: false, error: err.message || "Falha na conexão com o servidor." };
  }
}

export async function updateClientMinimums(id: string, minDailyOrders: number, minWeeklyOrders: number): Promise<boolean> {
  const res = await fetchApi<any>(`/api/clients/${id}/minimums`, {
    method: "PATCH",
    body: JSON.stringify({ minDailyOrders, minWeeklyOrders })
  });
  if (res && res.success) {
    notifySyncEvent("CLIENTS_UPDATED");
    return true;
  }
  return false;
}

export async function updateClientApproval(id: string, status: ClientStatus, notes?: string): Promise<boolean> {
  const res = await fetchApi<any>(`/api/clients/${id}/approval`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes })
  });
  if (res && res.success) {
    notifySyncEvent("CLIENTS_UPDATED");
    return true;
  }
  return false;
}

export async function getOrders(): Promise<Order[]> {
  const res = await fetchApi<{ success: boolean; data: Order[] }>("/api/orders");
  if (res && res.data) return res.data;
  return [];
}

export async function createOrder(orderPayload: {
  type: "DELIVERY" | "TOTEM";
  clientName: string;
  clientPhone: string;
  deliveryAddress?: string;
  items: any[];
  paymentMethod: string;
  changeForAmount?: number;
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Erro ao criar pedido." };
    }
    notifySyncEvent("NEW_ORDER_CREATED", { order: data.order });
    return { success: true, order: data.order };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro de rede ao salvar pedido." };
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<{ success: boolean; order?: Order }> {
  const res = await fetchApi<{ success: boolean; order: Order }>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  if (res && res.success) {
    notifySyncEvent("ORDER_STATUS_CHANGED", { order: res.order });
    return { success: true, order: res.order };
  }
  return { success: false };
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const res = await fetchApi<{ success: boolean; data: StoreSettings }>("/api/settings");
  if (res && res.data) return res.data;
  return null;
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<boolean> {
  const res = await fetchApi<any>("/api/settings", {
    method: "POST",
    body: JSON.stringify(newSettings)
  });
  if (res && res.success) {
    notifySyncEvent("SETTINGS_UPDATED");
    return true;
  }
  return false;
}

export async function getNotifications(): Promise<NotificationLog[]> {
  const res = await fetchApi<{ success: boolean; data: NotificationLog[] }>("/api/notifications");
  if (res && res.data) return res.data;
  return [];
}
