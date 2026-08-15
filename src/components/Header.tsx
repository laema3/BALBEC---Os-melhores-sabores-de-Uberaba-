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
  Palette
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
}) => {
  const [muted, setMutedState] = React.useState(getIsMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const logoImage = settings?.logoUrl || "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=300&q=80";
  const storeTitle = settings?.storeName || "BALBEC Salgados";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9ECEF] text-[#2D3436] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Info */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => onModeChange("DELIVERY")}>
            <div className="relative group">
              <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center text-slate-950 font-black text-2xl tracking-tighter shadow-sm group-hover:scale-105 transition-transform duration-200">
                B
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00B894] text-[9px] font-black items-center justify-center text-white">✓</span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-[#2D3436] uppercase">
                  BALBEC
                </h1>
                <span className="text-[10px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                  Franquia
                </span>
              </div>
              <p className="text-xs font-semibold text-[#636E72] uppercase tracking-widest truncate max-w-[200px] sm:max-w-xs">
                {settings?.franchiseCode ? `${settings.franchiseCode} • ` : ""}Franquia de Salgados
              </p>
            </div>
          </div>

          {/* Mode Navigation Bar */}
          <div className="hidden lg:flex items-center bg-[#F8F9FA] p-1.5 rounded-2xl border border-[#E9ECEF] shadow-inner">
            <button
              onClick={() => onModeChange("DELIVERY")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                currentMode === "DELIVERY"
                  ? "bg-[#F59E0B] text-slate-950 shadow-sm scale-[1.02]"
                  : "text-[#636E72] hover:bg-white hover:text-[#2D3436]"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Delivery (Web/Casa)</span>
            </button>

            <button
              onClick={() => onModeChange("TOTEM")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                currentMode === "TOTEM"
                  ? "bg-[#F59E0B] text-slate-950 shadow-sm scale-[1.02]"
                  : "text-[#636E72] hover:bg-white hover:text-[#2D3436]"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Totem / Tablet (Loja)</span>
            </button>

            <button
              onClick={() => onModeChange("CALL_DISPLAY")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                currentMode === "CALL_DISPLAY"
                  ? "bg-[#F59E0B] text-slate-950 shadow-sm scale-[1.02]"
                  : "text-[#636E72] hover:bg-white hover:text-[#2D3436]"
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Monitor TV Chamada</span>
            </button>

            <button
              onClick={() => onModeChange("ADMIN")}
              className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                currentMode === "ADMIN"
                  ? "bg-[#F59E0B] text-slate-950 shadow-sm scale-[1.02]"
                  : "text-[#636E72] hover:bg-white hover:text-[#2D3436]"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Painel Admin</span>
              
              {/* Badge for pending alerts in Admin */}
              {(pendingOrdersCount > 0 || pendingClientsCount > 0) && (
                <span className="flex h-5 min-w-5 px-1 bg-[#D97706] text-white rounded-full text-[10px] font-black items-center justify-center animate-pulse shadow-sm">
                  {pendingOrdersCount + pendingClientsCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Layout / Theme Selector Button */}
            {onOpenLayoutSelector && (
              <button
                onClick={onOpenLayoutSelector}
                title="Ver e Alternar entre os 5 Layouts"
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-xl text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden md:inline">5 Layouts</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={muted ? "Ativar efeitos sonoros" : "Silenciar som"}
              className={`p-2.5 rounded-xl border transition-colors ${
                muted
                  ? "bg-[#F8F9FA] text-[#B2BEC3] border-[#E9ECEF] hover:text-[#636E72]"
                  : "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] hover:bg-[#FDE68A]"
              }`}
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
            </button>

            {/* Client Status Badge / Register Button (Delivery mode) */}
            {currentMode === "DELIVERY" && (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={onOpenClientModal}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    !currentClient
                      ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] hover:bg-[#FDE68A]"
                      : currentClient.status === "APPROVED"
                      ? "bg-[#E6F9F5] text-[#00B894] border-[#00B894]/30"
                      : currentClient.status === "PENDING"
                      ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] animate-pulse"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {!currentClient ? (
                    <>
                      <UserCheck className="w-4 h-4 text-[#D97706]" />
                      <span>Cadastrar / Entrar</span>
                    </>
                  ) : (
                    <>
                      {currentClient.status === "APPROVED" && <CheckCircle2 className="w-4 h-4 text-[#00B894]" />}
                      {currentClient.status === "PENDING" && <Clock className="w-4 h-4 text-[#D97706]" />}
                      {currentClient.status === "REJECTED" && <XCircle className="w-4 h-4 text-red-500" />}
                      <div className="text-left">
                        <p className="font-black leading-none text-[#2D3436]">{currentClient.name}</p>
                        <p className="text-[10px] text-[#636E72] leading-tight">
                          {currentClient.status === "APPROVED" && `CNPJ: ${currentClient.cnpj || "Aprovado"}`}
                          {currentClient.status === "PENDING" && "Em Análise"}
                          {currentClient.status === "REJECTED" && "Não Aprovado"}
                        </p>
                      </div>
                    </>
                  )}
                </button>

                {currentClient && (
                  <button
                    onClick={onLogout}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                    title="Desconectar / Sair da conta"
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
                className="relative flex items-center space-x-2 px-4 py-2.5 bg-[#00B894] hover:bg-[#00A884] text-white font-extrabold rounded-xl shadow-md active:scale-95 transition-all"
              >
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="hidden sm:inline text-xs uppercase tracking-wider">Carrinho</span>
                {cartCount > 0 && (
                  <span className="bg-white text-[#00B894] text-xs font-black px-2 py-0.5 rounded-full border border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Mode Switcher Bar */}
      <div className="lg:hidden bg-white px-2 py-2 border-t border-[#E9ECEF] flex items-center justify-around overflow-x-auto text-xs font-bold">
        <button
          onClick={() => onModeChange("DELIVERY")}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 ${
            currentMode === "DELIVERY" ? "bg-[#F59E0B] text-slate-950 font-black" : "text-[#636E72]"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Delivery</span>
        </button>
        <button
          onClick={() => onModeChange("TOTEM")}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 ${
            currentMode === "TOTEM" ? "bg-[#F59E0B] text-slate-950 font-black" : "text-[#636E72]"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Totem</span>
        </button>
        <button
          onClick={() => onModeChange("CALL_DISPLAY")}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 ${
            currentMode === "CALL_DISPLAY" ? "bg-[#F59E0B] text-slate-950 font-black" : "text-[#636E72]"
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>TV Chamada</span>
        </button>
        <button
          onClick={() => onModeChange("ADMIN")}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 relative ${
            currentMode === "ADMIN" ? "bg-[#F59E0B] text-slate-950 font-black" : "text-[#636E72]"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Admin</span>
          {(pendingOrdersCount > 0 || pendingClientsCount > 0) && (
            <span className="w-2 h-2 bg-[#D97706] rounded-full animate-ping"></span>
          )}
        </button>
      </div>
    </header>
  );
};
