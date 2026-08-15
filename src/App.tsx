import React, { useEffect, useState, useCallback } from "react";
import { AppMode, Product, Client, Order, StoreSettings, NotificationLog, LayoutThemeId } from "./types";
import { 
  getProducts, 
  getClients, 
  getOrders, 
  getStoreSettings, 
  getNotifications, 
  subscribeToSyncEvents,
  syncBlueFocusProducts 
} from "./services/api";
import { playNewOrderAlert } from "./utils/audio";
import { Header } from "./components/Header";
import { CatalogView } from "./components/delivery/CatalogView";
import { CartDrawer } from "./components/delivery/CartDrawer";
import { ClientRegisterModal } from "./components/client/ClientRegisterModal";
import { ClientLoginModal } from "./components/client/ClientLoginModal";
import { TotemKioskView } from "./components/totem/TotemKioskView";
import { CallDisplayView } from "./components/totem/CallDisplayView";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { LayoutThemeSelector } from "./components/LayoutThemeSelector";
import { Sparkles, Check, Phone, MapPin } from "lucide-react";

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>("DELIVERY");

  // Visual Layout & Theme Choice (5 Presets)
  const [layoutTheme, setLayoutTheme] = useState<LayoutThemeId>(() => {
    return (localStorage.getItem("balbec_layout_theme") as LayoutThemeId) || "balbec-classic";
  });
  const [isLayoutSelectorOpen, setIsLayoutSelectorOpen] = useState(false);

  const handleSelectLayout = (layoutId: LayoutThemeId) => {
    setLayoutTheme(layoutId);
    localStorage.setItem("balbec_layout_theme", layoutId);
  };

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Delivery Cart
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number; observation?: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Client session
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync loader
  const [isSyncingBlueFocus, setIsSyncingBlueFocus] = useState(false);

  const loadAllData = useCallback(async () => {
    const [pList, cList, oList, sData, nList] = await Promise.all([
      getProducts(),
      getClients(),
      getOrders(),
      getStoreSettings(),
      getNotifications(),
    ]);

    setProducts(pList);
    setClients(cList);
    setOrders(oList);
    if (sData) setSettings(sData);
    setNotifications(nList);

    // If no client selected yet, require login
    if (!currentClient) {
      setIsLoginModalOpen(true);
    }
  }, [currentClient]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Subscribe to BroadcastChannel for real-time multi-tab & multi-device sync
  useEffect(() => {
    const unsubscribe = subscribeToSyncEvents((event) => {
      loadAllData();
      if (event.type === "NEW_ORDER_CREATED") {
        playNewOrderAlert();
      }
    });
    return () => unsubscribe();
  }, [loadAllData]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number, observation?: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, observation: observation || item.observation }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity), observation }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSyncBlueFocus = async () => {
    setIsSyncingBlueFocus(true);
    await syncBlueFocusProducts();
    await loadAllData();
    setIsSyncingBlueFocus(false);
  };

  const cartItemQuantities = cartItems.reduce((acc, ci) => {
    acc[ci.product.id] = ci.quantity;
    return acc;
  }, {} as Record<string, number>);

  const totalCartBadgeCount = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === "AGUARDANDO").length;
  const pendingClientsCount = clients.filter((c) => c.status === "PENDING").length;

  return (
    <div 
      data-layout={layoutTheme}
      className={`min-h-screen flex flex-col font-sans selection:bg-[#F59E0B] selection:text-slate-950 transition-colors duration-300 ${
        layoutTheme === "dark-industrial" 
          ? "bg-[#090A0F] text-[#F8FAFC]" 
          : layoutTheme === "b2b-atacado"
          ? "bg-[#F1F5F9] text-[#0F172A]"
          : layoutTheme === "artisan-bistro"
          ? "bg-[#FAF7F2] text-[#292524]"
          : layoutTheme === "fast-food-retro"
          ? "bg-[#FFFBF0] text-[#18181B]"
          : "bg-[#F8F9FA] text-[#2D3436]"
      }`}
    >
      
      {/* Top Header Navigation */}
      <Header
        currentMode={currentMode}
        onModeChange={(m) => setCurrentMode(m)}
        cartCount={totalCartBadgeCount}
        onOpenCart={() => {
          if (!currentClient || currentClient.status !== "APPROVED") {
            setIsLoginModalOpen(true);
          } else {
            setIsCartOpen(true);
          }
        }}
        settings={settings}
        currentClient={currentClient}
        onOpenClientModal={() => setIsClientModalOpen(true)}
        onLogout={() => setCurrentClient(null)}
        pendingClientsCount={pendingClientsCount}
        pendingOrdersCount={pendingOrdersCount}
        onOpenLayoutSelector={() => setIsLayoutSelectorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {/* Delivery (Web/Casa) Mode */}
        {currentMode === "DELIVERY" && (
          <CatalogView
            products={products}
            onAddToCart={handleAddToCart}
            cartItemQuantities={cartItemQuantities}
            onSyncBlueFocus={handleSyncBlueFocus}
            isSyncing={isSyncingBlueFocus}
            currentClient={currentClient}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenRegister={() => setIsClientModalOpen(true)}
          />
        )}

        {/* Totem / Tablet na Loja Mode */}
        {currentMode === "TOTEM" && (
          <TotemKioskView
            products={products}
            onOrderCreated={() => loadAllData()}
            currentClient={currentClient}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onClientLoginSuccess={(client) => setCurrentClient(client)}
            onClearClient={() => setCurrentClient(null)}
          />
        )}

        {/* Monitor TV Chamada Mode */}
        {currentMode === "CALL_DISPLAY" && (
          <CallDisplayView
            orders={orders}
            storeName={settings?.storeName}
          />
        )}

        {/* Admin Dashboard Mode */}
        {currentMode === "ADMIN" && (
          <AdminDashboard
            orders={orders}
            clients={clients}
            settings={settings}
            products={products}
            notifications={notifications}
            onRefreshData={loadAllData}
          />
        )}

      </main>

      {/* Cart & Checkout Drawer (Delivery) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentClient={currentClient}
        onOpenClientRegister={() => setIsClientModalOpen(true)}
        settings={settings}
        onOrderCreated={() => loadAllData()}
      />

      {/* Client Registration Modal */}
      <ClientRegisterModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        currentClient={currentClient}
        onClientUpdated={(updated) => {
          setCurrentClient(updated);
          setIsClientModalOpen(false);
          loadAllData();
        }}
        onSwitchToLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Client Login Modal */}
      <ClientLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(client) => {
          setCurrentClient(client);
          setIsLoginModalOpen(false);
          loadAllData();
        }}
        onSwitchToRegister={() => setIsClientModalOpen(true)}
      />

      {/* Footer Branding - Yellow Brand Theme */}
      <footer className="mt-auto bg-[#2D3436] text-[#B2BEC3] py-6 px-8 text-[11px] font-bold uppercase tracking-widest border-t border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] font-black text-slate-950 flex items-center justify-center text-lg tracking-tighter shadow-sm">
              B
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-tight uppercase">
                BALBEC — FRANQUIA DE SALGADOS
              </p>
              <p className="text-[11px] text-[#B2BEC3] font-medium leading-tight lowercase tracking-normal">
                {settings?.address || "Rua das Cozinhas, 120 - Centro"} • {settings?.phone || "(11) 3333-4444"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>STATUS DO SISTEMA: <span className="text-[#55EFC4]">● ONLINE</span></span>
            <span className="text-slate-600">|</span>
            <span className="text-[#F59E0B] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 inline" />
              <span>INTEGRAÇÃO BLUEFOCUS ATIVA</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Layout & Theme Selector (5 Presets Switcher) */}
      <LayoutThemeSelector
        currentLayout={layoutTheme}
        onSelectLayout={handleSelectLayout}
        isOpen={isLayoutSelectorOpen}
        onClose={() => setIsLayoutSelectorOpen(false)}
        onOpen={() => setIsLayoutSelectorOpen(true)}
      />

    </div>
  );
}
