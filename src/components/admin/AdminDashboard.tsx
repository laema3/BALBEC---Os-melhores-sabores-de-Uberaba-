import React, { useState } from "react";
import { Order, Client, StoreSettings, Product, NotificationLog, OrderStatus, ClientStatus, PaymentType } from "../../types";
import { 
  updateOrderStatus, 
  updateClientApproval, 
  updateClientMinimums,
  updateStoreSettings, 
  syncBlueFocusProducts, 
  updateProductStock, 
  createProduct 
} from "../../services/api";
import { ProposalsView } from "./ProposalsView";
import { playNewOrderAlert, playOrderReadyFanfare } from "../../utils/audio";
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
  ChevronRight
} from "lucide-react";

interface AdminDashboardProps {
  orders: Order[];
  clients: Client[];
  settings: StoreSettings | null;
  products: Product[];
  notifications: NotificationLog[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  clients,
  settings,
  products,
  notifications,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<"PEDIDOS" | "CLIENTES" | "PAGAMENTOS" | "LOGOMARCA" | "BLUEFOCUS" | "PROPOSTAS">("PEDIDOS");
  
  // Orders filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("TODOS");
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

  // Clients filter
  const [clientStatusFilter, setClientStatusFilter] = useState<string>("PENDING");

  // Settings form state
  const [storeName, setStoreName] = useState(settings?.storeName || "");
  const [franchiseCode, setFranchiseCode] = useState(settings?.franchiseCode || "");
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || "");
  const [storePhone, setStorePhone] = useState(settings?.phone || "");
  const [storeAddress, setStoreAddress] = useState(settings?.address || "");
  const [autoApprove, setAutoApprove] = useState(settings?.autoApproveClients || false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // BlueFocus Sync State
  const [isSyncingBlueFocus, setIsSyncingBlueFocus] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  // Product Stock Editing State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);

  // Client Minimums Editing State
  const [editingClientMinId, setEditingClientMinId] = useState<string | null>(null);
  const [minDaily, setMinDaily] = useState<number>(5);
  const [minWeekly, setMinWeekly] = useState<number>(30);

  const handleSaveMinimums = async (clientId: string) => {
    await updateClientMinimums(clientId, minDaily, minWeekly);
    setEditingClientMinId(null);
    onRefreshData();
  };

  // New Product Modal in BlueFocus
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("30");
  const [newProdCategory, setNewProdCategory] = useState<any>("salgados_fritos");
  const [newProdImage, setNewProdImage] = useState("");

  const pendingOrders = orders.filter((o) => o.status === "AGUARDANDO");
  const pendingClients = clients.filter((c) => c.status === "PENDING");

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

  const handleApproveClient = async (clientId: string, status: ClientStatus, notes?: string) => {
    await updateClientApproval(clientId, status, notes);
    onRefreshData();
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

  const handleSyncBlueFocus = async () => {
    setIsSyncingBlueFocus(true);
    setSyncMessage("");
    const res = await syncBlueFocusProducts();
    setIsSyncingBlueFocus(false);
    if (res.success) {
      setSyncMessage(`Sincronizado! ${res.productsCount} produtos atualizados com a API BlueFocus.`);
      onRefreshData();
    }
  };

  const handleSaveStock = async (prodId: string) => {
    await updateProductStock(prodId, editingStockValue);
    setEditingStockId(null);
    onRefreshData();
  };

  const handleCreateNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    await createProduct({
      name: newProdName,
      description: newProdDesc,
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      category: newProdCategory,
      image: newProdImage || "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    });

    setShowAddProductModal(false);
    setNewProdName("");
    setNewProdDesc("");
    setNewProdPrice("");
    onRefreshData();
  };

  const handleThermalPrint = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom Térmico #${order.orderNumber} - BALBEC</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; color: #000; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .border-t { border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; }
              .flex { display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="center bold" style="font-size: 16px;">BALBEC SALGADOS</div>
            <div class="center">Franquia: ${settings?.franchiseCode || "FRANQ-001"}</div>
            <div class="center">${settings?.address || "Rua Principal, 100"}</div>
            <div class="center">Tel: ${settings?.phone || ""}</div>
            <div class="border-t"></div>
            <div><strong>PEDIDO #${order.orderNumber}</strong> (${order.type})</div>
            <div>Data: ${new Date(order.createdAt).toLocaleString("pt-BR")}</div>
            <div>Cliente: ${order.clientName}</div>
            <div>Tel/Contato: ${order.clientPhone || "-"}</div>
            <div>Endereço: ${order.deliveryAddress || "Retirada Balcão"}</div>
            <div class="border-t"></div>
            <div class="bold">ITENS DO PEDIDO:</div>
            ${order.items.map(it => `
              <div class="flex">
                <span>${it.quantity}x ${it.productName}</span>
                <span>R$ ${it.totalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="border-t"></div>
            <div class="flex bold" style="font-size: 14px;">
              <span>TOTAL:</span>
              <span>R$ ${order.totalAmount.toFixed(2)}</span>
            </div>
            <div>Forma de Pagamento: ${order.paymentMethod}</div>
            <div class="border-t center" style="margin-top: 15px;">
              Obrigado pela preferência!<br/>
              Sistema Balbec BlueFocus
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "TODOS") return true;
    return o.status === orderStatusFilter;
  });

  const filteredClients = clients.filter((c) => {
    if (clientStatusFilter === "TODOS") return true;
    return c.status === clientStatusFilter;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Admin Top Dashboard Banner */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center justify-center font-black text-2xl shadow-sm">
            ⚙️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-[#2D3436]">PAINEL OPERACIONAL BALBEC</h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                {settings?.franchiseCode || "FRANQ-001"}
              </span>
            </div>
            <p className="text-xs text-[#636E72] font-medium mt-0.5">
              Gestão de pedidos, aprovação de clientes, condições de pagamento e integração BlueFocus.
            </p>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => playNewOrderAlert()}
            className="px-3 py-2 bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#D97706] border border-[#E9ECEF] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            title="Testar aviso sonoro de novo pedido"
          >
            <Volume2 className="w-4 h-4 text-[#D97706]" />
            <span>Testar Som</span>
          </button>

          <button
            onClick={onRefreshData}
            className="p-2.5 bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#636E72] border border-[#E9ECEF] rounded-xl transition-colors"
            title="Atualizar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#E9ECEF] scrollbar-none">
        
        <button
          onClick={() => setActiveTab("PEDIDOS")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "PEDIDOS"
              ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-[#F59E0B]/20 scale-105"
              : "bg-white text-[#636E72] hover:bg-[#F8F9FA] border border-[#E9ECEF]"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Gestão de Pedidos</span>
          {pendingOrders.length > 0 && (
            <span className="ml-1 bg-[#D63031] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow-xs">
              {pendingOrders.length} novos
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("CLIENTES")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "CLIENTES"
              ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-[#F59E0B]/20 scale-105"
              : "bg-white text-[#636E72] hover:bg-[#F8F9FA] border border-[#E9ECEF]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Aprovação de Clientes</span>
          {pendingClients.length > 0 && (
            <span className="ml-1 bg-[#F59E0B] text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse border border-slate-950">
              {pendingClients.length} pendentes
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("PAGAMENTOS")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "PAGAMENTOS"
              ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-[#F59E0B]/20 scale-105"
              : "bg-white text-[#636E72] hover:bg-[#F8F9FA] border border-[#E9ECEF]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Formas de Pagamento</span>
        </button>

        <button
          onClick={() => setActiveTab("LOGOMARCA")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "LOGOMARCA"
              ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-[#F59E0B]/20 scale-105"
              : "bg-white text-[#636E72] hover:bg-[#F8F9FA] border border-[#E9ECEF]"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Logomarca & Unidade</span>
        </button>

        <button
          onClick={() => setActiveTab("BLUEFOCUS")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "BLUEFOCUS"
              ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-[#F59E0B]/20 scale-105"
              : "bg-white text-[#636E72] hover:bg-[#F8F9FA] border border-[#E9ECEF]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#00B894]" />
          <span>Integração BlueFocus</span>
        </button>

        <button
          onClick={() => setActiveTab("PROPOSTAS")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "PROPOSTAS"
              ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-[#F59E0B]/20 scale-105"
              : "bg-white text-[#636E72] hover:bg-[#F8F9FA] border border-[#E9ECEF]"
          }`}
        >
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>Propostas Comerciais</span>
        </button>

      </div>

      {/* TAB 1: GESTÃO DE PEDIDOS */}
      {activeTab === "PEDIDOS" && (
        <div className="space-y-6">
          
          {/* Order Visual Alert Header if pending */}
          {pendingOrders.length > 0 && (
            <div className="p-4 bg-[#FEF3C7] border-2 border-[#FDE68A] rounded-[24px] flex items-center justify-between shadow-sm animate-pulse">
              <div className="flex items-center space-x-3 text-[#D63031]">
                <AlertCircle className="w-7 h-7 text-[#D97706] shrink-0" />
                <div>
                  <h3 className="font-black text-[#2D3436] text-base">
                    {pendingOrders.length} PEDIDO(S) NOVO(S) AGUARDANDO CONFIRMAÇÃO!
                  </h3>
                  <p className="text-xs text-[#636E72]">
                    Aviso sonoro ativado. Clique em "Mudar Status" para enviar para a esteira de preparação na cozinha.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOrderStatusFilter("AGUARDANDO")}
                className="px-4 py-2 bg-[#F59E0B] text-slate-950 font-black text-xs rounded-xl shadow-sm hover:bg-[#D97706]"
              >
                Ver Pedidos Pendentes
              </button>
            </div>
          )}

          {/* Status Filter Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {["TODOS", "AGUARDANDO", "PREPARANDO", "PRONTO", "CONCLUIDO", "CANCELADO"].map((st) => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  orderStatusFilter === st
                    ? "bg-[#F59E0B] text-slate-950 font-black"
                    : "bg-white text-[#636E72] border border-[#E9ECEF] hover:bg-[#F8F9FA]"
                }`}
              >
                {st === "TODOS" && "Todos os Pedidos"}
                {st === "AGUARDANDO" && "Aguardando"}
                {st === "PREPARANDO" && "Em Preparação"}
                {st === "PRONTO" && "Pronto / Saiu"}
                {st === "CONCLUIDO" && "Concluídos"}
                {st === "CANCELADO" && "Cancelados"}
              </button>
            ))}
          </div>

          {/* Orders Grid / Kanban */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[24px] border border-[#E9ECEF]">
              <ShoppingBag className="w-12 h-12 text-[#B2BEC3] mx-auto mb-2" />
              <p className="text-[#636E72] font-bold text-sm">Nenhum pedido encontrado neste status.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => {
                const isPending = order.status === "AGUARDANDO";

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-[24px] p-5 border-2 shadow-xs transition-all flex flex-col justify-between ${
                      isPending
                        ? "border-[#F59E0B] bg-[#FEF3C7]/40 animate-pulse"
                        : order.status === "PREPARANDO"
                        ? "border-[#FDE68A]"
                        : order.status === "PRONTO"
                        ? "border-[#00B894]/50"
                        : "border-[#E9ECEF]"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Order Number & Type */}
                      <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-black text-[#D97706] font-mono">
                            #{order.orderNumber}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            order.type === "TOTEM"
                              ? "bg-[#E6F9F5] text-[#00B894] border-[#00B894]/30"
                              : "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                          }`}>
                            {order.type === "TOTEM" ? "TOTEM LOJA" : "DELIVERY"}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          order.status === "AGUARDANDO"
                            ? "bg-[#D63031] text-white animate-pulse"
                            : order.status === "PREPARANDO"
                            ? "bg-[#F59E0B] text-slate-950 font-black"
                            : order.status === "PRONTO"
                            ? "bg-[#00B894] text-white"
                            : "bg-[#F8F9FA] text-[#636E72]"
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Client info */}
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-[#2D3436] text-sm">{order.clientName}</p>
                        <p className="text-[#636E72] flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>{order.clientPhone || "Presencial"}</span>
                        </p>
                        {order.deliveryAddress && (
                          <p className="text-[#636E72] text-[11px] truncate flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                            <span>{order.deliveryAddress}</span>
                          </p>
                        )}
                      </div>

                      {/* Items Brief */}
                      <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-1.5 text-xs">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[#2D3436]">
                            <span className="font-semibold">{it.quantity}x {it.productName}</span>
                            <span className="font-bold text-[#636E72]">R$ {it.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[#636E72] font-bold">Pagamento ({order.paymentMethod}):</span>
                        <span className="font-black text-[#00B894] text-base">
                          R$ {order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Action Controls */}
                    <div className="pt-4 border-t border-[#E9ECEF] mt-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {order.status === "AGUARDANDO" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "PREPARANDO")}
                            className="col-span-2 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-xl text-xs uppercase shadow-xs flex items-center justify-center space-x-1"
                          >
                            <Flame className="w-4 h-4" />
                            <span>Enviar para Cozinha</span>
                          </button>
                        )}

                        {order.status === "PREPARANDO" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "PRONTO")}
                            className="col-span-2 py-2.5 bg-[#00B894] hover:bg-[#00A383] text-white font-black rounded-xl text-xs uppercase shadow-xs flex items-center justify-center space-x-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Marcar como PRONTO</span>
                          </button>
                        )}

                        {order.status === "PRONTO" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "CONCLUIDO")}
                            className="col-span-2 py-2.5 bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#2D3436] font-bold border border-[#E9ECEF] rounded-xl text-xs uppercase"
                          >
                            Finalizar Venda
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedOrderModal(order)}
                        className="w-full py-2 bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#636E72] border border-[#E9ECEF] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Ver Ficha Completa</span>
                      </button>

                      <button
                        onClick={() => handleThermalPrint(order)}
                        className="w-full py-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] border border-[#FDE68A] text-xs font-black rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Printer className="w-4 h-4 text-[#D97706]" />
                        <span>Imprimir Cupom Térmico</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: APROVAÇÃO DE CLIENTES */}
      {activeTab === "CLIENTES" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-[20px] border border-[#E9ECEF] shadow-xs">
            <div>
              <h2 className="font-black text-[#2D3436] text-lg">Fila de Aprovação de Clientes</h2>
              <p className="text-xs text-[#636E72]">Novos cadastros de clientes aguardando validação do operador/franqueado</p>
            </div>

            <div className="flex items-center space-x-2">
              {["PENDING", "APPROVED", "REJECTED", "TODOS"].map((st) => (
                <button
                  key={st}
                  onClick={() => setClientStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    clientStatusFilter === st
                      ? "bg-[#F59E0B] text-slate-950 font-black"
                      : "bg-[#F8F9FA] text-[#636E72] border border-[#E9ECEF]"
                  }`}
                >
                  {st === "PENDING" && "Pendentes"}
                  {st === "APPROVED" && "Aprovados"}
                  {st === "REJECTED" && "Recusados"}
                  {st === "TODOS" && "Todos"}
                </button>
              ))}
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[24px] border border-[#E9ECEF]">
              <p className="text-[#636E72] font-bold text-sm">Nenhum cliente nesta fila no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`bg-white rounded-[24px] p-5 border-2 shadow-xs space-y-4 ${
                    client.status === "PENDING"
                      ? "border-[#F59E0B] bg-[#FEF3C7]/30"
                      : client.status === "APPROVED"
                      ? "border-[#00B894]/40"
                      : "border-[#D63031]/30"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-3">
                    <h3 className="font-black text-[#2D3436] text-base">{client.name}</h3>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                      client.status === "APPROVED"
                        ? "bg-[#E6F9F5] text-[#00B894] border border-[#00B894]/30"
                        : client.status === "PENDING"
                        ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] animate-pulse"
                        : "bg-[#FFF5F5] text-[#D63031] border border-[#FFE3E3]"
                    }`}>
                      {client.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 text-[#636E72]">
                    <p className="flex items-center space-x-2 font-mono">
                      <span className="text-[#D97706] font-bold">CNPJ:</span>
                      <span className="text-[#2D3436] font-bold">{client.cnpj || "Não informado"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-[#D97706]" />
                      <span className="font-bold text-[#2D3436]">{client.phone}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#D97706]" />
                      <span>
                        {client.address.street}, {client.address.number} - {client.address.neighborhood}, {client.address.city}
                      </span>
                    </p>

                    <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E9ECEF] space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2D3436]">Mín. Pedidos Diários:</span>
                        <span className="font-black text-[#D97706]">{client.minDailyOrders ?? 5}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2D3436]">Mín. Pedidos Semanais:</span>
                        <span className="font-black text-[#D97706]">{client.minWeeklyOrders ?? 30}</span>
                      </div>

                      {editingClientMinId === client.id ? (
                        <div className="space-y-2 pt-2 border-t border-[#E9ECEF]">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-[#636E72]">Diário</label>
                              <input
                                type="number"
                                value={minDaily}
                                onChange={(e) => setMinDaily(Number(e.target.value))}
                                className="w-full bg-white border border-[#E9ECEF] rounded-lg px-2 py-1 text-xs font-bold text-[#2D3436]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#636E72]">Semanal</label>
                              <input
                                type="number"
                                value={minWeekly}
                                onChange={(e) => setMinWeekly(Number(e.target.value))}
                                className="w-full bg-white border border-[#E9ECEF] rounded-lg px-2 py-1 text-xs font-bold text-[#2D3436]"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2 pt-1">
                            <button
                              onClick={() => handleSaveMinimums(client.id)}
                              className="flex-1 py-1.5 bg-[#00B894] text-white font-black rounded-lg text-[10px]"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingClientMinId(null)}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px]"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingClientMinId(client.id);
                            setMinDaily(client.minDailyOrders ?? 5);
                            setMinWeekly(client.minWeeklyOrders ?? 30);
                          }}
                          className="w-full mt-1 py-1.5 bg-white hover:bg-[#E9ECEF] text-[#2D3436] border border-[#E9ECEF] font-bold rounded-lg text-[10px] transition-colors"
                        >
                          ⚙️ Ajustar Mínimos de Pedidos
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-[#B2BEC3] font-mono pt-1">
                      Data cadastro: {new Date(client.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  {client.status === "PENDING" && (
                    <div className="pt-3 border-t border-[#E9ECEF] grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApproveClient(client.id, "APPROVED")}
                        className="py-2.5 bg-[#00B894] hover:bg-[#00A383] text-white font-black rounded-xl text-xs uppercase flex items-center justify-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aprovar</span>
                      </button>

                      <button
                        onClick={() => handleApproveClient(client.id, "REJECTED", "Endereço fora da área de entrega")}
                        className="py-2.5 bg-[#FFF5F5] hover:bg-[#FFE3E3] text-[#D63031] border border-[#FFE3E3] font-bold rounded-xl text-xs uppercase flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Recusar</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONDICIONS DE PAGAMENTO */}
      {activeTab === "PAGAMENTOS" && (
        <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-black text-[#2D3436] text-xl">Cadastro de Condições de Pagamento</h2>
            <p className="text-xs text-[#636E72]">Ative ou desative formas de pagamento aceitas no delivery e no totem</p>
          </div>

          <div className="space-y-4">
            {settings?.paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#FEF3C7] text-[#D97706] rounded-xl border border-[#FDE68A]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D3436] text-sm">{pm.name}</h4>
                    <p className="text-xs text-[#636E72]">{pm.instructions}</p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-[#E6F9F5] text-[#00B894] border border-[#00B894]/30 text-xs font-bold rounded-full">
                  Ativo na Loja ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LOGOMARCA & CONFIGURAÇÕES */}
      {activeTab === "LOGOMARCA" && (
        <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-6 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h2 className="font-black text-[#2D3436] text-xl">Identidade Visual & Logomarca da Franquia</h2>
            <p className="text-xs text-[#636E72]">Configure o logotipo exibido no totem, tablet e delivery web</p>
          </div>

          <form onSubmit={handleSaveBrandSettings} className="space-y-4 text-xs font-bold text-[#636E72]">
            <div>
              <label className="block mb-1 text-[#2D3436]">Nome da Loja / Unidade</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-3 text-[#2D3436] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-[#2D3436]">Código da Franquia BALBEC</label>
              <input
                type="text"
                value={franchiseCode}
                onChange={(e) => setFranchiseCode(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-3 text-[#2D3436] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-[#2D3436]">URL da Logomarca da Franquia</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-3 text-[#2D3436] text-sm focus:outline-none"
              />
            </div>

            {/* Logo Preview */}
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] flex items-center space-x-4">
              <img
                src={logoUrl || "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=300&q=80"}
                alt="Logo Preview"
                className="w-16 h-16 rounded-xl object-cover border border-[#F59E0B]/40"
              />
              <div>
                <span className="text-[10px] text-[#D97706] font-mono block">Preview do Logotipo</span>
                <span className="text-sm font-black text-[#2D3436]">{storeName || "BALBEC Salgados"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-[#2D3436]">Telefone WhatsApp</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-3 text-[#2D3436] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-[#2D3436]">Endereço Completo</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-3 text-[#2D3436] text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer p-3 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="w-4 h-4 accent-[#F59E0B] rounded"
                />
                <span className="text-xs text-[#2D3436] font-bold">
                  Ativar Aprovação Automática de Clientes (Sem Fila)
                </span>
              </label>
            </div>

            {saveSettingsSuccess && (
              <div className="p-3 bg-[#E6F9F5] border border-[#00B894]/40 text-[#00B894] rounded-xl">
                Configurações da franquia salvas com sucesso!
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-2xl shadow-sm transition-all"
            >
              {isSavingSettings ? "Salvando..." : "Salvar Logomarca e Parâmetros"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: INTEGRAÇÃO BLUEFOCUS */}
      {activeTab === "BLUEFOCUS" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#E6F9F5] text-[#00B894] border border-[#00B894]/30 rounded-2xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-[#2D3436] text-xl">Integração API BlueFocus</h2>
                  <p className="text-xs text-[#636E72]">Sincronização de catálogo, imagens, preços e estoque disponível</p>
                </div>
              </div>

              <button
                onClick={handleSyncBlueFocus}
                disabled={isSyncingBlueFocus}
                className="px-6 py-3 bg-[#00B894] hover:bg-[#00A383] text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingBlueFocus ? "animate-spin" : ""}`} />
                <span>{isSyncingBlueFocus ? "Sincronizando..." : "Sincronizar Catálogo Agora"}</span>
              </button>
            </div>

            {syncMessage && (
              <div className="p-3 bg-[#E6F9F5] border border-[#00B894]/30 text-[#00B894] rounded-xl text-xs font-bold">
                {syncMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
                <span className="text-[10px] text-[#636E72] uppercase font-bold block">Status da Conexão</span>
                <span className="text-sm font-black text-[#00B894]">API Conectada ✓</span>
              </div>
              <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
                <span className="text-[10px] text-[#636E72] uppercase font-bold block">Total de Produtos</span>
                <span className="text-sm font-black text-[#D97706]">{products.length} itens no catálogo</span>
              </div>
              <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
                <span className="text-[10px] text-[#636E72] uppercase font-bold block">Endpoint Configurado</span>
                <span className="text-xs font-mono text-[#00B894] truncate block">/api/bluefocus/products</span>
              </div>
            </div>
          </div>

          {/* Stock Manager Table */}
          <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-[#2D3436] text-lg">Controle de Estoque BlueFocus</h3>
                <p className="text-xs text-[#636E72]">Ajuste os valores de quantidade disponíveis na franquia</p>
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Produto BlueFocus</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E9ECEF] text-[#D97706] uppercase font-bold">
                    <th className="p-3">Código</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Preço</th>
                    <th className="p-3">Estoque</th>
                    <th className="p-3">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECEF]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F8F9FA]">
                      <td className="p-3 font-mono text-[#636E72]">{p.code}</td>
                      <td className="p-3 font-bold text-[#2D3436] flex items-center space-x-2">
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3 text-[#636E72]">{p.category}</td>
                      <td className="p-3 font-bold text-[#D97706]">R$ {p.price.toFixed(2)}</td>
                      <td className="p-3">
                        {editingStockId === p.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(Number(e.target.value))}
                              className="w-16 bg-[#F8F9FA] border border-[#F59E0B] rounded p-1 text-[#2D3436] font-bold"
                            />
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              className="p-1 bg-[#00B894] text-white font-bold rounded"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <span className={`font-bold ${p.stock <= 5 ? "text-[#D63031]" : "text-[#00B894]"}`}>
                            {p.stock} un
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setEditingStockId(p.id);
                            setEditingStockValue(p.stock);
                          }}
                          className="text-[#D97706] hover:underline font-bold"
                        >
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Customer Notifications Log */}
          <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-6 shadow-sm space-y-4">
            <h3 className="font-black text-[#2D3436] text-lg flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-[#00B894]" />
              <span>Histórico de Notificações WhatsApp Enviadas aos Clientes</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#00B894]">{notif.clientName} ({notif.clientPhone})</span>
                    <p className="text-[#2D3436] mt-0.5">{notif.message}</p>
                  </div>
                  <span className="text-[10px] text-[#B2BEC3] font-mono whitespace-nowrap ml-4">
                    {new Date(notif.sentAt).toLocaleTimeString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: PROPOSTAS COMERCIAIS */}
      {activeTab === "PROPOSTAS" && (
        <ProposalsView />
      )}

      {/* Order Detail Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E9ECEF] rounded-[28px] w-full max-w-md p-6 space-y-6 shadow-xl text-[#2D3436]">
            <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#D97706]">FICHA DE PEDIDO</span>
                <h3 className="text-xl font-black text-[#2D3436]">#{selectedOrderModal.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrderModal(null)} className="text-[#636E72] hover:text-[#2D3436]">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="text-[#636E72] font-bold">Cliente:</span> {selectedOrderModal.clientName}</p>
              <p><span className="text-[#636E72] font-bold">Telefone:</span> {selectedOrderModal.clientPhone}</p>
              <p><span className="text-[#636E72] font-bold">Endereço/Tipo:</span> {selectedOrderModal.deliveryAddress}</p>
              <p><span className="text-[#636E72] font-bold">Pagamento:</span> {selectedOrderModal.paymentMethod}</p>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] space-y-1 text-xs">
              <p className="font-bold text-[#D97706] border-b border-[#E9ECEF] pb-1">Itens Solicitados:</p>
              {selectedOrderModal.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.productName}</span>
                  <span className="font-bold text-[#2D3436]">R$ {it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#E9ECEF] flex justify-between font-black text-[#00B894]">
                <span>Total:</span>
                <span>R$ {selectedOrderModal.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E9ECEF] space-y-2">
              <button
                onClick={() => handleThermalPrint(selectedOrderModal)}
                className="w-full py-3 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] font-black rounded-xl text-xs uppercase tracking-wider border border-[#FDE68A] flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4 text-[#D97706]" />
                <span>Imprimir Cupom Térmico (80mm/58mm)</span>
              </button>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="w-full py-2.5 bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#2D3436] font-bold rounded-xl text-xs border border-[#E9ECEF]"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E9ECEF] rounded-[28px] w-full max-w-md p-6 space-y-4 shadow-xl text-[#2D3436]">
            <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-3">
              <h3 className="font-black text-[#2D3436] text-lg">Novo Produto no Catálogo BlueFocus</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-[#636E72] hover:text-[#2D3436]">✕</button>
            </div>

            <form onSubmit={handleCreateNewProduct} className="space-y-3 text-xs font-bold text-[#636E72]">
              <div>
                <label className="block mb-1 text-[#2D3436]">Nome do Salgado / Produto</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-2.5 text-[#2D3436] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-[#2D3436]">Descrição</label>
                <input
                  type="text"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-2.5 text-[#2D3436] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[#2D3436]">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-2.5 text-[#2D3436] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#2D3436]">Estoque Inicial</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-2.5 text-[#2D3436] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[#2D3436]">Categoria</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as any)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-2.5 text-[#2D3436] focus:outline-none"
                >
                  <option value="salgados_fritos">Salgados Fritos</option>
                  <option value="salgados_assados">Salgados Assados</option>
                  <option value="combos">Combos & Festas</option>
                  <option value="doces">Doces</option>
                  <option value="bebidas">Bebidas</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs shadow-xs mt-2"
              >
                Cadastrar e Importar no BlueFocus
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
