import { useState, useEffect } from 'react';

const TIPOS_SERVICO = [
  'Corte de Cabelo',
  'Coloração',
  'Hidratação',
  'Manicure',
  'Pedicure',
  'Maquiagem',
  'Progressiva',
  'Escova',
  'Outro'
];

export default function ServicoForm({ cliente, onSubmit, onCancel, loading }) {
  const [servico, setServico] = useState({
    tipo: TIPOS_SERVICO[0],
    data: new Date().toISOString().split('T')[0],
    horario: '09:00',
    valor: '',
    observacoes: '',
    // status: 'agendado'
  });

  useEffect(() => {
    // Reseta o formulário quando o cliente muda
    setServico({
      tipo: TIPOS_SERVICO[0],
      data: new Date().toISOString().split('T')[0],
      horario: '09:00',
      valor: '',
      observacoes: '',
      // status: 'agendado'
    });
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServico(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(servico);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Guardar Serviço para {cliente.nome}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço*</label>
          <select
            name="tipo"
            value={servico.tipo}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {TIPOS_SERVICO.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
            <input
              type="date"
              name="data"
              value={servico.data}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário*</label>
            <input
              type="time"
              name="horario"
              value={servico.horario}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)*</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="valor"
            value={servico.valor}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0,00"
            required
          />
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={servico.status}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="agendado">Agendado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="observacoes"
            value={servico.observacoes}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Detalhes do serviço..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}