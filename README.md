# FinanceFlow

Aplicação full stack para controle financeiro pessoal, desenvolvida com React, TypeScript, Node.js, Express e PostgreSQL.

O FinanceFlow permite que usuários gerenciem suas receitas e despesas, organizem movimentações por categoria e acompanhem um resumo financeiro mensal por meio de um Dashboard.

O projeto foi desenvolvido com foco na consolidação de conceitos de desenvolvimento full stack, integração entre frontend, API e banco de dados, autenticação, tratamento de erros e testes automatizados.

## Funcionalidades

- Cadastro e login de usuários.
- Autenticação com JWT.
- Rotas protegidas e recuperação de sessão.
- Cadastro, consulta, edição e exclusão de movimentações.
- Categorias de receitas e despesas.
- Filtros de movimentações por tipo e categoria na interface.
- Dashboard com receitas, despesas e saldo do mês atual.
- Listagem das movimentações recentes.
- Validação de dados no frontend e backend.
- Controle de acesso aos registros por usuário.
- Tratamento de erros de autenticação, aplicação e conexão com o banco.
- Interface responsiva.

**Regra do Dashboard:** os indicadores consideram as movimentações do mês atual com data até hoje. Lançamentos futuros continuam disponíveis no histórico, mas não entram no resumo até sua data.

## Tecnologias

### Frontend
- React
- TypeScript
- Vite
- React Router
- CSS Modules
- Fetch API
- Vitest
- React Testing Library

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT
- bcrypt
- Zod

### Ferramentas
- Docker e Docker Compose
- Insomnia
- Git e GitHub

## Arquitetura

O frontend React consome uma API REST desenvolvida com Node.js e Express.

A API recebe as requisições, valida os dados, verifica a autenticação e a autorização e realiza as operações necessárias no PostgreSQL.

Os registros financeiros são associados ao usuário autenticado, impedindo o acesso a movimentações de outras contas.

```text
React + TypeScript
        |
        | HTTP / JSON
        v
Node.js + Express
        |
        | Consultas SQL
        v
    PostgreSQL
```

## Executando localmente

### Pré-requisitos

- Node.js compatível com as dependências do projeto
- npm
- Docker e Docker Compose

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
cd financeflow
```

Substitua `URL_DO_REPOSITORIO` pelo endereço real após a publicação no GitHub.

### 2. Configurar as variáveis de ambiente

Crie `backend/.env` e `frontend/.env` com base nos respectivos arquivos `.env.example`.

Configure as credenciais locais do PostgreSQL, a chave JWT e as URLs utilizadas pelos serviços.

Os arquivos `.env` reais não devem ser enviados ao repositório.

### 3. Iniciar o PostgreSQL

Na raiz do projeto:

```bash
docker compose up -d
```

### 4. Iniciar o backend

```bash
cd backend
npm install
npm run dev
```

O backend utiliza a porta configurada no ambiente, normalmente `3000` no desenvolvimento local.

### 5. Iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O Vite normalmente disponibiliza a aplicação em `http://localhost:5173`.

**Observação:** a configuração inicial do banco, incluindo tabelas, categorias e demais dados necessários, deve seguir os scripts ou procedimentos de inicialização disponibilizados no repositório.

## Endpoints principais

| Método | Endpoint | Finalidade |
|---|---|---|
| POST | `/users` | Cadastro de usuário |
| POST | `/login` | Autenticação |
| GET | `/users/me` | Consulta da conta autenticada |
| GET | `/categories` | Consulta de categorias |
| GET | `/transactions` | Listagem de movimentações |
| GET | `/transactions/:id` | Consulta de uma movimentação |
| POST | `/transactions` | Cadastro de movimentação |
| PUT | `/transactions/:id` | Atualização de movimentação |
| DELETE | `/transactions/:id` | Exclusão de movimentação |
| GET | `/health` | Verificação da API |
| GET | `/health/db` | Verificação da conexão com o banco |

As rotas de movimentações e categorias exigem autenticação.

## Testes

O projeto possui testes automatizados no backend e frontend.

No backend, são verificados comportamentos relacionados a autenticação, autorização, validação de dados, operações financeiras e tratamento de erros.

No frontend, são testados cálculos financeiros, comunicação HTTP, recuperação de sessão, proteção de rotas e interações com formulários e listas.

### Backend

```bash
cd backend
npm run test
npm run build
```

### Frontend

```bash
cd frontend
npm run test
npm run build
npm run lint
```

O projeto também foi testado manualmente com Insomnia, incluindo falhas de conexão e tentativas de acesso a registros de outros usuários.

## Segurança e limitações conhecidas

- Senhas são armazenadas com hash.
- As rotas privadas utilizam validação JWT.
- O backend verifica a autorização para acessar e alterar registros.
- As entradas são validadas no servidor.
- Os erros são tratados para reduzir a exposição de detalhes internos.
- O JWT é atualmente armazenado no `sessionStorage`; essa escolha apresenta riscos em caso de XSS.
- O logout remove a sessão local, mas não revoga automaticamente um JWT já emitido.
- Para utilização com dados reais de usuários, recomenda-se revisar o modelo de sessão e realizar uma avaliação adicional de segurança.

## Objetivo do projeto

O FinanceFlow faz parte de meus estudos e projetos de portfólio em desenvolvimento full stack.

O objetivo foi construir uma aplicação funcional de ponta a ponta, praticando organização de código, integração entre camadas, banco de dados relacional, autenticação, testes automatizados e tratamento de falhas.

## Status

Aplicação desenvolvida e testada localmente. Preparação para publicação e deploy em andamento.
