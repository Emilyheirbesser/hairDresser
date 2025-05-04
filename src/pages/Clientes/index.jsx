import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';

import { ArrowLeft } from '../../components/ArrowLeft.jsx';

import ClienteForm from './ClienteForm';
import ClienteLista from './ClienteLista';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Clientes({ db }) {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Carrega clientes do Firebase com ordenação
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'clientes'), orderBy('nome'));
        const querySnapshot = await getDocs(q);
        
        const clientesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setClientes(clientesData);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
        setError("Erro ao carregar clientes. Tente recarregar a página.");
        toast.error("Erro ao carregar clientes");
      } finally {
        setLoading(false);
      }
    };

    carregarClientes();
  }, [db]);

  // Filtra clientes com useMemo para melhor performance
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (cliente.telefone && cliente.telefone.includes(busca)) ||
      (cliente.email && cliente.email.toLowerCase().includes(busca.toLowerCase()))
    );
  }, [clientes, busca]);

  // Adiciona/Atualiza cliente
  const handleAddCliente = async (novoCliente) => {
    try {
      setLoading(true);
      
      if (clienteEditando) {
        await updateDoc(doc(db, 'clientes', clienteEditando.id), novoCliente);
        setClientes(clientes.map(c => 
          c.id === clienteEditando.id ? { ...novoCliente, id: clienteEditando.id } : c
        ));
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const docRef = await addDoc(collection(db, 'clientes'), novoCliente);
        setClientes([...clientes, { ...novoCliente, id: docRef.id }]);
        toast.success("Cliente adicionado com sucesso!");
      }
      
      setClienteEditando(null);
      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error(`Erro ao ${clienteEditando ? 'atualizar' : 'adicionar'} cliente`);
    } finally {
      setLoading(false);
    }
  };

  // Remove cliente
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'clientes', id));
      setClientes(clientes.filter(c => c.id !== id));
      toast.success("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      toast.error("Erro ao excluir cliente");
    } finally {
      setLoading(false);
    }
  };

  // Abre modal para edição
  const handleEdit = (cliente) => {
    setClienteEditando(cliente);
    setModalAberto(true);
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className='header-with-back'>
        <ArrowLeft />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Clientes</h1>
        <button
          onClick={() => {
            setClienteEditando(null);
            setModalAberto(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Novo Cliente
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <ClienteLista 
        clientes={clientesFiltrados} 
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">
                {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={() => {
                  setClienteEditando(null);
                  setModalAberto(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ClienteForm 
              onSubmit={handleAddCliente} 
              clienteEditando={clienteEditando}
              onCancel={() => {
                setClienteEditando(null);
                setModalAberto(false);
              }}
              loading={loading}
            />
          </div>
        </div>
      )}

    </div>
  );
}
