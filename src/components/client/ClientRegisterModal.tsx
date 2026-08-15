import React, { useState } from "react";
import { Client } from "../../types";
import { registerClient } from "../../services/api";
import { X, User, Phone, Mail, MapPin, Building, Lock, CheckCircle2, Clock, XCircle, AlertCircle, Sparkles } from "lucide-react";

interface ClientRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClient: Client | null;
  onClientUpdated: (client: Client) => void;
  onSwitchToLogin: () => void;
}

export const ClientRegisterModal: React.FC<ClientRegisterModalProps> = ({
  isOpen,
  onClose,
  currentClient,
  onClientUpdated,
  onSwitchToLogin,
}) => {
  const [name, setName] = useState(currentClient?.name || "");
  const [phone, setPhone] = useState(currentClient?.phone || "");
  const [email, setEmail] = useState(currentClient?.email || "");
  const [cnpj, setCnpj] = useState(currentClient?.cnpj || "");
  const [password, setPassword] = useState(currentClient?.password || "");
  const [street, setStreet] = useState(currentClient?.address?.street || "");
  const [number, setNumber] = useState(currentClient?.address?.number || "");
  const [neighborhood, setNeighborhood] = useState(currentClient?.address?.neighborhood || "");
  const [complement, setComplement] = useState(currentClient?.address?.complement || "");
  const [city, setCity] = useState(currentClient?.address?.city || "São Paulo");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !cnpj.trim() || !password.trim()) {
      setErrorMessage("Por favor preencha Nome, Telefone, CNPJ e Senha.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await registerClient({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      cnpj: cnpj.trim(),
      password: password.trim(),
      address: {
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        complement: complement.trim(),
        city: city.trim() || "São Paulo",
      },
    });

    setIsSubmitting(false);

    if (result.success && result.client) {
      onClientUpdated(result.client);
    } else {
      setErrorMessage(result.error || "Não foi possível cadastrar o cliente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E9ECEF] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl text-[#2D3436] relative">
        
        {/* Header */}
        <div className="bg-[#F8F9FA] p-6 border-b border-[#E9ECEF] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#2D3436]">Cadastro de Cliente BALBEC</h2>
              <p className="text-xs text-[#D97706] font-bold">Obrigatório CNPJ e Senha para ver preços e pedidos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#636E72] hover:text-[#2D3436] hover:bg-[#E9ECEF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          {currentClient && (
            <div
              className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                currentClient.status === "APPROVED"
                  ? "bg-[#E6F9F5] border-[#00B894]/30 text-[#00B894]"
                  : currentClient.status === "PENDING"
                  ? "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}
            >
              {currentClient.status === "APPROVED" && <CheckCircle2 className="w-6 h-6 text-[#00B894] shrink-0 mt-0.5" />}
              {currentClient.status === "PENDING" && <Clock className="w-6 h-6 text-[#D97706] shrink-0 mt-0.5 animate-spin" />}
              {currentClient.status === "REJECTED" && <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />}

              <div>
                <h3 className="font-bold text-sm">
                  {currentClient.status === "APPROVED" && "Cadastro Aprovado e Logado!"}
                  {currentClient.status === "PENDING" && "Fila de Aprovação — Aguardando Franqueado"}
                  {currentClient.status === "REJECTED" && "Cadastro Não Aprovado"}
                </h3>
                <p className="text-xs mt-1 opacity-90 leading-relaxed">
                  {currentClient.status === "APPROVED" &&
                    "Sua conta está ativa e verificada. Você já visualiza os preços e pode realizar pedidos."}
                  {currentClient.status === "PENDING" &&
                    "Seu cadastro foi registrado com sucesso e está na fila de aprovação pelo franqueado BALBEC."}
                  {currentClient.status === "REJECTED" &&
                    (currentClient.notes || "Seu cadastro foi recusado. Entre em contato com a loja.")}
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1">
                Nome da Empresa / Responsável <span className="text-[#D97706]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#B2BEC3] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Balbec Salgados Uberaba LTDA"
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">
                  CNPJ (Login de Acesso) <span className="text-[#D97706]">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#B2BEC3] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">
                  Senha de Acesso <span className="text-[#D97706]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#B2BEC3] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Defina sua senha"
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">
                  Telefone / WhatsApp <span className="text-[#D97706]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#B2BEC3] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(34) 98888-7777"
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">E-mail (opcional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#B2BEC3] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="empresa@email.com"
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="pt-2 border-t border-[#E9ECEF]">
              <label className="block text-xs font-bold text-[#D97706] mb-2 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4" />
                <span>Endereço Principal para Entrega (Delivery)</span>
              </label>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Rua / Avenida"
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-sm text-[#2D3436] focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Número"
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-sm text-[#2D3436] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Bairro"
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-sm text-[#2D3436] focus:outline-none"
                />
                <input
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apt / Bloco / Ref"
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-sm text-[#2D3436] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 bg-[#00B894] hover:bg-[#00A884] text-white font-black rounded-2xl shadow-md flex items-center justify-center space-x-2 text-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{currentClient ? "Atualizar Meus Dados" : "Cadastrar e Solicitar Acesso"}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-[#E9ECEF] text-center">
            <p className="text-xs text-[#636E72]">
              Já possui cadastro e senha?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }}
                className="text-[#D97706] font-black hover:underline"
              >
                Fazer Login
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
