# 🏗️ ObraTrack

**Gestão Financeira Inteligente para Obras e Reformas.**

O ObraTrack é uma solução moderna desenvolvida para resolver o caos financeiro em canteiros de obras. Ele permite que proprietários e gestores tenham controle total sobre gastos com materiais, mão de obra e serviços, oferecendo uma visão clara da saúde financeira do projeto em tempo real.

---

## 🚀 Principais Funcionalidades

- **📊 Dashboard Estratégico:** Visualize o total gasto, a distribuição por categorias e a evolução mensal através de gráficos intuitivos.
- **💸 Gestão de Despesas:** Cadastro detalhado de gastos com suporte a categorização, datas retroativas e formatação inteligente de moeda.
- **📂 Categorização Inteligente:** Organize seus custos em Material, Pedreiro, Servente, Alimentação, Combustível e outros.
- **📄 Relatórios PDF:** Gere relatórios profissionais detalhados para prestação de contas ou arquivo pessoal com apenas um clique.
- **🔐 Autenticação Segura:** Sistema completo de Login e Cadastro utilizando JWT e proteção de rotas via Middleware.
- **📱 Interface Responsiva:** Design premium (Glassmorphism & Dark Mode ready) otimizado para Desktop e dispositivos móveis.

---

## 🛠️ Stack Tecnológica

- **Core:** [Next.js 15](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Autenticação:** [JWT](https://jwt.io/) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Formulários:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 🧪 Qualidade e Testes

Este projeto segue rigorosos padrões de qualidade, contando com uma suíte de testes automatizados:

- **E2E (End-to-End):** Utilizando [Playwright](https://playwright.dev/) para validar fluxos críticos como Cadastro, Login e Criação de Despesas.
- **Unitários:** Utilizando [Vitest](https://vitest.dev/) para garantir a integridade das regras de negócio na camada de Domínio e Casos de Uso.

---

## 🏗️ Arquitetura

O projeto foi construído seguindo princípios de **Clean Architecture** e **SOLID**, separando claramente as responsabilidades:

- `domain`: Entidades de negócio e interfaces de repositórios (regras puras).
- `application`: Casos de uso e DTOs.
- `infrastructure`: Implementações de banco de dados e serviços externos.
- `presentation`: Componentes React, Hooks e lógica de UI.

---

## ⚙️ Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/obra-track.git
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Renomeie o arquivo `.env.example` para `.env.local` e preencha as credenciais do seu banco de dados PostgreSQL.

4. **Execute as migrações do Banco:**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Rodar Testes:**
   ```bash
   npm run test        # Testes unitários
   npm run test:e2e    # Testes E2E (Playwright)
   ```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenhado com ❤️ por [Pedro](https://github.com/seu-usuario).
