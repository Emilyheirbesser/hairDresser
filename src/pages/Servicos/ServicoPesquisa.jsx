// components/ServicoSearchPopup.jsx
import { useState, useMemo } from 'react';
import './ServicoPesquisa.css';

export default function ServicoPesquisa({ servicos }) {
  const [busca, setBusca] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [servicoEmFoco, setServicoEmFoco] = useState(null);

  const servicosDaData = useMemo(() => {
    return servicos.filter(s => s.dataFormatada === dataSelecionada);
  }, [dataSelecionada, servicos]);

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
                onClick={() => {
                  setDataSelecionada(servico.dataFormatada);
                  setServicoEmFoco(servico);
                }}
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

      {dataSelecionada && (
        <div className="servico-popup">
          <div className="servico-popup-content">
            <div className="popup-header">
              <h2>Serviços em {dataSelecionada}</h2>
              <button className="btn-fechar"
                aria-label="Fechar"
                onClick={() => {
                setDataSelecionada(null);
                setServicoEmFoco(null);
              }}>Fechar</button>
            </div>
            <div className="servico-card">
              {servicoEmFoco && (
                <div className="serv-selecionado">
                  <p><strong>Cliente:</strong> {servicoEmFoco.clienteNome || 'Não informado'}</p>

                  <p><strong>Serviço:</strong></p>
                  <ul className="pl-4 list-disc">
                    {Array.isArray(servicoEmFoco.tipos) ? (
                      servicoEmFoco.tipos.map((tipo, index) => (
                        <li key={index} className="mb-1">
                          <span>{tipo.tipo || 'Tipo não informado'}</span> -{' '}
                          <span>
                            {parseFloat(tipo.valor || 0).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </span>
                          {tipo.cor && (
                            <>
                              {' '} - <span className="font-semibold"><strong>Cor:</strong></span>{' '}
                              <span
                                className="inline-block ml-1 px-2 py-0.5 text-xs rounded"
                                style={{
                                  backgroundColor: tipo.cor,
                                }}
                              >
                                {tipo.cor}
                              </span>
                            </>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>
                        {servicoEmFoco.tipo || 'Tipo não informado'} -{' '}
                        {parseFloat(servicoEmFoco.valor || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                        {servicoEmFoco.cor && (
                          <>
                            {' '} - <span className="font-semibold"><strong>Cor:</strong></span>{' '}
                            <span
                              className="inline-block ml-1 px-2 py-0.5 text-xs rounded"
                              style={{
                                backgroundColor: servicoEmFoco.cor,
                                color: '#fff'
                              }}
                            >
                              {servicoEmFoco.cor}
                            </span>
                          </>
                        )}
                      </li>
                    )}
                  </ul>

                  <p><strong>Horário:</strong> {servicoEmFoco.horario || 'Não informado'}</p>

                  <p><strong>Valor Total:</strong> {
                    (Array.isArray(servicoEmFoco.tipos)
                      ? servicoEmFoco.tipos.reduce((total, t) => total + parseFloat(t.valor || 0), 0)
                      : parseFloat(servicoEmFoco.valor || 0)
                    ).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })
                  }</p>

                  <p><strong>Status:</strong> {servicoEmFoco.status || 'Indefinido'}</p>
                  <p><strong>Observações:</strong> {servicoEmFoco.observacoes || 'Nenhuma'}</p>
                </div>
              )}

            </div>

            <div className="popup-body grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="servico-card">
                <h3 className="servico-card-title">Outros Serviços</h3>
                {servicosDaData.map(s => (
                  <div
                    key={`${s.id}-${s.horario}`}
                    className={`servico-item ${s.id === servicoEmFoco?.id ? 'servico-item-ativo' : ''}`}
                    onClick={() => setServicoEmFoco(s)}
                  >
                    <p className="servico-cliente">{s.clienteNome}</p>
                    <small className="servico-horario">{s.horario || 'Horário indefinido'}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
