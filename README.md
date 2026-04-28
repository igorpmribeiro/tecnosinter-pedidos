# Tecnosinter — Pedidos

Sistema interno de pedidos de compra. Cadastra fornecedores, departamentos, requisitantes, motivos e produtos automaticamente conforme os pedidos são criados, e gera o PDF do pedido pronto para envio.

Stack: **Next.js 16** (App Router, Turbopack) · **React 19** · **Prisma 6** · **PostgreSQL** (Supabase) · **shadcn/ui** · **Tailwind CSS 4** · **react-pdf**.

## Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) (free tier serve)

## Setup

1. **Clone e instale dependências**

   ```bash
   git clone <repo-url>
   cd tecnosinter-pedidos
   npm install
   ```

2. **Crie o banco no Supabase**

   - Crie um novo projeto no Supabase (preferencialmente em `sa-east-1` para baixa latência no Brasil).
   - No SQL Editor, execute o conteúdo de [`supabase/init.sql`](./supabase/init.sql) — cria as 7 tabelas, índices e políticas RLS.

3. **Configure variáveis de ambiente**

   ```bash
   cp .env.example .env
   ```

   Em **Project Settings → Database → Connection string → Transaction Pooler**, copie a connection string e cole em `DATABASE_URL`. Lembre de:
   - URL-encodar caracteres especiais da senha (`@` → `%40`, `$` → `%24`, etc).
   - Manter os params `?pgbouncer=true&connection_limit=10`.

4. **Gere o Prisma Client**

   ```bash
   npx prisma generate
   ```

5. **(Opcional) Popule departamentos e fornecedores iniciais**

   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Suba o dev server**

   ```bash
   npm run dev
   ```

   Abre em [http://localhost:3000](http://localhost:3000).

## Estrutura

```
app/
  pedidos/         lista, detalhe, novo pedido, geração de PDF
  produtos/        histórico de produtos
  motivos/         histórico de motivos/aplicações
components/        componentes shadcn/ui
lib/
  db.ts            singleton do Prisma Client
  format.ts        formatadores (moeda, data, unidades)
  pdf/             template do PDF (react-pdf)
prisma/
  schema.prisma    schema do banco
  seed.ts          dados iniciais
supabase/
  init.sql         SQL idempotente para criar tabelas + RLS no Supabase
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server com Turbopack |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build |
| `npm run lint` | ESLint |

## Notas de produção

- **Connection pooling**: a app usa o Transaction Pooler do Supabase (porta 6543) com `pgbouncer=true`, recomendado para apps Next.js/Prisma em ambientes serverless (Vercel).
- **RLS**: o backend conecta como `postgres` (BYPASSRLS), e as policies em `supabase/init.sql` bloqueiam acesso via PostgREST/SDKs. Se um dia a app passar a usar o client SDK do Supabase no frontend, será preciso adicionar policies para `authenticated`/`anon`.
