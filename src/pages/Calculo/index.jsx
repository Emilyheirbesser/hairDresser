// pages/CalculoServicos.jsx
import { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowLeft } from '../../components/ArrowLeft.jsx';
import * as XLSX from 'xlsx';
import "./calculoStyles.css";

export default function CalculoServicos() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [servicos, setServicos] = useState([]);
  const [servicosFiltrados, setServicosFiltrados] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');

  useEffect(() => {
    async function fetchServicos() {
      const snapshot = await getDocs(collection(db, 'servicos'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServicos(lista);
    }

    fetchServicos();
  }, []);

  const filtrarServicos = () => {
    if (!dataInicio || !dataFim) return;

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    const filtrados = servicos.filter(s => {
      const dataServico = new Date(s.data);
      const dentroDoPeriodo = dataServico >= inicio && dataServico <= fim;
      const statusCond = statusFiltro ? s.status === statusFiltro : true;
      return dentroDoPeriodo && statusCond;
    });

    setServicosFiltrados(filtrados);
  };

  const total = servicosFiltrados.reduce((soma, servico) => {
    if (Array.isArray(servico.tipos)) {
      return soma + servico.tipos.reduce((t, tipo) => t + parseFloat(tipo.valor || 0), 0);
    }
    return soma + parseFloat(servico.valor || 0);
  }, 0);

  const exportarExcel = () => {
    const dados = servicosFiltrados.map(s => ({
      Cliente: s.clienteNome,
      Data: s.dataFormatada,
      Horario: s.horario,
      Status: s.status,
      Observacoes: s.observacoes,
      Tipos: Array.isArray(s.tipos)
        ? s.tipos.map(t => `${t.tipo} (${t.valor})`).join(', ')
        : `${s.tipo} (${s.valor})`,
      ValorTotal: Array.isArray(s.tipos)
        ? s.tipos.reduce((t, tipo) => t + parseFloat(tipo.valor || 0), 0)
        : parseFloat(s.valor || 0)
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, 'Serviços');
    XLSX.writeFile(wb, 'relatorio-servicos.xlsx');
  };

  return (
    <div className="calculo-container">
      <div className="calculo-header">  
         <h1 className="text-2xl font-bold mb-4">Cálculo de Serviços</h1>
         <ArrowLeft />
      </div>  
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="form-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="form-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="form-select w-full"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={filtrarServicos}
            className="btn-primary w-full"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="card-total">
        <h2 className="text-lg font-semibold mb-2">Total de serviços: {servicosFiltrados.length}</h2>
        <p className="text-xl font-bold text-green-600">
          Total: {total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </p>
        <button onClick={exportarExcel} className="mt-4 btn-secondary">Exportar para Excel</button>
      </div>

      {servicosFiltrados.length > 0 && (
        <div className='card-calculo'>
            <h3 className="text-md font-semibold mb-2">Serviços encontrados:</h3>
            <ul>
            {servicos.map((s, index) => (
                <li key={index}>
                {s.clienteNome} - {s.dataFormatada} -{' '}
                {(
                    s.tipos
                    ? s.tipos.reduce((t, tipo) => t + parseFloat(tipo.valor || 0), 0)
                    : parseFloat(s.valor || 0)
                ).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })}
                </li>
            ))}
            </ul>

        </div>
      )}
    </div>
  );
}
