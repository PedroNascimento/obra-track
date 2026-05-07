
# 📘 PRD — Sistema Web de Controle de Gastos de Obra

**Versão:** 1.0  
**Status:** Planejamento  
**Arquitetura:** Clean Architecture  
**Ambiente de Desenvolvimento:** Google Antigravity IDE  

---

# 📌 1. Visão Geral

Sistema web para controle financeiro de obra/reforma, permitindo registrar e acompanhar:

- Despesas com material  
- Pagamento de pedreiro  
- Pagamento de servente  
- Alimentação  
- Combustível  
- Outras despesas relacionadas à obra  

O sistema fornecerá:

- Dashboard analítico
- Filtros por período (semanal, mensal, total e personalizado)
- Relatórios em PDF
- Controle por categorias
- Controle por tipo de despesa
- Autenticação com login e senha

O projeto será desenvolvido com **Next.js + TypeScript + PostgreSQL (Supabase)** seguindo **Clean Architecture**.

---

# 🎯 2. Objetivo do Produto

Permitir controle completo, organizado e visual dos custos da obra, garantindo:

- Visão consolidada de gastos
- Comparação por período
- Organização por categoria
- Exportação para relatório formal (PDF)

---

# 👤 3. Usuário-Alvo

- Proprietário da obra
- Responsável financeiro da reforma

Inicialmente mono-usuário (MVP), mas estruturado para suportar multiusuários futuramente.

---

# 🧱 4. Stack Tecnológica Obrigatória

## Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Lucide React (ícones)
- React Hook Form
- Zod (validação)

## Backend
- Next.js API Routes
- Node.js
- Clean Architecture

## Banco de Dados
- PostgreSQL (Supabase)
- Prisma ORM

## Testes
- Vitest (unitários)
- Testing Library (componentes)
- Playwright (E2E)

## Geração de PDF
- pdf-lib ou @react-pdf/renderer

---

# 🏛️ 5. Arquitetura — Clean Architecture

Estrutura obrigatória no Antigravity:

```

src/
├── app/                     # Next App Router
│   ├── (auth)/
│   ├── dashboard/
│   ├── api/
│
├── domain/                  # Regras de negócio puras
│   ├── entities/
│   ├── repositories/
│   ├── use-cases/
│
├── application/             # Orquestração
│   ├── dtos/
│   ├── services/
│
├── infrastructure/          # Implementações externas
│   ├── database/
│   ├── repositories/
│   ├── pdf/
│
├── presentation/            # UI e controllers
│   ├── components/
│   ├── hooks/
│
├── tests/

```

---

# 🗄️ 6. Modelagem de Dados

## Entidade: User

```

id
name
email
password_hash
created_at
updated_at

```

---

## Entidade: Expense

```

id
user_id
type (material | pedreiro | servente | alimentacao | combustivel | outro)
category
description
amount
expense_date
created_at

```

---

## Entidade: Category

```

id
user_id
name
color
created_at

```

---

# 📋 7. Requisitos Funcionais

## RF01 — Autenticação

- Login
- Logout
- Registro
- Hash de senha com bcrypt
- Sessão segura (JWT ou httpOnly cookie)

---

## RF02 — Cadastro de Despesas

Usuário deve informar:

- Tipo
- Categoria
- Descrição
- Data
- Valor

---

## RF03 — Edição e Exclusão

CRUD completo de despesas.

---

## RF04 — Dashboard

Deve exibir:

- Total geral gasto
- Total por tipo
- Total por categoria
- Total no período selecionado
- Últimas despesas

---

## RF05 — Filtros

Filtros obrigatórios:

- Semanal
- Mensal
- Total
- Período personalizado (date range)

---

## RF06 — Relatório PDF

Relatório deve conter:

- Dados do período
- Tabela detalhada
- Total geral
- Total por tipo
- Total por categoria
- Data de geração
- Identificação do usuário

Formato profissional (modelo financeiro).

---

# 📊 8. Dashboard — Detalhamento Técnico

Componentes:

- Cards de resumo
- Gráfico de barras (gastos por categoria)
- Gráfico de pizza (distribuição por tipo)
- Linha temporal (evolução de gastos)

Biblioteca recomendada:
- Recharts

---

# 🎨 9. UI/UX

- Layout responsivo
- Sidebar fixa (desktop)
- Menu colapsável (mobile)
- Dark mode opcional
- Design clean e minimalista
- Ícones com Lucide React

---

# 🔐 10. Segurança

- Senhas com bcrypt (10 rounds)
- Middleware protegendo rotas privadas
- Validação com Zod
- Sanitização de inputs
- Proteção contra SQL Injection (Prisma)
- Controle por user_id (Row-level isolation)

---

# 🧪 11. Estratégia de Testes (Obrigatório)

## 1️⃣ Testes Unitários (Vitest)

### Domain
- Criar despesa válida
- Bloquear valor negativo
- Validar data inválida
- Cálculo correto de total por período

### Use Cases
- Criar despesa
- Atualizar despesa
- Deletar despesa
- Gerar resumo financeiro

---

## 2️⃣ Testes de Integração

- API POST /expenses
- API GET com filtro semanal
- API GET com filtro mensal
- API DELETE
- API PUT

---

## 3️⃣ Testes de Componentes

- Formulário valida campos obrigatórios
- Dashboard renderiza totais corretamente
- Filtro altera dados exibidos

---

## 4️⃣ Testes E2E (Playwright)

Fluxos obrigatórios:

1. Criar conta
2. Fazer login
3. Cadastrar despesa
4. Visualizar no dashboard
5. Aplicar filtro
6. Gerar PDF

---

# 📄 12. Casos de Uso

## UC01 — Registrar Despesa

Entrada:
- Tipo
- Categoria
- Descrição
- Data
- Valor

Saída:
- Registro persistido
- Dashboard atualizado

---

## UC02 — Gerar Relatório PDF

Entrada:
- Período selecionado

Saída:
- PDF formatado
- Download automático

---

# 🚀 13. Roadmap

## MVP
- Autenticação
- CRUD despesas
- Dashboard simples
- Filtros
- PDF básico

## V2
- Upload de comprovantes
- Exportar Excel
- Metas de orçamento
- Alertas de estouro

---

# 🧩 14. Configuração Inicial no Antigravity

## Passos Iniciais

1. Criar projeto Next.js com TypeScript
2. Configurar Tailwind CSS
3. Instalar dependências:

```

prisma
@prisma/client
zod
react-hook-form
lucide-react
recharts
bcrypt
jsonwebtoken
vitest
@testing-library/react
playwright

```

4. Conectar Supabase PostgreSQL
5. Criar schema Prisma
6. Rodar migração inicial

---

# 📦 15. Entregáveis Esperados

- Código organizado em Clean Architecture
- Testes implementados
- Banco configurado (Supabase)
- Dashboard funcional
- Relatório PDF profissional
- Projeto rodando no Antigravity
- README técnico explicando arquitetura
- Documentação de endpoints

---

# 📌 Conclusão

Este PRD define claramente o escopo, arquitetura, requisitos e padrões técnicos para o desenvolvimento do Sistema de Controle de Gastos de Obra, garantindo:

- Estrutura escalável
- Código organizado
- Segurança
- Testabilidade
- Evolução futura

---