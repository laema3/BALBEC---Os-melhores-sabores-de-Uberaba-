export type Category = "salgados_fritos" | "salgados_assados" | "combos" | "doces" | "bebidas";

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  image: string;
  isAvailable: boolean;
  bluefocusSyncedAt: string;
}

export type ClientStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ClientAddress {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  city: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cnpj?: string;
  password?: string;
  minDailyOrders?: number;
  minWeeklyOrders?: number;
  address: ClientAddress;
  status: ClientStatus;
  createdAt: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observation?: string;
}

export type PaymentType = "DINHEIRO" | "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO";

export type OrderStatus = "AGUARDANDO" | "PREPARANDO" | "PRONTO" | "CONCLUIDO" | "CANCELADO";

export interface Order {
  id: string;
  orderNumber: string;
  type: "DELIVERY" | "TOTEM";
  clientName: string;
  clientPhone: string;
  deliveryAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentType;
  changeForAmount?: number;
  pixQrCodeUrl?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PaymentMethodSetting {
  id: string;
  name: string;
  type: PaymentType;
  active: boolean;
  instructions?: string;
}

export interface StoreSettings {
  storeName: string;
  franchiseCode: string;
  logoUrl: string;
  phone: string;
  address: string;
  autoApproveClients: boolean;
  blueFocusApiUrl: string;
  blueFocusApiKey: string;
  blueFocusAutoSyncMinutes: number;
  paymentMethods: PaymentMethodSetting[];
}

export interface NotificationLog {
  id: string;
  orderId: string;
  clientName: string;
  clientPhone: string;
  channel: "WHATSAPP" | "SMS";
  message: string;
  sentAt: string;
  status: "DELIVERED" | "SENT";
}

export type AppMode = "DELIVERY" | "TOTEM" | "ADMIN" | "CALL_DISPLAY";

export type LayoutThemeId = 
  | "balbec-classic" 
  | "dark-industrial" 
  | "b2b-atacado" 
  | "artisan-bistro" 
  | "fast-food-retro";

export interface LayoutThemeOption {
  id: LayoutThemeId;
  name: string;
  subtitle: string;
  tag: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  cardBg: string;
  textColor: string;
  fontVibe: string;
  recommendedFor: string;
}
