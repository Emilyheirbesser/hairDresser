// src/components/Register.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register({ onClose }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      onClose(); // fecha o modal
      navigate("/home");
    } catch (err) {
      console.error(err);
      setErro("Erro ao registrar. Verifique os dados.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Criar Conta</h2>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {erro && <div className="register-error">{erro}</div>}

          <div className="modal-buttons">
            <button type="submit" className="login-button">Registrar</button>
            <button
              type="button"
              className="login-button cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
