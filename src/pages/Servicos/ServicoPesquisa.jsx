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
            <div className="col-span-2">
              {servicoEmFoco && (
                <div>
                  <p><strong>Cliente:</strong> {servicoEmFoco.clienteNome}</p>

                  <p><strong>Serviço:</strong></p>
                  <ul className="pl-4 list-disc">
                    {Array.isArray(servicoEmFoco.tipos) ? (
                      servicoEmFoco.tipos.map((tipo, index) => (
                        <li key={index}>
                          {tipo.tipo} - {parseFloat(tipo.valor || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </li>
                      ))
                    ) : (
                      <li>
                        {servicoEmFoco.tipo || 'Não informado'} - {parseFloat(servicoEmFoco.valor || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
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
                <h3 className="font-bold mb-2">Outros Serviços</h3>
                {servicosDaData.map(s => (
                  <div
                    key={`${s.id}-${s.horario}`}
                    className={`cursor-pointer p-1 rounded ${s.id === servicoEmFoco?.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setServicoEmFoco(s)}
                  >
                    <p>{s.clienteNome}</p>
                    <small>{s.horario || 'Horário indefinido'}</small>
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
