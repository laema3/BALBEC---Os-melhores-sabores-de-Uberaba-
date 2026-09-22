import React, { useState } from "react";
import { CategoryItem, Product } from "../../types";
import { 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../../services/api";
import { 
  Tags, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Package, 
  Heart, 
  Coffee, 
  Star,
  Layers,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface CategoriesManagerProps {
  categories: CategoryItem[];
  products: Product[];
  onRefreshData: () => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categories,
  products,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#F59E0B");
  const [icon, setIcon] = useState("Flame");
  const [active, setActive] = useState(true);

  // Feedback State
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setColor("#F59E0B");
    setIcon("Flame");
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setColor(cat.color || "#F59E0B");
    setIcon(cat.icon || "Flame");
    setActive(cat.active);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "_");
      setSlug(generatedSlug);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showFeedback("error", "Informe o nome da categoria.");
      return;
    }

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "_"),
      description,
      color,
      icon,
      active,
    };

    if (editingCategory) {
      const res = await updateCategory(editingCategory.id, payload);
      if (res) {
        showFeedback("success", `Categoria "${res.name}" atualizada com sucesso!`);
        setIsModalOpen(false);
        onRefreshData();
      } else {
        showFeedback("error", "Erro ao atualizar categoria.");
      }
    } else {
      const res = await createCategory(payload);
      if (res) {
        showFeedback("success", `Categoria "${res.name}" cadastrada com sucesso!`);
        setIsModalOpen(false);
        onRefreshData();
      } else {
        showFeedback("error", "Erro ao criar nova categoria.");
      }
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    const productsInCat = products.filter((p) => p.category === cat.slug);
    if (productsInCat.length > 0) {
      if (
        !confirm(
          `A categoria "${cat.name}" possui ${productsInCat.length} produto(s) vinculado(s). Deseja realmente excluir?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
        return;
      }
    }

    const success = await deleteCategory(cat.id);
    if (success) {
      showFeedback("success", `Categoria "${cat.name}" excluída.`);
      onRefreshData();
    } else {
      showFeedback("error", "Erro ao excluir categoria.");
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    const nextState = !cat.active;
    const res = await updateCategory(cat.id, { active: nextState });
    if (res) {
      showFeedback("success", `Categoria ${nextState ? "ativada" : "desativada"}.`);
      onRefreshData();
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case "Flame":
        return <Flame className="w-5 h-5" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5" />;
      case "Package":
        return <Package className="w-5 h-5" />;
      case "Heart":
        return <Heart className="w-5 h-5" />;
      case "Coffee":
        return <Coffee className="w-5 h-5" />;
      default:
        return <Tags className="w-5 h-5" />;
    }
  };

  const iconOptions = [
    { id: "Flame", label: "Fogo / Fritos", icon: <Flame className="w-4 h-4" /> },
    { id: "Sparkles", label: "Estrela / Gourmet", icon: <Sparkles className="w-4 h-4" /> },
    { id: "Package", label: "Combo / Caixa", icon: <Package className="w-4 h-4" /> },
    { id: "Heart", label: "Coração / Doces", icon: <Heart className="w-4 h-4" /> },
    { id: "Coffee", label: "Bebidas / Café", icon: <Coffee className="w-4 h-4" /> },
    { id: "Tags", label: "Etiqueta Geral", icon: <Tags className="w-4 h-4" /> },
  ];

  const colorPresets = [
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#64748B", // Slate
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <Tags className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-black text-slate-900">Cadastro de Categorias</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Organize as seções do cardápio BALBEC Uberaba (ex: Salgados Fritos, Assados, Combos de Festa, Doces e Bebidas).
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Categoria</span>
        </button>
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

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome da categoria ou código de identificação..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => {
          const count = products.filter((p) => p.category === cat.slug).length;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                cat.active ? "border-slate-200" : "border-slate-200 bg-slate-50/50 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: cat.color || "#F59E0B" }}
                    >
                      {getIconComponent(cat.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                      <span className="font-mono text-[11px] text-slate-400">slug: {cat.slug}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      cat.active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {cat.active ? "Ativa" : "Oculta"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 min-h-[32px]">
                  {cat.description || "Sem descrição detalhada cadastrada."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                  <span>{count} produto{count === 1 ? "" : "s"}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title={cat.active ? "Ocultar Categoria" : "Exibir Categoria"}
                  >
                    {cat.active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                    title="Editar Categoria"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Excluir Categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
                  <Tags className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Salgados Folhados Nobres"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Identificador de Rota (Slug)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="salgados_folhados"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição exibida no topo do cardápio..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ícone Representativo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {iconOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setIcon(opt.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                        icon === opt.id
                          ? "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/30"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span className="truncate">{opt.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cor de Destaque
                </label>
                <div className="flex items-center space-x-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        color === c ? "scale-110 ring-2 ring-offset-2 ring-slate-900" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Categoria visível no cardápio
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
                  {editingCategory ? "Salvar Alterações" : "Criar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
