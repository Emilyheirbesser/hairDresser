import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HamburgerMenu } from "../../components/HamburgerMenu";
import { FiHome } from "react-icons/fi";
import { doc, Timestamp, serverTimestamp, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig"; // db = Firestore
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [dadosMensais, setDadosMensais] = useState([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserName(userData.nome || "usuário");
        } else {
          setUserName(user.email || "usuário");
        }


        // Buscar dados dos últimos 6 meses
        const meses = [];
        const agora = new Date();

        for (let i = 5; i >= 0; i--) {
          const inicio = startOfMonth(subMonths(agora, i));
          const fim = endOfMonth(subMonths(agora, i));

          const clientesSnap = await getDocs(
            query(
              collection(db, "clientes"),
              where("uid", "==", user.uid),
              where("criadoEm", ">=", Timestamp.fromDate(inicio)),
              where("criadoEm", "<=", Timestamp.fromDate(fim)),
            )
          );

          const servicosSnap = await getDocs(
            query(
              collection(db, "servicos"),
              where("uid", "==", user.uid),
              where("criadoEm", ">=", Timestamp.fromDate(inicio)),
              where("criadoEm", "<=", Timestamp.fromDate(fim)),
            )
          );

          meses.push({
            mes: inicio.toLocaleDateString('pt-BR', { month: 'short' }),
            clientes: clientesSnap.size,
            servicos: servicosSnap.size,
          });
        }

        setDadosMensais(meses);
        // (demais lógicas aqui – gráfico, etc.)
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchDados();
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
          <FiHome className="figura-home" />
        </div>

        <div className="home-content">
          <div className="welcome-section">
            <h2 className="section-title">Bem-vindo, <strong>{userName}</strong></h2>
            <p className="section-text">Você está autenticado!</p>
          </div>

          <button onClick={() => setMostrarGrafico(!mostrarGrafico)} className="toggle-grafico-btn">
            {mostrarGrafico ? "Esconder Gráfico" : "Mostrar Gráfico"}
          </button>
          {mostrarGrafico && (
            <div className="grafico-section">
              <h3>Evolução Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clientes" stroke="#8884d8" name="Clientes" />
                  <Line type="monotone" dataKey="servicos" stroke="#82ca9d" name="Serviços" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}



        </div>
      </div>
    </div>
  );
}
