import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, collection, getDocs, addDoc, query, orderBy, limit, startAfter, deleteDoc, updateDoc } from 'firebase/firestore';
import ServicoForm from './ServicoForm';
import ServicoLista from './ServicoLista';
import { ArrowLeft } from '../../components/ArrowLeft.jsx';
import "./style.css";
import { HamburgerMenu } from '../../components/HamburgerMenu.jsx';
// import "./servicosStyles.css";

export default function Servicos({ db }) {
  // Estados principais
  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicoEditando, setServicoEditando] = useState(null);

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [temMais, setTemMais] = useState(true);
  const itensPorPagina = 10;

  // Carrega apenas os clientes inicialmente
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setLoading(true);
        const clientesSnapshot = await getDocs(collection(db, 'clientes'));
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

    carregarClientes();
  }, [db]);

  // Função para carregar serviços (manual ou por paginação)
  const carregarServicos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let servicosQuery = query(
        collection(db, 'servicos'),
        orderBy('data', 'desc'),
        limit(itensPorPagina)
      );

      if (paginaAtual > 1 && ultimoDoc) {
        servicosQuery = query(servicosQuery, startAfter(ultimoDoc));
      }

      const servicosSnapshot = await getDocs(servicosQuery);
      
      if (servicosSnapshot.docs.length > 0) {
        setUltimoDoc(servicosSnapshot.docs[servicosSnapshot.docs.length - 1]);
        setTemMais(servicosSnapshot.docs.length === itensPorPagina);
      } else {
        setTemMais(false);
      }

      const servicosData = servicosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataFormatada: new Date(doc.data().data).toLocaleDateString('pt-BR'),
        observacoes: doc.data().observacoes || ''
      }));

      if (paginaAtual === 1) {
        setServicos(servicosData);
      } else {
        setServicos(prev => [...prev, ...servicosData]);
      }
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
      setError("Erro ao carregar serviços. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Carrega mais itens quando a página muda
  useEffect(() => {
    if (paginaAtual > 1) {
      carregarServicos();
    }
  }, [paginaAtual]);

  // Filtra clientes com useMemo para melhor performance
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      cliente.telefone.includes(buscaCliente)
    );
  }, [clientes, buscaCliente]);

  // Ordena serviços por data
  const servicosOrdenados = useMemo(() => {
    return [...servicos].sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [servicos]);

  // Adiciona ou edita um serviço
  const handleAddServico = async (novoServico) => {
    try {
      setLoading(true);
      
      if (servicoEditando) {
        await updateDoc(doc(db, 'servicos', servicoEditando.id), {
          ...novoServico,
          valor: parseFloat(novoServico.valor),
          clienteId: clienteSelecionado.id,
          clienteNome: clienteSelecionado.nome,
          data: new Date(novoServico.data).toISOString(),
          observacoes: novoServico.observacoes || ''
        });
        
        setServicos(servicos.map(s => 
          s.id === servicoEditando.id ? { 
            ...s,
            ...novoServico,
            valor: parseFloat(novoServico.valor),
            clienteId: clienteSelecionado.id,
            clienteNome: clienteSelecionado.nome,
            data: new Date(novoServico.data).toISOString(),
            dataFormatada: new Date(novoServico.data).toLocaleDateString('pt-BR')
          } : s
        ));
        
        setServicoEditando(null);
        setClienteSelecionado(null);
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const docRef = await addDoc(collection(db, 'servicos'), {
          ...novoServico,
          valor: parseFloat(novoServico.valor),
          clienteId: clienteSelecionado.id,
          clienteNome: clienteSelecionado.nome,
          data: new Date(novoServico.data).toISOString(),
          observacoes: novoServico.observacoes || ''
        });
        
        setServicos(prev => [{
          id: docRef.id,
          ...novoServico,
          clienteNome: clienteSelecionado.nome,
          dataFormatada: new Date(novoServico.data).toLocaleDateString('pt-BR')
        }, ...prev]);
        
        toast.success("Serviço agendado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error(`Erro ao ${servicoEditando ? 'atualizar' : 'agendar'} serviço`);
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

      //debug
      console.log("ID do serviço a ser deletado:", id);

      // Cria a referência do documento corretamente
      const servicoRef = doc(db, 'servicos', id);
      
      // Debug: verifique o caminho da referência
      console.log("Caminho do documento:", servicoRef.path);
      
      // Executa a exclusão
      await deleteDoc(servicoRef); 

      // Atualiza o estado local removendo o serviço deletado
      setServicos(prevServicos => prevServicos.filter(servico => servico.id !== id));
      
      // Reseta a paginação pois os itens mudaram
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

  // Carrega mais itens (pagination)
  const handleCarregarMais = () => {
    setPaginaAtual(prev => prev + 1);
  };

  return (
    <div className="services-container">
      <div className="card-services">
        <div className="services-header">
          <HamburgerMenu />
          <h1 className="services-title">Relatório de Serviços</h1>
          <ArrowLeft />
          
        </div>
        
        {error && (
          <div className="services-error">
            {error}
          </div>
        )}
        
        <div className="services-grid">
          <div>
            <div className="client-search-container">
              <input
                type="text"
                placeholder="Buscar cliente por nome ou telefone"
                className="client-search-input"
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
              />
            </div>
            
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
            
            {clienteSelecionado && (
              <ServicoForm 
                cliente={clienteSelecionado}
                onSubmit={handleAddServico}
                onCancel={() => setClienteSelecionado(null)}
                loading={loading}
              />
            )}
          </div>
          
          <div className="services-list-container">
          <button 
            onClick={carregarServicos}
            className="load-services-btn"
          >
            Carregar Serviços
          </button>
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
