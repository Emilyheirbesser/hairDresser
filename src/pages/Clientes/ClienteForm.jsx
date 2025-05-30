import { useState, useEffect } from 'react';
import { db, auth } from "../../firebaseConfig";
import { collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import "./clienteFormStyles.css";

export default function ClienteForm({ 
  onSubmit, 
  clienteEditando, 
  onCancel,
  loading
}) {
  const [cliente, setCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    observacoes: '',
  });

  useEffect(() => {
    if (clienteEditando) {
      setCliente({
        nome: clienteEditando.nome || '',
        telefone: clienteEditando.telefone || '',
        email: clienteEditando.email || '',
        observacoes: clienteEditando.observacoes || '',
      });
    } else {
      setCliente({
        nome: '',
        telefone: '',
        email: '',
        observacoes: ''
      });
    }
  }, [clienteEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const clientesRef = collection(db, "clientes");

      const q = query(
        clientesRef,
        where("uid", "==", user.uid),
        where("nome", "==", cliente.nome.trim())
      );

      const querySnapshot = await getDocs(q);

      const nomeExistente = querySnapshot.docs.length > 0 &&
        (!clienteEditando || querySnapshot.docs[0].id !== clienteEditando.id);

      if (nomeExistente) {
        alert(`Cliente "${cliente.nome.trim()}" já existe.`);
        return;
      }

      const clienteFormatado = {
        ...cliente,
        nome: cliente.nome.trim(),
        uid: user.uid,
        ...(clienteEditando ? {} : { criadoEm: serverTimestamp() }) // ✅ só adiciona se for novo
      };

      onSubmit(clienteFormatado);
    } catch (error) {
      console.error("Erro ao verificar nome:", error);
      alert("Erro ao verificar nome do cliente.");
    }
  };

  return (
    <div className="cliente-form-container">
      <h2 className="cliente-form-title">
        {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>
      
      <form onSubmit={handleSubmit} className="cliente-form">
        <div className="form-group">
          <label className="form-label">Nome</label>
          <input
            type="text"
            name="nome"
            value={cliente.nome}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input
            type="tel"
            name="telefone"
            value={cliente.telefone}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={cliente.email}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Observações</label>
          <textarea
            name="observacoes"
            value={cliente.observacoes}
            onChange={handleChange}
            className="form-textarea"
            rows="3"
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="cancel-button-form"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`submit-button-form ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              'Salvando...'
            ) : clienteEditando ? (
              'Atualizar Cliente'
            ) : (
              'Adicionar Cliente'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}