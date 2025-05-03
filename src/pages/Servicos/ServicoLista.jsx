export default function ServicoLista({ servicos, loading, onEdit, onDelete }) {
  if (loading && servicos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (servicos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Nenhum serviço agendado ainda
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Horário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {servicos.map(servico => (
              <tr key={servico.id}>
                <td className="px-6 py-4 whitespace-nowrap">{servico.clienteNome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{servico.tipo}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(servico.data).toLocaleDateString('pt-BR')} às {servico.horario}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {servico.valor.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    servico.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                    servico.status === 'concluido' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {servico.status === 'agendado' ? 'Agendado' :
                     servico.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => onEdit(servico)}
                    className="text-blue-600 hover:text-blue-900"
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(servico.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={loading}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}