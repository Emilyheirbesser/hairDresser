import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { HamburgerMenu } from '../../components/HamburgerMenu.jsx';

import { db } from '../../firebaseConfig';
import { horarios } from './horarios';

import './agenda.css';

export default function Agenda() {
  const [servicos, setServicos] = useState([]);

  // Data atual automática
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toLocaleDateString('pt-BR')
  );

  useEffect(() => {
    async function buscarServicos() {
      try {
        const snapshot = await getDocs(collection(db, 'servicos'));

        const lista = snapshot.docs.map(doc => {
          const data = doc.data();

          // Converte data corretamente
          const dataConvertida = data.data?.toDate
            ? data.data.toDate()
            : data.data
              ? new Date(data.data)
              : null;

          return {
            id: doc.id,
            ...data,

            dataFormatada: dataConvertida
              ? dataConvertida.toLocaleDateString('pt-BR')
              : 'Sem data'
          };
        });

        setServicos(lista);

      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      }
    }

    buscarServicos();
  }, []);

  // Filtra serviços da data selecionada
  const servicosDoDia = servicos.filter(
    servico => servico.dataFormatada === dataSelecionada
  );
   
  const alterarData = (dias) => {

    const partes = dataSelecionada.split('/');

    const dataAtual = new Date(
        partes[2],
        partes[1] - 1,
        partes[0]
    );

    dataAtual.setDate(dataAtual.getDate() + dias);

    setDataSelecionada(
        dataAtual.toLocaleDateString('pt-BR')
    );
    };

    const converterDataParaInput = (dataBR) => {

    const partes = dataBR.split('/');

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

  return (
    <div className="agenda-container">
      <div className="agenda-card">

        <div className="agenda-header">
          <div className="tituloMenu">
            <HamburgerMenu/>
            <h1>Agenda</h1>
          </div>
          <span className="agenda-data">
            {dataSelecionada}
          </span>

          <div className="agenda-topbar">

              <button
                  className="agenda-hoje-btn"
                  onClick={() =>
                  setDataSelecionada(
                      new Date().toLocaleDateString('pt-BR')
                  )
                  }
              >
                  Hoje
              </button>

              <div className="data-search">
                  <button
                      className="agenda-nav-btn"
                      onClick={() => alterarData(-1)}
                  >
                      ←
                  </button>

                  <input
                      type="date"
                      className="agenda-date-input"
                      value={converterDataParaInput(dataSelecionada)}
                      onChange={(e) => {
                      const data = new Date(e.target.value);

                      setDataSelecionada(
                          data.toLocaleDateString('pt-BR')
                      );
                      }}
                  />
                  <button
                      className="agenda-nav-btn"
                      onClick={() => alterarData(1)}
                  >
                      →
                  </button>
              </div>


          </div>
        </div>
        <div className="agenda-grid">

          {servicosDoDia.length > 0 ? (

          servicosDoDia
              .sort((a, b) => a.horario.localeCompare(b.horario))
              .map(servico => (
                  
                <div
                  key={servico.id}
                  className={`agenda-card status-${servico.status}`}
                >  
                  <div className="agenda-hora">
                    {servico.horario}
                  </div>

                  <div className="agenda-info">

                    <div className="agenda-topo">
                      <span className={`agenda-status status-${servico.status}`}>
                        {servico.status}
                      </span>
                    </div>

                    <h3 className="agenda-cliente">
                      {servico.clienteNome}
                    </h3>

                    <p className="agenda-servico">
                      {Array.isArray(servico.tipos)
                        ? servico.tipos.map(t => t.tipo).join(', ')
                        : servico.tipo
                      }
                    </p>

                  </div>

                </div>
                ))

          ) : (

          <div className="agenda-sem-agendamento">
              Nenhum agendamento para esta data
          </div>

          )}

        </div>


      </div>
    </div>
  );
}