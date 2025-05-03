import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Página Inicial</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Sair
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Bem-vindo ao Sistema</h2>
            <p className="text-gray-600">
              Você está autenticado! Aqui é sua página inicial.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-medium text-blue-800">Navegação</h3>
            <p className="mt-2 text-blue-600">
              Acesse a página de <a href="/clientes" className="underline">Clientes </a>
              ou <a href="/servicos" className="underline">Servicos</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}