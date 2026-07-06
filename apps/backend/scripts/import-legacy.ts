/**
 * Ferramenta de importacao dos dados do sistema legado (DOS/Clipper) para o
 * SIG-Mechanic novo. Le os arquivos .DBF originais e migra para o Postgres
 * via Prisma, seguindo o mapeamento documentado em docs/MIGRATION-MAPPING.md
 * e docs/LEGACY-DATA-DICTIONARY.md.
 *
 * IMPORTANTE:
 * - Os arquivos .DBF NAO sao versionados no git (contem PII de clientes reais
 *   - ver .gitignore). Coloque os arquivos originais na pasta `sistema/` na
 *   raiz do repo (ou aponte LEGACY_DATA_DIR para outro caminho) antes de rodar.
 * - Este script e IDEMPOTENTE: pode ser executado novamente sem duplicar
 *   registros (usa `legacyCode` para clientes e placa para veiculos como
 *   chave de correspondencia).
 * - Rode sempre primeiro com --dry-run para conferir os números antes de
 *   gravar no banco.
 * - Ainda NAO importa Ordens de Servico / financeiro (lan_pec.dbf, lan_ser.dbf,
 *   contas_p.dbf, contas_r.dbf) - fica para uma proxima etapa, seguindo o
 *   mesmo padrao usado aqui.
 *
 * Uso:
 *   npm run import:legacy -- --dry-run
 *   npm run import:legacy
 *   npm run import:legacy -- --only=clientes
 *   npm run import:legacy -- --only=veiculos
 *   LEGACY_DATA_DIR=/caminho/para/dbfs npm run import:legacy
 *   LEGACY_DBF_ENCODING=iso-8859-1 npm run import:legacy   (se acentos saírem errados com cp850)
 */

import { DBFFile } from 'dbffile';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaClient, ClientType } from '@prisma/client';

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY = args.find((a) => a.startsWith('--only='))?.split('=')[1];
const DATA_DIR = process.env.LEGACY_DATA_DIR ?? path.resolve(__dirname, '..', '..', '..', 'sistema');
const ENCODING = (process.env.LEGACY_DBF_ENCODING ?? 'cp850') as any;

function dbfPath(filename: string): string {
  const full = path.join(DATA_DIR, filename);
  if (!fs.existsSync(full)) {
    throw new Error(
      `Arquivo nao encontrado: ${full}\n` +
        `Coloque os arquivos .DBF originais do sistema legado na pasta '${DATA_DIR}' ` +
        `(ou defina a variavel de ambiente LEGACY_DATA_DIR apontando para o local correto).`,
    );
  }
  return full;
}

function str(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

function date(v: unknown): Date | undefined {
  if (!(v instanceof Date) || isNaN(v.getTime()) || v.getFullYear() < 1900) return undefined;
  return v;
}

function isCpf(v: string): boolean {
  return /^\d{11}$/.test(v.replace(/\D/g, ''));
}

async function importClientes() {
  console.log('\n=== Importando Clientes (clientes.dbf) ===');
  const dbf = await DBFFile.open(dbfPath('clientes.dbf'), { encoding: ENCODING });
  console.log(`Registros no DBF: ${dbf.recordCount}`);
  const records = await dbf.readRecords();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const rec of records as Record<string, unknown>[]) {
    const legacyCode = str(rec.NUMERO);
    const name = str(rec.NOME);
    if (!legacyCode || !name) {
      skipped++;
      continue;
    }

    const cpfDigits = str(rec.CPF)?.replace(/\D/g, '');
    const data = {
      legacyCode,
      type: ClientType.PF,
      name,
      cpf: cpfDigits && isCpf(cpfDigits) ? cpfDigits : undefined,
      cnpj: cpfDigits && !isCpf(cpfDigits) ? cpfDigits : undefined,
      rg: str(rec.RG_INS),
      birthDate: date(rec.DTNASC),
      phone: str(rec.FONE),
      whatsapp: str(rec.CELULA),
      zipCode: str(rec.CEP),
      street: str(rec.ENDER),
      neighborhood: str(rec.BAIRRO),
      city: str(rec.CIDADE),
      state: str(rec.U_F),
      active: str(rec.STATUS)?.toUpperCase() !== 'I',
    };

    if (DRY_RUN) {
      created++;
      continue;
    }

    const existing = await prisma.client.findFirst({ where: { legacyCode } });
    if (existing) {
      await prisma.client.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.client.create({ data });
      created++;
    }
  }

  console.log(
    `Clientes: ${DRY_RUN ? `${created} seriam importados` : `${created} criados, ${updated} atualizados`}, ${skipped} ignorados (sem NUMERO/NOME).`,
  );
}

// Constroi um mapa placa -> codigo legado do cliente, a partir do historico
// de OS (ctr_os.dbf), ja que carros.dbf nao guarda o vinculo com o cliente.
// Assume que a ultima ocorrencia no arquivo e a mais confiavel.
async function buildPlateToClientMap(): Promise<Map<string, string>> {
  console.log('\nLendo ctr_os.dbf para reconstruir o vinculo cliente-veiculo...');
  const dbf = await DBFFile.open(dbfPath('ctr_os.dbf'), { encoding: ENCODING });
  const records = await dbf.readRecords();
  const map = new Map<string, string>();
  for (const rec of records as Record<string, unknown>[]) {
    const plate = str(rec.CHAPA)?.toUpperCase();
    const clientCode = str(rec.NU_CLI);
    if (plate && clientCode) {
      map.set(plate, clientCode);
    }
  }
  console.log(`Vinculos placa->cliente encontrados: ${map.size}`);
  return map;
}

async function importVeiculos() {
  console.log('\n=== Importando Veiculos (carros.dbf) ===');
  const plateToClient = await buildPlateToClientMap();

  const dbf = await DBFFile.open(dbfPath('carros.dbf'), { encoding: ENCODING });
  console.log(`Registros no DBF: ${dbf.recordCount}`);
  const records = await dbf.readRecords();

  let created = 0;
  let updated = 0;
  let skippedNoPlate = 0;
  let skippedNoClient = 0;

  for (const rec of records as Record<string, unknown>[]) {
    const plate = str(rec.PLACA)?.toUpperCase();
    if (!plate) {
      skippedNoPlate++;
      continue;
    }

    const clientCode = plateToClient.get(plate);
    if (!clientCode) {
      skippedNoClient++;
      continue;
    }

    const client = await prisma.client.findFirst({ where: { legacyCode: clientCode } });
    if (!client) {
      skippedNoClient++;
      continue;
    }

    const brandName = str(rec.FABRI) ?? 'Nao Informado';
    const modelName = str(rec.TIPO) ?? 'Nao Informado';

    if (DRY_RUN) {
      created++;
      continue;
    }

    const brand = await prisma.vehicleBrand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });
    const model = await prisma.vehicleModel.upsert({
      where: { brandId_name: { brandId: brand.id, name: modelName } },
      update: {},
      create: { brandId: brand.id, name: modelName },
    });

    const data = {
      clientId: client.id,
      brandId: brand.id,
      modelId: model.id,
      year: str(rec.AANO),
      color: str(rec.COR),
      plate,
    };

    const existing = await prisma.vehicle.findFirst({ where: { plate } });
    if (existing) {
      await prisma.vehicle.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.vehicle.create({ data });
      created++;
    }
  }

  console.log(
    `Veiculos: ${DRY_RUN ? `${created} seriam importados` : `${created} criados, ${updated} atualizados`}, ` +
      `${skippedNoPlate} ignorados (sem placa), ${skippedNoClient} ignorados (sem cliente correspondente em ctr_os.dbf).`,
  );
}

async function main() {
  console.log(`Pasta de dados legados: ${DATA_DIR}`);
  console.log(`Encoding: ${ENCODING}`);
  console.log(DRY_RUN ? 'Modo DRY-RUN: nenhuma gravacao sera feita no banco.' : 'Modo REAL: os dados serao gravados no banco.');

  if (!ONLY || ONLY === 'clientes') {
    await importClientes();
  }
  if (!ONLY || ONLY === 'veiculos') {
    await importVeiculos();
  }

  console.log('\nImportacao concluida.');
}

main()
  .catch((err) => {
    console.error('\nErro durante a importacao:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
