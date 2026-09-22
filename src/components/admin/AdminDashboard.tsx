import React, { useState } from "react";
import { 
  Order, 
  Client, 
  StoreSettings, 
  Product, 
  NotificationLog, 
  OrderStatus, 
  ClientStatus, 
  AdminTab, 
  CategoryItem 
} from "../../types";
import { 
  updateOrderStatus, 
  updateStoreSettings 
} from "../../services/api";
import { BlueFocusManager } from "./BlueFocusManager";
import { ProductsManager } from "./ProductsManager";
import { CategoriesManager } from "./CategoriesManager";
import { ClientsManager } from "./ClientsManager";
import { ClientBlockingManager } from "./ClientBlockingManager";
import { playOrderReadyFanfare } from "../../utils/audio";
import { 
  ShoppingBag, 
  UserCheck, 
  CreditCard, 
  Image as ImageIcon, 
  RefreshCw, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Flame, 
  Truck, 
  Store, 
  Printer, 
  Search, 
  Plus, 
  Sparkles, 
  Send, 
  MessageSquare, 
  FileText,
  Phone,
  MapPin,
  Check,
  ChevronRight,
  Package,
  Tags,
  Users,
  UserX,
  Settings,
  Palette,
  ShieldAlert
} from "lucide-react";

interface AdminDashboardProps {
  orders: Order[];
  clients: Client[];
  settings: StoreSettings | null;
  products: Product[];
  categories?: CategoryItem[];
  notifications: NotificationLog[];
  onRefreshData: () => void;
  activeTab?: AdminTab;
  onActiveTabChange?: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  clients,
  settings,
  products,
  categories = [],
  notifications,
  onRefreshData,
  activeTab: controlledTab,
  onActiveTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<AdminTab>("PEDIDOS");
  const currentTab = controlledTab || internalTab;

  const handleTabChange = (tab: AdminTab) => {
    if (onActiveTabChange) {
      onActiveTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // Orders filter & modal
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("TODOS");
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

  // Settings form state
  const [storeName, setStoreName] = useState(settings?.storeName || "BALBEC - Salgados & Delícias");
  const [franchiseCode, setFranchiseCode] = useState(settings?.franchiseCode || "UBERABA-01");
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || "");
  const [storePhone, setStorePhone] = useState(settings?.phone || "(34) 3333-1000");
  const [storeAddress, setStoreAddress] = useState(settings?.address || "Av. Leopoldino de Oliveira, 1500 - Centro, Uberaba - MG");
  const [autoApprove, setAutoApprove] = useState(settings?.autoApproveClients || false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === "AGUARDANDO");
  const preparingOrders = orders.filter((o) => o.status === "PREPARANDO");
  const readyOrders = orders.filter((o) => o.status === "PRONTO");
  const blockedClientsCount = clients.filter((c) => c.status === "BLOCKED").length;
  const pendingClientsCount = clients.filter((c) => c.status === "PENDING").length;

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const res = await updateOrderStatus(orderId, nextStatus);
    if (res.success) {
      if (nextStatus === "PRONTO") {
        playOrderReadyFanfare();
      }
      onRefreshData();
      if (selectedOrderModal?.id === orderId && res.order) {
        setSelectedOrderModal(res.order);
      }
    }
  };

  const handleSaveBrandSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    await updateStoreSettings({
      storeName,
      franchiseCode,
      logoUrl,
      phone: storePhone,
      address: storeAddress,
      autoApproveClients: autoApprove,
    });
    setIsSavingSettings(false);
    setSaveSettingsSuccess(true);
    setTimeout(() => setSaveSettingsSuccess(false), 3000);
    onRefreshData();
  };

  const handleThermalPrint = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=380,height=600");
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cupom Pedido #${order.orderNumber}</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 72mm;
            margin: 0 auto;
            padding: 8mm 2mm;
            font-size: 12px;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; }
          .title { font-size: 16px; font-weight: 900; }
          .sub { font-size: 10px; }
          .items { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">BALBEC</div>
          <div class="sub">Os melhores sabores de Uberaba</div>
          <div class="sub">Unidade Centro - Uberaba/MG</div>
          <div class="sub">Tel: (34) 3333-1000</div>
        </div>
        <div class="divider"></div>
        <div class="center bold">PEDIDO #${order.orderNumber}</div>
        <div class="center">${order.type === "DELIVERY" ? "🛵 ENTREGA DELIVERY" : "📱 TOTEM LOJA"}</div>
        <div class="sub center">${new Date(order.createdAt).toLocaleString("pt-BR")}</div>
        <div class="divider"></div>
        <div><strong>Cliente:</strong> ${order.clientName}</div>
        <div><strong>Telefone:</strong> ${order.clientPhone || "Não inf."}</div>
        ${order.deliveryAddress ? `<div><strong>Endereço:</strong> ${order.deliveryAddress}</div>` : ""}
        <div class="divider"></div>
        <div class="bold">ITENS:</div>
        <div class="items">
          ${order.items
            .map(
              (it) => `
            <div class="row">
              <span>${it.quantity}x ${it.productName}</span>
              <span>R$ ${it.totalPrice.toFixed(2)}</span>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="divider"></div>
        <div class="row bold" style="font-size: 14px;">
          <span>TOTAL:</span>
          <span>R$ ${order.totalAmount.toFixed(2)}</span>
        </div>
        <div class="row sub">
          <span>Pagamento:</span>
          <span>${order.paymentMethod}</span>
        </div>
        ${order.changeForAmount ? `<div class="row sub"><span>Troco p/:</span><span>R$ ${order.changeForAmount.toFixed(2)}</span></div>` : ""}
        <div class="divider"></div>
        <div class="center sub">Obrigado pela preferência!<br/>balbec.com.br</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "TODOS") return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Dynamic Sub-View Rendering */}

      {/* 1. PEDIDOS (KDS) */}
      {currentTab === "PEDIDOS" && (
        <div className="space-y-6">
          
          {/* Header & Filter Controls */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <ShoppingBag className="w-6 h-6" />
                </span>
                <h2 className="text-2xl font-black text-slate-900">Painel de Pedidos & Cozinha (KDS)</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Acompanhamento em tempo real de comandas do Totem e Delivery em Uberaba com disparo automático no WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "TODOS", label: `Todos (${orders.length})` },
                { id: "AGUARDANDO", label: `Aguardando (${pendingOrders.length})`, count: pendingOrders.length, color: "text-amber-600 bg-amber-50" },
                { id: "PREPARANDO", label: `Preparando (${preparingOrders.length})`, count: preparingOrders.length, color: "text-blue-600 bg-blue-50" },
                { id: "PRONTO", label: `Prontos (${readyOrders.length})`, count: readyOrders.length, color: "text-emerald-600 bg-emerald-50" },
                { id: "CONCLUIDO", label: "Finalizados" },
                { id: "CANCELADO", label: "Cancelados" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderStatusFilter(f.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    orderStatusFilter === f.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">Nenhum pedido neste status</h3>
                <p className="text-xs text-slate-400 mt-1">Os novos pedidos realizados aparecerão aqui instantaneamente.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isPending = order.status === "AGUARDANDO";
                const isPreparing = order.status === "PREPARANDO";
                const isReady = order.status === "PRONTO";
                const isCompleted = order.status === "CONCLUIDO";
                const isCancelled = order.status === "CANCELADO";

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                      isPending
                        ? "border-amber-400 ring-2 ring-amber-400/20"
                        : isPreparing
                        ? "border-blue-300"
                        : isReady
                        ? "border-emerald-400"
                        : "border-slate-200 opacity-80"
                    }`}
                  >
                    {/* Card Header */}
                    <div
                      className={`p-4 border-b flex items-center justify-between ${
                        isPending
                          ? "bg-amber-500/10 border-amber-200"
                          : isPreparing
                          ? "bg-blue-500/10 border-blue-200"
                          : isReady
                          ? "bg-emerald-500/10 border-emerald-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-lg font-mono">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            order.type === "DELIVERY"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.type === "DELIVERY" ? "🛵 Delivery" : "📱 Totem"}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                          isPending
                            ? "bg-amber-500 text-slate-950 animate-pulse"
                            : isPreparing
                            ? "bg-blue-600 text-white"
                            : isReady
                            ? "bg-emerald-600 text-white"
                            : isCompleted
                            ? "bg-slate-700 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 flex-1">
                      {/* Client Info */}
                      <div>
                        <p className="font-bold text-slate-900 text-sm truncate">{order.clientName}</p>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{order.clientPhone || "Sem telefone"}</span>
                        </div>
                        {order.deliveryAddress && (
                          <div className="flex items-start space-x-1 text-xs text-slate-600 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate">{order.deliveryAddress}</span>
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          Itens da Comanda ({order.items.length})
                        </span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-800">
                            <span className="font-semibold truncate pr-2">
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-bold text-slate-900 shrink-0">
                              R$ {item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Payment */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Pagamento</span>
                          <span className="font-bold text-slate-700">{order.paymentMethod}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Total</span>
                          <span className="font-black text-base text-emerald-600">
                            R$ {order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-3 bg-slate-50/80 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {isPending && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "PREPARANDO")}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Iniciar Preparo</span>
                          </button>
                        )}

                        {isPreparing && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "PRONTO")}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Chamar Senha (Pronto)</span>
                          </button>
                        )}

                        {isReady && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "CONCLUIDO")}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Finalizar Pedido</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleThermalPrint(order)}
                          className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                          title="Imprimir Cupom da Cozinha"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span>Imprimir Cupom</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedOrderModal(order)}
                        className="w-full py-1.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Ver Detalhes Completos
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. CADASTRO DE PRODUTOS */}
      {currentTab === "PRODUTOS" && (
        <ProductsManager
          products={products}
          categories={categories}
          onRefreshData={onRefreshData}
        />
      )}

      {/* 3. CADASTRO DE CATEGORIAS */}
      {currentTab === "CATEGORIAS" && (
        <CategoriesManager
          categories={categories}
          products={products}
          onRefreshData={onRefreshData}
        />
      )}

      {/* 4. CADASTRO DE CLIENTES */}
      {currentTab === "CLIENTES" && (
        <ClientsManager
          clients={clients}
          onRefreshData={onRefreshData}
          onNavigateToBlocking={() => handleTabChange("BLOQUEIO_CLIENTES")}
        />
      )}

      {/* 5. BLOQUEIO DE CLIENTES */}
      {currentTab === "BLOQUEIO_CLIENTES" && (
        <ClientBlockingManager
          clients={clients}
          onRefreshData={onRefreshData}
          onNavigateToClients={() => handleTabChange("CLIENTES")}
        />
      )}

      {/* 6. INTEGRAÇÃO BLUEFOCUS */}
      {currentTab === "BLUEFOCUS" && (
        <BlueFocusManager
          settings={settings}
          products={products}
          onRefreshData={onRefreshData}
        />
      )}

      {/* 7. CONFIGURAÇÕES & FRANQUIA */}
      {currentTab === "CONFIGURACOES" && (
        <div className="space-y-6">
          
          {/* BlueFocus Quick Gateway Card inside Configurações */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-black text-slate-900">Integração BlueFocus ERP</h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    Ativo no Menu
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Gerencie credenciais de API, tokens da franquia, testes de latência e sincronização de catálogo e estoque.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleTabChange("BLUEFOCUS")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
            >
              <span>Abrir Integração BlueFocus</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <Settings className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Configurações & Franquia BALBEC</h2>
                <p className="text-sm text-slate-500">
                  Dados da unidade Uberaba, regras de aprovação de novos cadastros e integração BlueFocus.
                </p>
              </div>
            </div>

            {saveSettingsSuccess && (
              <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Configurações salvas com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSaveBrandSettings} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome da Unidade / Franquia
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Código da Franquia
                  </label>
                  <input
                    type="text"
                    value={franchiseCode}
                    onChange={(e) => setFranchiseCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telefone WhatsApp da Loja
                  </label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Endereço Completo em Uberaba
                  </label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL da Logomarca Personalizada
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://sua-empresa.com.br/logo.png"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      Aprovar novos clientes B2B automaticamente
                    </span>
                    <span className="text-xs text-slate-500">
                      Se desmarcado, novos cadastros passarão pelo status "PENDENTE" para validação de CNPJ.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                >
                  {isSavingSettings ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            </form>
          </div>

          {/* WhatsApp Notification Log */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Histórico de Mensagens WhatsApp Enviadas</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Nenhuma notificação enviada ainda.</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-emerald-700">
                        {notif.clientName} ({notif.clientPhone})
                      </span>
                      <p className="text-slate-800 mt-0.5">{notif.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-4">
                      {new Date(notif.sentAt).toLocaleTimeString("pt-BR")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 uppercase">Comanda Detalhada</span>
                <h3 className="text-xl font-black text-slate-900">#{selectedOrderModal.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="text-slate-500 font-bold">Cliente:</span> {selectedOrderModal.clientName}</p>
              <p><span className="text-slate-500 font-bold">Telefone:</span> {selectedOrderModal.clientPhone || "Não informado"}</p>
              <p><span className="text-slate-500 font-bold">Tipo:</span> {selectedOrderModal.type === "DELIVERY" ? "🛵 Delivery" : "📱 Totem Loja"}</p>
              {selectedOrderModal.deliveryAddress && (
                <p><span className="text-slate-500 font-bold">Endereço:</span> {selectedOrderModal.deliveryAddress}</p>
              )}
              <p><span className="text-slate-500 font-bold">Pagamento:</span> {selectedOrderModal.paymentMethod}</p>
              <p><span className="text-slate-500 font-bold">Status Atual:</span> <span className="font-bold text-amber-600">{selectedOrderModal.status}</span></p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <p className="font-bold text-slate-700 border-b border-slate-200 pb-1">Itens do Pedido:</p>
              {selectedOrderModal.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.productName}</span>
                  <span className="font-bold text-slate-900">R$ {it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-emerald-600 text-sm">
                <span>Total da Comanda:</span>
                <span>R$ {selectedOrderModal.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleThermalPrint(selectedOrderModal)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>Imprimir Cupom Térmico (80mm/58mm)</span>
              </button>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
