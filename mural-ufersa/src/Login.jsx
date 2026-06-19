import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nome, setNome] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [modo, setModo] = useState("login");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [reenviarCarregando, setReenviarCarregando] = useState(false);
  const { login, signUp, confirmSignUp, resendSignUpCode } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");
    try {
      await login(email, senha);
      navigate("/");
    } catch (error) {
      setMensagem(
        error.message || "Erro ao fazer login. Verifique as credenciais.",
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");
    try {
      await signUp(email, senha, {
        phoneNumber: telefone,
        name: nome,
      });
      setModo("confirmacao");
      setMensagem(
        "Cadastro criado. Verifique o e-mail para confirmar o código.",
      );
    } catch (error) {
      setMensagem(error.message || "Erro ao criar usuário.");
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmacao = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");
    try {
      await confirmSignUp(email, confirmacao);
      setMensagem("Conta confirmada. Agora faça login.");
      setModo("login");
    } catch (error) {
      setMensagem(error.message || "Erro ao confirmar cadastro.");
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setReenviarCarregando(true);
    setMensagem("");
    try {
      await resendSignUpCode(email);
      setMensagem("Código reenviado. Verifique sua caixa de entrada.");
    } catch (error) {
      setMensagem(error.message || "Erro ao reenviar código.");
    } finally {
      setReenviarCarregando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
        {modo === "login" && "Acesso ao Mural"}
        {modo === "cadastro" && "Criar conta"}
        {modo === "confirmacao" && "Confirmar cadastro"}
      </h2>

      {mensagem && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          {mensagem}
        </div>
      )}

      {modo === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              E-mail da UFERSA
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2 border"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-900 text-white py-2 rounded-md font-bold hover:bg-blue-950transition-colors disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
          <button
            type="button"
            onClick={() => setModo("cadastro")}
            className="w-full border border-blue-200 text-blue-900 py-2 rounded-md font-bold hover:bg-blue-50 transition-colors"
          >
            Criar conta
          </button>
        </form>
      )}

      {modo === "cadastro" && (
        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Nome completo
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Telefone
            </label>
            <input
              type="tel"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="+5599999999999"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2 border"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-900 text-white py-2 rounded-md font-bold hover:bg-blue-950 transition-colors disabled:opacity-60"
          >
            {carregando ? "Criando..." : "Criar conta"}
          </button>
          <button
            type="button"
            onClick={() => setModo("login")}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded-md font-bold hover:bg-gray-50 transition-colors"
          >
            Voltar para login
          </button>
        </form>
      )}

      {modo === "confirmacao" && (
        <form onSubmit={handleConfirmacao} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Código de confirmação
            </label>
            <input
              type="text"
              required
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2 border"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-900 text-white py-2 rounded-md font-bold hover:bg-blue-950 transition-colors disabled:opacity-60"
          >
            {carregando ? "Confirmando..." : "Confirmar conta"}
          </button>
          <button
            type="button"
            onClick={handleReenviarCodigo}
            disabled={reenviarCarregando}
            className="w-full border border-blue-900 text-blue-900 py-2 rounded-md font-bold hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            {reenviarCarregando ? "Reenviando..." : "Reenviar código"}
          </button>
          <button
            type="button"
            onClick={() => setModo("login")}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded-md font-bold hover:bg-gray-50 transition-colors"
          >
            Ir para login
          </button>
        </form>
      )}
    </div>
  );
}
