import { useState, useEffect } from 'react';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import './ServicoForm.css'; 

const TIPOS_SERVICO = [
  'Auxilio',
  'Babyliss',
  'Botox',
  'Coloração',
  'Corte de Cabelo',
  'Escova',
  'Escova Modelada',
  'Lavagem',
  'Mechas',
  'Preparo',
  'Progressiva',
  'Tonalizante',
  'Tratamentos',
  'Outro'
];

const HORARIOS_DISPONIVEIS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ServicoForm({ cliente, onSubmit, onCancel, loading, servicoEditando }) {
  const [servico, setServico] = useState({
    tipo: TIPOS_SERVICO[0],
    data: formatDate(new Date()),
    horario: '09:00',
    servicosSelecionados: [{ tipo: TIPOS_SERVICO[0], valor: 0, cor: '' }],
    observacoes: '',
    status: 'agendado',
  });

  function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  useEffect(() => {
    console.log('[📥] useEffect - servicoEditando:', servicoEditando);

    if (servicoEditando) {
      let dataCorrigida = '';

      if (servicoEditando.data?.toDate) {
        dataCorrigida = formatDate(servicoEditando.data.toDate());
        console.log('[📆] Data convertida de Timestamp:', dataCorrigida);
      } else if (typeof servicoEditando.data === 'string') {
        dataCorrigida = servicoEditando.data.includes('T')
          ? servicoEditando.data.split('T')[0]
          : servicoEditando.data;
        console.log('[📆] Data convertida de string:', dataCorrigida);
      }

      const tipos = servicoEditando.tipo?.split(',') || [TIPOS_SERVICO[0]];
      const valores = typeof servicoEditando.valor === 'number'
        ? [servicoEditando.valor]
        : (servicoEditando.valor || '0').toString().split(',').map(v => parseFloat(v));

      const servicosSelecionados = tipos.map((tipo, i) => ({
        tipo: tipo.trim(),
        valor: valores[i] || 0
      }));

      const novoServico = {
        data: dataCorrigida,
        horario: servicoEditando.horario || '09:00',
        servicosSelecionados,
        observacoes: servicoEditando.observacoes || '',
        status: servicoEditando.status || 'agendado'
      };

      console.log('[🧩] Estado ajustado no useEffect:', novoServico);
      setServico(novoServico);
    }
  }, [cliente, servicoEditando]);

  const handleServicoChange = (index, field, value) => {
    setServico(prev => {
      const novos = [...prev.servicosSelecionados];
      if (field === 'valor') {
        novos[index][field] = parseFloat(value) || 0;
      } else {
        novos[index][field] = value;
      }
      return { ...prev, servicosSelecionados: novos };
    });
  };

  const adicionarServico = () => {
    setServico(prev => ({
      ...prev,
      servicosSelecionados: [...prev.servicosSelecionados, { tipo: "", valor: 0 }]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServico(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('[📤] handleSubmit iniciado');
    console.log('[📅] Valor de servico.data antes da conversão:', servico.data);
    console.log('[⏰] Valor de servico.horario antes da conversão:', servico.horario);

    const tipos = servico.servicosSelecionados.map(s => s.tipo).join(', ');
    const valorTotal = servico.servicosSelecionados.reduce((soma, s) => soma + s.valor, 0);

    let dataConvertida;

    try {
      const [ano, mes, dia] = servico.data.split('-').map(Number);
      const [hora, minuto] = servico.horario.split(':').map(Number);
      dataConvertida = new Date(ano, mes - 1, dia, hora, minuto, 0);

      console.log('[⏳] dataConvertida (objeto Date):', dataConvertida.toString());
      console.log('[🧭] dataConvertida.toISOString:', dataConvertida.toISOString());
    } catch (error) {
      console.error('[❌] Erro ao converter data:', error, 'Data recebida:', servico.data);
      return;
    }

    const servicoFormatado = {
      tipo: tipos,
      tipos: servico.servicosSelecionados,
      valor: valorTotal,
      data: Timestamp.fromDate(dataConvertida),
      horario: servico.horario,
      observacoes: servico.observacoes,
      status: servico.status,
      criadoEm: serverTimestamp()
    };

    console.log('[📦] servicoFormatado enviado para onSubmit:', servicoFormatado);

    onSubmit(servicoFormatado);
  };


  return (
    <div className="servico-form-container">
      <div className="servico-form-header">
        <h2 className="servico-form-title">
          {servicoEditando ? 'Editar Serviço' : 'Salvar Serviço'} para {cliente.nome}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="btn-fechar-top"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="servico-form">
        {servico.servicosSelecionados.map((s, index) => (
          <div key={index} className="form-row gap-4">
            <div className="form-group grow">
            <label className="form-label">Serviço*</label>
            <select
              value={s.tipo}
              onChange={(e) => handleServicoChange(index, 'tipo', e.target.value)}
              className="form-select"
            >
              <option value="" disabled>Selecione um tipo</option>
              {TIPOS_SERVICO.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            </div>
            <div className="form-group w-28">
              <label className="form-label">Valor*</label>
              <input
                type="number"
                value={s.valor === 0 ? '' : s.valor}
                placeholder="R$ 0,00"
                step="0.01"
                min="0"
                onChange={(e) => handleServicoChange(index, 'valor', e.target.value)}
                className="form-input"
              />
            </div>
            {['Coloração', 'Tonalizante'].includes(s.tipo) && (
              <div className="form-group">
                <label className="form-label">Cor</label>
                <input
                  type="text"
                  value={s.cor || ''}
                  placeholder="Ex: Castanho claro"
                  onChange={(e) => handleServicoChange(index, 'cor', e.target.value)}
                  className="form-input"
                />
              </div>
            )}
          </div>
        ))}

        <button type="button" className="submit-button my-2" onClick={adicionarServico}>
          + Adicionar Serviço
        </button>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Data*</label>
            <input
              type="date"
              name="data"
              value={servico.data}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Horário*</label>
            <input
              type="text"
              name="horario"
              list="horarios-lista"
              value={servico.horario}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Ex: 09:30"
            />
            <datalist id="horarios-lista">
              {HORARIOS_DISPONIVEIS.map(horario => (
                <option key={horario} value={horario} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            name="status"
            value={servico.status}
            onChange={handleChange}
            className="form-select"
          >
            <option value="agendado">Agendado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Observações</label>
          <textarea
            name="observacoes"
            value={servico.observacoes}
            onChange={handleChange}
            className="form-textarea"
            rows="3"
            placeholder="Detalhes do serviço, preferências do cliente, etc."
          />
          <p className="form-hint">Opcional</p>
        </div>

        <div className="form-group">
          <strong>Total: </strong>
          R$ {servico.servicosSelecionados.reduce((soma, s) => soma + s.valor, 0).toFixed(2)}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={loading} className="cancel-button">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className={`submit-button ${loading ? 'loading' : ''}`}>
            {loading ? 'Salvando...' : servicoEditando ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
