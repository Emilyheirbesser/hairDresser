import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

import "./LoginStyles.css"
export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/home");
    } catch (err) {
      setErro("Email ou senha incorretos");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Bem-vindo ao</h1>
          <p className="login-subtitle">Planned Hair</p>
        </div>
        
        <div className="login-body">
          <form onSubmit={login} className="login-form">
            <div className="login-input-group">
              <label className="login-label">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>
            
            <div className="login-input-group">
              <label className="login-label">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="login-input"
                required
              />
            </div>
            
            <button
              type="submit"
              className="login-button"
            >
              Acessar Sistema
            </button>
            
            {erro && (
              <div className="login-error">
                <svg className="login-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {erro}
              </div>
            )}
          </form>
        </div>
        
        <div className="login-footer">
          © {new Date().getFullYear()} Hair Dresser - Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}
