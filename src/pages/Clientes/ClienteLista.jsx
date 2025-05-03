export default function ClienteLista({ clientes, onEdit, onDelete, loading }) {
  if (loading && clientes.length === 0) {
    return <div className="text-center py-8">Carregando clientes...</div>;
  }

  if (clientes.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum cliente encontrado</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.telefone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => onEdit(cliente)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(cliente.id)}
                    className="text-red-600 hover:text-red-900"
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