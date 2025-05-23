// src/components/Register.jsx
import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register({ onClose }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      console.log("Usuário criado:", user.uid); // <-- Deve aparecer no console

      

      // Salvar dados no Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nome,
        telefone,
        email: user.email,
        criadoEm: new Date()
      });
      console.log("Documento salvo no Firestore com sucesso."); // <-- Verifique se aparece

      // onClose();
      navigate("/home");
    } catch (err) {
      console.error("Erro detalhado:", err.message);
      setErro(err.message);

    }
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Criar Conta</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="(XX) XXXXX-XXXX"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
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
