// src/pages/AdminTools.jsx
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useState } from 'react';

export default function Admin() {
  const [log, setLog] = useState([]);
  const [executando, setExecutando] = useState(false);

  const corrigirDatasParaTimestamp = async () => {
    const confirmacao = window.confirm('⚠️ Tem certeza que deseja atualizar todas as datas para Timestamp?');
    if (!confirmacao) return;

    setExecutando(true);
    const servicosRef = collection(db, 'servicos');
    const snapshot = await getDocs(servicosRef);

    const novoLog = [];

    for (const docSnap of snapshot.docs) {
      const dados = docSnap.data();
      const dataOriginal = dados.data;

      // Já é Timestamp, ignora
      if (dataOriginal instanceof Timestamp) {
        novoLog.push(`🔁 ${docSnap.id} já está no formato Timestamp`);
        continue;
      }

      try {
        const dataConvertida = new Date(dataOriginal);
        if (isNaN(dataConvertida)) {
          novoLog.push(`❌ ${docSnap.id}: data inválida (${dataOriginal})`);
          continue;
        }

        await updateDoc(doc(servicosRef, docSnap.id), {
          data: Timestamp.fromDate(dataConvertida)
        });

        novoLog.push(`✅ ${docSnap.id} atualizado`);
      } catch (erro) {
        novoLog.push(`❌ ${docSnap.id} erro: ${erro.message}`);
      }
    }

    setLog(novoLog);
    setExecutando(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Ferramentas Administrativas</h1>

      <button
        onClick={corrigirDatasParaTimestamp}
        disabled={executando}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {executando ? 'Executando...' : 'Corrigir Datas para Timestamp'}
      </button>

      {log.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Log de execução:</h2>
          <ul className="text-sm list-disc pl-5 space-y-1 max-h-80 overflow-auto">
            {log.map((linha, index) => (
              <li key={index}>{linha}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
