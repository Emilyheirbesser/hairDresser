// src/pages/Perfil.jsx
import "./pfStyles.css";
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft } from "../../components/ArrowLeft";

export default function Perfil() {
  const [dados, setDados] = useState({ nome: '', telefone: '', email: '' });
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDados(docSnap.data());
        }
      }
    };
    fetchPerfil();
  }, []);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const salvarAlteracoes = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "usuarios", user.uid), {
          nome: dados.nome,
          telefone: dados.telefone,
        });
        setMensagem("Dados atualizados com sucesso.");
        setEditando(false);
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        setMensagem("Erro ao atualizar.");
      }
    }
  };

  return (
    <div className="perfil-container">
        <div className="perfil-header">
            <h2>Meu Perfil</h2>
            <ArrowLeft />

        </div>
      <div className="perfil-form">
        <label>Nome:</label>
        <input
          name="nome"
          value={dados.nome}
          onChange={handleChange}
          disabled={!editando}
        />
        <label>Telefone:</label>
        <input
          name="telefone"
          value={dados.telefone}
          onChange={handleChange}
          disabled={!editando}
        />
        <label>Email:</label>
        <input value={dados.email} disabled />

        {editando ? (
          <button onClick={salvarAlteracoes}>Salvar</button>
        ) : (
          <button onClick={() => setEditando(true)}>Editar</button>
        )}
        {mensagem && <p>{mensagem}</p>}
      </div>
    </div>
  );
}
