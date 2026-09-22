import React, { useState } from "react";
import { Product, CategoryItem } from "../../types";
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateProductStock, 
  updateProductAvailability,
  syncBlueFocusProducts 
} from "../../services/api";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Tag, 
  Eye, 
  EyeOff,
  Sparkles,
  DollarSign
} from "lucide-react";

interface ProductsManagerProps {
  products: Product[];
  categories: CategoryItem[];
  onRefreshData: () => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  categories,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("ALL");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("30");
  const [category, setCategory] = useState("salgados_fritos");
  const [image, setImage] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Stock quick edit
  const [quickStockId, setQuickStockId] = useState<string | null>(null);
  const [quickStockValue, setQuickStockValue] = useState<number>(0);

  // Feedback State
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setCode(`BF-${Math.floor(100 + Math.random() * 900)}`);
    setDescription("");
    setPrice("");
    setStock("30");
    setCategory(categories[0]?.slug || "salgados_fritos");
    setImage("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80");
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCode(prod.code);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setStock(prod.stock.toString());
    setCategory(prod.category);
    setImage(prod.image);
    setIsAvailable(prod.isAvailable);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      showFeedback("error", "Preencha o Nome e o Preço do produto.");
      return;
    }

    const payload = {
      name,
      code: code || `BF-${Math.floor(100 + Math.random() * 900)}`,
      description,
      price: parseFloat(price.replace(",", ".")),
      stock: parseInt(stock, 10) || 0,
      category,
      image: image || "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
      isAvailable,
    };

    if (editingProduct) {
      const res = await updateProduct(editingProduct.id, payload);
      if (res) {
        showFeedback("success", `Produto "${res.name}" atualizado com sucesso!`);
        setIsModalOpen(false);
        onRefreshData();
      } else {
        showFeedback("error", "Erro ao salvar alterações no produto.");
      }
    } else {
      const res = await createProduct(payload);
      if (res) {
        showFeedback("success", `Produto "${res.name}" cadastrado com sucesso!`);
        setIsModalOpen(false);
        onRefreshData();
      } else {
        showFeedback("error", "Erro ao criar novo produto.");
      }
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${prod.name}"?`)) {
      const success = await deleteProduct(prod.id);
      if (success) {
        showFeedback("success", `Produto "${prod.name}" removido.`);
        onRefreshData();
      } else {
        showFeedback("error", "Erro ao excluir produto.");
      }
    }
  };

  const handleToggleAvailability = async (prod: Product) => {
    const nextState = !prod.isAvailable;
    const success = await updateProductAvailability(prod.id, nextState);
    if (success) {
      showFeedback("success", `Produto ${nextState ? "ativado" : "pausado"} no cardápio.`);
      onRefreshData();
    }
  };

  const handleSaveQuickStock = async (prodId: string) => {
    const success = await updateProductStock(prodId, quickStockValue);
    if (success) {
      setQuickStockId(null);
      onRefreshData();
    }
  };

  const handleSyncBlueFocus = async () => {
    setIsSyncing(true);
    const res = await syncBlueFocusProducts();
    setIsSyncing(false);
    if (res.success) {
      showFeedback("success", `Sincronização concluída! ${res.productsCount} produtos integrados com BlueFocus.`);
      onRefreshData();
    } else {
      showFeedback("error", "Falha ao sincronizar com BlueFocus.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchAvailability =
      availabilityFilter === "ALL" ||
      (availabilityFilter === "ACTIVE" && p.isAvailable) ||
      (availabilityFilter === "INACTIVE" && !p.isAvailable);

    return matchSearch && matchCategory && matchAvailability;
  });

  const getCategoryName = (slug: string) => {
    const found = categories.find((c) => c.slug === slug);
    if (found) return found.name;
    const map: Record<string, string> = {
      salgados_fritos: "Salgados Fritos",
      salgados_assados: "Salgados Assados",
      combos: "Combos & Centos",
      doces: "Doces & Sobremesas",
      bebidas: "Bebidas & Sucos",
    };
    return map[slug] || slug;
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Primary Action */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Package className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-black text-slate-900">Cadastro de Produtos</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o cardápio da BALBEC Uberaba, preços, controle de estoque e integração de código BlueFocus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncBlueFocus}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-amber-600" : ""}`} />
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar BlueFocus"}</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do salgado, código BlueFocus ou ingredientes..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Todas as Categorias ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div className="w-full md:w-auto">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Disponíveis no Cardápio</option>
            <option value="INACTIVE">Pausados / Indisponíveis</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Produto</th>
                <th className="py-3.5 px-4">Código BlueFocus</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Preço (R$)</th>
                <th className="py-3.5 px-4">Estoque</th>
                <th className="py-3.5 px-4">Status Cardápio</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum produto encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isEditingStock = quickStockId === prod.id;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">{prod.name}</p>
                            <p className="text-xs text-slate-500 truncate max-w-xs">{prod.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md font-semibold">
                          {prod.code}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-xs font-semibold">
                          {getCategoryName(prod.category)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        R$ {prod.price.toFixed(2).replace(".", ",")}
                      </td>

                      {/* Stock inline edit */}
                      <td className="py-3 px-4">
                        {isEditingStock ? (
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="number"
                              min="0"
                              value={quickStockValue}
                              onChange={(e) => setQuickStockValue(parseInt(e.target.value, 10) || 0)}
                              className="w-16 px-2 py-1 bg-white border border-amber-400 rounded-lg text-sm font-bold text-center"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveQuickStock(prod.id)}
                              className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                              title="Salvar Estoque"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setQuickStockId(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setQuickStockId(prod.id);
                              setQuickStockValue(prod.stock);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 hover:ring-2 hover:ring-amber-400 transition-all cursor-pointer ${
                              prod.stock <= 5
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : prod.stock <= 15
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                            title="Clique para editar estoque rapidamente"
                          >
                            <span>{prod.stock} un</span>
                            <Edit3 className="w-3 h-3 opacity-60 ml-1" />
                          </button>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailability(prod)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                            prod.isAvailable
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }`}
                        >
                          {prod.isAvailable ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                          <span>{prod.isAvailable ? "Ativo no Cardápio" : "Pausado"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            title="Editar Produto Completo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Exibindo <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> produtos
          </span>
          <span>Sincronizado automaticamente com a retaguarda BALBEC</span>
        </div>
      </div>

      {/* Modal: Create / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {editingProduct ? "Editar Produto" : "Novo Produto no Cardápio"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Coxinha de Frango com Catupiry"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Código BlueFocus
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="BF-101"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição & Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Massa dourada artesanal com recheio cremoso..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preço Unitário (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="8.50"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL da Imagem / Foto
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                />
                {image && (
                  <div className="mt-2 flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={image} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-xs text-slate-500">Preview da foto do produto</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Disponível no cardápio online e totem
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                >
                  {editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
