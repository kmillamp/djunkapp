import { useState, useEffect } from "react";
import { Play, Volume2, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/unk-button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [message, setMessage] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Efeito sonoro de startup do iPod
  useEffect(() => {
    // Simula a animação de ligar
    setTimeout(() => {
      setIsAnimating(false);
      setIsPoweredOn(true);
    }, 1500);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Por favor, preencha todos os campos.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      setMessage("Login realizado com sucesso! Bem-vindo à Conexão UNK.");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error("Erro no login:", error);
      setMessage("Erro ao fazer login. Verifique suas credenciais.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-4 sm:p-8 font-inter">
      {/* Container principal para o iPod */}
      <div className="relative">
        {/* iPod Body - Branco realista */}
        <div
          className="w-80 h-[650px] bg-gradient-to-b from-white via-gray-50 to-gray-100 rounded-[60px] border border-gray-200 relative overflow-hidden"
          style={{
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.05),
              0 2px 4px rgba(0,0,0,0.1),
              0 8px 16px rgba(0,0,0,0.15),
              0 16px 32px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8),
              inset 0 -1px 0 rgba(0,0,0,0.05)
            `
          }}
        >
          {/* Brilho superior realista */}
          <div className="absolute top-0 left-4 right-4 h-6 bg-gradient-to-b from-white/80 to-transparent rounded-t-[30px]"></div>

          {/* Tela LCD escura */}
          <div className="relative mx-6 mt-6 mb-8">
            <div
              className="h-72 bg-gradient-to-b from-gray-900 to-black rounded-lg relative overflow-hidden border border-gray-800"
              style={{
                boxShadow: `
                  inset 0 2px 4px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(0,0,0,0.4)
                `
              }}
            >
              {/* Reflexo da tela animado */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent animate-shimmer"></div>

              {/* Animação de ligar */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
                <div className="relative w-24 h-24">
                  <div className="w-full h-full border-4 border-white rounded-full animate-ping slow absolute inset-0"></div>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <Volume2 className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo da tela (visível após a animação) */}
              <div className={`relative z-10 p-6 h-full flex flex-col transition-opacity duration-1000 ${isPoweredOn ? 'opacity-100' : 'opacity-0'}`}>
                {/* Cabeçalho da tela */}
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Conexão UNK</h3>
                  <p className="text-xs text-gray-400">Bem-Vindo</p>
                </div>

                {/* Login Form */}
                <div className="space-y-3 flex-1">
                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-2.5">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-2.5">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-9 pr-10 py-2.5 bg-gray-800/50 border border-gray-700 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Lembre-me */}
                  <div className="flex items-center justify-between text-xs pt-2">
                    <label className="flex items-center space-x-2 text-gray-400">
                      <input type="checkbox" className="w-3 h-3 rounded border-gray-600 bg-gray-800" />
                      <span>Lembrar</span>
                    </label>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      Esqueceu?
                    </button>
                  </div>
                </div>

                {/* Mensagem de status */}
                {message && (
                  <div className="text-center text-xs py-2 px-3 bg-gray-800/50 rounded-lg mt-2">
                    <p className={message.includes("sucesso") ? "text-green-400" : "text-red-400"}>
                      {message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Click Wheel - Realista */}
          <div className="relative mx-auto">
            <div
              className="w-52 h-52 rounded-full mx-auto relative bg-gradient-to-b from-gray-100 via-white to-gray-200 border border-gray-300"
              style={{
                boxShadow: `
                  0 2px 8px rgba(0,0,0,0.15),
                  inset 0 1px 0 rgba(255,255,255,0.8),
                  inset 0 -1px 2px rgba(0,0,0,0.1),
                  inset 0 0 0 1px rgba(255,255,255,0.5)
                `
              }}
            >
              {/* Anel externo do click wheel */}
              <div
                className="absolute inset-2 rounded-full border border-gray-400/30"
                style={{
                  boxShadow: `
                    inset 0 1px 2px rgba(0,0,0,0.1),
                    inset 0 -1px 0 rgba(255,255,255,0.8)
                  `
                }}
              ></div>

              {/* Centro do click wheel */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-20 h-20 rounded-full bg-gradient-to-b from-gray-200 via-white to-gray-100 hover:from-gray-300 hover:via-gray-100 hover:to-gray-200 text-gray-700 hover:text-gray-800 shadow-lg border border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: `
                      0 1px 3px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.8),
                      inset 0 -1px 1px rgba(0,0,0,0.1)
                    `
                  }}
                >
                  <div className="text-center">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin mx-auto mb-1"></div>
                    ) : (
                      <Play className="w-6 h-6 mx-auto mb-1" />
                    )}
                    <span className="text-xs font-semibold leading-tight">
                      {isLoading ? "..." : "LOGIN"}
                    </span>
                  </div>
                </Button>
              </div>

              {/* Botões do click wheel */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 transition-all text-xs font-medium"
                >
                  MENU
                </Button>
              </div>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 transition-all text-xs font-medium"
                >
                  ⏮
                </Button>
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 transition-all text-xs font-medium"
                >
                  ⏭
                </Button>
              </div>
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 transition-all text-xs font-medium"
                >
                  ⏸
                </Button>
              </div>
            </div>
          </div>

          {/* Informações inferiores */}
          <div className="text-center mt-6 pb-6">
            <div className="text-xs text-gray-500 space-y-0.5">
              <p className="font-medium">Conexão UNK</p>
              <p>Fuderosa Systems</p>
              <p className="text-gray-400">Version 1.0.0</p>
            </div>
          </div>

          {/* Chave de bloqueio */}
          <div
            className="absolute top-16 -right-1 w-6 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-r-lg border-r border-gray-500"
            style={{
              boxShadow: `
                inset -1px 0 2px rgba(0,0,0,0.2),
                inset 0 1px 0 rgba(255,255,255,0.3)
              `
            }}
          >
            <div
              className="w-4 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-r mt-3 ml-1"
              style={{
                boxShadow: `
                  inset -1px 0 1px rgba(0,0,0,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.2)
                `
              }}
            ></div>
          </div>
        </div>

        {/* Sombra da base realista */}
        <div className="absolute -bottom-8 left-4 right-4 h-16 bg-gradient-radial from-black/20 via-black/10 to-transparent rounded-full blur-xl"></div>
      </div>
    </div>
  );
}