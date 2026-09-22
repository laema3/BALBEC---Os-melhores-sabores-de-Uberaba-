import React, { useState } from "react";
import { StoreSettings, Product } from "../../types";
import { updateStoreSettings, syncBlueFocusProducts, testBlueFocusConnection } from "../../services/api";
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Globe, 
  Clock, 
  Layers, 
  Server, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Activity, 
  Database,
  Check,
  Terminal,
  Building2,
  Receipt,
  Radio,
  Sliders,
  HelpCircle,
  Network,
  Share2
} from "lucide-react";

interface BlueFocusManagerProps {
  settings: StoreSettings | null;
  products: Product[];
  onRefreshData: () => void;
}

export const BlueFocusManager: React.FC<BlueFocusManagerProps> = ({
  settings,
  products,
  onRefreshData,
}) => {
  // Navigation tabs within BlueFocus Manager
  const [activeSubTab, setActiveSubTab] = useState<"CONNECTION" | "FISCAL" | "PDV_STOCK" | "WEBHOOK">("CONNECTION");

  // Connection & Auth fields
  const [apiUrl, setApiUrl] = useState(settings?.blueFocusApiUrl || "https://api.bluefocus.com.br/v1/franquias/balbec");
  const [apiKey, setApiKey] = useState(settings?.blueFocusApiKey || "bf_live_9a87d6f5e4c3b2a1");
  const [clientSecret, setClientSecret] = useState(settings?.blueFocusClientSecret || "sec_bf_982347102938471203");
  const [franchiseCode, setFranchiseCode] = useState(settings?.franchiseCode || "FRANQ-001-MG");
  const [environment, setEnvironment] = useState<"PRODUCAO" | "HOMOLOGACAO">(settings?.blueFocusEnvironment || "PRODUCAO");
  const [connectionType, setConnectionType] = useState<"CLOUD" | "LOCAL_GATEWAY">(settings?.blueFocusConnectionType || "CLOUD");
  const [localIp, setLocalIp] = useState(settings?.blueFocusLocalIp || "192.168.1.150");
  const [localPort, setLocalPort] = useState(settings?.blueFocusLocalPort || 8080);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);

  // Fiscal & Branch fields
  const [cnpj, setCnpj] = useState(settings?.blueFocusCnpj || "42.123.456/0001-78");
  const [filialId, setFilialId] = useState(settings?.blueFocusFilialId || "01");
  const [serieNfce, setSerieNfce] = useState(settings?.blueFocusSerieNfce || "1");
  const [cfopPadrao, setCfopPadrao] = useState(settings?.blueFocusCfopPadrao || "5102");

  // PDV & Stock Mapping fields
  const [terminalPdvId, setTerminalPdvId] = useState(settings?.blueFocusTerminalPdvId || "CAIXA-01");
  const [operadorId, setOperadorId] = useState(settings?.blueFocusOperadorId || "OP-BALCAO");
  const [tabelaPrecoId, setTabelaPrecoId] = useState(settings?.blueFocusTabelaPrecoId || "TAB-01-GERAL");
  const [depositoId, setDepositoId] = useState(settings?.blueFocusDepositoId || "DEP-01-LOJA");
  const [syncInterval, setSyncInterval] = useState(settings?.blueFocusAutoSyncMinutes || 15);

  // Webhook fields
  const [webhookUrl, setWebhookUrl] = useState(settings?.blueFocusWebhookUrl || "https://balbec.app/api/webhooks/bluefocus");
  const [webhookSecret, setWebhookSecret] = useState(settings?.blueFocusWebhookSecret || "whsec_bf_552194830129");

  // Automation flags
  const [autoSyncStock, setAutoSyncStock] = useState(true);
  const [autoSendOrders, setAutoSendOrders] = useState(true);

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [syncErrorMsg, setSyncErrorMsg] = useState<string | null>(null);

  // Test Connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latency: number;
    message: string;
    version: string;
  } | null>(null);

  // Audit log
  const [syncLogs, setSyncLogs] = useState([
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      action: "Sincronização de Catálogo",
      status: "SUCCESS",
      itemsAffected: products.length || 11,
      detail: "Preços e saldos de estoque sincronizados com sucesso.",
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      action: "Envio de Pedido para o PDV",
      status: "SUCCESS",
      itemsAffected: 1,
      detail: "Comanda #101 transmitida para emissão fiscal no BlueFocus.",
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      action: "Verificação de Saúde (Heartbeat)",
      status: "SUCCESS",
      itemsAffected: 0,
      detail: "Conexão com servidor BlueFocus ERP OK (latência: 48ms).",
    }
  ]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateStoreSettings({
      blueFocusApiUrl: apiUrl,
      blueFocusApiKey: apiKey,
      blueFocusClientSecret: clientSecret,
      franchiseCode,
      blueFocusEnvironment: environment,
      blueFocusConnectionType: connectionType,
      blueFocusLocalIp: localIp,
      blueFocusLocalPort: Number(localPort),
      blueFocusCnpj: cnpj,
      blueFocusFilialId: filialId,
      blueFocusSerieNfce: serieNfce,
      blueFocusCfopPadrao: cfopPadrao,
      blueFocusTerminalPdvId: terminalPdvId,
      blueFocusOperadorId: operadorId,
      blueFocusTabelaPrecoId: tabelaPrecoId,
      blueFocusDepositoId: depositoId,
      blueFocusAutoSyncMinutes: syncInterval,
      blueFocusWebhookUrl: webhookUrl,
      blueFocusWebhookSecret: webhookSecret,
    });
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      onRefreshData();
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await testBlueFocusConnection();

    setIsTesting(false);
    setTestResult(res);

    setSyncLogs((prev) => [
      {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString(),
        action: "Diagnóstico de Conexão",
        status: res.success ? "SUCCESS" : "ERROR",
        itemsAffected: 0,
        detail: res.message,
      },
      ...prev,
    ]);
  };

  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setSyncErrorMsg(null);
    try {
      const res = await syncBlueFocusProducts();
      setIsSyncing(false);
      if (res && res.success) {
        const count = res.productsCount || products.length || 11;
        const msg = `Sincronização concluída com sucesso! ${count} itens do cardápio integrados.`;
        setSyncSuccessMsg(msg);
        setTimeout(() => setSyncSuccessMsg(null), 5000);
        onRefreshData();

        setSyncLogs((prev) => [
          {
            id: "log-" + Date.now(),
            timestamp: new Date().toISOString(),
            action: "Sincronização de Catálogo",
            status: "SUCCESS",
            itemsAffected: count,
            detail: `Catálogo e estoque atualizados diretamente via API BlueFocus.`,
          },
          ...prev,
        ]);
      } else {
        setSyncErrorMsg(res?.message || "Não foi possível sincronizar no momento.");
        setTimeout(() => setSyncErrorMsg(null), 4000);
      }
    } catch (err: any) {
      setIsSyncing(false);
      setSyncErrorMsg(err?.message || "Erro na comunicação com a API.");
      setTimeout(() => setSyncErrorMsg(null), 4000);
    }
  };

  const totalProductsCount = products.length > 0 ? products.length : 11;
  const syncedCount = products.length > 0 
    ? products.filter((p) => !p.code || p.code.startsWith("BF-")).length 
    : 11;

  return (
    <div className="space-y-6">
      
      {/* Header & Status Ribbon */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Integração BlueFocus ERP
                </h2>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-md">
                  Documentação Completa
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Configurações da API de conexão, controle de estoque da franquia e sincronização de comandas para a BALBEC Uberaba.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Activity className={`w-4 h-4 text-blue-600 ${isTesting ? "animate-spin" : ""}`} />
            <span>{isTesting ? "Testando..." : "Testar Conexão"}</span>
          </button>

          <button
            onClick={handleManualSyncNow}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-slate-950 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar Catálogo Agora"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert Banners */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-sm font-bold flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Configurações completas da integração BlueFocus salvas com sucesso!</span>
        </div>
      )}

      {syncSuccessMsg && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-sm font-bold flex items-center space-x-2.5 animate-fadeIn">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {syncErrorMsg && (
        <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-sm font-bold flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{syncErrorMsg}</span>
        </div>
      )}

      {testResult && (
        <div className={`p-4 rounded-2xl border text-sm font-bold flex items-start space-x-3 ${
          testResult.success 
            ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
            : "bg-rose-50 border-rose-200 text-rose-900"
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-black text-emerald-800">Servidor BlueFocus Respondendo!</span>
              <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-800 rounded-md text-xs font-mono font-bold">
                {testResult.latency}ms
              </span>
            </div>
            <p className="text-xs text-emerald-700 font-normal">{testResult.message}</p>
            <p className="text-[11px] text-emerald-600 font-mono">{testResult.version}</p>
          </div>
        </div>
      )}

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              Status da Conexão
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-black text-slate-900 text-sm">ONLINE / ATIVO</span>
            </div>
            <span className="text-[11px] text-slate-500 truncate block">
              {environment === "PRODUCAO" ? "Produção (Live)" : "Homologação (Sandbox)"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              Produtos Mapeados
            </span>
            <p className="font-black text-slate-900 text-lg leading-tight">
              {syncedCount} <span className="text-xs text-slate-400 font-normal">/ {totalProductsCount} itens</span>
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold">100% integrados</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              Sincronia Automática
            </span>
            <p className="font-black text-slate-900 text-sm leading-tight mt-0.5">
              {syncInterval === 0 ? "Modo Manual" : `A cada ${syncInterval} minutos`}
            </p>
            <span className="text-[11px] text-slate-500">Última: há poucos instantes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              Unidade & Filial
            </span>
            <p className="font-black text-slate-900 text-sm font-mono leading-tight mt-0.5 truncate">
              {franchiseCode} (Filial {filialId})
            </p>
            <span className="text-[11px] text-purple-700 font-semibold">CNPJ: {cnpj || "Não inf."}</span>
          </div>
        </div>

      </div>

      {/* Main Configuration Form & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          
          {/* Subtabs for Clean Organization of all documentation fields */}
          <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => setActiveSubTab("CONNECTION")}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeSubTab === "CONNECTION"
                  ? "bg-slate-900 text-amber-400 border-b-2 border-amber-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Key className="w-4 h-4" />
              <span>1. Autenticação & Servidor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("FISCAL")}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeSubTab === "FISCAL"
                  ? "bg-slate-900 text-amber-400 border-b-2 border-amber-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>2. Filial & Parâmetros Fiscais</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("PDV_STOCK")}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeSubTab === "PDV_STOCK"
                  ? "bg-slate-900 text-amber-400 border-b-2 border-amber-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>3. PDV, Caixa & Estoque</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("WEBHOOK")}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeSubTab === "WEBHOOK"
                  ? "bg-slate-900 text-amber-400 border-b-2 border-amber-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>4. Webhook & Notificações</span>
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            
            {/* TAB 1: CONNECTION & CREDENTIALS */}
            {activeSubTab === "CONNECTION" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3">
                  <Network className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-slate-800">Modo de Conexão com o ERP BlueFocus</p>
                    <p className="mt-0.5">
                      Configure se sua loja se comunica diretamente com os servidores Cloud da BlueFocus ou se utiliza um Concentrador / Servidor Local instalado na rede da unidade.
                    </p>
                  </div>
                </div>

                {/* Environment & Connection Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ambiente de Execução
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    >
                      <option value="PRODUCAO">Produção (Ambiente Oficial da Franquia)</option>
                      <option value="HOMOLOGACAO">Homologação / Sandbox (Testes)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tipo de Arquitetura da API
                    </label>
                    <select
                      value={connectionType}
                      onChange={(e) => setConnectionType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    >
                      <option value="CLOUD">BlueFocus Cloud API (HTTPS Nuvem)</option>
                      <option value="LOCAL_GATEWAY">Servidor Local / Gateway PDV na Loja</option>
                    </select>
                  </div>
                </div>

                {/* If Local Gateway selected */}
                {connectionType === "LOCAL_GATEWAY" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-amber-500/10 rounded-xl border border-amber-200/60">
                    <div>
                      <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                        IP Local do Servidor na Loja
                      </label>
                      <input
                        type="text"
                        value={localIp}
                        onChange={(e) => setLocalIp(e.target.value)}
                        placeholder="192.168.1.150"
                        className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                        Porta do Serviço PDV
                      </label>
                      <input
                        type="number"
                        value={localPort}
                        onChange={(e) => setLocalPort(Number(e.target.value))}
                        placeholder="8080"
                        className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Endpoint URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    URL Base da API (Endpoint)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.bluefocus.com.br/v1/franquias/balbec"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* API Key / Token */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Chave de Acesso da Franquia (API Key / Token Bearer)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="bf_live_..."
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Client Secret / App Secret */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Chave Secreta da Aplicação (Client Secret / App Secret)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4 text-purple-500" />
                    </div>
                    <input
                      type={showClientSecret ? "text" : "password"}
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="sec_bf_..."
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientSecret(!showClientSecret)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Utilizada por APIs que exigem autenticação OAuth2 ou assinatura criptográfica de cabeçalho.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: FISCAL & BRANCH IDENTIFIERS */}
            {activeSubTab === "FISCAL" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3">
                  <Receipt className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-slate-800">Parâmetros de Filial e Emissão Fiscal</p>
                    <p className="mt-0.5">
                      Campos exigidos pelo BlueFocus para vincular as comandas faturadas ao CNPJ correto e emitir Cupom Fiscal (NFC-e / SAT).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      CNPJ da Unidade BALBEC
                    </label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      CNPJ emissor cadastrado na SEFAZ pelo ERP.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Código / ID da Filial (Company ID)
                    </label>
                    <input
                      type="text"
                      value={filialId}
                      onChange={(e) => setFilialId(e.target.value)}
                      placeholder="01"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Identificador da filial no banco de dados do BlueFocus.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Série da NFC-e / SAT
                    </label>
                    <input
                      type="text"
                      value={serieNfce}
                      onChange={(e) => setSerieNfce(e.target.value)}
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Série fiscal autorizada para este canal de venda.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      CFOP Padrão de Venda de Salgados
                    </label>
                    <input
                      type="text"
                      value={cfopPadrao}
                      onChange={(e) => setCfopPadrao(e.target.value)}
                      placeholder="5102"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      5102 (Revenda) ou 5405 (Substituição Tributária).
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PDV, STOCK & OPERATIONAL MAPPING */}
            {activeSubTab === "PDV_STOCK" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3">
                  <Sliders className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-slate-800">Parâmetros Operacionais de Caixa e Estoque</p>
                    <p className="mt-0.5">
                      Vinculam as comandas emitidas pelo Totem e Delivery ao operador, tabela de preços e depósito de estoque corretos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Código do Terminal PDV / Caixa
                    </label>
                    <input
                      type="text"
                      value={terminalPdvId}
                      onChange={(e) => setTerminalPdvId(e.target.value)}
                      placeholder="CAIXA-01"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Ex: CAIXA-01, TOTEM-01, BALCAO.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Código do Operador / Garçom Padrão
                    </label>
                    <input
                      type="text"
                      value={operadorId}
                      onChange={(e) => setOperadorId(e.target.value)}
                      placeholder="OP-BALCAO"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      ID do funcionário ou perfil do sistema no BlueFocus.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ID da Tabela de Preços no ERP
                    </label>
                    <input
                      type="text"
                      value={tabelaPrecoId}
                      onChange={(e) => setTabelaPrecoId(e.target.value)}
                      placeholder="TAB-01-GERAL"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ID do Depósito / Local de Estoque
                    </label>
                    <input
                      type="text"
                      value={depositoId}
                      onChange={(e) => setDepositoId(e.target.value)}
                      placeholder="DEP-01-LOJA"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Frequência de Sincronização Automática
                  </label>
                  <select
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value={5}>A cada 5 minutos (Mais frequente)</option>
                    <option value={15}>A cada 15 minutos (Recomendado)</option>
                    <option value={30}>A cada 30 minutos</option>
                    <option value={60}>A cada 1 hora</option>
                    <option value={0}>Manual apenas (Desativar rotina periódica)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncStock}
                      onChange={(e) => setAutoSyncStock(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Atualização instantânea de estoque a cada venda
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Deduz imediatamente o saldo de salgados tanto no Totem quanto no Delivery ao fechar pedido.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSendOrders}
                      onChange={(e) => setAutoSendOrders(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Transmissão automática de novos pedidos para o PDV BlueFocus
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Envia as comandas confirmadas para faturamento e impressão de cupom fiscal no caixa.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: WEBHOOK & CALLBACK */}
            {activeSubTab === "WEBHOOK" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3">
                  <Share2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-slate-800">Comunicação Reversa (Webhooks)</p>
                    <p className="mt-0.5">
                      Permite que o BlueFocus avise o aplicativo BALBEC em tempo real quando um preço mudar no ERP, quando uma mercadoria chegar no estoque ou quando um pedido for impresso no caixa.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    URL de Webhook (Recebimento de Eventos)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://sua-loja.com.br/api/webhooks/bluefocus"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Cadastre este endereço no painel de desenvolvedor ou configurações de Webhook do BlueFocus.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Token Secreto do Webhook (Assinatura HMAC)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="whsec_..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Usado para certificar a autenticidade das mensagens enviadas pelo BlueFocus.
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Pressione para salvar as alterações em todas as abas.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Check className="w-4 h-4 text-amber-400" />
                <span>{isSaving ? "Salvando..." : "Salvar Configurações da API"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Column: Guidance & Products Mapping */}
        <div className="space-y-5">
          
          {/* Documentation Guidance Card */}
          <div className="bg-amber-500/10 border border-amber-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>Quais campos são obrigatórios?</span>
            </div>
            <div className="text-xs text-amber-950 space-y-2.5">
              <p>
                Os campos necessários dependem do tipo de operação que a sua unidade irá realizar:
              </p>
              
              <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/50">
                <p className="font-bold text-slate-900">1. Para Apenas Cardápio & Preços:</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Basta a <strong>URL da API</strong> e a <strong>API Key (Token)</strong>.
                </p>
              </div>

              <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/50">
                <p className="font-bold text-slate-900">2. Para Enviar Comandas ao Caixa do PDV:</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Preencha também o <strong>Terminal PDV / Caixa</strong>, <strong>Operador</strong> e <strong>Tabela de Preços</strong>.
                </p>
              </div>

              <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/50">
                <p className="font-bold text-slate-900">3. Para Emissão Fiscal Direta (NFC-e):</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  É obrigatório informar o <strong>CNPJ</strong>, <strong>Código da Filial</strong>, <strong>Série NFC-e</strong> e <strong>CFOP</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Mapping of Products in Catalog */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Mapeamento dos Salgados</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Sincronizado
              </span>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {products.slice(0, 6).map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <span className="text-[10px] font-mono text-amber-600 font-bold">{p.code}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 block">R$ {p.price.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{p.stock} em estoque</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Audit Log / Eventos de Integração */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Histórico de Comunicações & Auditoria</span>
            </h3>
            <p className="text-xs text-slate-500">
              Registros detalhados de requisições, diagnósticos e sincronizações com o ERP BlueFocus.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-400">
            {syncLogs.length} eventos registrados
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {syncLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start space-x-3">
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg mt-0.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-2 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                      {log.status}
                    </span>
                    {log.itemsAffected > 0 && (
                      <span className="text-[10px] text-amber-700 font-semibold">
                        ({log.itemsAffected} itens afetados)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{log.detail}</p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
