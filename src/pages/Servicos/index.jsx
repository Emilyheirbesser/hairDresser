import { useState, useEffect, useMemo } from 'react';
import { doc, collection, getDocs, addDoc, query, orderBy, limit, startAfter, deleteDoc } from 'firebase/firestore';
import ServicoForm from './ServicoForm';
import ServicoLista from './ServicoLista';

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

  // Carrega dados do Firebase com paginação
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carrega clientes (sem paginação)
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);

      // Carrega serviços com paginação e ordenação por data
      let servicosQuery = query(
        collection(db, 'servicos'),
        orderBy('data', 'desc'),
        limit(itensPorPagina)
      );

      if (paginaAtual > 1 && ultimoDoc) {
        servicosQuery = query(servicosQuery, startAfter(ultimoDoc));
      }

      const servicosSnapshot = await getDocs(servicosQuery);
      
      // Atualiza último documento para paginação
      if (servicosSnapshot.docs.length > 0) {
        setUltimoDoc(servicosSnapshot.docs[servicosSnapshot.docs.length - 1]);
        setTemMais(servicosSnapshot.docs.length === itensPorPagina);
      } else {
        setTemMais(false);
      }

      // Processa dados dos serviços
      const servicosData = servicosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Formata a data para exibição
        dataFormatada: new Date(doc.data().data).toLocaleDateString('pt-BR')
      }));

      if (paginaAtual === 1) {
        setServicos(servicosData);
      } else {
        setServicos(prev => [...prev, ...servicosData]);
      }
      
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [db, paginaAtual]);

  // Filtra clientes com useMemo para melhor performance
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      cliente.telefone.includes(buscaCliente)
    );
  }, [clientes, buscaCliente]);

  // Ordena serviços por data (já vem ordenado do Firebase, mas garantimos)
  const servicosOrdenados = useMemo(() => {
    return [...servicos].sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [servicos]);

  // Adiciona novo serviço
  const handleAddServico = async (novoServico) => {
    try {
      setLoading(true);
      
      if (servicoEditando) {
        await updateDoc(doc(db, 'servicos', servicoEditando.id), {
          ...novoServico,
          valor: parseFloat(novoServico.valor),
          clienteId: clienteSelecionado.id,
          clienteNome: clienteSelecionado.nome,
          data: new Date(novoServico.data).toISOString()
        });
        
        setServicos(servicos.map(s => 
          s.id === servicoEditando.id ? { 
            ...novoServico,
            id: servicoEditando.id,
            dataFormatada: new Date(novoServico.data).toLocaleDateString('pt-BR')
          } : s
        ));
        
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const docRef = await addDoc(collection(db, 'servicos'), {
          ...novoServico,
          valor: parseFloat(novoServico.valor),
          clienteId: clienteSelecionado.id,
          clienteNome: clienteSelecionado.nome,
          data: new Date(novoServico.data).toISOString()
        });
        
        setServicos(prev => [{
          id: docRef.id,
          ...novoServico,
          clienteNome: clienteSelecionado.nome,
          dataFormatada: new Date(novoServico.data).toLocaleDateString('pt-BR')
        }, ...prev]);
        
        toast.success("Serviço agendado com sucesso!");
      }
      
      setClienteSelecionado(null);
      setServicoEditando(null);
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Relatório de Serviços</h1>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar cliente por nome ou telefone"
              className="w-full p-2 border rounded"
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
            />
          </div>
          
          {/* Lista de clientes filtrados */}
          {buscaCliente && (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map(cliente => (
                    <li key={cliente.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div 
                        onClick={() => {
                          setClienteSelecionado(cliente);
                          setBuscaCliente('');
                        }}
                        className="flex justify-between"
                      >
                        <span className="font-medium">{cliente.nome}</span>
                        <span>{cliente.telefone}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-gray-500">Nenhum cliente encontrado</li>
                )}
              </ul>
            </div>
          )}
          
          {/* Formulário de serviço */}
          {clienteSelecionado && (
            <ServicoForm 
              cliente={clienteSelecionado}
              onSubmit={handleAddServico}
              onCancel={() => setClienteSelecionado(null)}
              loading={loading}
            />
          )}
        </div>
        
        {/* Lista de serviços */}
        <div>
          <ServicoLista 
            servicos={servicosOrdenados} 
            loading={loading}
            onEdit={handleEditServico}
            onDelete={handleDeleteServico}
          />
          
          {/* Botão para carregar mais serviços */}
          {temMais && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleCarregarMais}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Carregar Mais'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
