import { useState, useEffect } from 'react';
import './ServicoForm.css'; 

const TIPOS_SERVICO = [
  'Corte de Cabelo',
  'Coloração',
  'Hidratação',
  'Mechas',
  'Tonalizante',
  'botox',
  'Progressiva',
  'Escova',
  'Outro'
];

const HORARIOS_DISPONIVEIS = [
  '08:00', '09:00', '10:00', '11:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ServicoForm({ cliente, onSubmit, onCancel, loading, servicoEditando }) {
  const [servico, setServico] = useState({
    tipo: TIPOS_SERVICO[0],
    data: formatDate(new Date()),
    horario: '09:00',
    valor: '',
    observacoes: '',
    status: 'agendado'
  });

  // Função para formatar a data corretamente
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
    if (servicoEditando) {
      // Corrige a formatação da data ao editar
      const dataCorrigida = servicoEditando.data.includes('T') 
        ? servicoEditando.data.split('T')[0]
        : servicoEditando.data;
        
      setServico({
        tipo: servicoEditando.tipo || TIPOS_SERVICO[0],
        data: dataCorrigida,
        horario: servicoEditando.horario || '09:00',
        valor: servicoEditando.valor || '',
        observacoes: servicoEditando.observacoes || '',
        status: servicoEditando.status || 'agendado'
      });
    }
  }, [cliente, servicoEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServico(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Garante que a data está no formato correto
    const dataFormatada = servico.data.includes('T') 
      ? servico.data 
      : `${servico.data}T00:00:00`;
    
    const servicoFormatado = {
      ...servico,
      data: dataFormatada,
      valor: parseFloat(servico.valor),
      observacoes: servico.observacoes || ''
    };
    
    onSubmit(servicoFormatado);
  };

  return (
    <div className="servico-form-container">
      <h2 className="servico-form-title">
        {servicoEditando ? 'Editar Serviço' : 'Agendar Serviço'} para {cliente.nome}
      </h2>
      
      <form onSubmit={handleSubmit} className="servico-form">
        <div className="form-group">
          <label className="form-label">Tipo de Serviço*</label>
          <select
            name="tipo"
            value={servico.tipo}
            onChange={handleChange}
            className="form-select"
            required
          >
            {TIPOS_SERVICO.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

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
            <select
              name="horario"
              value={servico.horario}
              onChange={handleChange}
              className="form-select"
              required
            >
              {HORARIOS_DISPONIVEIS.map(horario => (
                <option key={horario} value={horario}>{horario}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Valor (R$)*</label>
          <div className="input-with-icon">
            <span className="input-icon">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="valor"
              value={servico.valor}
              onChange={handleChange}
              className="form-input"
              placeholder="0,00"
              required
            />
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

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="cancel-button"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Salvando...' : servicoEditando ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}