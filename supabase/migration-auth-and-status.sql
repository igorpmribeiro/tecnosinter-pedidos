-- Tecnosinter Pedidos — migração para Auth + Status de aprovação + RLS
-- Aplica somente as mudanças. Idempotente (pode rodar mais de uma vez).
--
-- Sobre RLS:
--   O app usa autenticação própria (JWT em cookie) e conecta no banco como
--   role `postgres` (que faz BYPASSRLS). Essas policies servem para BLOQUEAR
--   o acesso direto pela API pública do Supabase (PostgREST + anon key) —
--   sem RLS, a anon key consegue ler tudo via REST.

BEGIN;

-- 1. Enums novos
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'FUNCIONARIO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('AGUARDANDO', 'APROVADO', 'REPROVADO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tabela de usuários
CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "email"         TEXT NOT NULL,
  "passwordHash"  TEXT NOT NULL,
  "role"          "Role" NOT NULL DEFAULT 'FUNCIONARIO',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");

-- 3. Novos campos no Order
ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "status"          "OrderStatus" NOT NULL DEFAULT 'AGUARDANDO',
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedAt"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewedById"    TEXT,
  ADD COLUMN IF NOT EXISTS "createdById"     TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 4. Foreign keys no Order para User
DO $$ BEGIN
  ALTER TABLE "Order"
    ADD CONSTRAINT "Order_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Order"
    ADD CONSTRAINT "Order_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. RLS — habilita em todas as tabelas e revoga permissões dos roles públicos.
--    Como não há policies criadas, anon/authenticated não conseguem ler nem escrever.
--    O Prisma (role `postgres`) bypassa RLS e segue funcionando normalmente.

ALTER TABLE "User"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Requester"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reason"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem"  ENABLE ROW LEVEL SECURITY;

-- Garante que mesmo permissões antigas concedidas a anon/authenticated não passem.
REVOKE ALL ON "User", "Product", "Supplier", "Department",
              "Requester", "Reason", "Order", "OrderItem"
  FROM anon, authenticated;

COMMIT;
