import React, { useState } from "react";
import { Product, Category, Client } from "../../types";
import { Search, Plus, Minus, Info, Sparkles, Flame, Check, AlertCircle, Lock, UserCheck } from "lucide-react";

interface CatalogViewProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number, observation?: string) => void;
  cartItemQuantities: Record<string, number>;
  onSyncBlueFocus: () => void;
  isSyncing: boolean;
  currentClient: Client | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

const CATEGORIES: { id: Category | "todos"; label: string; icon: string }[] = [
  { id: "todos", label: "Todos os Itens", icon: "🥐" },
  { id: "salgados_fritos", label: "Fritos Quentinhos", icon: "🔥" },
  { id: "salgados_assados", label: "Assados Artesanais", icon: "🥖" },
  { id: "combos", label: "Combos & Festas", icon: "🎉" },
  { id: "doces", label: "Sobremesas & Doces", icon: "🍩" },
  { id: "bebidas", label: "Bebidas Geladas", icon: "🥤" },
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onAddToCart,
  cartItemQuantities,
  onSyncBlueFocus,
  isSyncing,
  currentClient,
  onOpenLogin,
  onOpenRegister,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalObservation, setModalObservation] = useState("");

  const isAuthorized = currentClient && currentClient.status === "APPROVED";

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "todos" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDetail = (p: Product) => {
    if (!isAuthorized) {
      onOpenLogin();
      return;
    }
    setSelectedProduct(p);
    setModalQuantity(1);
    setModalObservation("");
  };

  const handleConfirmAddModal = () => {
    if (!isAuthorized) {
      onOpenLogin();
      return;
    }
    if (selectedProduct) {
      onAddToCart(selectedProduct, modalQuantity, modalObservation);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Banner BALBEC */}
      <div className="relative rounded-[28px] overflow-hidden bg-white border border-[#E9ECEF] p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Franquia de Salgados Artesanais • Uberaba/MG</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2D3436] tracking-tight leading-tight">
            O verdadeiro sabor de <span className="text-[#D97706]">BALBEC</span> na sua mesa.
          </h2>
          <p className="mt-3 text-[#636E72] text-sm sm:text-base font-medium leading-relaxed">
            Coxinhas cremosas, kibes crocantes, empadas gourmets e combos de festa com sincronização em tempo real.
          </p>

          {!isAuthorized && (
            <div className="mt-4 p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#D97706]">
                <Lock className="w-5 h-5 shrink-0" />
                <span>Acesso Restrito: Faça login com CNPJ e senha ou cadastre-se para ver preços e fazer pedidos.</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-xl text-xs shadow-sm transition-all"
                >
                  Fazer Login
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-3 py-2 bg-white hover:bg-[#F8F9FA] text-[#2D3436] border border-[#F59E0B] font-bold rounded-xl text-xs transition-all"
                >
                  Cadastre-se
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-slate-950 text-6xl font-black shrink-0 shadow-md">
          🥐
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#B2BEC3] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar salgado, combo ou bebida..."
              className="w-full bg-white border border-[#E9ECEF] focus:border-[#F59E0B] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none transition-colors shadow-sm"
            />
          </div>

          <button
            onClick={onSyncBlueFocus}
            disabled={isSyncing}
            className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#F8F9FA] text-[#2D3436] border border-[#E9ECEF] rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-sm"
          >
            <span className={isSyncing ? "animate-spin" : ""}>🔄</span>
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar Catálogo BlueFocus"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#F59E0B] text-slate-950 shadow-sm scale-[1.02]"
                  : "bg-white text-[#636E72] hover:bg-[#F8F9FA] border border-[#E9ECEF]"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E9ECEF] p-8 shadow-sm">
          <p className="text-[#D97706] font-bold text-lg">Nenhum produto encontrado.</p>
          <p className="text-[#636E72] text-xs mt-1">Tente mudar o termo de busca ou escolha outra categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const inCartQty = cartItemQuantities[product.id] || 0;
            const remainingStock = Math.max(0, product.stock - inCartQty);
            const isOut = product.stock <= 0 || remainingStock <= 0;

            return (
              <div
                key={product.id}
                className="group bg-white border border-[#E9ECEF] rounded-[24px] p-4 flex flex-col shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-2xl mb-4 overflow-hidden bg-[#F8F9FA] flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                          isOut
                            ? "bg-red-500 text-white"
                            : remainingStock <= 5
                            ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] animate-pulse font-extrabold"
                            : "bg-[#E6F9F5] text-[#00B894] border border-[#00B894]/30 font-extrabold"
                        }`}
                      >
                        {isOut ? "ESGOTADO" : `Disp: ${remainingStock}`}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/90 text-[#2D3436] border border-[#E9ECEF] shadow-xs">
                        {product.code}
                      </span>
                    </div>

                    {inCartQty > 0 && isAuthorized && (
                      <div className="absolute bottom-3 right-3 bg-[#00B894] text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-md">
                        {inCartQty} no carrinho
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 mb-3">
                    <h3 className="font-bold text-base text-[#2D3436] group-hover:text-[#D97706] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#636E72] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#E9ECEF] flex justify-between items-center">
                  {isAuthorized ? (
                    <span className="text-xl font-black text-[#D97706]">
                      R$ {product.price.toFixed(2)}
                    </span>
                  ) : (
                    <button
                      onClick={onOpenLogin}
                      className="text-xs font-bold text-[#D97706] hover:underline flex items-center space-x-1 bg-[#FEF3C7] px-2.5 py-1.5 rounded-xl border border-[#FDE68A]"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Ver Preço (Login)</span>
                    </button>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenDetail(product)}
                      title="Ver Detalhes"
                      className="p-2.5 bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#636E72] rounded-xl text-xs transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (!isAuthorized) {
                          onOpenLogin();
                          return;
                        }
                        onAddToCart(product, 1);
                      }}
                      disabled={isOut}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl transition-all shadow-sm active:scale-95 ${
                        isOut
                          ? "bg-[#DFE6E9] text-[#B2BEC3] cursor-not-allowed"
                          : "bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && isAuthorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E9ECEF] rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl text-[#2D3436]">
            <div className="relative h-48 bg-[#F8F9FA]">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-[#2D3436] rounded-full shadow-md"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-md">
                  {selectedProduct.code}
                </span>
                <h3 className="text-xl font-black text-[#2D3436] mt-1">{selectedProduct.name}</h3>
                <p className="text-sm text-[#636E72] mt-1 leading-relaxed">{selectedProduct.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E9ECEF]">
                <div>
                  <span className="text-xs text-[#636E72] block">Valor Unitário</span>
                  <span className="text-2xl font-black text-[#D97706]">R$ {selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#636E72] block">Estoque</span>
                  <span className="text-sm font-bold text-[#00B894]">{selectedProduct.stock} disponíveis</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">Observações para Cozinha (opcional)</label>
                <input
                  type="text"
                  value={modalObservation}
                  onChange={(e) => setModalObservation(e.target.value)}
                  placeholder="Ex: Bem quentinho, caprichar na embalagem..."
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <div className="flex items-center border border-[#E9ECEF] rounded-xl bg-[#F8F9FA] p-1">
                  <button
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="p-2 hover:bg-white rounded-lg text-[#2D3436]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-black text-sm">{modalQuantity}</span>
                  <button
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    className="p-2 hover:bg-white rounded-lg text-[#2D3436]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleConfirmAddModal}
                  className="flex-1 py-3 bg-[#00B894] hover:bg-[#00A884] text-white font-black rounded-xl text-sm shadow-md flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Adicionar (R$ {(selectedProduct.price * modalQuantity).toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
