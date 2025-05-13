import "./clienteListaStyles.css";

export default function ClienteLista({ clientes, onEdit, onDelete, loading }) {
  if (loading && clientes.length === 0) {
    return <div className="cliente-list-loading">Carregando clientes...</div>;
  }

  if (clientes.length === 0) {
    return <div className="cliente-list-empty">Nenhum cliente encontrado</div>;
  }

  return (
    <div className="cliente-list-container">
      <div className="cliente-list-scroll">
        <table className="cliente-list-table">
          <thead className="cliente-list-header">
            <tr>
              <th className="cliente-list-th">Nome</th>
              <th className="cliente-list-th">Telefone</th>
              <th className="cliente-list-th">Email</th>
              <th className="cliente-list-th">Ações</th>
            </tr>
          </thead>
          <tbody className="cliente-list-body">
            {clientes.map(cliente => (
              <tr key={cliente.id} className="cliente-list-row">
                <td className="cliente-list-td">{cliente.nome}</td>
                <td className="cliente-list-td">{cliente.telefone || '-'}</td>
                <td className="cliente-list-td">{cliente.email || '-'}</td>
                <td className="cliente-list-td cliente-list-actions">
                  <button
                    onClick={() => onEdit(cliente)}
                    className="cliente-list-edit-btn"
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(cliente.id)}
                    className="cliente-list-delete-btn"
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