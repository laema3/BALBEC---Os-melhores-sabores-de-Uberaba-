import React, { useState } from "react";
import { Product, Category, Order, OrderItem, PaymentType, Client } from "../../types";
import { playTotemClick, playOrderReadyFanfare } from "../../utils/audio";
import { createOrder, getClients } from "../../services/api";
import { 
  Sparkles, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  QrCode, 
  Banknote, 
  CreditCard,
  Flame,
  ArrowRight,
  Building,
  LogIn
} from "lucide-react";

interface TotemKioskViewProps {
  products: Product[];
  onOrderCreated: (order: Order) => void;
  currentClient: Client | null;
  onOpenLogin: () => void;
  onClientLoginSuccess: (client: Client) => void;
  onClearClient: () => void;
}

const CATEGORIES: { id: Category | "todos"; label: string; icon: string }[] = [
  { id: "todos", label: "Cardápio Completo", icon: "🥐" },
  { id: "salgados_fritos", label: "Salgados Fritos", icon: "🔥" },
  { id: "salgados_assados", label: "Assados Especiais", icon: "🥖" },
  { id: "combos", label: "Copos & Combos", icon: "🎉" },
  { id: "doces", label: "Doces & Churros", icon: "🍩" },
  { id: "bebidas", label: "Bebidas Geladas", icon: "🥤" },
];

export const TotemKioskView: React.FC<TotemKioskViewProps> = ({
  products,
  onOrderCreated,
  currentClient,
  onOpenLogin,
  onClientLoginSuccess,
  onClearClient,
}) => {
  const [started, setStarted] = useState(false);
  const [totemCnpjInput, setTotemCnpjInput] = useState("");
  const [cnpjError, setCnpjError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "todos">("todos");
  const [totemCart, setTotemCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>("PIX");
  const [changeFor, setChangeFor] = useState("50");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(
    (p) => selectedCategory === "todos" || p.category === selectedCategory
  );

  const cartTotal = totemCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItemsCount = totemCart.reduce((sum, item) => sum + item.quantity, 0);

  const handleStartSession = async (e?: React.FormEvent, skipCnpj: boolean = false) => {
    if (e) e.preventDefault();
    playTotemClick();
    setCnpjError("");

    if (skipCnpj) {
      onClearClient();
      setTotemCnpjInput("");
      setStarted(true);
      return;
    }

    const cleanCnpj = totemCnpjInput.replace(/\D/g, "");

    if (!cleanCnpj) {
      setCnpjError("Por favor, digite o CNPJ cadastrado ou clique em 'Continuar como Balcão Avulso'.");
      return;
    }

    const clientsList = await getClients();
    const found = clientsList.find(
      (c) => c.cnpj?.replace(/\D/g, "") === cleanCnpj
    );

    if (!found) {
      setCnpjError("CNPJ não encontrado no sistema. Para acessar no Totem com CNPJ, o cadastro já deve ter sido realizado e aprovado.");
      return;
    }

    if (found.status === "PENDING") {
      setCnpjError(`O CNPJ de "${found.name}" está cadastrado, porém ainda está PENDENTE de aprovação pela administração.`);
      return;
    }

    if (found.status === "REJECTED") {
      setCnpjError(`O cadastro do CNPJ de "${found.name}" não foi aprovado pela administração.`);
      return;
    }

    if (found.status === "APPROVED") {
      onClientLoginSuccess(found);
      setStarted(true);
    }
  };

  const handleAddToCart = (product: Product) => {
    playTotemClick();
    setTotemCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    playTotemClick();
    setTotemCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const handleFinishTotemOrder = async () => {
    playTotemClick();
    if (totemCart.length === 0) return;

    setIsSubmitting(true);

    const items: OrderItem[] = totemCart.map((ci) => ({
      productId: ci.product.id,
      productName: ci.product.name,
      quantity: ci.quantity,
      unitPrice: ci.product.price,
      totalPrice: ci.product.price * ci.quantity,
    }));

    const response = await createOrder({
      type: "TOTEM",
      clientName: currentClient?.name || "Cliente Balcão Loja",
      clientPhone: currentClient?.phone || "(11) 90000-TOTEM",
      deliveryAddress: currentClient
        ? `Retirada no Balcão (CNPJ: ${currentClient.cnpj || "-"} - ${currentClient.name})`
        : "Retirada no Balcão Presencial",
      items,
      paymentMethod,
      changeForAmount: paymentMethod === "DINHEIRO" && changeFor ? Number(changeFor) : undefined,
    });

    setIsSubmitting(false);

    if (response.success && response.order) {
      setCreatedOrder(response.order);
      onOrderCreated(response.order);
      playOrderReadyFanfare();
      setTotemCart([]);
      setIsCheckoutModalOpen(false);
    }
  };

  const handleResetTotem = () => {
    playTotemClick();
    setCreatedOrder(null);
    setStarted(false);
    setTotemCart([]);
    setTotemCnpjInput("");
    setCnpjError("");
    onClearClient();
  };

  // Touch Welcome Overlay Screen for Totem
  if (!started) {
    return (
      <div
        className="min-h-[85vh] rounded-[32px] bg-[#F8F9FA] border-2 border-[#E9ECEF] p-8 flex flex-col items-center justify-between text-center select-none relative overflow-hidden shadow-xl"
      >
        <div className="absolute inset-0 bg-[#F59E0B]/5 backdrop-blur-xs"></div>

        {/* Top Branding Header */}
        <div className="relative z-10 pt-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white p-1 shadow-md border border-[#E9ECEF] mb-3 animate-bounce">
            <img
              src="https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=300&q=80"
              alt="BALBEC"
              className="w-full h-full object-cover rounded-[20px]"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#F59E0B] tracking-wider drop-shadow-xs">
            BALBEC
          </h1>
          <p className="text-[#2D3436] font-bold uppercase tracking-widest text-xs mt-1">
            Autoatendimento Presencial (Totem)
          </p>
        </div>

        {/* CNPJ Quick Login / Identification Box for In-Store Printing */}
        <div className="relative z-10 w-full max-w-md bg-white border-2 border-[#F59E0B]/50 p-6 rounded-3xl shadow-lg my-6">
          <div className="flex items-center space-x-2 mb-3 text-left">
            <Building className="w-5 h-5 text-[#D97706]" />
            <div>
              <p className="font-black text-sm text-[#2D3436]">Acesso com CNPJ Aprovado</p>
              <p className="text-[11px] text-[#636E72]">Digite seu CNPJ cadastrado para identificação no cupom e pedido</p>
            </div>
          </div>

          <form onSubmit={(e) => handleStartSession(e, false)} className="space-y-3">
            <input
              type="text"
              value={totemCnpjInput}
              onChange={(e) => {
                setTotemCnpjInput(e.target.value);
                if (cnpjError) setCnpjError("");
              }}
              placeholder="Ex: 12.345.678/0001-99"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-2xl px-4 py-3 text-sm text-[#2D3436] font-mono text-center font-bold focus:outline-none"
            />
            {cnpjError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold text-left animate-shake">
                {cnpjError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-2xl shadow-md text-sm uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>ACESSAR COM CNPJ APROVADO</span>
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#E9ECEF] flex flex-col items-center">
            <button
              type="button"
              onClick={() => handleStartSession(undefined, true)}
              className="text-xs font-bold text-[#636E72] hover:text-[#2D3436] underline py-1"
            >
              Continuar como Balcão Avulso (Sem CNPJ)
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pb-2 text-[#636E72] text-xs font-semibold flex items-center space-x-2">
          <Flame className="w-4 h-4 text-[#D97706]" />
          <span>Salgados fritos e assados na hora • Emissão automática de ficha e cupom térmico</span>
        </div>
      </div>
    );
  }

  // Receipt printed view after order
  if (createdOrder) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-[#2D3436] animate-fade-in">
        <div className="bg-white border-2 border-[#00B894] rounded-[32px] p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E6F9F5] border-2 border-[#00B894] text-[#00B894] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] px-3 py-1 bg-[#FEF3C7] rounded-full border border-[#FDE68A]">
              SENHA DE RETIRADA NO BALCÃO
            </span>
            <div className="text-6xl font-black text-[#2D3436] tracking-wider my-3">
              #{createdOrder.orderNumber}
            </div>
            <p className="text-xs text-[#636E72]">
              Acompanhe seu número no <span className="font-bold text-[#D97706]">Monitor de Chamada</span> na parede da loja!
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] text-left text-xs space-y-2">
            <p className="font-bold text-[#2D3436] border-b border-[#E9ECEF] pb-2 flex items-center justify-between">
              <span>Itens do Pedido (Totem):</span>
              <Printer className="w-4 h-4 text-[#636E72]" />
            </p>
            {createdOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[#636E72]">
                <span>{it.quantity}x {it.productName}</span>
                <span className="font-bold text-[#2D3436]">R$ {it.totalPrice.toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-[#E9ECEF] flex justify-between font-black text-[#2D3436] text-sm">
              <span>Total Pago:</span>
              <span className="text-[#D97706]">R$ {createdOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleResetTotem}
            className="w-full py-4 bg-[#00B894] hover:bg-[#00A884] text-white font-black rounded-2xl shadow-md text-sm uppercase tracking-wider transition-all"
          >
            Concluir e Voltar ao Início Totem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      
      {/* Top Kiosk Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-[#E9ECEF] p-4 rounded-2xl shadow-xs gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] font-black text-[#D97706] flex items-center justify-center text-xl">
            🥐
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-black text-[#2D3436] text-lg">TOTEM AUTOATENDIMENTO BALBEC</h2>
              {currentClient && currentClient.status === "APPROVED" ? (
                <span className="px-2.5 py-0.5 bg-[#E6F9F5] text-[#00B894] border border-[#00B894]/30 rounded-lg text-xs font-black">
                  CNPJ Aprovado: {currentClient.name} ({currentClient.cnpj})
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-[#F8F9FA] text-[#636E72] border border-[#E9ECEF] rounded-lg text-xs font-bold">
                  Balcão Avulso
                </span>
              )}
            </div>
            <p className="text-xs text-[#D97706] font-bold">Toque nos itens para adicionar ao pedido presencial</p>
          </div>
        </div>

        <button
          onClick={handleResetTotem}
          className="px-4 py-2 bg-[#F8F9FA] text-[#636E72] hover:text-[#2D3436] border border-[#E9ECEF] rounded-xl text-xs font-bold transition-colors"
        >
          Cancelar / Sair
        </button>
      </div>

      {/* Large Touch Category Bar */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playTotemClick();
              setSelectedCategory(cat.id);
            }}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-sm font-black whitespace-nowrap transition-all shadow-xs active:scale-95 ${
              selectedCategory === cat.id
                ? "bg-[#F59E0B] text-slate-950 scale-105 border-2 border-[#F59E0B] shadow-md"
                : "bg-white text-[#636E72] hover:bg-[#F8F9FA] border border-[#E9ECEF]"
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Kiosk Grid with Giant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const inCartItem = totemCart.find((ci) => ci.product.id === product.id);
          const inCartQty = inCartItem?.quantity || 0;
          const isOut = product.stock <= 0;

          return (
            <div
              key={product.id}
              onClick={() => !isOut && handleAddToCart(product)}
              className={`bg-white border-2 rounded-[24px] p-5 shadow-sm transition-all duration-200 select-none flex flex-col justify-between cursor-pointer active:scale-95 ${
                inCartQty > 0
                  ? "border-[#F59E0B] shadow-md"
                  : "border-[#E9ECEF] hover:border-[#B2BEC3]"
              }`}
            >
              <div className="space-y-3">
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-[#F8F9FA]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {inCartQty > 0 && (
                    <div className="absolute top-3 right-3 bg-[#F59E0B] text-slate-950 font-black text-sm px-3 py-1 rounded-full shadow-md border border-slate-900 animate-bounce">
                      {inCartQty}x no pedido
                    </div>
                  )}
                  {isOut && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-red-500 font-black text-sm uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-red-200">
                        Esgotado
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-black text-[#2D3436] text-lg leading-tight">{product.name}</h3>
                  <p className="text-xs text-[#636E72] mt-1 line-clamp-2">{product.description}</p>
                </div>
              </div>

              {/* Price & Add Touch Button */}
              <div className="pt-4 border-t border-[#E9ECEF] flex items-center justify-between mt-3">
                <span className="text-2xl font-black text-[#D97706]">
                  R$ {product.price.toFixed(2)}
                </span>

                <div className="flex items-center space-x-2">
                  {inCartQty > 0 ? (
                    <div className="flex items-center space-x-1 bg-[#F8F9FA] p-1 rounded-2xl border border-[#E9ECEF]" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleUpdateQuantity(product.id, -1)}
                        className="p-2 bg-white text-[#2D3436] rounded-xl border border-[#E9ECEF]"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="px-3 font-black text-[#D97706]">{inCartQty}</span>
                      <button
                        onClick={() => handleUpdateQuantity(product.id, 1)}
                        disabled={inCartQty >= product.stock}
                        className="p-2 bg-[#F59E0B] text-slate-950 font-black rounded-xl disabled:opacity-30"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={isOut}
                      className="px-5 py-3 bg-[#00B894] hover:bg-[#00A884] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center space-x-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Kiosk Sticky Bottom Cart Bar */}
      {totemCart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-5xl mx-auto bg-white border-2 border-[#F59E0B] rounded-[24px] p-4 shadow-2xl backdrop-blur-md flex items-center justify-between text-[#2D3436] animate-slide-up">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#F59E0B] text-slate-950 rounded-2xl font-black text-lg">
              {totalItemsCount}
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-[#636E72]">Total do Pedido Totem</p>
              <p className="text-2xl font-black text-[#D97706]">R$ {cartTotal.toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={() => {
              playTotemClick();
              if (!currentClient || currentClient.status !== "APPROVED") {
                onOpenLogin();
              } else {
                setIsCheckoutModalOpen(true);
              }
            }}
            className="px-8 py-4 bg-[#00B894] hover:bg-[#00A884] text-white font-black rounded-2xl shadow-md text-sm uppercase tracking-wider flex items-center space-x-2 active:scale-95 transition-all"
          >
            <span>FINALIZAR PEDIDO PRESENCIAL</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Totem In-Store Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E9ECEF] rounded-[32px] w-full max-w-lg p-6 space-y-6 shadow-2xl text-[#2D3436]">
            <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-4">
              <h3 className="text-xl font-black text-[#2D3436]">Escolha a Forma de Pagamento no Totem</h3>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-2 text-[#636E72] hover:text-[#2D3436]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("PIX")}
                className={`w-full p-4 rounded-2xl border-2 font-black text-left flex items-center justify-between transition-all ${
                  paymentMethod === "PIX"
                    ? "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]"
                    : "bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="w-6 h-6 text-[#00B894]" />
                  <div>
                    <p className="text-sm font-bold text-[#2D3436]">Pix (Pague na Tela do Totem)</p>
                    <p className="text-xs text-[#636E72] font-normal">Aprovação imediata do pedido</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("DINHEIRO")}
                className={`w-full p-4 rounded-2xl border-2 font-black text-left flex items-center justify-between transition-all ${
                  paymentMethod === "DINHEIRO"
                    ? "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]"
                    : "bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Banknote className="w-6 h-6 text-[#D97706]" />
                  <div>
                    <p className="text-sm font-bold text-[#2D3436]">Dinheiro no Balcão</p>
                    <p className="text-xs text-[#636E72] font-normal">Pague ao operador na retirada</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("CARTAO_CREDITO")}
                className={`w-full p-4 rounded-2xl border-2 font-black text-left flex items-center justify-between transition-all ${
                  paymentMethod === "CARTAO_CREDITO"
                    ? "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]"
                    : "bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-[#2D3436]">Cartão de Crédito / Débito</p>
                    <p className="text-xs text-[#636E72] font-normal">Maquininha no Totem / Balcão</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-4 border-t border-[#E9ECEF] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#636E72] block font-bold">Total a Pagar</span>
                <span className="text-2xl font-black text-[#D97706]">R$ {cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleFinishTotemOrder}
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-[#00B894] hover:bg-[#00A884] text-white font-black rounded-2xl shadow-md text-xs uppercase tracking-wider transition-all"
              >
                {isSubmitting ? "Gerando Ficha..." : "CONFIRMAR E GERAR FICHA"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
