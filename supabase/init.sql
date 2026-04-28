-- =============================================================================
-- Tecnosinter Pedidos - Supabase / Postgres bootstrap
-- =============================================================================
-- Execute este arquivo no SQL Editor do Supabase (ou via psql) para criar
-- todas as tabelas, índices e políticas RLS necessárias.
--
-- IMPORTANTE:
-- - O Prisma se conecta como `postgres` (role com BYPASSRLS), portanto as
--   políticas RLS abaixo NÃO afetam queries feitas pelo backend via Prisma.
-- - As políticas existem para proteger o acesso via PostgREST / SDKs do
--   Supabase (anon / authenticated). Como este é um app interno acessado
--   apenas pelo backend (Next.js + Prisma), o padrão é manter RLS ativo
--   sem políticas públicas — bloqueando qualquer leitura pelo client SDK.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Product" (
    "id"            TEXT             PRIMARY KEY,
    "name"          TEXT             NOT NULL,
    "unit"          TEXT             NOT NULL,
    "lastPrice"     DOUBLE PRECISION,
    "lastOrderedAt" TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)     NOT NULL
);

CREATE TABLE IF NOT EXISTS "Supplier" (
    "id"        TEXT         PRIMARY KEY,
    "name"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Department" (
    "id"        TEXT         PRIMARY KEY,
    "name"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Requester" (
    "id"           TEXT         PRIMARY KEY,
    "name"         TEXT         NOT NULL,
    "departmentId" TEXT         NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Requester_departmentId_fkey"
        FOREIGN KEY ("departmentId") REFERENCES "Department" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Reason" (
    "id"             TEXT         PRIMARY KEY,
    "description"    TEXT         NOT NULL,
    "lastUsedAt"     TIMESTAMP(3),
    "previousUsedAt" TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Order" (
    "id"           TEXT         PRIMARY KEY,
    "orderNumber"  TEXT         NOT NULL,
    "orderedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDays" INTEGER      NOT NULL,
    "costCenter"   TEXT,
    "authorizedBy" TEXT,
    "supplierId"   TEXT         NOT NULL,
    "departmentId" TEXT         NOT NULL,
    "requesterId"  TEXT         NOT NULL,
    "reasonId"     TEXT         NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_supplierId_fkey"
        FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_departmentId_fkey"
        FOREIGN KEY ("departmentId") REFERENCES "Department" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_requesterId_fkey"
        FOREIGN KEY ("requesterId") REFERENCES "Requester" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_reasonId_fkey"
        FOREIGN KEY ("reasonId") REFERENCES "Reason" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id"         TEXT             PRIMARY KEY,
    "orderId"    TEXT             NOT NULL,
    "productId"  TEXT             NOT NULL,
    "quantity"   DOUBLE PRECISION NOT NULL,
    "unitPrice"  DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "Order" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "Product" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS "Product_name_key"
    ON "Product" ("name");

CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_name_key"
    ON "Supplier" ("name");

CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key"
    ON "Department" ("name");

CREATE UNIQUE INDEX IF NOT EXISTS "Requester_name_departmentId_key"
    ON "Requester" ("name", "departmentId");

CREATE UNIQUE INDEX IF NOT EXISTS "Reason_description_key"
    ON "Reason" ("description");

CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key"
    ON "Order" ("orderNumber");

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx"
    ON "OrderItem" ("orderId");

CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx"
    ON "OrderItem" ("productId");

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- O Supabase exige RLS ativo em todas as tabelas do schema `public` que
-- ficam expostas via PostgREST. Habilitamos em todas e definimos políticas
-- restritivas: somente a service_role (usada no backend) pode ler/escrever.
-- Os roles `anon` e `authenticated` ficam bloqueados por padrão.
-- =============================================================================

ALTER TABLE "Product"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Requester"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reason"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem"  ENABLE ROW LEVEL SECURITY;

-- Força RLS mesmo para owners (defesa em profundidade)
ALTER TABLE "Product"    FORCE ROW LEVEL SECURITY;
ALTER TABLE "Supplier"   FORCE ROW LEVEL SECURITY;
ALTER TABLE "Department" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Requester"  FORCE ROW LEVEL SECURITY;
ALTER TABLE "Reason"     FORCE ROW LEVEL SECURITY;
ALTER TABLE "Order"      FORCE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem"  FORCE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Políticas: acesso total apenas para service_role
-- -----------------------------------------------------------------------------
-- O backend (Next.js + Prisma) já se conecta como `postgres` que é BYPASSRLS,
-- mas adicionamos a política para service_role caso parte do app passe a usar
-- o client JS do Supabase com a service role key.

DROP POLICY IF EXISTS "service_role_all" ON "Product";
CREATE POLICY "service_role_all" ON "Product"
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON "Supplier";
CREATE POLICY "service_role_all" ON "Supplier"
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON "Department";
CREATE POLICY "service_role_all" ON "Department"
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON "Requester";
CREATE POLICY "service_role_all" ON "Requester"
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON "Reason";
CREATE POLICY "service_role_all" ON "Reason"
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON "Order";
CREATE POLICY "service_role_all" ON "Order"
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON "OrderItem";
CREATE POLICY "service_role_all" ON "OrderItem"
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- (Opcional) Liberar leitura/escrita para usuários autenticados
-- -----------------------------------------------------------------------------
-- Descomente o bloco abaixo se você for usar o client SDK do Supabase no
-- frontend com login (role `authenticated`). Não recomendado enquanto o
-- app não tiver autenticação implementada.
--
-- CREATE POLICY "authenticated_read" ON "Product"    FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "authenticated_read" ON "Supplier"   FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "authenticated_read" ON "Department" FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "authenticated_read" ON "Requester"  FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "authenticated_read" ON "Reason"     FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "authenticated_read" ON "Order"      FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "authenticated_read" ON "OrderItem"  FOR SELECT TO authenticated USING (true);
