import React, { useState } from "react";
import { FileText, Download, Printer, CheckCircle2, DollarSign, Building2, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export function ProposalsView() {
  const [selectedProposal, setSelectedProposal] = useState<"SETUP" | "RECURRENCE">("SETUP");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center justify-center font-black text-2xl shadow-sm">
            📄
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#2D3436]">Propostas Comerciais • BALBEC Uberaba</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                Pronto para PDF / Impressão
              </span>
            </div>
            <p className="text-xs text-[#636E72] mt-0.5">
              Documentação comercial detalhada para Implantação e Recorrência (Específico para o maior movimento de Uberaba).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSelectedProposal("SETUP")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedProposal === "SETUP"
                ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-[#F59E0B]/20"
                : "bg-white text-[#636E72] border border-[#E9ECEF] hover:bg-[#F8F9FA]"
            }`}
          >
            1. Proposta de Implantação (Setup)
          </button>
          <button
            onClick={() => setSelectedProposal("RECURRENCE")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedProposal === "RECURRENCE"
                ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-[#F59E0B]/20"
                : "bg-white text-[#636E72] border border-[#E9ECEF] hover:bg-[#F8F9FA]"
            }`}
          >
            2. Proposta de Recorrência (SaaS)
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#2D3436] hover:bg-black text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-[#F59E0B]" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Proposal Document Preview Container */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-[32px] p-8 sm:p-12 shadow-xl max-w-4xl mx-auto space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b-2 border-[#E9ECEF] pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-3xl font-black text-[#D97706]">
              🥐
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2D3436] tracking-tight">
                BALBEC SALGADOS • UBERABA/MG
              </h1>
              <p className="text-xs font-bold text-[#D97706] uppercase tracking-wider mt-1">
                {selectedProposal === "SETUP" ? "Proposta Comercial • Implantação e Setup Tecnológico" : "Proposta Comercial • Recorrência Mensal & Suporte Operacional (SaaS)"}
              </p>
            </div>
          </div>
          <div className="text-right sm:text-right text-xs text-[#636E72] space-y-1 bg-[#F8F9FA] p-4 rounded-2xl border border-[#E9ECEF] w-full sm:w-auto">
            <p className="font-bold text-[#2D3436]">Referência: Mercado Uberaba-MG</p>
            <p>Data: Agosto de 2026</p>
            <p className="text-[10px] text-[#D97706] font-bold">Validade: 15 dias</p>
          </div>
        </div>

        {/* PROPOSAL 1: SETUP / IMPLANTAÇÃO */}
        {selectedProposal === "SETUP" && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-[#FEF3C7]/40 border-2 border-[#FDE68A] rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-black text-[#2D3436] flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#D97706]" />
                <span>Resumo Executivo do Projeto</span>
              </h3>
              <p className="text-sm text-[#2D3436] leading-relaxed">
                Considerando que a <strong>BALBEC</strong> é a salgaderia mais tradicional, movimentada e querida de <strong>Uberaba-MG</strong>, este projeto entrega uma infraestrutura digital de altíssimo desempenho para absorver o enorme fluxo de clientes no balcão, no salão (via Totem de Autoatendimento) e no Delivery próprio, eliminando a dependência excessiva de comissões de marketplaces terceirizados (que cobram de 12% a 25% por pedido).
              </p>
            </div>

            {/* Scope of Work */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#2D3436] border-b border-[#E9ECEF] pb-2">
                1. Escopo da Implantação (Setup Único)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center space-x-2 text-[#D97706] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                    <span>Totem de Autoatendimento Presencial</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Interface interativa otimizada para tablets ou totens touch no salão da BALBEC em Uberaba, permitindo que clientes façam pedidos sozinhos e paguem via Pix ou Cartão.
                  </p>
                </div>

                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center space-x-2 text-[#D97706] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                    <span>Painel de TV para Cozinha & Chamada</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Monitor de senhas em tempo real instalado na parede para chamada visual de pedidos ("Em Preparação" e "Pronto para Retirada"), agilizando o balcão.
                  </p>
                </div>

                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center space-x-2 text-[#D97706] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                    <span>Plataforma de Delivery Web Própria</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Cardápio digital com carrinho, cálculo de frete por bairro em Uberaba, cadastro de clientes com aprovação gerencial e envio direto de pedidos via WhatsApp.
                  </p>
                </div>

                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center space-x-2 text-[#D97706] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                    <span>Integração ERP BlueFocus & Estoque</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Sincronização de catálogo, preços e controle de estoque em tempo real para evitar venda de salgados esgotados nos horários de pico.
                  </p>
                </div>
              </div>
            </div>

            {/* Investment Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#2D3436] border-b border-[#E9ECEF] pb-2">
                2. Investimento de Implantação (Valor Único)
              </h3>
              
              <div className="bg-[#2D3436] text-white rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-mono text-[#F59E0B] uppercase font-bold tracking-widest block">Pacote Turnkey Completo</span>
                  <h4 className="text-2xl font-black mt-1">Setup, Configuração & Treinamento em Uberaba</h4>
                  <p className="text-xs text-slate-300 mt-1">Inclui parametrização de catálogo, layout visual, testes e homologação.</p>
                </div>
                <div className="text-right sm:text-right bg-white/10 px-6 py-4 rounded-xl border border-white/10 w-full sm:w-auto">
                  <span className="text-[10px] text-slate-300 uppercase block font-bold">Valor Total de Implantação</span>
                  <span className="text-3xl font-black text-[#F59E0B]">R$ 5.500,00</span>
                  <span className="text-[10px] text-slate-300 block mt-0.5">ou 3x de R$ 1.833,33</span>
                </div>
              </div>
            </div>

            {/* Implementation Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#2D3436] border-b border-[#E9ECEF] pb-2">
                3. Cronograma de Entrega (5 a 7 Dias Úteis)
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#D97706] font-black flex items-center justify-center shrink-0 border border-[#FDE68A]">1</span>
                  <div>
                    <p className="font-bold text-[#2D3436]">Dia 1 e 2: Configuração do Ambiente e Identidade Visual</p>
                    <p className="text-[#636E72]">Ajuste da logomarca da BALBEC, cores da franquia em Uberaba e importação do catálogo de salgados fritos, assados e bebidas.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#D97706] font-black flex items-center justify-center shrink-0 border border-[#FDE68A]">2</span>
                  <div>
                    <p className="font-bold text-[#2D3436]">Dia 3 e 4: Integração BlueFocus e Homologação de Pagamentos</p>
                    <p className="text-[#636E72]">Conexão com o ERP e testes de fluxo de Pix, Dinheiro e Cartão nos terminais de atendimento.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#D97706] font-black flex items-center justify-center shrink-0 border border-[#FDE68A]">3</span>
                  <div>
                    <p className="font-bold text-[#2D3436]">Dia 5 a 7: Treinamento da Equipe & Virada de Chave (Go-Live)</p>
                    <p className="text-[#636E72]">Capacitação dos caixas, gerentes e atendentes em Uberaba, com acompanhamento no primeiro fim de semana de alto movimento.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROPOSAL 2: RECURRENCE / SAAS */}
        {selectedProposal === "RECURRENCE" && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-[#FEF3C7]/40 border-2 border-[#FDE68A] rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-black text-[#2D3436] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#D97706]" />
                <span>Garantia de Alta Performance e Suporte Contínuo</span>
              </h3>
              <p className="text-sm text-[#2D3436] leading-relaxed">
                Para manter a operação da salgaderia mais movimentada de Uberaba funcionando sem interrupções nos horários de pico (finais de tarde, fins de semana e feriados), o plano de recorrência (SaaS) assegura infraestrutura em nuvem de alta disponibilidade, atualizações constantes de segurança e suporte técnico prioritário.
              </p>
            </div>

            {/* Scope of Recurrence */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#2D3436] border-b border-[#E9ECEF] pb-2">
                1. O que está Incluso na Recorrência Mensal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center space-x-2 text-[#D97706] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                    <span>Hospedagem em Nuvem & Domínio Seguro</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Servidores redundantes de alta velocidade preparados para suportar picos intensos de acesso simultâneo em Uberaba sem queda de sistema.
                  </p>
                </div>

                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center space-x-2 text-[#D97706] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                    <span>Suporte Técnico Prioritário (WhatsApp & Remoto)</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Atendimento rápido para gerentes e operadores em horário comercial e de pico operacional da loja.
                  </p>
                </div>

                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center space-x-2 text-[#D97706] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                    <span>Manutenção da Integração BlueFocus</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Atualizações automáticas de estoque, preços e novos produtos cadastrados no retaguarda.
                  </p>
                </div>

                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center space-x-2 text-[#D97706] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                    <span>Backups Diários & Segurança de Dados</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Proteção completa contra perda de dados de clientes, histórico de pedidos e relatórios de faturamento.
                  </p>
                </div>
              </div>
            </div>

            {/* Recurrence Investment Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#2D3436] border-b border-[#E9ECEF] pb-2">
                2. Investimento Mensal (Recorrência SaaS)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-[#FDE68A] rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold px-3 py-1 bg-[#FEF3C7] text-[#D97706] rounded-full border border-[#FDE68A]">
                      PLANO RECOMENDADO
                    </span>
                    <h4 className="text-xl font-black text-[#2D3436] mt-3">Mensalidade Fixa SaaS</h4>
                    <p className="text-xs text-[#636E72] mt-1">
                      Ideal para lojas com alto volume de vendas em Uberaba, garantindo previsibilidade financeira sem cobrança de taxas por pedido.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E9ECEF] flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-[#2D3436]">R$ 1.490</span>
                      <span className="text-xs text-[#636E72]"> / mês</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#00B894] bg-[#E6F9F5] px-2.5 py-1 rounded-lg">
                      0% de taxa por pedido
                    </span>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold px-3 py-1 bg-[#E9ECEF] text-[#636E72] rounded-full">
                      OPÇÃO HÍBRIDA
                    </span>
                    <h4 className="text-xl font-black text-[#2D3436] mt-3">Base Fixa + Percentual Reduzido</h4>
                    <p className="text-xs text-[#636E72] mt-1">
                      Mensalidade menor com repasse de 1,5% sobre o volume transacionado pelo sistema próprio.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E9ECEF] flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-[#2D3436]">R$ 790</span>
                      <span className="text-xs text-[#636E72]"> / mês + 1,5%</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-lg">
                      Parceria Ativa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Justification for Uberaba */}
            <div className="bg-[#E6F9F5] border border-[#00B894]/30 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-black text-[#00B894] flex items-center space-x-2">
                <span>💡 Retorno sobre o Investimento (ROI) para a BALBEC em Uberaba</span>
              </h4>
              <p className="text-xs text-[#2D3436] leading-relaxed">
                Considerando que a BALBEC é a referência máxima em Uberaba com milhares de salgados vendidos semanalmente, migrar pedidos de marketplaces terceirizados (taxas de 15% a 25%) para o canal próprio economiza <strong>dezenas de milhares de reais por mês</strong> em taxas. A mensalidade do SaaS é paga logo nos primeiros dias de operação do mês.
              </p>
            </div>
          </div>
        )}

        {/* Footer Signoff */}
        <div className="pt-8 border-t-2 border-[#E9ECEF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#636E72] gap-4">
          <div>
            <p className="font-bold text-[#2D3436]">BALBEC Salgados Franquia • Uberaba-MG</p>
            <p>Desenvolvido com Tecnologia Exclusiva & Integração BlueFocus</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold text-[#D97706]">Aprovado por: ___________________________</span>
          </div>
        </div>

      </div>
    </div>
  );
}
