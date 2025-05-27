💇‍♀️ Web App de Agendamentos – Planned Hair
Aplicação Front-end responsiva desenvolvida com React + Vite, voltada para o gerenciamento de serviços, clientes e agendamentos em salões de beleza.

⚙️ Tecnologias utilizadas:
React (Hooks e Componentes Funcionais)

Vite (ambiente de build rápido)

Tailwind CSS (estilização)

Firebase (CRUD, autenticação e banco de dados)

React Icons (ícones dinâmicos)

✨ Funcionalidades:
Cadastro e listagem de clientes

Registro e edição de atendimentos

Filtro de busca em tempo real

Paginação e ordenação de dados

Interface moderna e responsiva

Feedback visual com toasts

🔗 Deploy:
Hospedado na Netlify: Acesse aqui

### Netfly
[![Netlify Status](https://api.netlify.com/api/v1/badges/82346025-b894-42b3-9929-cf0379ec72a3/deploy-status)](https://app.netlify.com/sites/planned-hair/deploys)



## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.







      {/* {servicoSelecionado && (
        <div className="servico-popup">
          <div className="servico-popup-content">
            <h2>Detalhes do Serviço</h2>
            <p><strong>Cliente:</strong> {servicoSelecionado.clienteNome}</p>
            <p><strong>Serviço:</strong> {servicoSelecionado.tipo}</p>
            <p><strong>Data:</strong> {servicoSelecionado.dataFormatada || 'Data não informada'}</p>
            <p><strong>Horário:</strong> {servicoSelecionado.horario || 'Não informado'}</p>
            <p><strong>Valor:</strong> {servicoSelecionado.valor?.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }) || 'R$ 0,00'}</p>
            <p><strong>Status:</strong> {servicoSelecionado.status || 'Indefinido'}</p>
            <p><strong>Observações:</strong> {servicoSelecionado.observacoes || 'Nenhuma'}</p>
            <button className='btn-fechar' onClick={() => setServicoSelecionado(null)}>Fechar</button>
          </div>
        </div>
      )} */}