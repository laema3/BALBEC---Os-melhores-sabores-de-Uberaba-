import React, { useState } from "react";
import { Client, ClientStatus } from "../../types";
import { blockClient, updateClientApproval } from "../../services/api";
import { 
  UserX, 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Phone, 
  Building2, 
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  MessageSquare
} from "lucide-react";

interface ClientBlockingManagerProps {
  clients: Client[];
  onRefreshData: () => void;
  onNavigateToClients: () => void;
}

export const ClientBlockingManager: React.FC<ClientBlockingManagerProps> = ({
  clients,
  onRefreshData,
  onNavigateToClients,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterView, setFilterView] = useState<"ALL" | "BLOCKED" | "PENDING" | "APPROVED">("ALL");

  // Block Modal State
  const [selectedClientToBlock, setSelectedClientToBlock] = useState<Client | null>(null);
  const [blockReasonPreset, setBlockReasonPreset] = useState<string>("Inadimplência Financeira");
  const [customBlockReason, setCustomBlockReason] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Feedback Banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const blockedCount = clients.filter((c) => c.status === "BLOCKED").length;
  const pendingCount = clients.filter((c) => c.status === "PENDING").length;
  const approvedCount = clients.filter((c) => c.status === "APPROVED").length;

  const handleOpenBlockModal = (client: Client) => {
    setSelectedClientToBlock(client);
    setBlockReasonPreset("Inadimplência Financeira");
    setCustomBlockReason("");
  };

  const handleConfirmBlock = async () => {
    if (!selectedClientToBlock) return;

    setIsProcessing(true);
    const finalReason = customBlockReason
      ? `${blockReasonPreset}: ${customBlockReason}`
      : blockReasonPreset;

    const res = await blockClient(selectedClientToBlock.id, true, finalReason);
    setIsProcessing(false);

    if (res.success) {
      showFeedback("success", `O cliente "${selectedClientToBlock.name}" foi BLOQUEADO com sucesso.`);
      setSelectedClientToBlock(null);
      onRefreshData();
    } else {
      showFeedback("error", res.error || "Erro ao bloquear cliente.");
    }
  };

  const handleUnblock = async (client: Client) => {
    if (confirm(`Deseja DESBLOQUEAR e liberar o acesso do cliente "${client.name}"?`)) {
      setIsProcessing(true);
      const res = await blockClient(client.id, false);
      setIsProcessing(false);

      if (res.success) {
        showFeedback("success", `O cliente "${client.name}" foi DESBLOQUEADO e está com acesso liberado!`);
        onRefreshData();
      } else {
        showFeedback("error", res.error || "Erro ao desbloquear cliente.");
      }
    }
  };

  const handleQuickApprovePending = async (client: Client) => {
    setIsProcessing(true);
    const res = await updateClientApproval(client.id, "APPROVED");
    setIsProcessing(false);
    if (res) {
      showFeedback("success", `Cliente "${client.name}" aprovado com sucesso.`);
      onRefreshData();
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cnpj && c.cnpj.includes(searchTerm)) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.blockReason && c.blockReason.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterView === "BLOCKED") return matchSearch && c.status === "BLOCKED";
    if (filterView === "PENDING") return matchSearch && c.status === "PENDING";
    if (filterView === "APPROVED") return matchSearch && c.status === "APPROVED";
    return matchSearch;
  });

  const reasonPresets = [
    "Inadimplência Financeira / Boletos em aberto",
    "Não cumprimento de metas mínimas semanais",
    "Cancelamento ou rescisão de contrato",
    "Suspeita de fraude ou divergência cadastral",
    "Solicitação direta da administração",
    "Outro motivo personalizado",
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <UserX className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-black text-slate-900">Bloqueio & Controle de Clientes</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Painel de segurança para restringir acessos de compras, gerenciar inadimplência e aprovações de cadastro.
          </p>
        </div>

        <button
          onClick={onNavigateToClients}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Ver Todos os Clientes</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Blocked */}
        <div 
          onClick={() => setFilterView("BLOCKED")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterView === "BLOCKED" 
              ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400/40" 
              : "bg-white border-slate-200 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Bloqueados</span>
            <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-700">{blockedCount}</span>
            <span className="text-xs text-rose-600 font-medium">clientes com restrição</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Não conseguem realizar login ou enviar pedidos</p>
        </div>

        {/* Pending */}
        <div 
          onClick={() => setFilterView("PENDING")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterView === "PENDING" 
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/40" 
              : "bg-white border-slate-200 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pendentes</span>
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-700">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-medium">aguardando análise</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cadastros novos pendentes de validação de CNPJ</p>
        </div>

        {/* Approved */}
        <div 
          onClick={() => setFilterView("APPROVED")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterView === "APPROVED" 
              ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/40" 
              : "bg-white border-slate-200 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Liberados / Ativos</span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-700">{approvedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">compras permitidas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Acesso normal ao delivery e totem com preços B2B</p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setFilterView("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterView === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setFilterView("BLOCKED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterView === "BLOCKED"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            Bloqueados ({blockedCount})
          </button>
          <button
            onClick={() => setFilterView("PENDING")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterView === "PENDING"
                ? "bg-amber-500 text-slate-950"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilterView("APPROVED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterView === "APPROVED"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            Liberados ({approvedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 md:max-w-md w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, CNPJ ou motivo de bloqueio..."
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800"
          />
        </div>

      </div>

      {/* Clients Security Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Cliente / CNPJ</th>
                <th className="py-3.5 px-4">Contato & Cidade</th>
                <th className="py-3.5 px-4">Status Atual</th>
                <th className="py-3.5 px-4">Motivo / Histórico</th>
                <th className="py-3.5 px-4 text-right">Ação de Segurança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isBlocked = client.status === "BLOCKED";
                  const isPending = client.status === "PENDING";

                  return (
                    <tr 
                      key={client.id} 
                      className={`transition-colors ${
                        isBlocked 
                          ? "bg-rose-50/40 hover:bg-rose-50/70" 
                          : isPending 
                          ? "bg-amber-50/30 hover:bg-amber-50/60" 
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Name & CNPJ */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                              isBlocked
                                ? "bg-rose-100 text-rose-700"
                                : isPending
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isBlocked ? <Lock className="w-4 h-4" /> : client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{client.name}</p>
                            <span className="font-mono text-xs text-slate-500 font-medium">
                              CNPJ: {client.cnpj || "Não cadastrado"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <a
                            href={`https://wa.me/55${client.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{client.phone}</span>
                          </a>
                          <span className="text-xs text-slate-500">
                            {client.address?.city || "Uberaba/MG"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isBlocked && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-black inline-flex items-center space-x-1">
                            <Lock className="w-3.5 h-3.5 text-rose-600" />
                            <span>BLOQUEADO</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold inline-flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Pendente Análise</span>
                          </span>
                        )}
                        {client.status === "APPROVED" && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold inline-flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Liberado</span>
                          </span>
                        )}
                        {client.status === "REJECTED" && (
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-bold inline-flex items-center space-x-1">
                            <XCircle className="w-3.5 h-3.5 text-slate-600" />
                            <span>Rejeitado</span>
                          </span>
                        )}
                      </td>

                      {/* Motive / History */}
                      <td className="py-3.5 px-4 text-xs">
                        {client.blockReason ? (
                          <div className="p-2 bg-rose-100/70 border border-rose-200 rounded-xl text-rose-900 font-medium max-w-xs">
                            <span className="font-bold block">Motivo do Bloqueio:</span>
                            {client.blockReason}
                          </div>
                        ) : client.notes ? (
                          <span className="text-slate-600 max-w-xs truncate block">{client.notes}</span>
                        ) : (
                          <span className="text-slate-400 italic">Sem restrições registradas.</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isBlocked ? (
                            <button
                              onClick={() => handleUnblock(client)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                              title="Desbloquear e liberar compras"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Desbloquear</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {isPending && (
                                <button
                                  onClick={() => handleQuickApprovePending(client)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Aprovar</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenBlockModal(client)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                                title="Bloquear acesso e compras do cliente"
                              >
                                <Lock className="w-3.5 h-3.5 text-rose-600" />
                                <span>Bloquear</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Confirm Block with Reason */}
      {selectedClientToBlock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-rose-600 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Confirmar Bloqueio de Cliente</h3>
                <p className="text-xs text-slate-500">Restrição de segurança no sistema BALBEC</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Cliente Alvo</p>
                <p className="font-black text-slate-900 text-base">{selectedClientToBlock.name}</p>
                <p className="text-xs text-slate-600 font-mono mt-0.5">CNPJ: {selectedClientToBlock.cnpj || "Sem CNPJ"}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Motivo Principal do Bloqueio *
                </label>
                <select
                  value={blockReasonPreset}
                  onChange={(e) => setBlockReasonPreset(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500"
                >
                  {reasonPresets.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detalhes Adicionais / Justificativa
                </label>
                <textarea
                  rows={3}
                  value={customBlockReason}
                  onChange={(e) => setCustomBlockReason(e.target.value)}
                  placeholder="Ex: Títulos vencidos há mais de 15 dias sem retorno no WhatsApp..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                <span className="font-bold block">⚠️ Efeitos Imediatos:</span>
                <p>• O cliente não conseguirá realizar login no Delivery ou no Totem da loja.</p>
                <p>• Pedidos existentes ou novas tentativas de checkout serão recusadas.</p>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedClientToBlock(null)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-sm shadow-md shadow-rose-600/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isProcessing ? "Bloqueando..." : "Confirmar Bloqueio"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
