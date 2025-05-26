// components/ServicoSearchPopup.jsx
import { useState, useMemo } from 'react';
import './ServicoPesquisa.css';

export default function ServicoPesquisa({ servicos }) {
  const [busca, setBusca] = useState('');
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const servicosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return servicos.filter(s => {
      const cliente = s.clienteNome?.toLowerCase() || '';
      const observacoes = s.observacoes?.toLowerCase() || '';
      const data = s.dataFormatada || '';
      const tipo = s.tipo?.toLowerCase() || '';
      const status = s.status?.toLowerCase() || '';

      return (
        cliente.includes(termo) ||
        observacoes.includes(termo) ||
        data.includes(termo) ||
        tipo.includes(termo) ||
        status.includes(termo)
      );
    });
  }, [busca, servicos]);

  return (
    <div className="servico-search-container">
      <input
        type="text"
        placeholder="Buscar por cliente, data, observações, tipo ou status"
        className="servico-search-input"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {busca && (
        <div className="servico-list">
          {servicosFiltrados.length ? (
            servicosFiltrados.map(servico => (
              <div
                key={servico.id}
                className="servico-item"
                onClick={() => setServicoSelecionado(servico)}
              >
                <div className="flex justify-between">
                  <span>{servico.clienteNome}</span>
                  <span>{servico.dataFormatada || 'Data indefinida'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-servicos">Nenhum serviço encontrado</div>
          )}
        </div>
      )}

      {servicoSelecionado && (
        <div className="servico-popup">
          <div className="servico-popup-content">
            <h2>Detalhes do Serviço</h2>
            <p><strong>Cliente:</strong> {servicoSelecionado.clienteNome}</p>
            <p><strong>Serviço:</strong> {servicoSelecionado.tipo}</p>
            <p><strong>Data:</strong> {servicoSelecionado.dataFormatada || 'Data não informada'}</p>
            <p><strong>Horário:</strong> {servicoSelecionado.horario || 'Não informado'}</p>
            <p><strong>Valor:</strong> {servicoSelecionado.valor?.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }) || 'R$ 0,00'}</p>
            <p><strong>Status:</strong> {servicoSelecionado.status || 'Indefinido'}</p>
            <p><strong>Observações:</strong> {servicoSelecionado.observacoes || 'Nenhuma'}</p>
            <button className='btn-fechar' onClick={() => setServicoSelecionado(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
