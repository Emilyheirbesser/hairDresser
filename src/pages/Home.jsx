import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

import "./homeStyles.css"
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
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <h1 className="home-title">Página Inicial</h1>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Sair
          </button>
        </div>
        
        <div className="home-content">
          <div className="welcome-section">
            <h2 className="section-title">Bem-vindo ao Sistema</h2>
            <p className="section-text">
              Você está autenticado! Aqui é sua página inicial.
            </p>
          </div>
          
          <div className="navigation-section">
            <h3 className="nav-title">Navegação</h3>
            <div className="nav-links">
              <a href="/clientes" className="nav-link">Clientes</a>
              <a href="/servicos" className="nav-link">Serviços</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
