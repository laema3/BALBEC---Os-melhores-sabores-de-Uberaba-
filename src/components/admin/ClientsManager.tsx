import React, { useState } from "react";
import { Client, ClientStatus } from "../../types";
import { 
  registerClient, 
  updateClient, 
  deleteClient, 
  updateClientMinimums, 
  updateClientApproval 
} from "../../services/api";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  UserX, 
  UserCheck, 
  Clock, 
  MessageSquare,
  Sparkles
} from "lucide-react";

interface ClientsManagerProps {
  clients: Client[];
  onRefreshData: () => void;
  onNavigateToBlocking?: () => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  clients,
  onRefreshData,
  onNavigateToBlocking,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [minDaily, setMinDaily] = useState("5");
  const [minWeekly, setMinWeekly] = useState("30");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Uberaba");
  const [clientStatus, setClientStatus] = useState<ClientStatus>("APPROVED");
  const [notes, setNotes] = useState("");

  // Inline Minimums Editing
  const [editingMinId, setEditingMinId] = useState<string | null>(null);
  const [inlineDaily, setInlineDaily] = useState<number>(5);
  const [inlineWeekly, setInlineWeekly] = useState<number>(30);

  // Feedback State
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setName("");
    setCnpj("");
    setPhone("");
    setEmail("");
    setPassword("123456");
    setMinDaily("5");
    setMinWeekly("30");
    setStreet("");
    setNumber("");
    setNeighborhood("");
    setCity("Uberaba");
    setClientStatus("APPROVED");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setCnpj(c.cnpj || "");
    setPhone(c.phone);
    setEmail(c.email || "");
    setPassword(c.password || "");
    setMinDaily((c.minDailyOrders || 5).toString());
    setMinWeekly((c.minWeeklyOrders || 30).toString());
    setStreet(c.address?.street || "");
    setNumber(c.address?.number || "");
    setNeighborhood(c.address?.neighborhood || "");
    setCity(c.address?.city || "Uberaba");
    setClientStatus(c.status);
    setNotes(c.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !cnpj) {
      showFeedback("error", "Preencha Nome, Telefone e CNPJ.");
      return;
    }

    const payload = {
      name,
      cnpj,
      phone,
      email,
      password: password || "123456",
      minDailyOrders: parseInt(minDaily, 10) || 5,
      minWeeklyOrders: parseInt(minWeekly, 10) || 30,
      address: {
        street,
        number,
        neighborhood,
        city: city || "Uberaba",
      },
      status: clientStatus,
      notes,
    };

    if (editingClient) {
      const res = await updateClient(editingClient.id, payload);
      if (res) {
        showFeedback("success", `Cliente "${res.name}" atualizado com sucesso!`);
        setIsModalOpen(false);
        onRefreshData();
      } else {
        showFeedback("error", "Erro ao salvar alterações no cliente.");
      }
    } else {
      const res = await registerClient(payload);
      if (res.success && res.client) {
        showFeedback("success", `Cliente "${res.client.name}" cadastrado com sucesso!`);
        setIsModalOpen(false);
        onRefreshData();
      } else {
        showFeedback("error", res.error || "Erro ao cadastrar cliente.");
      }
    }
  };

  const handleDeleteClient = async (c: Client) => {
    if (confirm(`Tem certeza que deseja excluir o cadastro do cliente "${c.name}"?`)) {
      const success = await deleteClient(c.id);
      if (success) {
        showFeedback("success", `Cliente "${c.name}" excluído.`);
        onRefreshData();
      } else {
        showFeedback("error", "Erro ao excluir cliente.");
      }
    }
  };

  const handleSaveInlineMinimums = async (clientId: string) => {
    const success = await updateClientMinimums(clientId, inlineDaily, inlineWeekly);
    if (success) {
      setEditingMinId(null);
      showFeedback("success", "Metas mínimas de pedidos atualizadas.");
      onRefreshData();
    }
  };

  const handleQuickApprove = async (clientId: string, nextStatus: ClientStatus) => {
    const success = await updateClientApproval(clientId, nextStatus);
    if (success) {
      showFeedback("success", `Status do cliente alterado para ${nextStatus}.`);
      onRefreshData();
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cnpj && c.cnpj.includes(searchTerm)) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.address?.city && c.address.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aprovado</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pendente de Análise</span>
          </span>
        );
      case "BLOCKED":
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-bold flex items-center space-x-1 animate-pulse">
            <UserX className="w-3.5 h-3.5 text-rose-600" />
            <span>Bloqueado</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-bold flex items-center space-x-1">
            <X className="w-3.5 h-3.5 text-slate-500" />
            <span>Rejeitado</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-black text-slate-900">Cadastro de Clientes</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o cadastro de revendedores, lanchonetes, clientes B2B e contratos de fornecimento em Uberaba.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onNavigateToBlocking && (
            <button
              onClick={onNavigateToBlocking}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-sm border border-rose-200 transition-colors cursor-pointer"
            >
              <UserX className="w-4 h-4 text-rose-600" />
              <span>Painel de Bloqueios</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Cliente</span>
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
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome da empresa, CNPJ, telefone, e-mail ou bairro..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800"
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

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Todos os Status ({clients.length})</option>
            <option value="APPROVED">Aprovados (Liberados)</option>
            <option value="PENDING">Pendentes de Aprovação</option>
            <option value="BLOCKED">Bloqueados</option>
            <option value="REJECTED">Rejeitados</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Cliente / Razão Social</th>
                <th className="py-3.5 px-4">CNPJ & Acesso</th>
                <th className="py-3.5 px-4">Contato & WhatsApp</th>
                <th className="py-3.5 px-4">Endereço (Uberaba)</th>
                <th className="py-3.5 px-4">Metas de Pedidos</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum cliente encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isEditingMin = editingMinId === client.id;

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{client.name}</p>
                            <p className="text-xs text-slate-400">
                              Cadastrado em {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CNPJ */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md font-semibold block w-fit">
                          {client.cnpj || "Sem CNPJ"}
                        </span>
                        {client.password && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">
                            Senha: ••••••••
                          </span>
                        )}
                      </td>

                      {/* Phone & WhatsApp */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col space-y-1">
                          <a
                            href={`https://wa.me/55${client.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{client.phone}</span>
                          </a>
                          {client.email && (
                            <span className="text-xs text-slate-500 truncate max-w-[160px]">
                              {client.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-start space-x-1 max-w-[200px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">
                            {client.address?.street
                              ? `${client.address.street}, ${client.address.number || "S/N"} - ${client.address.neighborhood || ""}`
                              : "Endereço não informado"}
                          </span>
                        </div>
                      </td>

                      {/* Minimum Quotas */}
                      <td className="py-3.5 px-4">
                        {isEditingMin ? (
                          <div className="flex items-center space-x-1.5 p-1 bg-amber-50 rounded-lg border border-amber-200">
                            <input
                              type="number"
                              min="1"
                              value={inlineDaily}
                              onChange={(e) => setInlineDaily(parseInt(e.target.value, 10) || 1)}
                              className="w-12 px-1 py-0.5 bg-white border border-amber-300 rounded text-xs font-bold text-center"
                              title="Meta Diária"
                            />
                            <span className="text-[10px] text-slate-500">/dia</span>
                            <button
                              onClick={() => handleSaveInlineMinimums(client.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                              title="Salvar Metas"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingMinId(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingMinId(client.id);
                              setInlineDaily(client.minDailyOrders || 5);
                              setInlineWeekly(client.minWeeklyOrders || 30);
                            }}
                            className="text-xs text-slate-700 hover:text-amber-700 flex items-center space-x-1 group cursor-pointer"
                            title="Clique para ajustar meta mínima de pedidos"
                          >
                            <span className="font-bold">{client.minDailyOrders || 5}/dia</span>
                            <span className="text-slate-400">({client.minWeeklyOrders || 30}/sem)</span>
                            <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">{getStatusBadge(client.status)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {client.status === "PENDING" && (
                            <button
                              onClick={() => handleQuickApprove(client.id, "APPROVED")}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                              title="Aprovar Cadastro Imediatamente"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Aprovar</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(client)}
                            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            title="Editar Dados do Cliente"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Excluir Cadastro"
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
            Exibindo <strong>{filteredClients.length}</strong> de <strong>{clients.length}</strong> clientes
          </span>
          <span>Regras de fornecimento e contrato BALBEC Uberaba/MG</span>
        </div>
      </div>

      {/* Modal: Create / Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {editingClient ? "Editar Cadastro do Cliente" : "Novo Cliente B2B"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Padaria e Confeitaria Central"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telefone WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(34) 99999-8888"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="compras@empresa.com.br"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Senha de Acesso
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Endereço em Uberaba
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Rua / Avenida"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Número"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bairro"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade (Uberaba/MG)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Meta Mínima Diária
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minDaily}
                    onChange={(e) => setMinDaily(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Meta Mínima Semanal
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minWeekly}
                    onChange={(e) => setMinWeekly(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status do Cadastro
                  </label>
                  <select
                    value={clientStatus}
                    onChange={(e) => setClientStatus(e.target.value as ClientStatus)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                  >
                    <option value="APPROVED">Aprovado (Liberado)</option>
                    <option value="PENDING">Pendente</option>
                    <option value="BLOCKED">Bloqueado</option>
                    <option value="REJECTED">Rejeitado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações Internas / Contrato
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Entrega prioritária matutina, cliente com faturamento quinzenal..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                />
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
                  {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
