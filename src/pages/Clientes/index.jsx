import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ArrowLeft } from '../../components/ArrowLeft.jsx';
import { HamburgerMenu } from '../../components/HamburgerMenu.jsx';
import ClienteForm from './ClienteForm';
import ClienteLista from './ClienteLista';
import './stylesCliente.css';

export default function Clientes({ db, user }) {
  const uid = user?.uid;

  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [limiteExibicao, setLimiteExibicao] = useState(10); // Exibir 10 inicialmente

  // Carrega clientes do Firebase com filtro por UID e ordenação por nome
  useEffect(() => {
    if (!uid) return;

    const carregarClientes = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'clientes'),
          where('uid', '==', uid),
          orderBy('nome')
        );

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
  }, [db, uid]);

  // Filtra clientes com useMemo para melhor performance
  const clientesFiltrados = useMemo(() => {
    const filtrados = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (cliente.telefone && cliente.telefone.includes(busca)) ||
      (cliente.email && cliente.email.toLowerCase().includes(busca.toLowerCase()))
    );
    return filtrados.slice(0, limiteExibicao); // limitar exibição
  }, [clientes, busca, limiteExibicao]);

  // Adiciona ou atualiza cliente
  const handleAddCliente = async (novoCliente) => {
    try {
      setLoading(true);
      const clienteComUid = { ...novoCliente, uid };

      if (clienteEditando) {
        await updateDoc(doc(db, 'clientes', clienteEditando.id), clienteComUid);
        setClientes(clientes.map(c =>
          c.id === clienteEditando.id ? { ...clienteComUid, id: clienteEditando.id } : c
        ));
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const docRef = await addDoc(collection(db, 'clientes'), clienteComUid);
        setClientes([...clientes, { ...clienteComUid, id: docRef.id }]);
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
    <div className="clients-container">
      <div className='card-clients'>
        <div className="clients-header">
          <HamburgerMenu />
          <h1 className="clients-title">Gerenciamento de Clientes</h1>
          <ArrowLeft />
        </div>
      
      <button
        onClick={() => {
          setClienteEditando(null);
          setModalAberto(true);
        }}
        className="new-client-btn"
        >
        + Novo Cliente
      </button>

    {error && (
      <div className="clients-error">
        <p>{error}</p>
      </div>
    )}

      <div className="search-container">
        <div className="relative">

          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            className="search-input"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <ClienteLista 
        clientes={clientesFiltrados} 
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
      {clientesFiltrados.length < clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (cliente.telefone && cliente.telefone.includes(busca)) ||
        (cliente.email && cliente.email.toLowerCase().includes(busca.toLowerCase()))
      ).length && (
        <div className="text-center mt-4">
          <button
            className="mostrar-mais"
            onClick={() => setLimiteExibicao(limiteExibicao + 10)}
          >
            Mostrar mais
          </button>
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
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
    </div>
  );
}
