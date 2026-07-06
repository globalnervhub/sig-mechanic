-- CreateTable
CREATE TABLE "vehicle_brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_models" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oil_change_records" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "order_id" TEXT,
    "change_date" TIMESTAMP(3) NOT NULL,
    "current_km" INTEGER NOT NULL,
    "next_change_km" INTEGER,
    "next_change_date" TIMESTAMP(3),
    "oil_type" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oil_change_records_pkey" PRIMARY KEY ("id")
);

-- AlterTable: adiciona colunas novas (nullable por enquanto, para permitir backfill)
ALTER TABLE "vehicles" ADD COLUMN "brand_id" TEXT;
ALTER TABLE "vehicles" ADD COLUMN "model_id" TEXT;

-- CreateIndex (precisam existir antes do backfill, que usa ON CONFLICT nestas colunas)
CREATE UNIQUE INDEX "vehicle_brands_name_key" ON "vehicle_brands"("name");

CREATE UNIQUE INDEX "vehicle_models_brand_id_name_key" ON "vehicle_models"("brand_id", "name");

-- Backfill: cria uma marca para cada valor distinto ja existente na coluna livre "brand"
INSERT INTO "vehicle_brands" ("id", "name")
SELECT gen_random_uuid()::text, d.brand_name
FROM (
    SELECT DISTINCT trim("brand") AS brand_name
    FROM "vehicles"
    WHERE "brand" IS NOT NULL AND trim("brand") <> ''
) d
ON CONFLICT ("name") DO NOTHING;

-- Backfill: cria um modelo (vinculado a marca) para cada par (brand, model) distinto
INSERT INTO "vehicle_models" ("id", "brand_id", "name")
SELECT gen_random_uuid()::text, b."id", d.model_name
FROM (
    SELECT DISTINCT trim("brand") AS brand_name, trim("model") AS model_name
    FROM "vehicles"
    WHERE "brand" IS NOT NULL AND trim("brand") <> '' AND "model" IS NOT NULL AND trim("model") <> ''
) d
JOIN "vehicle_brands" b ON b."name" = d.brand_name
ON CONFLICT ("brand_id", "name") DO NOTHING;

-- Backfill: fallback para veiculos com marca/modelo vazio (nao deveria ocorrer, mas protege contra NOT NULL)
INSERT INTO "vehicle_brands" ("id", "name")
SELECT gen_random_uuid()::text, 'Nao Informado'
WHERE NOT EXISTS (SELECT 1 FROM "vehicle_brands" WHERE "name" = 'Nao Informado')
  AND EXISTS (SELECT 1 FROM "vehicles" WHERE "brand" IS NULL OR trim("brand") = '');

INSERT INTO "vehicle_models" ("id", "brand_id", "name")
SELECT gen_random_uuid()::text, b."id", 'Nao Informado'
FROM "vehicle_brands" b
WHERE b."name" = 'Nao Informado'
  AND NOT EXISTS (SELECT 1 FROM "vehicle_models" m WHERE m."brand_id" = b."id" AND m."name" = 'Nao Informado')
  AND EXISTS (SELECT 1 FROM "vehicles" WHERE "brand" IS NULL OR trim("brand") = '' OR "model" IS NULL OR trim("model") = '');

-- Vincula os veiculos existentes as marcas/modelos criados
UPDATE "vehicles" v
SET "brand_id" = b."id"
FROM "vehicle_brands" b
WHERE b."name" = trim(v."brand") AND v."brand" IS NOT NULL AND trim(v."brand") <> '';

UPDATE "vehicles" v
SET "model_id" = m."id"
FROM "vehicle_models" m
JOIN "vehicle_brands" b ON b."id" = m."brand_id"
WHERE b."name" = trim(v."brand") AND m."name" = trim(v."model")
  AND v."brand" IS NOT NULL AND trim(v."brand") <> '' AND v."model" IS NOT NULL AND trim(v."model") <> '';

-- Vincula os veiculos remanescentes (marca/modelo vazio) ao fallback "Nao Informado"
UPDATE "vehicles" v
SET "brand_id" = (SELECT "id" FROM "vehicle_brands" WHERE "name" = 'Nao Informado')
WHERE v."brand_id" IS NULL;

UPDATE "vehicles" v
SET "model_id" = (SELECT "id" FROM "vehicle_models" WHERE "name" = 'Nao Informado')
WHERE v."model_id" IS NULL;

-- Agora que todos os veiculos tem brand_id/model_id preenchidos, torna as colunas obrigatorias
ALTER TABLE "vehicles" ALTER COLUMN "brand_id" SET NOT NULL;
ALTER TABLE "vehicles" ALTER COLUMN "model_id" SET NOT NULL;

-- Remove as colunas antigas de texto livre
ALTER TABLE "vehicles" DROP COLUMN "brand";
ALTER TABLE "vehicles" DROP COLUMN "model";

-- AddForeignKey
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "vehicle_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oil_change_records" ADD CONSTRAINT "oil_change_records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oil_change_records" ADD CONSTRAINT "oil_change_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
