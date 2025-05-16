import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HamburgerMenu } from "../../components/HamburgerMenu";

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
      resetTimer();
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
      setShowWarning(false);

    }, INACTIVITY_TIMEOUT - (5 * 60 * 1000));
    
    // Timer para logout
    const timer = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
    
    setWarningTimer(warnTimer);
    setLogoutTimer(timer);
  };

  const setupEventListeners = () => {
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
    resetTimer();
    const cleanup = setupEventListeners();
    
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      cleanup();
    };
  }, []);

  return (
    <div className="home-container">
      {/* Modal de aviso de inatividade */}
      {showWarning && (
        <div className="inactivity-warning">
          <div className="warning-content">
            <h3>Sua sessão expirará em breve</h3>
            <p>Você será desconectado em 5 minutos devido à inatividade.</p>
            <button onClick={resetTimer}>Continuar</button>
          </div>
        </div>
      )}

      <div className="home-card">
        <div className="home-header">
          <HamburgerMenu />
          <h1 className="home-title">Página Inicial</h1>
        </div>
        
        <div className="home-content">
          <div className="welcome-section">
            <h2 className="section-title">Bem-vindo ao Sistema</h2>
            <p className="section-text">
              Você está autenticado! Bem vindo a página inicial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}