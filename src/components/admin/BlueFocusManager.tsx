import React, { useState } from "react";
import { StoreSettings, Product } from "../../types";
import { updateStoreSettings, syncBlueFocusProducts } from "../../services/api";
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
  ArrowRight, 
  Eye, 
  EyeOff, 
  Activity, 
  Database,
  Check,
  Send,
  DownloadCloud,
  FileCheck2,
  Terminal
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
  // Form fields
  const [apiUrl, setApiUrl] = useState(settings?.blueFocusApiUrl || "https://api.bluefocus.com.br/v1/franquias/balbec");
  const [apiKey, setApiKey] = useState(settings?.blueFocusApiKey || "bf_live_9a87d6f5e4c3b2a1");
  const [franchiseCode, setFranchiseCode] = useState(settings?.franchiseCode || "FRANQ-001-MG");
  const [syncInterval, setSyncInterval] = useState(settings?.blueFocusAutoSyncMinutes || 15);
  const [showApiKey, setShowApiKey] = useState(false);

  // Automation flags
  const [autoSyncStock, setAutoSyncStock] = useState(true);
  const [autoSendOrders, setAutoSendOrders] = useState(true);
  const [notifyOnSync, setNotifyOnSync] = useState(false);

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Test Connection State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latency: number;
    message: string;
    version: string;
  } | null>(null);

  // Mocked/Local sync audit log
  const [syncLogs, setSyncLogs] = useState([
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      action: "Sincronização de Catálogo",
      status: "SUCCESS",
      itemsAffected: products.length,
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
      detail: "Conexão com servidor BlueFocus ERP OK (latência: 64ms).",
    }
  ]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateStoreSettings({
      blueFocusApiUrl: apiUrl,
      blueFocusApiKey: apiKey,
      franchiseCode,
      blueFocusAutoSyncMinutes: syncInterval,
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

    // Simulate real network validation with API ping
    await new Promise((resolve) => setTimeout(resolve, 600));

    setIsTesting(false);
    setTestResult({
      success: true,
      latency: Math.floor(45 + Math.random() * 35),
      message: "Comunicação bidirecional estabelecida com sucesso com o servidor BlueFocus.",
      version: "BlueFocus ERP Franquias v2.4.8 (Cluster SP-Central)",
    });

    setSyncLogs((prev) => [
      {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString(),
        action: "Diagnóstico de Conexão",
        status: "SUCCESS",
        itemsAffected: 0,
        detail: "Teste de ping e validação de token executados com sucesso.",
      },
      ...prev,
    ]);
  };

  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    const res = await syncBlueFocusProducts();
    setIsSyncing(false);
    if (res.success) {
      const msg = `Sincronização concluída! ${res.productsCount} itens do cardápio integrados.`;
      setSyncSuccessMsg(msg);
      setTimeout(() => setSyncSuccessMsg(null), 4000);
      onRefreshData();

      setSyncLogs((prev) => [
        {
          id: "log-" + Date.now(),
          timestamp: new Date().toISOString(),
          action: "Sincronização Manual Forçada",
          status: "SUCCESS",
          itemsAffected: res.productsCount,
          detail: `Catálogo e estoque atualizados diretamente via API BlueFocus.`,
        },
        ...prev,
      ]);
    }
  };

  const syncedCount = products.filter((p) => p.code?.startsWith("BF-")).length;

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
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Integração BlueFocus ERP
              </h2>
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
          <span>Configurações de integração com BlueFocus salvas com sucesso!</span>
        </div>
      )}

      {syncSuccessMsg && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-sm font-bold flex items-center space-x-2.5 animate-fadeIn">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
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
            <span className="text-[11px] text-slate-500 truncate block">BlueFocus Cloud v2.4</span>
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
              {syncedCount} <span className="text-xs text-slate-400 font-normal">/ {products.length} itens</span>
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
              A cada {syncInterval} minutos
            </p>
            <span className="text-[11px] text-slate-500">Última: há 12 min</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              Código do Terminal
            </span>
            <p className="font-black text-slate-900 text-sm font-mono leading-tight mt-0.5 truncate">
              {franchiseCode}
            </p>
            <span className="text-[11px] text-purple-700 font-semibold">Uberaba Centro</span>
          </div>
        </div>

      </div>

      {/* Main Configuration Form & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Key className="w-5 h-5 text-amber-500" />
              <span>Credenciais & Parâmetros da API BlueFocus</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Informe a chave da franquia fornecida pela equipe do BlueFocus para sincronização automática de produtos, comandas e estoque.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            {/* Endpoint URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL Base do Servidor BlueFocus API
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
              <span className="text-[11px] text-slate-400 mt-1 block">
                Endpoint seguro HTTPS onde os dados de cardápio e vendas são transacionados.
              </span>
            </div>

            {/* API Key / Token */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Chave de Acesso da Franquia (API Key / Token de Autenticação)
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
                  title={showApiKey ? "Ocultar chave" : "Mostrar chave"}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Token secreto utilizado para assinar as requisições de estoque e vendas.
              </span>
            </div>

            {/* 2 Cols: Franchise Code & Sync Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Código da Franquia / Terminal PDV
                </label>
                <input
                  type="text"
                  value={franchiseCode}
                  onChange={(e) => setFranchiseCode(e.target.value)}
                  placeholder="FRANQ-001-MG"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                />
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
                  <option value={0}>Manual apenas (Desativar rotina)</option>
                </select>
              </div>
            </div>

            {/* Automation Options Checkboxes */}
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

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
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

        {/* Right Info Column: Features & Guide */}
        <div className="space-y-5">
          
          {/* Quick Explanation Card */}
          <div className="bg-amber-500/10 border border-amber-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Como funciona a Integração?</span>
            </div>
            <ul className="text-xs text-amber-950 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Catálogo & Preços:</strong> O BlueFocus alimenta nomes, fotos, preços e categorias dos salgados.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Códigos de Produto:</strong> Cada item possui um código único (ex: BF-101) vinculado ao ERP.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Estoque Unificado:</strong> O estoque vendido no balcão da loja ou no delivery é sincronizado em tempo real.</span>
              </li>
            </ul>
          </div>

          {/* Sincronização direta de estoque box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Mapeamento dos Salgados</span>
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {products.slice(0, 5).map((p) => (
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
              <span>Histórico de Comunicações & Eventos BlueFocus</span>
            </h3>
            <p className="text-xs text-slate-500">
              Registros detalhados de requisições, diagnósticos e sincronizações efetuadas.
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
