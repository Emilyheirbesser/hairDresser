import { useState, useEffect } from 'react';

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

  // Preenche os campos quando estiver editando
  useEffect(() => {
    if (clienteEditando) {
      setCliente({
        nome: clienteEditando.nome || '',
        telefone: clienteEditando.telefone || '',
        email: clienteEditando.email || '',
        observacoes: clienteEditando.observacoes || ''
      });
    } else {
      // Reseta os campos para novo cliente
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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
          <input
            type="text"
            name="nome"
            value={cliente.nome}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            type="tel"
            name="telefone"
            value={cliente.telefone}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={cliente.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="observacoes"
            value={cliente.observacoes}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {clienteEditando && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
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