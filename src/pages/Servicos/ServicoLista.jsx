import "./servicosStyles.css";

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
    <div>
    <div className="servicos-container">
      <table className="servicos-table">
        <thead className="servicos-thead">
          <tr>
            <th className="servicos-th">Cliente</th>
            <th className="servicos-th">Serviço</th>
            <th className="servicos-th">Data/Horário</th>
            <th className="servicos-th">Valor</th>
            <th className="servicos-th">Status</th>
            <th className="servicos-th">Observações</th>
            <th className="servicos-th">Ações</th>
          </tr>
        </thead>
        <tbody className="seervicos-tbody">
          {servicos.map(servico => (
            <tr key={servico.id} className="servico-tr">
              <td className="servicos-td">{servico.clienteNome}</td>
              <td className="servicos-td">{servico.tipo}</td>
              <td className="servicos-td">
                {new Date(servico.data).toLocaleDateString('pt-BR')} às {servico.horario}
              </td>
              <td className="servicos-td">
                {servico.valor.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </td>
              <td className="servicos-td">
                <span className={`status-badge ${
                  servico.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                  servico.status === 'concluido' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {servico.status === 'agendado' ? 'Agendado' :
                    servico.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                </span>
              </td>
              <td className="servicos-td observacoes-cell">
                {servico.observacoes ? (
                  <span className="text-sm text-gray-600">{servico.observacoes}</span>
                ) : (
                  <span className="text-sm text-gray-400">Nenhuma observação</span>
                )}
              </td>
              <td className="servicos-td acoes-cell">
                <button
                  onClick={() => onEdit(servico)}
                  className="btn-editar"
                  disabled={loading}
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(servico.id)}
                  className="btn-excluir"
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