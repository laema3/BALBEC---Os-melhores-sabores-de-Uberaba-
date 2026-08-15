import React, { useState } from "react";
import { Product, OrderItem, Client, PaymentType, Order, StoreSettings } from "../../types";
import { createOrder } from "../../services/api";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  QrCode, 
  Banknote, 
  CreditCard, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  Truck,
  Store
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { product: Product; quantity: number; observation?: string }[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  currentClient: Client | null;
  onOpenClientRegister: () => void;
  settings: StoreSettings | null;
  onOrderCreated: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentClient,
  onOpenClientRegister,
  settings,
  onOrderCreated,
}) => {
  const [step, setStep] = useState<"CART" | "CHECKOUT" | "SUCCESS">("CART");
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>("PIX");
  const [changeForAmount, setChangeForAmount] = useState<string>("50");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Pix state
  const [copiedPix, setCopiedPix] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryType === "DELIVERY" ? 5.0 : 0.0;
  const total = subtotal + deliveryFee;

  const handleCopyPix = () => {
    if (createdOrder?.pixQrCodeUrl) {
      navigator.clipboard.writeText(createdOrder.pixQrCodeUrl);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const handleProceedToCheckout = () => {
    if (!currentClient && !guestName) {
      // Auto open register or fill guest
    }
    setStep("CHECKOUT");
  };

  const handleConfirmOrder = async () => {
    setErrorMsg("");
    const clientName = currentClient ? currentClient.name : guestName.trim() || "Cliente BALBEC";
    const clientPhone = currentClient ? currentClient.phone : guestPhone.trim() || "(11) 99999-9999";

    if (!clientName || !clientPhone) {
      setErrorMsg("Por favor, preencha o nome e telefone de contato.");
      return;
    }

    const orderItems: OrderItem[] = cartItems.map((ci) => ({
      productId: ci.product.id,
      productName: ci.product.name,
      quantity: ci.quantity,
      unitPrice: ci.product.price,
      totalPrice: ci.product.price * ci.quantity,
      observation: ci.observation,
    }));

    setIsSubmitting(true);

    const deliveryAddr =
      deliveryType === "DELIVERY"
        ? currentClient
          ? `${currentClient.address.street}, ${currentClient.address.number} - ${currentClient.address.neighborhood}, ${currentClient.address.city}`
          : "Endereço informado via WhatsApp"
        : "Retirada Presencial na Loja BALBEC";

    const response = await createOrder({
      type: deliveryType === "DELIVERY" ? "DELIVERY" : "TOTEM",
      clientName,
      clientPhone,
      deliveryAddress: deliveryAddr,
      items: orderItems,
      paymentMethod,
      changeForAmount: paymentMethod === "DINHEIRO" && changeForAmount ? Number(changeForAmount) : undefined,
    });

    setIsSubmitting(false);

    if (response.success && response.order) {
      setCreatedOrder(response.order);
      onOrderCreated(response.order);
      onClearCart();
      setStep("SUCCESS");
    } else {
      setErrorMsg(response.error || "Falha ao processar pedido. Verifique o estoque.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E9ECEF] text-[#2D3436] shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 bg-[#F8F9FA] border-b border-[#E9ECEF] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#FEF3C7] text-[#D97706] rounded-2xl border border-[#FDE68A]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2D3436]">Meu Carrinho</h2>
                <p className="text-xs text-[#D97706] font-bold">BALBEC Salgados</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#636E72] hover:text-[#2D3436] hover:bg-[#E9ECEF] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content Body */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            
            {step === "CART" && (
              <>
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-4xl">
                      🥐
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#D97706]">Seu carrinho está vazio</h3>
                      <p className="text-xs text-[#636E72] mt-1 max-w-xs mx-auto">
                        Escolha coxinhas, kibes, empadas ou bebidas deliciosas do nosso catálogo!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((ci) => (
                      <div
                        key={ci.product.id}
                        className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] flex items-center space-x-3 hover:border-[#B2BEC3] transition-all"
                      >
                        <img
                          src={ci.product.image}
                          alt={ci.product.name}
                          className="w-16 h-16 object-cover rounded-xl border border-[#E9ECEF] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-[#2D3436] truncate">{ci.product.name}</h4>
                          <p className="text-xs font-black text-[#D97706] mt-0.5">
                            R$ {(ci.product.price * ci.quantity).toFixed(2)}
                          </p>
                          {ci.observation && (
                            <p className="text-[10px] text-[#636E72] italic mt-0.5 truncate">
                              Obs: {ci.observation}
                            </p>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center space-x-1 bg-white border border-[#E9ECEF] rounded-xl p-1">
                          <button
                            onClick={() => onUpdateQuantity(ci.product.id, ci.quantity - 1)}
                            className="p-1 text-[#636E72] hover:text-[#2D3436]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#2D3436]">{ci.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(ci.product.id, ci.quantity + 1)}
                            disabled={ci.quantity >= ci.product.stock}
                            className="p-1 text-[#636E72] hover:text-[#2D3436] disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(ci.product.id)}
                          className="p-1.5 text-[#B2BEC3] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === "CHECKOUT" && (
              <div className="space-y-6">
                
                {/* Delivery Type Option */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Forma de Recebimento</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDeliveryType("DELIVERY")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center space-x-2 transition-all ${
                        deliveryType === "DELIVERY"
                          ? "bg-[#F59E0B] text-slate-950 border-[#F59E0B] shadow-sm font-black"
                          : "bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]"
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Delivery (Entrega)</span>
                    </button>
                    <button
                      onClick={() => setDeliveryType("PICKUP")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center space-x-2 transition-all ${
                        deliveryType === "PICKUP"
                          ? "bg-[#F59E0B] text-slate-950 border-[#F59E0B] shadow-sm font-black"
                          : "bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]"
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Retirada no Balcão</span>
                    </button>
                  </div>
                </div>

                {/* Client Identification Box */}
                <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#D97706] flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>Dados do Cliente</span>
                    </span>
                    {currentClient && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F5] text-[#00B894] border border-[#00B894]/30">
                        {currentClient.status}
                      </span>
                    )}
                  </div>

                  {currentClient ? (
                    <div className="text-xs space-y-1 text-[#636E72]">
                      <p className="font-bold text-[#2D3436]">{currentClient.name}</p>
                      <p>{currentClient.phone}</p>
                      <p className="text-[11px]">
                        {currentClient.address.street}, {currentClient.address.number} - {currentClient.address.neighborhood}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Seu Nome Completo"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-white border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-2.5 text-xs text-[#2D3436] focus:outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="Seu WhatsApp (11) 98765-4321"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full bg-white border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl p-2.5 text-xs text-[#2D3436] focus:outline-none"
                      />
                      <button
                        onClick={onOpenClientRegister}
                        className="text-[11px] font-bold text-[#D97706] hover:underline"
                      >
                        + Cadastrar conta completa com endereço
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Condição de Pagamento</label>
                  <div className="space-y-2">
                    
                    {/* Pix option */}
                    <button
                      onClick={() => setPaymentMethod("PIX")}
                      className={`w-full p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                        paymentMethod === "PIX"
                          ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] shadow-sm font-black"
                          : "bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <QrCode className="w-5 h-5 text-[#00B894]" />
                        <div className="text-left">
                          <p className="font-black text-[#2D3436]">Pix (Instantâneo)</p>
                          <p className="text-[10px] text-[#636E72]">QR Code gerado na confirmação</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E6F9F5] text-[#00B894] border border-[#00B894]/30">
                        Recomendado
                      </span>
                    </button>

                    {/* Dinheiro option */}
                    <button
                      onClick={() => setPaymentMethod("DINHEIRO")}
                      className={`w-full p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                        paymentMethod === "DINHEIRO"
                          ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] shadow-sm font-black"
                          : "bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Banknote className="w-5 h-5 text-[#D97706]" />
                        <div className="text-left">
                          <p className="font-black text-[#2D3436]">Dinheiro</p>
                          <p className="text-[10px] text-[#636E72]">Troco informado para o entregador</p>
                        </div>
                      </div>
                    </button>

                    {paymentMethod === "DINHEIRO" && (
                      <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] space-y-2">
                        <label className="text-[11px] font-bold text-[#D97706]">Precisa de troco para quanto?</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#636E72]">R$</span>
                          <input
                            type="number"
                            value={changeForAmount}
                            onChange={(e) => setChangeForAmount(e.target.value)}
                            className="bg-white border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl px-3 py-1.5 text-xs text-[#2D3436] w-32 font-bold"
                          />
                          {Number(changeForAmount) > total && (
                            <span className="text-[10px] text-[#00B894] font-bold">
                              Troco: R$ {(Number(changeForAmount) - total).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cartao options */}
                    <button
                      onClick={() => setPaymentMethod("CARTAO_CREDITO")}
                      className={`w-full p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                        paymentMethod === "CARTAO_CREDITO"
                          ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] shadow-sm font-black"
                          : "bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                        <div className="text-left">
                          <p className="font-black text-[#2D3436]">Cartão de Crédito / Débito</p>
                          <p className="text-[10px] text-[#636E72]">Maquininha presencial</p>
                        </div>
                      </div>
                    </button>

                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

              </div>
            )}

            {step === "SUCCESS" && createdOrder && (
              <div className="text-center py-6 space-y-6 animate-fade-in">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#E6F9F5] border-2 border-[#00B894] text-[#00B894] flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] rounded-full">
                    Pedido #{createdOrder.orderNumber}
                  </span>
                  <h3 className="text-2xl font-black text-[#2D3436] mt-2">Pedido Registrado na BALBEC!</h3>
                  <p className="text-xs text-[#636E72] mt-1">
                    Seu pedido foi recebido e entrou na esteira da nossa cozinha com o status{" "}
                    <span className="font-bold text-[#D97706]">[{createdOrder.status}]</span>.
                  </p>
                </div>

                {/* Pix QR Code Display if PIX */}
                {createdOrder.paymentMethod === "PIX" && (
                  <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-3">
                    <p className="text-xs font-bold text-[#00B894] flex items-center justify-center space-x-1">
                      <QrCode className="w-4 h-4" />
                      <span>Chave Pix Copia e Cola</span>
                    </p>

                    <div className="bg-white p-3 rounded-xl w-40 h-40 mx-auto flex items-center justify-center border border-[#E9ECEF] shadow-sm">
                      <div className="text-center text-[#2D3436]">
                        <QrCode className="w-28 h-28 mx-auto text-[#2D3436]" />
                        <span className="text-[9px] font-mono font-bold block mt-1">
                          BALBEC PIX #{createdOrder.orderNumber}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyPix}
                      className="w-full py-2 bg-white hover:bg-[#F8F9FA] text-xs font-bold text-[#2D3436] border border-[#E9ECEF] rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                    >
                      {copiedPix ? <Check className="w-4 h-4 text-[#00B894]" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPix ? "Chave Pix Copiada!" : "Copiar Código Pix"}</span>
                    </button>
                  </div>
                )}

                {/* Order Summary & Status Timeline */}
                <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] text-left space-y-2 text-xs">
                  <div className="flex justify-between text-[#636E72]">
                    <span>Cliente:</span>
                    <span className="font-bold text-[#2D3436]">{createdOrder.clientName}</span>
                  </div>
                  <div className="flex justify-between text-[#636E72]">
                    <span>Total do Pedido:</span>
                    <span className="font-black text-[#D97706]">R$ {createdOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#636E72]">
                    <span>Notificação WhatsApp:</span>
                    <span className="text-[#00B894] font-bold">Enviada com sucesso ✓</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStep("CART");
                    onClose();
                  }}
                  className="w-full py-3 bg-[#00B894] text-white font-black rounded-2xl shadow-md text-xs uppercase tracking-wider"
                >
                  Acompanhar no Painel / Fechar
                </button>
              </div>
            )}

          </div>

          {/* Drawer Footer Price & Next Button */}
          {step !== "SUCCESS" && cartItems.length > 0 && (
            <div className="p-6 bg-[#F8F9FA] border-t border-[#E9ECEF] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#636E72]">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#2D3436]">R$ {subtotal.toFixed(2)}</span>
                </div>
                {deliveryType === "DELIVERY" && (
                  <div className="flex justify-between text-[#636E72]">
                    <span>Taxa de Entrega:</span>
                    <span className="font-bold text-[#00B894]">R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-[#E9ECEF]">
                  <span className="font-bold text-[#2D3436]">Total Geral:</span>
                  <span className="font-black text-[#D97706] text-lg">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {step === "CART" ? (
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 bg-[#00B894] hover:bg-[#00A884] text-white font-black rounded-2xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <span>Avançar para Pagamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setStep("CART")}
                    className="px-4 py-3 bg-white border border-[#E9ECEF] text-[#636E72] hover:text-[#2D3436] font-bold rounded-2xl text-xs"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-[#00B894] hover:bg-[#00A884] text-white font-black rounded-2xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSubmitting ? "Finalizando Venda..." : "Concluir Pedido BALBEC"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
