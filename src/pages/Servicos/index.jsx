import { useState, useEffect, useMemo } from 'react';
import {
  doc, collection, getDocs, addDoc, query,
  orderBy, limit, startAfter, deleteDoc,
  updateDoc, where
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { HamburgerMenu } from '../../components/HamburgerMenu.jsx';
import { ArrowLeft } from '../../components/ArrowLeft.jsx';
import ServicoPesquisa from './ServicoPesquisa.jsx';
import ServicoForm from './ServicoForm';
import ServicoLista from './ServicoLista';
import 'react-toastify/dist/ReactToastify.css';
import "./style.css";

// Supondo que você esteja usando Auth Context
import { getAuth } from 'firebase/auth';

export default function Servicos({ db }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicoEditando, setServicoEditando] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [temMais, setTemMais] = useState(true);
  const [todosServicos, setTodosServicos] = useState([]);
  const itensPorPagina = 10;

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setLoading(true);
        const clientesRef = collection(db, 'clientes');
        const q = query(clientesRef, where('uid', '==', uid));
        const clientesSnapshot = await getDocs(q);
        const clientesData = clientesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClientes(clientesData);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
        setError("Erro ao carregar clientes. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    if (uid) carregarClientes();
  }, [db, uid]);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      setError(null);

      let servicosRef = collection(db, 'servicos');
      let servicosQuery = query(
        servicosRef,
        where('uid', '==', uid),
        orderBy('data', 'desc'),
        limit(itensPorPagina)
      );

      if (paginaAtual > 1 && ultimoDoc) {
        servicosQuery = query(servicosQuery, startAfter(ultimoDoc));
      }

      const snapshot = await getDocs(servicosQuery);

      if (snapshot.docs.length > 0) {
        setUltimoDoc(snapshot.docs[snapshot.docs.length - 1]);
        setTemMais(snapshot.docs.length === itensPorPagina);
      } else {
        setTemMais(false);
      }

      const dados = snapshot.docs.map(doc => {
        const dataDoc = doc.data();
        return {
          id: doc.id,
          ...dataDoc,
          dataFormatada: dataDoc.data
            ? new Date(dataDoc.data).toLocaleDateString('pt-BR')
            : '',
          observacoes: dataDoc.observacoes || ''
        };
      });

      setServicos(prev => paginaAtual === 1 ? dados : [...prev, ...dados]);

    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
      setError("Erro ao carregar serviços. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const carregarTodosServicos = async () => {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'servicos'),
          where('uid', '==', uid),
          orderBy('data', 'desc')
        )
      );
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataFormatada: new Date(doc.data().data).toLocaleDateString('pt-BR')
      }));
      setTodosServicos(dados);
    } catch (err) {
      console.error("Erro ao carregar todos os serviços para pesquisa:", err);
    }
  };

  useEffect(() => {
    if (uid) carregarTodosServicos();
  }, [db, uid]);

  useEffect(() => {
    if (uid && (paginaAtual === 1 || paginaAtual > 1)) {
      carregarServicos();
    }
  }, [paginaAtual, uid]);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      cliente.telefone.includes(buscaCliente)
    );
  }, [clientes, buscaCliente]);

  const servicosOrdenados = useMemo(() => {
    return [...servicos].sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [servicos]);

  const handleAddServico = async (novoServico) => {
    try {
      setLoading(true);

      const servicoFormatado = {
        ...novoServico,
        valor: parseFloat(novoServico.valor),
        clienteId: clienteSelecionado.id,
        clienteNome: clienteSelecionado.nome,
        data: new Date(novoServico.data).toISOString(),
        uid: uid,
        observacoes: novoServico.observacoes || ''
      };

      if (servicoEditando) {
        await updateDoc(doc(db, 'servicos', servicoEditando.id), servicoFormatado);
        setServicos(servicos.map(s =>
          s.id === servicoEditando.id ? {
            ...s,
            ...servicoFormatado,
            dataFormatada: new Date(novoServico.data).toLocaleDateString('pt-BR')
          } : s
        ));
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const docRef = await addDoc(collection(db, 'servicos'), servicoFormatado);
        setServicos(prev => [{
          id: docRef.id,
          ...servicoFormatado,
          dataFormatada: new Date(novoServico.data).toLocaleDateString('pt-BR')
        }, ...prev]);
        toast.success("Serviço agendado com sucesso!");
      }

      setServicoEditando(null);
      setClienteSelecionado(null);
      await carregarTodosServicos();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error(`Erro ao ${servicoEditando ? 'atualizar' : 'salvar'} serviço`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditServico = (servico) => {
    setClienteSelecionado({
      id: servico.clienteId,
      nome: servico.clienteNome
    });
    setServicoEditando(servico);
  };

  const handleDeleteServico = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'servicos', id));
      setServicos(prevServicos => prevServicos.filter(servico => servico.id !== id));
      setPaginaAtual(1);
      setUltimoDoc(null);
      toast.success("Serviço excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      toast.error(`Erro ao excluir serviço: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCarregarMais = () => {
    setPaginaAtual(prev => prev + 1);
  };

  return (
    <div className="services-container">
      <div className="card-services">
        <div className="services-header">
          <HamburgerMenu />
          <h1 className="services-title">Relatório de Atendimento</h1>
          <ArrowLeft />
        </div>

        {error && (
          <div className="services-error">
            {error}
          </div>
        )}

        <div className="services-grid">
          <div container-client-search>
            <div className="client-search-container">
              <p> Pesquise o cliente para a inclusão do serviço:</p>
              <input
                type="text"
                placeholder="Buscar cliente por nome ou telefone"
                className="client-search-input"
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
              />
            {buscaCliente && (
              <div className="client-list">
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map(cliente => (
                    <div
                      key={cliente.id}
                      className="client-item"
                      onClick={() => {
                        setClienteSelecionado(cliente);
                        setBuscaCliente('');
                      }}
                    >
                      <div className="flex justify-between">
                        <span className="client-name">{cliente.nome}</span>
                        <span className="client-phone">{cliente.telefone}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-clients">Nenhum cliente encontrado</div>
                )}
              </div>
            )}
            </div>

            {clienteSelecionado && (
              <ServicoForm
                key={servicoEditando ? servicoEditando.id : 'novo'}
                cliente={clienteSelecionado}
                servicoEditando={servicoEditando}
                onSubmit={handleAddServico}
                onCancel={() => {
                  setClienteSelecionado(null);
                  setServicoEditando(null);
                }}
                loading={loading}
              />
            )}
          </div>

          <div className="services-list-container">
            <p>
              Pesquise aqui os serviços já salvos!
            </p>
            <ServicoPesquisa servicos={todosServicos} />
            <ServicoLista
              servicos={servicosOrdenados}
              loading={loading}
              onEdit={handleEditServico}
              onDelete={handleDeleteServico}
            />

            {temMais && (
              <button
                onClick={handleCarregarMais}
                disabled={loading}
                className="load-more-btn"
              >
                {loading ? 'Carregando...' : 'Carregar Mais'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
