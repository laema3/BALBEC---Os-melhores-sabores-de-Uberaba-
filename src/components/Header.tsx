import React from "react";
import { AppMode, StoreSettings, Client } from "../types";
import { 
  ShoppingBag, 
  Store, 
  Smartphone, 
  Monitor, 
  Tv, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  XCircle,
  UserCheck,
  Palette,
  Menu,
  Flame
} from "lucide-react";
import { getIsMuted, setMuted } from "../utils/audio";

interface HeaderProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  cartCount: number;
  onOpenCart: () => void;
  settings: StoreSettings | null;
  currentClient: Client | null;
  onOpenClientModal: () => void;
  onLogout: () => void;
  pendingClientsCount: number;
  pendingOrdersCount: number;
  onOpenLayoutSelector?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  cartCount,
  onOpenCart,
  settings,
  currentClient,
  onOpenClientModal,
  onLogout,
  pendingClientsCount,
  pendingOrdersCount,
  onOpenLayoutSelector,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [muted, setMutedState] = React.useState(getIsMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Left: Sidebar Hamburger + Logo & Brand */}
          <div className="flex items-center space-x-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Menu Lateral (Produtos, Categorias, Clientes, Bloqueio)"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div 
              className="flex items-center space-x-3 cursor-pointer select-none" 
              onClick={() => onModeChange("DELIVERY")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-sm shrink-0">
                <Flame className="w-6 h-6 text-slate-950" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    BALBEC
                  </h1>
                  <span className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    Uberaba/MG
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 truncate max-w-[200px] sm:max-w-xs leading-none mt-0.5">
                  Os melhores sabores de Uberaba
                </p>
              </div>
            </div>
          </div>

          {/* Center: Mode Navigation Bar */}
          <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => onModeChange("DELIVERY")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentMode === "DELIVERY"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Delivery Online</span>
            </button>

            <button
              onClick={() => onModeChange("TOTEM")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentMode === "TOTEM"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Totem Loja</span>
            </button>

            <button
              onClick={() => onModeChange("CALL_DISPLAY")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentMode === "CALL_DISPLAY"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>TV de Senhas</span>
            </button>

            <button
              onClick={() => onModeChange("ADMIN")}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentMode === "ADMIN"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Painel Admin</span>
              
              {(pendingOrdersCount > 0 || pendingClientsCount > 0) && (
                <span className="flex h-4 min-w-4 px-1 bg-rose-600 text-white rounded-full text-[9px] font-black items-center justify-center animate-pulse">
                  {pendingOrdersCount + pendingClientsCount}
                </span>
              )}
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2.5">
            
            {/* Layouts Preset Selector */}
            {onOpenLayoutSelector && (
              <button
                onClick={onOpenLayoutSelector}
                title="Alternar entre as 5 Propostas de Layout"
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">5 Layouts</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={muted ? "Ativar som de alertas" : "Silenciar som"}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                muted
                  ? "bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-600"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />}
            </button>

            {/* Client Login/Profile Button (Delivery Mode) */}
            {currentMode === "DELIVERY" && (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={onOpenClientModal}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !currentClient
                      ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      : currentClient.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : currentClient.status === "PENDING"
                      ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {!currentClient ? (
                    <>
                      <UserCheck className="w-4 h-4 text-amber-700" />
                      <span>Entrar / Cadastrar</span>
                    </>
                  ) : (
                    <>
                      {currentClient.status === "APPROVED" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {currentClient.status === "PENDING" && <Clock className="w-4 h-4 text-amber-600" />}
                      {currentClient.status === "BLOCKED" && <XCircle className="w-4 h-4 text-rose-600" />}
                      <div className="text-left">
                        <p className="font-bold leading-none text-slate-900 truncate max-w-[120px]">{currentClient.name}</p>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {currentClient.status === "APPROVED" && "Cliente Liberado"}
                          {currentClient.status === "PENDING" && "Pendente"}
                          {currentClient.status === "BLOCKED" && "Bloqueado"}
                        </p>
                      </div>
                    </>
                  )}
                </button>

                {currentClient && (
                  <button
                    onClick={onLogout}
                    className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Desconectar da conta"
                  >
                    Sair
                  </button>
                )}
              </div>
            )}

            {/* Cart Button (Delivery Mode) */}
            {currentMode === "DELIVERY" && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="hidden sm:inline text-xs">Carrinho</span>
                {cartCount > 0 && (
                  <span className="bg-white text-emerald-800 text-xs font-black px-1.5 py-0.2 rounded-full shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Mode Switcher Bar */}
      <div className="lg:hidden bg-slate-50 px-2 py-2 border-t border-slate-200 flex items-center justify-around overflow-x-auto text-xs font-bold">
        <button
          onClick={() => onModeChange("DELIVERY")}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 ${
            currentMode === "DELIVERY" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-600"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Delivery</span>
        </button>
        <button
          onClick={() => onModeChange("TOTEM")}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 ${
            currentMode === "TOTEM" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-600"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Totem</span>
        </button>
        <button
          onClick={() => onModeChange("CALL_DISPLAY")}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 ${
            currentMode === "CALL_DISPLAY" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-600"
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>TV Senhas</span>
        </button>
        <button
          onClick={() => onModeChange("ADMIN")}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 relative ${
            currentMode === "ADMIN" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-600"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Admin</span>
          {(pendingOrdersCount > 0 || pendingClientsCount > 0) && (
            <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping"></span>
          )}
        </button>
      </div>
    </header>
  );
};
