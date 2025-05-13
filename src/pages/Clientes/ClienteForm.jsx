import { useState, useEffect } from 'react';
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
    observacoes: ''
  });

  useEffect(() => {
    if (clienteEditando) {
      setCliente({
        nome: clienteEditando.nome || '',
        telefone: clienteEditando.telefone || '',
        email: clienteEditando.email || '',
        observacoes: clienteEditando.observacoes || ''
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cliente);
  };

  return (
    <div className="cliente-form-container">
      <h2 className="cliente-form-title">
        {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>
      
      <form onSubmit={handleSubmit} className="cliente-form">
        <div className="form-group">
          <label className="form-label">Nome*</label>
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
          {clienteEditando && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="cancel-button"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'loading' : ''}`}
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