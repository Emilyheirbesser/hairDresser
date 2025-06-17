// components/PeriodoMes.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './periodoMes.css'

export function PeriodoMes({ className = '', onShowCalculo }) {
  const [periodo, setPeriodo] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  useEffect(() => {
    const calcularPeriodo = async () => {
      setLoading(true);
      try {
        const hoje = new Date();
        const inicioBase = new Date(2024, 5, 11); // 10/06/2024 — mês é 0-based

        // Encontra o intervalo de 14 dias em que estamos
        const diasPassados = Math.floor((hoje - inicioBase) / (1000 * 60 * 60 * 24));
        const ciclos = Math.floor(diasPassados / 14);
        const inicioPeriodo = new Date(inicioBase);
        inicioPeriodo.setDate(inicioBase.getDate() + ciclos * 14);

        const fimPeriodo = new Date(inicioPeriodo);
        fimPeriodo.setDate(inicioPeriodo.getDate() + 13); // 14 dias no total (inclusive)

        console.log('[📅] Intervalo de 14 dias calculado:');
        console.log('Início:', inicioPeriodo.toISOString());
        console.log('Fim:', fimPeriodo.toISOString());
        
        // Formatar data para exibição
        const formatarData = (date) => {
          return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
        };

        setPeriodo(`${formatarData(inicioPeriodo)} a ${formatarData(fimPeriodo)}`);

        // Firebase busca
        const inicioTimestamp = Timestamp.fromDate(new Date(inicioPeriodo.setHours(0, 0, 0, 0)));
        const fimTimestamp = Timestamp.fromDate(new Date(fimPeriodo.setHours(23, 59, 59, 999)));
        // const fimTimestamp = Timestamp.fromDate(new Date(fimPeriodo.getTime() + 86400000)); // fim do dia +1 dia

        const servicosRef = collection(db, 'servicos');
        const q = query(
          servicosRef,
          where('data', '>=', inicioTimestamp),
          where('data', '<=', fimTimestamp)
        );


        const snapshot = await getDocs(q);
        const servicos = snapshot.docs.map(doc => doc.data());

        const soma = servicos.reduce((acc, servico) => {
          const valor = servico.tipos?.reduce((t, tipo) => t + (parseFloat(tipo.valor) || 0), 0)
            || parseFloat(servico.valor) || 0;
          return acc + valor;
        }, 0);

        setTotal(soma);
      } catch (error) {
        console.error("Erro ao calcular período:", error);
        setPeriodo('Erro ao carregar período');
      } finally {
        setLoading(false);
      }
    };

    calcularPeriodo();
  }, []);


  return (
    <div className={`container ${className}`}>
      <button
        onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
        className="toggle-button"
      >
        {mostrarDetalhes ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Ocultar Mensal
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Mostrar Mensal
          </>
        )}
      </button>

      {mostrarDetalhes && (
        <div className="details-container">
          {loading ? (
            <div className="loading-spinner">
              <div className="loading"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="summaryTitle">Resumo Mensal</h3>
              <div className="infoGrid">
                <div>
                  <p className="infoLabel">Período:</p>
                  <p className="infoValue">{periodo}</p>
                </div>
                <div>
                  <p className="infoLabel">Total:</p>
                  <p className="totalValue">
                    {total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
