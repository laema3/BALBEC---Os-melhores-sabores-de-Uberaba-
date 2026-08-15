import React, { useState } from "react";
import { Client } from "../../types";
import { loginClient } from "../../services/api";
import { X, Building, Lock, LogIn, AlertCircle, Sparkles } from "lucide-react";

interface ClientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (client: Client) => void;
  onSwitchToRegister: () => void;
}

export const ClientLoginModal: React.FC<ClientLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [cnpj, setCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnpj.trim() || !password.trim()) {
      setErrorMessage("Informe o CNPJ e a senha.");
      return;
    }

    setIsSubmitting(true);
    const result = await loginClient(cnpj.trim(), password.trim());
    setIsSubmitting(false);

    if (result.success && result.client) {
      onLoginSuccess(result.client);
      onClose();
    } else {
      setErrorMessage(result.error || "CNPJ ou senha inválidos.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E9ECEF] rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl text-[#2D3436]">
        
        <div className="bg-[#F8F9FA] p-6 border-b border-[#E9ECEF] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#2D3436]">Login BALBEC Cliente</h2>
              <p className="text-xs text-[#D97706] font-bold">Acesse com seu CNPJ e senha cadastrados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#636E72] hover:text-[#2D3436] hover:bg-[#E9ECEF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1">CNPJ (Login)</label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#B2BEC3] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B2BEC3] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha cadastrada"
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#F59E0B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-2xl shadow-md flex items-center justify-center space-x-2 text-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Entrar no Sistema</span>
            </button>
          </form>

          <div className="pt-3 border-t border-[#E9ECEF] text-center">
            <p className="text-xs text-[#636E72]">
              Não tem cadastro ainda?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToRegister();
                }}
                className="text-[#D97706] font-black hover:underline"
              >
                Cadastre-se aqui
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
