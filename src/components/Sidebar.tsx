import React from "react";
import { AppMode, AdminTab, StoreSettings } from "../types";
import { 
  ShoppingBag, 
  UserCheck, 
  CreditCard, 
  Image as ImageIcon, 
  Package, 
  Tags, 
  Users, 
  UserX, 
  Settings, 
  FileText, 
  Store, 
  Tv, 
  Smartphone, 
  Truck, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Palette,
  Volume2,
  VolumeX,
  ShieldAlert,
  Flame
} from "lucide-react";
import { getIsMuted, setMuted } from "../utils/audio";

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  adminTab: AdminTab;
  onAdminTabChange: (tab: AdminTab) => void;
  pendingOrdersCount: number;
  pendingClientsCount: number;
  blockedClientsCount: number;
  productsCount: number;
  categoriesCount: number;
  clientsCount: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenLayoutSelector: () => void;
  settings: StoreSettings | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onModeChange,
  adminTab,
  onAdminTabChange,
  pendingOrdersCount,
  pendingClientsCount,
  blockedClientsCount,
  productsCount,
  categoriesCount,
  clientsCount,
  isOpen,
  onToggleOpen,
  onOpenLayoutSelector,
  settings,
}) => {
  const [muted, setMutedState] = React.useState(getIsMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const handleAdminTabSelect = (tab: AdminTab) => {
    if (currentMode !== "ADMIN") {
      onModeChange("ADMIN");
    }
    onAdminTabChange(tab);
  };

  const adminNavItems: {
    tab: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    desc: string;
  }[] = [
    {
      tab: "PEDIDOS",
      label: "Pedidos & Cozinha (KDS)",
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: "bg-amber-500 text-slate-950",
      desc: "Gestão em tempo real de pedidos e alertas WhatsApp",
    },
    {
      tab: "PRODUTOS",
      label: "Cadastro de Produtos",
      icon: <Package className="w-5 h-5" />,
      badge: productsCount,
      badgeColor: "bg-slate-700 text-slate-200",
      desc: "Itens, preços, estoque e código BlueFocus",
    },
    {
      tab: "CATEGORIAS",
      label: "Cadastro de Categorias",
      icon: <Tags className="w-5 h-5" />,
      badge: categoriesCount,
      badgeColor: "bg-slate-700 text-slate-200",
      desc: "Organização do cardápio e seções",
    },
    {
      tab: "CLIENTES",
      label: "Cadastro de Clientes",
      icon: <Users className="w-5 h-5" />,
      badge: clientsCount,
      badgeColor: "bg-emerald-600 text-white",
      desc: "Base B2B, metas mínimas e dados cadastrais",
    },
    {
      tab: "BLOQUEIO_CLIENTES",
      label: "Bloqueio de Clientes",
      icon: <UserX className="w-5 h-5" />,
      badge: (blockedClientsCount + pendingClientsCount) > 0 ? (blockedClientsCount + pendingClientsCount) : undefined,
      badgeColor: blockedClientsCount > 0 ? "bg-rose-600 text-white animate-pulse" : "bg-amber-500 text-slate-950",
      desc: "Controle de acesso, restrições e aprovações",
    },
    {
      tab: "BLUEFOCUS",
      label: "Integração BlueFocus",
      icon: <Sparkles className="w-5 h-5" />,
      badge: productsCount,
      badgeColor: "bg-amber-500 text-slate-950",
      desc: "API, credenciais, sincronização de estoque e testes de conexão",
    },
    {
      tab: "CONFIGURACOES",
      label: "Configurações & Franquia",
      icon: <Settings className="w-5 h-5" />,
      desc: "Logomarca, pagamentos e dados da unidade",
    },
  ];

  const channelNavItems: {
    mode: AppMode;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      mode: "DELIVERY",
      label: "Cardápio Delivery",
      icon: <Truck className="w-5 h-5" />,
      badge: "Online",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      mode: "TOTEM",
      label: "Totem Autoatendimento",
      icon: <Smartphone className="w-5 h-5" />,
      badge: "Loja",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    {
      mode: "CALL_DISPLAY",
      label: "TV Chamada de Senhas",
      icon: <Tv className="w-5 h-5" />,
      badge: "Painel",
      badgeColor: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
          isOpen ? "w-72 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        {/* Top Brand Header */}
        <div className="h-18 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
              <Flame className="w-6 h-6 text-slate-950" />
            </div>
            {isOpen && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-base text-white tracking-wider truncate">
                  BALBEC
                </span>
                <span className="text-[11px] text-amber-400 font-semibold truncate leading-tight">
                  Sabores de Uberaba
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleOpen}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            title={isOpen ? "Recolher Menu Lateral" : "Expandir Menu Lateral"}
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Section: Gestão & Cadastros (Admin) */}
          <div className="space-y-1.5">
            {isOpen && (
              <div className="px-3 pb-1 text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center justify-between">
                <span>Gestão & Cadastros</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              </div>
            )}

            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = currentMode === "ADMIN" && adminTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => handleAdminTabSelect(item.tab)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-all group relative cursor-pointer ${
                      isActive
                        ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-900/80 font-medium"
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-slate-950" : "text-amber-400"}`}>
                      {item.icon}
                    </div>

                    {isOpen && (
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="text-xs truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                              isActive ? "bg-slate-950 text-amber-400" : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Collapsed view indicator badge */}
                    {!isOpen && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950 ring-1 ring-amber-400/50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Canais de Venda / Totens */}
          <div className="space-y-1.5">
            {isOpen && (
              <div className="px-3 pb-1 text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center justify-between">
                <span>Canais de Atendimento</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              </div>
            )}

            <div className="space-y-1">
              {channelNavItems.map((item) => {
                const isActive = currentMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    onClick={() => onModeChange(item.mode)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-all group relative cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-900/80 font-medium"
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-blue-400"}`}>
                      {item.icon}
                    </div>

                    {isOpen && (
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="text-xs truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                              isActive ? "bg-white text-blue-900" : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Actions & Quick Preferences */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2 shrink-0">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-left transition-all cursor-pointer ${
              !isOpen && "justify-center px-0"
            }`}
            title={muted ? "Ativar Áudio e Alertas" : "Silenciar Áudio"}
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            {isOpen && (
              <span className="text-xs font-medium">
                {muted ? "Alertas Silenciados" : "Alertas Sonoros Ativos"}
              </span>
            )}
          </button>

          {/* Franchise Info Footer */}
          {isOpen && (
            <div className="pt-2 px-1 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">Unidade Uberaba/MG</span>
              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-bold">Online</span>
            </div>
          )}

        </div>
      </aside>
    </>
  );
};
