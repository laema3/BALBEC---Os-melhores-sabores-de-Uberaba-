import React, { useEffect, useState } from "react";
import { Order } from "../../types";
import { Tv, Flame, CheckCircle2, Clock } from "lucide-react";

interface CallDisplayViewProps {
  orders: Order[];
  storeName?: string;
}

export const CallDisplayView: React.FC<CallDisplayViewProps> = ({ orders, storeName }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const preparingOrders = orders.filter((o) => o.status === "PREPARANDO" || o.status === "AGUARDANDO");
  const readyOrders = orders.filter((o) => o.status === "PRONTO");

  return (
    <div className="min-h-[85vh] bg-white rounded-[32px] border-2 border-[#E9ECEF] p-6 sm:p-8 text-[#2D3436] flex flex-col justify-between shadow-xl overflow-hidden">
      
      {/* TV Screen Header */}
      <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] rounded-2xl">
            <Tv className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#D97706]">
              BALBEC • MONITOR DE PEDIDOS
            </h1>
            <p className="text-xs font-bold text-[#636E72]">
              {storeName || "Franquia BALBEC Salgados"} • Acompanhe a retirada no balcão
            </p>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="text-right">
          <div className="text-3xl sm:text-4xl font-mono font-black text-[#D97706]">
            {time}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B2BEC3] block">
            Horário Local
          </span>
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 flex-1">
        
        {/* Left Column: PREPARANDO */}
        <div className="bg-[#F8F9FA] border-2 border-[#FDE68A] rounded-[24px] p-6 flex flex-col shadow-sm">
          <div className="flex items-center space-x-3 border-b border-[#FDE68A] pb-4 mb-6">
            <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#D97706]">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#D97706]">EM PREPARAÇÃO</h2>
              <p className="text-xs text-[#636E72]">Salgados saindo quentinhos da cozinha</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 align-content-start">
            {preparingOrders.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[#B2BEC3] text-xs font-bold">
                Nenhum pedido em preparação no momento
              </div>
            ) : (
              preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-[#FDE68A] rounded-2xl p-4 text-center shadow-xs animate-pulse"
                >
                  <span className="text-[10px] font-mono text-[#636E72] font-bold block uppercase">
                    {ord.type === "TOTEM" ? "Totem Presencial" : "Delivery"}
                  </span>
                  <span className="text-3xl font-black text-[#D97706] tracking-wider my-1 block">
                    #{ord.orderNumber}
                  </span>
                  <span className="text-[10px] text-[#636E72] font-bold truncate block">
                    {ord.clientName.split(" ")[0]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: PRONTOS PARA RETIRADA */}
        <div className="bg-[#F8F9FA] border-2 border-[#00B894]/30 rounded-[24px] p-6 flex flex-col shadow-sm">
          <div className="flex items-center space-x-3 border-b border-[#00B894]/20 pb-4 mb-6">
            <div className="p-2.5 rounded-xl bg-[#E6F9F5] text-[#00B894]">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#00B894]">PRONTOS PARA RETIRADA</h2>
              <p className="text-xs text-[#636E72]">Por favor venha retirar seu pedido no balcão</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 align-content-start">
            {readyOrders.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[#B2BEC3] text-xs font-bold">
                Aguardando chamadas...
              </div>
            ) : (
              readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#E6F9F5] border-2 border-[#00B894] rounded-2xl p-4 text-center shadow-md shadow-[#00B894]/10 animate-bounce"
                >
                  <span className="text-[10px] font-mono text-[#00B894] font-black block uppercase">
                    RETIRAR NO BALCÃO
                  </span>
                  <span className="text-4xl font-black text-[#00B894] tracking-wider my-1 block">
                    #{ord.orderNumber}
                  </span>
                  <span className="text-xs font-bold text-[#2D3436] truncate block">
                    {ord.clientName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Screen Footer */}
      <div className="border-t border-[#E9ECEF] pt-4 flex items-center justify-between text-xs font-bold text-[#636E72]">
        <span>SISTEMA DE PAINEL BALBEC FRANQUIAS</span>
        <span className="text-[#D97706] flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Atualização Automática em Tempo Real</span>
        </span>
      </div>

    </div>
  );
};
