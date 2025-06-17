// src/pages/Calculo/index.jsx
import { useReducer, useEffect } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from '../../firebaseConfig';
import { ArrowLeft } from '../../components/ArrowLeft';
import { PeriodoMes } from './PeriodoMes';
import "./calculoStyles.css";

// Configuração inicial do estado
const initialState = {
  dataInicio: '',
  dataFim: '',
  servicos: [],
  servicosFiltrados: [],
  statusFiltro: '',
  erro: '',
  carregando: false
};

// Função reducer para gerenciar o estado
function reducer(state, action) {
  switch (action.type) {
    case 'SET_FILTROS':
      return { ...state, ...action.payload };
    case 'SET_SERVICOS':
      return { ...state, servicos: action.payload, carregando: false };
    case 'SET_FILTRADOS':
      return { ...state, servicosFiltrados: action.payload };
    case 'SET_ERRO':
      return { ...state, erro: action.payload };
    case 'SET_CARREGANDO':
      return { ...state, carregando: action.payload };
    default:
      return state;
  }
}

export default function CalculoServicos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { dataInicio, dataFim, servicos, servicosFiltrados, statusFiltro, erro, carregando } = state;

  // Buscar serviços do Firebase
  useEffect(() => {
    const fetchServicos = async () => {
      dispatch({ type: 'SET_CARREGANDO', payload: true });
      try {
        const snapshot = await getDocs(collection(db, 'servicos'));
        const lista = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            data: data.data?.toDate ? data.data.toDate() : (data.data ? new Date(data.data) : null),
            dataFormatada: data.data?.toDate
              ? data.data.toDate().toLocaleDateString('pt-BR')
              : (data.data ? new Date(data.data).toLocaleDateString('pt-BR') : 'Sem data')
          };
        });
        dispatch({ type: 'SET_SERVICOS', payload: lista });
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        dispatch({ type: 'SET_ERRO', payload: "Erro ao carregar serviços" });
      }
    };

    fetchServicos();
  }, []);

  // Calcular valor do serviço
  const calcularValorServico = (servico) => {
    if (servico.tipos?.length) {
      return servico.tipos.reduce((total, tipo) => {
        const valor = typeof tipo.valor === 'string' ? parseFloat(tipo.valor) : tipo.valor || 0;
        return total + valor;
      }, 0);
    }
    const valor = typeof servico.valor === 'string' ? parseFloat(servico.valor) : servico.valor || 0;
    return valor;
  };

  // Filtrar serviços
  const filtrarServicos = () => {
    if (!dataInicio || !dataFim) {
      dispatch({ type: 'SET_ERRO', payload: "Por favor, selecione ambas as datas" });
      return;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (inicio > fim) {
      dispatch({ type: 'SET_ERRO', payload: "A data de início deve ser anterior à data de fim" });
      return;
    }

    dispatch({ type: 'SET_ERRO', payload: '' });

    const filtrados = servicos.filter(s => {
      if (!s.data) return false;
      
      const dataServico = s.data;
      const dentroDoPeriodo = dataServico >= inicio && dataServico <= fim;
      const statusCond = statusFiltro ? s.status === statusFiltro : true;
      return dentroDoPeriodo && statusCond;
    });

    dispatch({ type: 'SET_FILTRADOS', payload: filtrados });
  };

  // Calcular total
  const total = servicosFiltrados.reduce((soma, servico) => {
    return soma + calcularValorServico(servico);
  }, 0);

  // Exportar para Excel
  const exportarExcel = () => {
    if (servicosFiltrados.length === 0) {
      dispatch({ type: 'SET_ERRO', payload: "Nenhum serviço para exportar" });
      return;
    }

    const dados = servicosFiltrados.map(s => ({
      Cliente: s.clienteNome,
      Data: s.dataFormatada,
      Horario: s.horario || '',
      Status: s.status || '',
      Observacoes: s.observacoes || '',
      Tipos: s.tipos?.length
        ? s.tipos.map(t => `${t.tipo} (${t.valor})`).join(', ')
        : `${s.tipo} (${s.valor})`,
      ValorTotal: calcularValorServico(s)
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, 'Serviços');
    XLSX.writeFile(wb, 'relatorio-servicos.xlsx');
  };

  return (
    <div className="calculo-container">
      <div className="calculo-header">  
        <h1 className="text-2xl font-bold mb-4">Comissão</h1>
        <ArrowLeft />
      </div>

      <PeriodoMes className="mb-6"
      onShowCalculo={() => {
        console.log("Mostrar calculo")
      }}
      />

      {erro && <div className="erro-message">{erro}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => dispatch({ type: 'SET_FILTROS', payload: { dataInicio: e.target.value } })}
            className="form-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => dispatch({ type: 'SET_FILTROS', payload: { dataFim: e.target.value } })}
            className="form-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFiltro}
            onChange={(e) => dispatch({ type: 'SET_FILTROS', payload: { statusFiltro: e.target.value } })}
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
            disabled={carregando}
          >
            {carregando ? 'Carregando...' : 'Buscar'}
          </button>
        </div>
      </div>


      {carregando && <div className="loading-spinner">Carregando...</div>}

      {servicosFiltrados.length > 0 && (
        <>
        <div className="card-total">
          <h2 className="text-lg font-semibold mb-2">Total de serviços: {servicosFiltrados.length}</h2>
          <p className="text-xl font-bold text-green-600">
            Total: {total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
          <button
            onClick={exportarExcel} 
            className="mt-4 btn-secondary"
            disabled={servicosFiltrados.length === 0 || carregando}
          >
            Exportar para Excel
          </button>
        </div>

        <div className='card-calculo'>
          <h3 className="text-md font-semibold mb-2">Serviços encontrados:</h3>
          <ul>
            {servicosFiltrados.map((s, index) => (
              <li key={index} className="servico-item">
                {s.clienteNome} - {s.dataFormatada} -{' '}
                {calcularValorServico(s).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
                {s.status && ` - Status: ${s.status}`}
              </li>
            ))}
          </ul>
        </div>
      </>
      )}
    </div>
  );
}