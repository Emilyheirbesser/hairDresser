import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HamburgerMenu } from "../../components/HamburgerMenu";
import { FiHome } from "react-icons/fi";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig"; // db = Firestore
import "./homeStyles.css";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

export default function Home() {
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimer, setWarningTimer] = useState(null);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const [userName, setUserName] = useState("");
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);

  const navigate = useNavigate();
  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setUserName(user.email || "usuário");

      const fetchDados = async () => {
        try {
          // Total de Clientes do usuário
          const clientesQuery = query(collection(db, "clientes"), where("uid", "==", user.uid));
          const clientesSnap = await getDocs(clientesQuery);
          setTotalClientes(clientesSnap.size);

          // Total de Serviços do usuário
          const servicosQuery = query(collection(db, "servicos"), where("uid", "==", user.uid));
          const servicosSnap = await getDocs(servicosQuery);
          setTotalServicos(servicosSnap.size);

        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      };

      fetchDados();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
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

    const warnTimer = setTimeout(() => {
      setShowWarning(true);
    }, INACTIVITY_TIMEOUT - 5 * 60 * 1000); // 5 minutos antes

    const timer = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);

    setWarningTimer(warnTimer);
    setLogoutTimer(timer);
  };

  const setupEventListeners = () => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      events.forEach((event) => {
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
          <FiHome color="blue" />
        </div>

        <div className="home-content">
          <div className="welcome-section">
            <h2 className="section-title">Bem-vindo, <strong>{userName}</strong></h2>
            <p className="section-text">Você está autenticado!</p>
          </div>

          <div className="stats-section">
            <div className="stat-card">
              <h3>Clientes</h3>
              <p>{totalClientes}</p>
            </div>
            <div className="stat-card">
              <h3>Serviços</h3>
              <p>{totalServicos}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
