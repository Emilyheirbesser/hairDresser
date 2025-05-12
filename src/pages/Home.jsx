import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./homeStyles.css";

// Tempo de inatividade em milissegundos (ex: 30 minutos)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; 

export default function Home() {

  const [showWarning, setShowWarning] = useState(false);
  const [warningTimer, setWarningTimer] = useState(null);




  const navigate = useNavigate();
  const [logoutTimer, setLogoutTimer] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      resetTimer(); // Limpa o timer ao fazer logout manual
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };


  const resetTimer = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    if (warningTimer) clearTimeout(warningTimer);
    
    setShowWarning(false);
    
    // Timer para mostrar aviso (5 minutos antes)
    const warnTimer = setTimeout(() => {
      setShowWarning(true);
    }, INACTIVITY_TIMEOUT - (5 * 60 * 1000));
    
    // Timer para logout
    const timer = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
    
    setWarningTimer(warnTimer);
    setLogoutTimer(timer);
  };

  const setupEventListeners = () => {
    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  };

  useEffect(() => {
    resetTimer(); // Inicia o timer quando o componente monta
    const cleanup = setupEventListeners(); // Configura os listeners
    
    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer); // Limpa o timer ao desmontar
      }
      cleanup(); // Remove os listeners
    };
  }, []);

  {showWarning && (
    <div className="inactivity-warning">
      <div className="warning-content">
        <h3>Sua sessão expirará em breve</h3>
        <p>Você será desconectado em 5 minutos devido à inatividade.</p>
        <button onClick={resetTimer}>Continuar</button>
      </div>
    </div>
  )}
  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <h1 className="home-title">Página Inicial</h1>
          <button onClick={handleLogout} className="logout-btn">
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