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

const HORARIOS_DISPONIVEIS = [
  '08:00', '09:00', '10:00', '11:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ServicoForm({ cliente, onSubmit, onCancel, loading, servicoEditando }) {
  const [servico, setServico] = useState({
    tipo: TIPOS_SERVICO[0],
    data: new Date().toISOString().split('T')[0],
    horario: '09:00',
    valor: '',
    observacoes: '',
    status: 'agendado'
  });

  useEffect(() => {
    if (servicoEditando) {
      // Preenche o formulário com os dados do serviço sendo editado
      setServico({
        tipo: servicoEditando.tipo || TIPOS_SERVICO[0],
        data: servicoEditando.data.split('T')[0],
        horario: servicoEditando.horario || '09:00',
        valor: servicoEditando.valor || '',
        observacoes: servicoEditando.observacoes || '',
        status: servicoEditando.status || 'agendado'
      });
    } else {
      // Reseta o formulário para novo serviço
      setServico({
        tipo: TIPOS_SERVICO[0],
        data: new Date().toISOString().split('T')[0],
        horario: '09:00',
        valor: '',
        observacoes: '',
        status: 'agendado'
      });
    }
  }, [cliente, servicoEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServico(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Formata os dados antes de enviar
    const servicoFormatado = {
      ...servico,
      valor: parseFloat(servico.valor),
      // Garante que observações não seja null/undefined
      observacoes: servico.observacoes || ''
    };
    
    onSubmit(servicoFormatado);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {servicoEditando ? 'Editar Serviço' : 'Agendar Serviço'} para {cliente.nome}
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
              min={new Date().toISOString().split('T')[0]} // Não permite datas passadas
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário*</label>
            <select
              name="horario"
              value={servico.horario}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {HORARIOS_DISPONIVEIS.map(horario => (
                <option key={horario} value={horario}>{horario}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)*</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="valor"
              value={servico.valor}
              onChange={handleChange}
              className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="observacoes"
            value={servico.observacoes}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Detalhes do serviço, preferências do cliente, etc."
          />
          <p className="mt-1 text-sm text-gray-500">Opcional</p>
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
            {loading ? 'Salvando...' : servicoEditando ? 'Atualizar' : 'Agendar'}
          </button>
        </div>
      </form>
    </div>
  );
}