# Mapeamento de Migracao - Sistema Legado (DOS/Clipper) -> SIG-Mechanic

> Baseado na leitura dos cabecalhos binarios dos arquivos `.DBF` em `sistema/`.
> Ver detalhes completos de campos em [LEGACY-DATA-DICTIONARY.md](./LEGACY-DATA-DICTIONARY.md).

## Observacoes Gerais

- O sistema legado e um cadastro CA-Clipper/dBase (arquivos `.DBF`/`.DBT`, indices `.JNX`).
- Datas sao armazenadas em campos tipo `D` (formato `YYYYMMDD`).
- Nao ha chaves estrangeiras reais; os relacionamentos sao feitos por codigos-texto
  (ex.: `NU_CLI` em `ctr_os.dbf` referencia `NUMERO` em `clientes.dbf`).
- Varias tabelas sao fragmentadas por mes/ano (ex. `mecajan.dbf` .. `mecadez.dbf`,
  `cx2015.dbf`, `cxdados6.dbf`) e precisam ser consolidadas em uma unica tabela
  com coluna de data na importacao.
- Existem tabelas duplicadas/paralelas com mesmo layout (`clientes.dbf` e
  `clientev.dbf`) — necessario decidir qual e a fonte de verdade ou se ambas
  devem ser importadas e mescladas por `NUMERO`.
- Tabelas de estoque/pecas (`peca.dbf`, `entnota.dbf`, `sainota.dbf`, `pedido.dbf`,
  `compras.dbf`) **nao serao migradas como fonte de verdade**, pois o controle de
  estoque passa a ser de responsabilidade do SIV-NG. Podem ser importadas apenas
  para fins de **historico consultivo** (somente leitura).
- O sistema que efetivamente alimentara os dados novos (mencionado pelo usuario)
  usa um formato de importacao diferente do legado DOS. Este mapeamento cobre
  apenas a carga inicial/historica a partir do legado; a integracao corrente
  devera ser feita via a integracao SIV-NG (ver secao "Integracao com SIV-NG"
  no SIG-Mechanic.md) e um adaptador de importacao especifico a ser definido
  quando o formato do novo sistema for detalhado.

---

## Mapeamento por Modulo

### Clientes

| Legado | Campo | Novo (Prisma) | Observacao |
|---|---|---|---|
| clientes.dbf | NUMERO | clients.legacy_code | Chave legada, manter para rastreabilidade |
| clientes.dbf | NOME | clients.name | |
| clientes.dbf | ENDER, BAIRRO, CIDADE, U_F, CEP | clients.address (JSON ou tabela address) | |
| clientes.dbf | DTNASC | clients.birth_date | |
| clientes.dbf | CPF, RG_INS | clients.cpf, clients.rg | |
| clientes.dbf | FONE, CELULA | clients.phones (array) | |
| clientes.dbf | DATACD, DATADB, DATAPG | clients.audit (created/updated) | |
| clientes.dbf | XVALOR, ACUMULADO | financeiro (contas_r vinculado) | Nao migrar como saldo direto — recalcular via contas_r |
| clientes.dbf | HISTORICO (memo) | client_notes / histórico | Campo memo, precisa leitura do `.DBT` |
| clientev.dbf | (mesmo layout) | — | Avaliar se e duplicata/backup de clientes.dbf |

### Veiculos

| Legado | Campo | Novo (Prisma) | Observacao |
|---|---|---|---|
| carros.dbf | FABRI | vehicles.brand | Somente 7000 regs, poucos campos |
| carros.dbf | TIPO | vehicles.model | |
| carros.dbf | PLACA | vehicles.plate | |
| carros.dbf | AANO | vehicles.year | |
| carros.dbf | COR | vehicles.color | |
| ctr_os.dbf | MARCA, MODELO, CHAPA, ANO, KL_MTR | vehicles.* (dados tambem aparecem na OS) | Cruzar com carros.dbf pela placa |

> `carros.dbf` nao tem client_id explicito — o vinculo cliente-veiculo e feito via
> `ctr_os.dbf` (campo `NU_CLI` + `CHAPA`/placa). Necessario reconstruir o vinculo
> na importacao combinando as duas fontes.

### Ordens de Servico

| Legado | Campo | Novo (Prisma) | Observacao |
|---|---|---|---|
| ctr_os.dbf | OS_NUM | orders.legacy_number | |
| ctr_os.dbf | NU_CLI | orders.client_id (via lookup) | |
| ctr_os.dbf | MARCA, MODELO, CHAPA, ANO, KL_MTR | orders.vehicle_id (via lookup/placa) | |
| ctr_os.dbf | DAT_EN, DAT_SA | orders.opened_at, orders.closed_at | |
| ctr_os.dbf | V_PEC, V_SER | orders.parts_total, orders.services_total | |
| lan_pec.dbf | OSNUM, NPECA, QUANT, PVEND | order_items (pecas) | 437k registros — maior tabela, importar em lote/streaming |
| lan_ser.dbf | OSSNU, MECAN, SERVI, PRSER | order_services (servicos + mecanico) | 108k registros |

### Mecanicos e Comissao

| Legado | Campo | Novo (Prisma) | Observacao |
|---|---|---|---|
| salmec.dbf | NOME, NOME_COMPL, SALARIO, FUNCAO, CPF, DAT_ADM, ... | mechanics.* | Cadastro completo (34 registros) |
| meca.dbf / meca_t.dbf / mecajan..mecadez.dbf / mmecatd.dbf | DATA, NOME, HIST, VALOR, DEDUT | commissions (lancamentos) | Fragmentado por mes/ano — consolidar por DATA na importacao |
| lan_ser.dbf | MECAN, PRSER | commissions (base de calculo por servico) | Cruzar com percentuais de `salmec` |

### Financeiro

| Legado | Campo | Novo (Prisma) | Observacao |
|---|---|---|---|
| contas_p.dbf | DATA, FORNEC, TITULO, VALOR, DT_PAG, VL_PAG | payables | 31k registros |
| contas_r.dbf | DT_VEN, TITULO, CLIENTE, VALOR, DT_REC, VL_REC | receivables | 35k registros |
| n_f.dbf | DATA_E, DATA_R, NUM_NF, FORNEC, VAL_NF, VAL_IC, VL_FRET | invoices (fornecedor) | |
| n_orc.dbf / n_venda.dbf / mensal.dbf | N_ORC, DATA_V, VENDEDOR, VALOR_V, CLIENTE | budgets/sales | |
| forneced.dbf | FANTASIA, RAZ_SOCIAL, CGC, I_E, ENDERECO, TELEFONE, E_MAIL | suppliers | |

### Fluxo de Caixa / Bancos

| Legado | Campo | Novo (Prisma) | Observacao |
|---|---|---|---|
| cxdados.dbf, cx2015.dbf, cx2015b.dbf, cxdados6.dbf | GDATA, GHIST, DEBITO, CREDITO, GSALDO | cash_flow | Fragmentado por ano/periodo — consolidar |
| bradesco.dbf, hsbc.dbf, itau.dbf, nordeste.dbf | DATA, HISTORICO, DOCTO, VALOR_C, VALOR_D, SALDO | bank_accounts / bank_statements | Um arquivo por banco — mapear para `banks`/`bank_accounts` |

### Servicos (Catalogo)

| Legado | Campo | Novo (Prisma) | Observacao |
|---|---|---|---|
| servicos.dbf | NCOD, SERVICO, PRECO, OBS | services | Apenas 12 registros — catalogo pequeno, migracao trivial |

### Fora do Escopo de Migracao (dominio do SIV-NG)

- `peca.dbf`, `entnota.dbf`, `sainota.dbf`, `saiestq.dbf`, `pedido.dbf`,
  `compras.dbf`, `devolu.dbf`, `temp_s.dbf`, `temp_v.dbf`, `tempent.dbf`,
  `l_nota.dbf` — dados de estoque/compras. Importar apenas como **historico
  somente-leitura** se necessario para consulta, nunca como fonte ativa.

---

## Estrategia de Importacao Recomendada

1. **Extracao**: usar biblioteca Node.js (`dbf-reader`/parser custom, ja que os
   dados sao ASCII/CP850) para converter cada `.DBF` em JSON/CSV intermediario.
2. **Normalizacao**: aplicar as regras acima (consolidar fragmentados por
   mes/ano, resolver duplicidade clientes/clientev, reconstruir vinculo
   cliente-veiculo).
3. **Carga**: scripts de seed/importacao em TypeScript (rodando contra o
   schema Prisma), idempotentes (podem ser re-executados sem duplicar).
4. **Auditoria**: registrar em `audit_logs` a origem "IMPORT_LEGACY" para cada
   registro migrado, permitindo rastrear o que veio do DOS.
5. **Validacao**: gerar relatorio de divergencias (clientes sem CPF valido,
   OS sem cliente encontrado, etc.) antes de considerar a migracao concluida.

Este mapeamento sera refinado quando o formato de importacao do novo sistema
alimentador for detalhado.
