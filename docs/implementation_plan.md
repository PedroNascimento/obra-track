# ObraTrack — Plano de Implementação

> **Decisões técnicas confirmadas:**
> - 🔐 **Auth:** JWT manual com `jose` + httpOnly cookie (Edge-compatible)
> - 🎨 **Dark Mode:** Light mode padrão com toggle manual
> - ☁️ **Deploy:** Vercel
> - 🗄️ **Supabase:** DATABASE_URL será configurada após criação do projeto

Sistema web de controle financeiro de obras com Next.js + TypeScript + PostgreSQL (Supabase), seguindo Clean Architecture. O MVP cobre autenticação, CRUD de despesas, dashboard analítico, filtros por período e geração de relatório PDF.

---

## Fases de Desenvolvimento

### Fase 1 — Setup e Infraestrutura

**Objetivo:** Projeto funcionando localmente, banco conectado, estrutura de pastas definida.

---

#### [NEW] Scaffold do Projeto

- Criar projeto Next.js 14 (App Router) com TypeScript via `npx create-next-app@latest`
- Configurar Tailwind CSS (já incluso pelo scaffolder)
- Configurar `tsconfig.json` com path aliases (`@/domain`, `@/application`, etc.)
- Criar estrutura de diretórios da Clean Architecture:

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # login, register
│   ├── dashboard/
│   ├── expenses/
│   └── api/
│       ├── auth/
│       └── expenses/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── use-cases/
├── application/
│   ├── dtos/
│   └── services/
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   └── pdf/
├── presentation/
│   ├── components/
│   └── hooks/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

#### [NEW] Banco de Dados e ORM

**Schema Prisma:**

```prisma
model User {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  expenses     Expense[]
  categories   Category[]
}

model Expense {
  id          String      @id @default(uuid())
  userId      String
  type        ExpenseType
  categoryId  String?
  description String
  amount      Decimal     @db.Decimal(10, 2)
  expenseDate DateTime
  createdAt   DateTime    @default(now())
  user        User        @relation(fields: [userId], references: [id])
  category    Category?   @relation(fields: [categoryId], references: [id])
}

model Category {
  id        String    @id @default(uuid())
  userId    String
  name      String
  color     String
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id])
  expenses  Expense[]
}

enum ExpenseType {
  material
  pedreiro
  servente
  alimentacao
  combustivel
  outro
}
```

---

#### [NEW] Configuração de Dependências

```bash
npm install prisma @prisma/client zod react-hook-form lucide-react recharts
npm install bcryptjs jose        # jose para JWT Edge-compatible (não jsonwebtoken)
npm install @react-pdf/renderer
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event
npm install --save-dev @playwright/test
npm install --save-dev @types/bcryptjs
```

> **Por que `jose` e não `jsonwebtoken`?**  
> `jsonwebtoken` usa APIs do Node.js (`crypto` sync) que **não funcionam no Edge Runtime** da Vercel.  
> `jose` é totalmente compatível com Web Crypto API, rodando no middleware do Next.js sem problemas.

---

### Fase 2 — Domain Layer (Regras de Negócio)

**Objetivo:** Entidades e contratos puros, sem dependências externas.

---

#### [NEW] `src/domain/entities/expense.entity.ts`

Classe `Expense` com:
- Validação de `amount > 0`
- Validação de `expenseDate` não futura (opcional)
- Método `static create()` que lança erro se inválido

#### [NEW] `src/domain/entities/user.entity.ts`

Classe `User` com:
- Validação de email
- Sem exposição de `passwordHash`

#### [NEW] `src/domain/entities/category.entity.ts`

Classe `Category` com validação de nome e cor hex.

#### [NEW] `src/domain/repositories/expense.repository.ts`

Interface `IExpenseRepository`:
```typescript
interface IExpenseRepository {
  create(expense: Expense): Promise<Expense>
  findById(id: string, userId: string): Promise<Expense | null>
  findByFilter(userId: string, filter: DateFilter): Promise<Expense[]>
  update(expense: Expense): Promise<Expense>
  delete(id: string, userId: string): Promise<void>
  getSummary(userId: string, filter: DateFilter): Promise<ExpenseSummary>
}
```

#### [NEW] `src/domain/repositories/user.repository.ts`

Interface `IUserRepository`.

#### [NEW] `src/domain/repositories/category.repository.ts`

Interface `ICategoryRepository`.

#### [NEW] `src/domain/use-cases/`

Use cases puros:
- `create-expense.use-case.ts`
- `update-expense.use-case.ts`
- `delete-expense.use-case.ts`
- `get-expenses.use-case.ts`
- `get-financial-summary.use-case.ts`
- `register-user.use-case.ts`
- `login-user.use-case.ts`

---

### Fase 3 — Infrastructure Layer

**Objetivo:** Implementação concreta dos repositórios com Prisma.

---

#### [NEW] `src/infrastructure/database/prisma.client.ts`

Singleton do PrismaClient.

#### [NEW] `src/infrastructure/repositories/prisma-expense.repository.ts`

Implementa `IExpenseRepository` usando Prisma. Todos os queries filtram por `userId` (Row-Level Isolation).

#### [NEW] `src/infrastructure/repositories/prisma-user.repository.ts`

Implementa `IUserRepository`.

#### [NEW] `src/infrastructure/repositories/prisma-category.repository.ts`

Implementa `ICategoryRepository`.

#### [NEW] `src/infrastructure/pdf/expense-report.generator.ts`

Usando `@react-pdf/renderer`:
- Layout profissional com cabeçalho
- Tabela de despesas com colunas: Data, Tipo, Categoria, Descrição, Valor
- Totais por tipo e por categoria
- Rodapé com data de geração e usuário

---

### Fase 4 — Application Layer e API Routes

**Objetivo:** DTOs, serviços de orquestração e endpoints REST.

---

#### [NEW] `src/application/dtos/`

- `create-expense.dto.ts` — schema Zod para validação
- `update-expense.dto.ts`
- `expense-filter.dto.ts` — semanal | mensal | total | custom (dateFrom, dateTo)
- `financial-summary.dto.ts`

#### [NEW] `src/app/api/auth/register/route.ts`

`POST /api/auth/register` — registra usuário com bcrypt.

#### [NEW] `src/app/api/auth/login/route.ts`

`POST /api/auth/login` — autentica, retorna JWT em httpOnly cookie.

#### [NEW] `src/app/api/auth/logout/route.ts`

`POST /api/auth/logout` — limpa cookie.

#### [NEW] `src/app/api/expenses/route.ts`

- `GET /api/expenses` — lista com filtro de período (query params)
- `POST /api/expenses` — cria despesa

#### [NEW] `src/app/api/expenses/[id]/route.ts`

- `GET /api/expenses/:id`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

#### [NEW] `src/app/api/expenses/summary/route.ts`

`GET /api/expenses/summary?filter=weekly` — retorna totais agregados.

#### [NEW] `src/app/api/categories/route.ts`

CRUD de categorias.

#### [NEW] `src/middleware.ts`

Middleware Next.js protegendo todas as rotas exceto `/(auth)` e `/api/auth`. Valida JWT do cookie.

---

### Fase 5 — Presentation Layer (UI)

**Objetivo:** Interface completa, responsiva, com dark mode.

---

#### Design System

- Paleta: **light mode padrão** — branco/slate claro + acento laranja/âmbar (remetendo a obra/construção)
- Dark mode: ativado via toggle manual (class `dark` no `<html>`, persistido em `localStorage`)
- Fonte: Inter (Google Fonts)
- Componente `ThemeToggle` no header com ícone sol/lua (Lucide `Sun` / `Moon`)

#### [NEW] `src/presentation/components/layout/`

- `Sidebar.tsx` — navegação fixa desktop (Dashboard, Despesas, Categorias, Relatórios)
- `MobileMenu.tsx` — menu colapsável mobile
- `AppLayout.tsx` — wrapper com sidebar + main content

#### [NEW] `src/app/(auth)/login/page.tsx`

Formulário de login com React Hook Form + Zod. Design premium com gradiente e card centralizado.

#### [NEW] `src/app/(auth)/register/page.tsx`

Formulário de registro.

#### [NEW] `src/app/dashboard/page.tsx`

Componentes do Dashboard:
- `SummaryCards.tsx` — 4 cards: Total Geral, Esta Semana, Este Mês, Maior Gasto
- `PeriodFilter.tsx` — tabs: Semanal | Mensal | Total | Personalizado
- `ExpenseByTypeChart.tsx` — gráfico pizza (Recharts `PieChart`)
- `ExpenseByCategoryChart.tsx` — gráfico barras (Recharts `BarChart`)
- `ExpenseTimelineChart.tsx` — gráfico linha temporal (Recharts `LineChart`)
- `RecentExpensesTable.tsx` — últimas 10 despesas

#### [NEW] `src/app/expenses/page.tsx`

Listagem de despesas com:
- Tabela com colunas: Data, Tipo, Categoria, Descrição, Valor, Ações
- Botão "Nova Despesa" → abre modal
- Filtros por período e tipo

#### [NEW] `src/presentation/components/expenses/`

- `ExpenseFormModal.tsx` — modal com formulário (criar/editar)
- `ExpenseTable.tsx`
- `DeleteConfirmDialog.tsx`

#### [NEW] `src/app/reports/page.tsx`

Seleção de período + botão "Gerar PDF" que chama a rota de geração.

---

### Fase 6 — Testes

**Objetivo:** Cobertura de testes conforme estratégia do PRD.

---

#### [NEW] `src/tests/unit/domain/`

- `expense.entity.test.ts` — validações da entidade
- `financial-summary.use-case.test.ts` — cálculo de totais

#### [NEW] `src/tests/unit/use-cases/`

- `create-expense.use-case.test.ts`
- `update-expense.use-case.test.ts`
- `delete-expense.use-case.test.ts`

#### [NEW] `src/tests/integration/api/`

- `expenses.api.test.ts` — POST, GET, PUT, DELETE com banco de teste

#### [NEW] `src/tests/e2e/`

- `auth.spec.ts` — registro e login
- `expenses.spec.ts` — CRUD de despesas
- `dashboard.spec.ts` — filtros e visualização
- `report.spec.ts` — geração de PDF

---

## Ordem de Execução Sugerida

| # | Fase | Tempo Estimado |
|---|------|---------------|
| 1 | Setup + Scaffold + Banco | 1 sessão |
| 2 | Domain Layer (entidades + use cases) | 1 sessão |
| 3 | Infrastructure (repositórios Prisma) | 1 sessão |
| 4 | API Routes + Middleware Auth | 1 sessão |
| 5 | UI — Layout, Auth, Dashboard | 2 sessões |
| 6 | UI — Expenses CRUD + Relatório PDF | 1 sessão |
| 7 | Testes | 1 sessão |

**Total estimado: ~8 sessões de trabalho**

---

## Decisões Confirmadas

| Ponto | Decisão |
|-------|--------|
| Supabase | Projeto ainda será criado — `.env` configurado na Fase 1 com placeholder |
| Auth | **JWT manual com `jose`** + httpOnly cookie + SameSite=Strict |
| Dark Mode | **Light padrão** com toggle manual (persistido em localStorage) |
| PDF | **`@react-pdf/renderer`** (melhor DX para layout financeiro complexo) |
| Deploy | **Vercel** — middleware e env vars configurados para Edge Runtime |

> [!NOTE]
> **Próximo passo para o banco:** Crie o projeto em [supabase.com](https://supabase.com), vá em *Settings → Database* e copie a **Connection String (URI)**. Cole no `.env` quando solicitado durante a Fase 1.

---

## Verificação do MVP

- [ ] `npm run dev` sem erros
- [ ] Login/Logout funcionando
- [ ] CRUD de despesas completo
- [ ] Dashboard com gráficos renderizando dados reais
- [ ] Filtros alterando os dados exibidos
- [ ] PDF gerado com layout profissional
- [ ] Testes unitários passando (`npm run test`)
- [ ] Testes E2E passando (`npx playwright test`)
