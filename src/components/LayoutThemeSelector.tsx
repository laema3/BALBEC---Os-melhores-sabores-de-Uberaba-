import React, { useState } from "react";
import { LayoutThemeId, LayoutThemeOption } from "../types";
import { Palette, Check, Sparkles, X, Eye, Layers, Compass, Zap, ShieldCheck } from "lucide-react";

export const LAYOUT_THEMES: LayoutThemeOption[] = [
  {
    id: "balbec-classic",
    name: "1. Balbec Classic (Âmbar Dourado & Clean)",
    subtitle: "Padrão Franquia Artesanal Equilibrada",
    tag: "Original / Recomendado",
    description: "Design moderno com acabamento clean, bordas suaves, destaques em amarelo âmbar e alta legibilidade para franquias de salgados artesanais.",
    primaryColor: "#F59E0B",
    secondaryColor: "#00B894",
    bgColor: "#F8F9FA",
    cardBg: "#FFFFFF",
    textColor: "#2D3436",
    fontVibe: "Sans moderna com pesos bem calibrados",
    recommendedFor: "Franquias com atendimento misto (Delivery + Totem + Balcão)",
  },
  {
    id: "dark-industrial",
    name: "2. Gourmet Dark Industrial (Grafite & Chamas)",
    subtitle: "Estilo Steakhouse / Dark Kitchen Premium",
    tag: "Visual Noturno de Alto Padrão",
    description: "Fundo em carbono grafite escuro com luzes de neon âmbar e cobre. Transmite sofisticação, focado em hamburguerias, rotisserias e dark kitchens.",
    primaryColor: "#F59E0B",
    secondaryColor: "#E11D48",
    bgColor: "#090A0F",
    cardBg: "#13151B",
    textColor: "#F8FAFC",
    fontVibe: "Contraste cinematográfico e bordas precisas",
    recommendedFor: "Lojas noturnas, buffets gourmet e totens em ambientes modernos",
  },
  {
    id: "b2b-atacado",
    name: "3. B2B Atacado & Grid Denso (Azul Corporativo & Volume)",
    subtitle: "Foco em Revenda, Centos e Grandes Pedidos",
    tag: "Máxima Eficiência de Compra",
    description: "Interface em azul corporativo e alta densidade de informação. Projetado para clientes com CNPJ que compram centos de salgados com rapidez e tabelas claras.",
    primaryColor: "#0284C7",
    secondaryColor: "#10B981",
    bgColor: "#F1F5F9",
    cardBg: "#FFFFFF",
    textColor: "#0F172A",
    fontVibe: "Tipografia tabular, botões compactos e grades de produto",
    recommendedFor: "Distribuidoras, fábricas de salgados e venda exclusiva por atacado B2B",
  },
  {
    id: "artisan-bistro",
    name: "4. Artisan Bistro & Boulangerie (Terracota & Linho)",
    subtitle: "Ateliê de Salgados e Forno a Lenha",
    tag: "Sensação Orgânica e Acolhedora",
    description: "Tons de terracota, tijolo e linho natural com bordas super arredondadas e estilo editorial. Dá ênfase a receitas caseiras, folhados e empadas finas.",
    primaryColor: "#C2410C",
    secondaryColor: "#D97706",
    bgColor: "#FAF7F2",
    cardBg: "#FFFFFF",
    textColor: "#292524",
    fontVibe: "Estilo café artesanal europeu com toque quente",
    recommendedFor: "Padarias gourmet, confeitarias finas e empórios artesanais",
  },
  {
    id: "fast-food-retro",
    name: "5. Fast-Food Vibrante & Dinâmico (Rubi & Mostarda)",
    subtitle: "Estilo Grandes Redes de Fast-Casual",
    tag: "Energia, Agilidade e Vendas Rápidas",
    description: "Vermelho rubi intenso, mostarda dourada e contornos expressivos. Estimula apetite imediato e rapidez de decisão no cardápio e totens de rua.",
    primaryColor: "#DC2626",
    secondaryColor: "#EAB308",
    bgColor: "#FFFBF0",
    cardBg: "#FFFFFF",
    textColor: "#18181B",
    fontVibe: "Títulos impactantes em caixa alta e badges de alta saturação",
    recommendedFor: "Lojas de shopping, quiosques de alto fluxo e lanchonetes express",
  },
];

interface LayoutThemeSelectorProps {
  currentLayout: LayoutThemeId;
  onSelectLayout: (layoutId: LayoutThemeId) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const LayoutThemeSelector: React.FC<LayoutThemeSelectorProps> = ({
  currentLayout,
  onSelectLayout,
  isOpen,
  onClose,
  onOpen,
}) => {
  const activeOption = LAYOUT_THEMES.find((t) => t.id === currentLayout) || LAYOUT_THEMES[0];

  return (
    <>
      {/* Floating Quick Button */}
      <button
        onClick={onOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-2xl border border-white/20 backdrop-blur-md cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group"
        title="Alternar entre os 5 Layouts propostos"
      >
        <Palette className="w-5 h-5 text-amber-400 animate-spin-slow group-hover:rotate-45 transition-transform" />
        <div className="text-left leading-none">
          <p className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">Alternar Design</p>
          <p className="text-xs font-bold text-slate-100 max-w-[140px] truncate">{activeOption.name.split("(")[0]}</p>
        </div>
        <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
          5 Layouts
        </span>
      </button>

      {/* Modal with the 5 Layouts */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-black text-white">Galeria de Layouts & Propostas Visuais</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                      5 Estilos Vivos
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Selecione qualquer uma das propostas abaixo para aplicar a direção visual completa no sistema em tempo real.
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* List of 5 Layouts */}
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
              {LAYOUT_THEMES.map((theme) => {
                const isCurrent = theme.id === currentLayout;
                return (
                  <div
                    key={theme.id}
                    onClick={() => onSelectLayout(theme.id)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden bg-white ${
                      isCurrent
                        ? "border-amber-500 shadow-lg ring-2 ring-amber-500/20 bg-amber-50/20"
                        : "border-slate-200 hover:border-slate-400 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      
                      {/* Left: Info */}
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-slate-900">{theme.name}</h4>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md">
                            {theme.tag}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-700 text-[11px] font-black rounded-md flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>LAYOUT ATIVO</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-amber-700">{theme.subtitle}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{theme.description}</p>
                        
                        <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                          <span>🎯 <strong>Ideal para:</strong> {theme.recommendedFor}</span>
                        </div>
                      </div>

                      {/* Right: Visual Palette Swatches & Action */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 shrink-0 w-full md:w-auto">
                        
                        {/* Swatches preview */}
                        <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-slate-100 border border-slate-200">
                          <div
                            className="w-6 h-6 rounded-lg shadow-xs border border-black/10"
                            style={{ backgroundColor: theme.bgColor }}
                            title={`Fundo: ${theme.bgColor}`}
                          />
                          <div
                            className="w-6 h-6 rounded-lg shadow-xs border border-black/10"
                            style={{ backgroundColor: theme.cardBg }}
                            title={`Cards: ${theme.cardBg}`}
                          />
                          <div
                            className="w-6 h-6 rounded-lg shadow-xs border border-black/10"
                            style={{ backgroundColor: theme.primaryColor }}
                            title={`Destaque Primário: ${theme.primaryColor}`}
                          />
                          <div
                            className="w-6 h-6 rounded-lg shadow-xs border border-black/10"
                            style={{ backgroundColor: theme.secondaryColor }}
                            title={`Secundário: ${theme.secondaryColor}`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLayout(theme.id);
                          }}
                          className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-xs ${
                            isCurrent
                              ? "bg-amber-500 text-slate-950 pointer-events-none"
                              : "bg-slate-900 hover:bg-slate-800 text-white"
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Em Uso</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>Ativar Layout</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>✨ Você pode alternar e testar todos os 5 layouts a qualquer instante sem perder pedidos ou dados cadastrados.</span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
