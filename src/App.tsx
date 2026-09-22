import React, { useEffect, useState, useCallback } from "react";
import { 
  AppMode, 
  Product, 
  Client, 
  Order, 
  StoreSettings, 
  NotificationLog, 
  LayoutThemeId, 
  AdminTab, 
  CategoryItem 
} from "./types";
import { 
  getProducts, 
  getCategories, 
  getClients, 
  getOrders, 
  getStoreSettings, 
  getNotifications, 
  subscribeToSyncEvents,
  syncBlueFocusProducts 
} from "./services/api";
import { playNewOrderAlert } from "./utils/audio";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
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
  const [currentMode, setCurrentMode] = useState<AppMode>("ADMIN");
  const [adminTab, setAdminTab] = useState<AdminTab>("PEDIDOS");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
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
    const [pList, catList, cList, oList, sData, nList] = await Promise.all([
      getProducts(),
      getCategories(),
      getClients(),
      getOrders(),
      getStoreSettings(),
      getNotifications(),
    ]);

    setProducts(pList);
    setCategories(catList);
    setClients(cList);
    setOrders(oList);
    if (sData) setSettings(sData);
    setNotifications(nList);
  }, []);

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
  const blockedClientsCount = clients.filter((c) => c.status === "BLOCKED").length;

  return (
    <div 
      data-layout={layoutTheme}
      className={`min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 ${
        layoutTheme === "dark-industrial" 
          ? "bg-[#090A0F] text-[#F8FAFC]" 
          : layoutTheme === "b2b-atacado"
          ? "bg-[#F1F5F9] text-[#0F172A]"
          : layoutTheme === "artisan-bistro"
          ? "bg-[#FAF7F2] text-[#292524]"
          : layoutTheme === "fast-food-retro"
          ? "bg-[#FFFBF0] text-[#18181B]"
          : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentMode={currentMode}
        onModeChange={(m) => setCurrentMode(m)}
        adminTab={adminTab}
        onAdminTabChange={(tab) => {
          setAdminTab(tab);
          if (currentMode !== "ADMIN") setCurrentMode("ADMIN");
        }}
        pendingOrdersCount={pendingOrdersCount}
        pendingClientsCount={pendingClientsCount}
        blockedClientsCount={blockedClientsCount}
        productsCount={products.length}
        categoriesCount={categories.length}
        clientsCount={clients.length}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenLayoutSelector={() => setIsLayoutSelectorOpen(true)}
        settings={settings}
      />

      {/* Main Layout Container adjusted for Sidebar */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-20"
        }`}
      >
        {/* Top Header */}
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
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* View Port Content */}
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
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
              categories={categories}
              notifications={notifications}
              onRefreshData={loadAllData}
              activeTab={adminTab}
              onActiveTabChange={(t) => setAdminTab(t)}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="mt-auto bg-slate-900 text-slate-400 py-5 px-6 sm:px-8 text-xs font-semibold border-t border-slate-800">
          <div className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 font-black text-slate-950 flex items-center justify-center text-base shadow-sm">
                B
              </div>
              <div>
                <p className="font-bold text-white text-sm tracking-tight uppercase">
                  BALBEC — OS MELHORES SABORES DE UBERABA
                </p>
                <p className="text-[11px] text-slate-400 font-normal">
                  {settings?.address || "Av. Leopoldino de Oliveira, 1500 - Centro, Uberaba - MG"} • Tel: {settings?.phone || "(34) 3333-1000"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-bold">SISTEMA ONLINE</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-amber-400 flex items-center space-x-1 font-bold">
                <Sparkles className="w-3.5 h-3.5 inline" />
                <span>BLUEFOCUS INTEGRADO</span>
              </span>
            </div>
          </div>
        </footer>
      </div>

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
