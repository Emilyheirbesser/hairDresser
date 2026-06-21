// src/pages/Calculo/index.jsx
import { useReducer, useEffect } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from '../../firebaseConfig';
import { ArrowLeft } from '../../components/ArrowLeft';
import { PeriodoMes } from './PeriodoMes';
import "./calculoStyles.css";

const initialState = {
  dataInicio: '',
  dataFim: '',
  servicos: [],
  servicosFiltrados: [],
  statusFiltro: '',
  erro: '',
  carregando: false
};

const ACTIONS = {
  SET_FILTROS: 'SET_FILTROS',
  SET_FILTRADOS: 'SET_FILTRADOS',
  SET_ERRO: 'SET_ERRO'
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_FILTROS:
      return { ...state, ...action.payload };
    case ACTIONS.SET_FILTRADOS:
      return { ...state, servicosFiltrados: action.payload, carregando: false }; // <- importante
    case ACTIONS.SET_ERRO:
      return { ...state, erro: action.payload, carregando: false }; // <- importante
    case 'SET_SERVICOS':
      return { ...state, servicos: action.payload, carregando: false };
    case 'SET_CARREGANDO':
      return { ...state, carregando: action.payload };
    default:
      return state;
  }
}


const PERCENTUAIS = {
  'Auxilio': 0.4,
  'Corte': 0.5,
  'Corte de Cabelo': 0.5,
  'Lavagem': 0.4,
  'Preparo': 0.4,
  'Chapinha': 0.4,
  'Babyliss': 0.4,
  'Escova': 0.5,
  'Escova Modelada': 0.5,
  'Tratamentos': 0.4,
  'Coloração': 0.4,
  'Tonalizante': 0.4,
  'Progressiva': 0.4,
  'Botox': 0.4,
  'Mechas': 0.4,
  'Outros': 0.4
};

export default function CalculoServicos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { dataInicio, dataFim, servicos, servicosFiltrados, statusFiltro, erro, carregando } = state;

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

  const calcularValorComPercentual = (servico) => {
    if (servico.tipos?.length) {
      return servico.tipos.map(tipo => {
        const percentual = PERCENTUAIS[tipo.tipo] ?? 0;
        const valor = typeof tipo.valor === 'string' ? parseFloat(tipo.valor) : tipo.valor || 0;
        return {
          tipo: tipo.tipo,
          valorOriginal: valor,
          percentual,
          valorComDesconto: valor * percentual
        };
      });
    }
    return [];
  };

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

  const total = servicosFiltrados.reduce((soma, servico) => {
    return soma + calcularValorServico(servico);
  }, 0);

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

  const totalComissao = servicosFiltrados.reduce((total, servico) => {
    const comissoes = calcularValorComPercentual(servico).reduce((soma, linha) => soma + linha.valorComDesconto, 0);
    return total + comissoes;
  }, 0);

  return (
    <div className="calculo-container">
      <div className="calculo-header">  
        <h1 className="text-2xl font-bold mb-4">Comissão</h1>
        <ArrowLeft />
      </div>

      <PeriodoMes className="mb-6" onShowCalculo={() => console.log("Mostrar calculo")} />

      {erro && <div className="erro-message">{erro}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Início</label>
          <input type="date" value={dataInicio} onChange={(e) => dispatch({ type: 'SET_FILTROS', payload: { dataInicio: e.target.value } })} className="form-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Fim</label>
          <input type="date" value={dataFim} onChange={(e) => dispatch({ type: 'SET_FILTROS', payload: { dataFim: e.target.value } })} className="form-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select value={statusFiltro} onChange={(e) => dispatch({ type: 'SET_FILTROS', payload: { statusFiltro: e.target.value } })} className="form-select w-full">
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={filtrarServicos} className="btn-primary w-full" disabled={carregando}>
            {carregando ? 'Carregando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {carregando && <div className="loading-spinner">Carregando...</div>}

      {servicosFiltrados.length > 0 && (
        <>
          <div className="card-total">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Bruto</p>
                <p className="text-xl font-bold text-green-600">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Comissão</p>
                <p className="text-xl font-bold text-blue-600">
                  {totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            <h2 className="text-lg font-semibold mb-2">Total de serviços: {servicosFiltrados.length}</h2>
              <div className="total-items-end">
                <button 
                  onClick={exportarExcel} 
                  className="btn-secondary w-full" 
                  disabled={servicosFiltrados.length === 0 || carregando}
                >
                  Exportar para Excel
                </button>
              </div>
            </div>
          </div>

          <ServicosList 
            servicos={servicosFiltrados} 
            calcularValorServico={calcularValorServico} 
          />

          <TabelaComissoes 
            servicos={servicosFiltrados} 
            calcularValorComPercentual={calcularValorComPercentual} 
            total={total}
            totalComissao={totalComissao}
          />
        </>
      )}
    </div>
  );
}

// Componentes filhos para melhor organização
function ServicosList({ servicos, calcularValorServico }) {
  return (
    <div className='card-calculo'>
      <h3 className="text-md font-semibold mb-2">Serviços encontrados:</h3>
      <ul className="space-y-2">
        {servicos.map((s) => (
          <li key={s.id} className="servico-item">
            {s.clienteNome} - {s.dataFormatada} - 
            {calcularValorServico(s).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
            {s.status && ` - Status: ${s.status}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TabelaComissoes({ servicos, calcularValorComPercentual, total, totalComissao }) {
  return (
    <div className='card-calculo mt-6'>

      <h3 className="titulo-tabela-porcentuais">Tabela com Percentuais Aplicados:</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Cliente</th>
              <th className="border px-4 py-2">Data</th>
              <th className="border px-4 py-2">Tipo</th>
              <th className="border px-4 py-2">Valor</th>
              <th className="border px-4 py-2">%</th>
              <th className="border px-4 py-2">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {servicos.flatMap((s) => 
              calcularValorComPercentual(s).map((linha, i) => (
                <tr key={`${s.id}-${i}`} className="text-sm hover:bg-gray-50">
                  <td className="border px-2 py-1">{s.clienteNome}</td>
                  <td className="border px-2 py-1">{s.dataFormatada}</td>
                  <td className="border px-2 py-1">{linha.tipo}</td>
                  <td className="border px-2 py-1 text-right">
                    {linha.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="border px-2 py-1 text-right">{(linha.percentual * 100).toFixed(0)}%</td>
                  <td className="border px-2 py-1 text-right">
                    {linha.valorComDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="total-de-servicos">
        <div className="text-center">
          <p className="text-total-bruto">Total Bruto</p>
          <p className="resultado">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="text-center">
          <p className="text-total-comissao">Total Comissão</p>
          <p className="resultado">{totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="text-center">
          <p className="text-total-servicos">Total de Serviços</p>
          <p className="resultado">{servicos.length}</p>
        </div>
      </div>
    </div>
  );
}
