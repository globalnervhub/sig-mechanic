# SIG-Mechanic

> Sistema de Gestão para Oficinas Mecânicas
> **Codinome:** SIG-Mechanic
> **Versão do Documento:** 1.0
> **Status:** Planejamento
> **Tipo:** Projeto Interno

---

# Índice

* Visão Geral
* Objetivos
* Escopo
* Problemas que Resolve
* Objetivos do Negócio
* Público-alvo
* Premissas
* Regras Gerais
* Arquitetura
* Tecnologias
* Módulos
* Fluxos do Sistema
* Banco de Dados
* APIs
* Permissões
* Relatórios
* Dashboard
* Roadmap
* Backlog Inicial
* Melhorias Futuras
* Estrutura do Projeto
* Checklist

---

# Visão Geral

O SIG-Mechanic é um sistema ERP voltado para oficinas mecânicas desenvolvido para substituir o sistema legado em DOS atualmente utilizado pela empresa.

O sistema **não será responsável pelo gerenciamento de estoque**, pois continuará utilizando o sistema SIV-NG como fonte oficial para produtos, preços, códigos e descrições.

O foco principal do projeto é modernizar toda a operação administrativa da oficina, centralizando atendimentos, ordens de serviço, clientes, veículos, financeiro e comissões.

---

# Objetivos

* Eliminar a dependência do sistema DOS.
* Melhorar produtividade.
* Digitalizar documentos.
* Automatizar processos.
* Facilitar emissão de relatórios.
* Reduzir erros operacionais.
* Permitir futuras integrações.
* Centralizar todas as informações da oficina.

---

# Escopo

O sistema deverá contemplar:

* Cadastro de clientes
* Cadastro de veículos
* Cadastro de mecânicos
* Cadastro de operadores
* Cadastro de serviços
* Cadastro de bancos
* Cadastro de contas bancárias
* Cadastro de boletos
* Cadastro de fabricantes
* Cadastro de modelos
* Cadastro de anos
* Cadastro de categorias de serviços
* Ordem de Serviço
* Orçamentos
* Financeiro
* Fluxo de Caixa
* Comissão
* Histórico completo
* Relatórios
* Dashboard

---

# O que NÃO faz

O sistema não fará:

* Controle de estoque
* Entrada de mercadorias
* Inventário
* Compras
* Baixa de estoque

Esses dados continuarão sendo mantidos pelo SIV-NG.

---

# Integração com SIV-NG

Sincronização de:

* Código
* Descrição
* Preço
* Unidade
* Situação

A sincronização deverá ocorrer automaticamente.

---

# Integração com Sistema DOS

Importação inicial de:

* Clientes
* Histórico
* Veículos
* Ordens de serviço
* Financeiro (quando possível)

---

# Público-Alvo

Uso exclusivamente interno.

Usuários:

* Administrador
* Proprietário
* Gerente
* Operador
* Mecânico
* Financeiro

---

# Stack Tecnológica

> Stack unificada 100% TypeScript, escolhida por ser um projeto desenvolvido integralmente por IA. Uma única linguagem entre frontend e backend reduz erros de tradução de tipos, permite compartilhamento de contratos/DTOs e simplifica o contexto de desenvolvimento.

Frontend

* Next.js
* TypeScript
* TailwindCSS

Backend

* NestJS
* TypeScript
* Node.js LTS

ORM

* Prisma

Banco

* PostgreSQL

Cache

* Redis

Storage

* MinIO

Filas

* BullMQ (Redis)

Servidor

* Linux
* Nginx (reverse proxy)
* Node.js (PM2 ou Docker)

---

# Arquitetura

```
Cliente

↓

Frontend Next.js

↓

API NestJS (TypeScript)

↓

Prisma ORM

↓

Redis (cache / filas via BullMQ)

↓

PostgreSQL

↓

MinIO
```

---

# Módulo de Clientes

Cadastro completo contendo:

Pessoa Física

* Nome
* CPF
* RG
* Data nascimento

Pessoa Jurídica

* Razão Social
* Nome Fantasia
* CNPJ
* IE

Contato

* Telefones
* WhatsApp
* Email

Endereço

* CEP
* Rua
* Número
* Bairro
* Cidade
* Estado

Observações

Anexos

Histórico

---

# Módulo de Veículos

Cadastro completo

Campos

* Cliente
* Marca
* Modelo
* Ano
* Cor
* Combustível
* Motor
* Placa
* Chassi
* Renavam
* KM Atual

Controle de

* Revisões
* Troca de óleo
* Histórico
* Fotos

---

# Controle de Quilometragem

Cada serviço poderá registrar:

* KM Atual
* Próxima troca
* Próxima revisão

Alertas automáticos futuramente.

---

# Cadastro de Mecânicos

Dados pessoais

Contato

Especialidades

Situação

Data admissão

Percentual de comissão padrão

---

# Cadastro de Operadores

Usuário

Senha

Permissões

Cargo

Comissão

Situação

---

# Cadastro de Serviços

Cada serviço conterá:

Nome

Categoria

Tempo médio

Valor padrão

Descrição

Garantia

Observações

---

# Orçamentos

Permitir:

Adicionar peças

Adicionar serviços

Descontos

Observações

Validade

Conversão para Ordem de Serviço

Impressão PDF

---

# Ordem de Serviço

Status

* Aberta
* Aguardando Peças
* Em Execução
* Aguardando Cliente
* Finalizada
* Cancelada

Cada OS terá:

Número

Cliente

Veículo

Operador

Mecânico

Data abertura

Data fechamento

Itens

Serviços

Peças

Fotos

Observações

Histórico

---

# Fluxo da Ordem

```
Orçamento

↓

Aprovado

↓

OS Aberta

↓

Execução

↓

Finalizada

↓

Pagamento

↓

Liberação Comissão
```

---

# Comissão

Cada funcionário poderá possuir:

Comissão fixa

Comissão por serviço

Comissão por categoria

Comissão percentual

A comissão somente poderá ser liberada após confirmação do pagamento do cliente.

---

# Financeiro

Contas a Receber

Contas a Pagar

Boletos

Transferências

Dinheiro

PIX

Cartão

Cheque

---

# Fluxo de Caixa

Controle por:

Banco

Conta

Data

Entrada

Saída

Saldo

Transferência

---

# Bancos

Cadastro

Nome

Código

Situação

---

# Contas Bancárias

Banco

Agência

Conta

Tipo

Saldo Inicial

Saldo Atual

---

# Pagamentos

Registro de:

Fornecedor

Cliente

Funcionário

Forma de pagamento

Comprovante

Anexos

---

# Recebimentos

Valor

Cliente

Data

Forma

Observação

---

# Impressões

OS

Orçamento

Recibo

Pagamento

Comissão

Extrato

---

# Histórico

Todo registro possuirá:

Usuário

Data

Hora

IP

Alteração

Antes

Depois

---

# Dashboard

Indicadores

OS em aberto

OS finalizadas

Receita diária

Receita mensal

Comissões pendentes

Serviços realizados

Clientes novos

Veículos cadastrados

---

# Pesquisa Global

Pesquisar por:

Cliente

Placa

CPF

Telefone

OS

Motorista

Veículo

Modelo

---

# Banco de Dados

Principais tabelas

```
users

roles

permissions

clients

vehicles

vehicle_models

vehicle_brands

services

service_categories

mechanics

operators

orders

order_items

order_services

payments

receipts

banks

bank_accounts

cash_flow

commissions

budgets

budget_items

files

logs

audit_logs
```

---

# API

Endpoints

```
/api/login

/api/clientes

/api/veiculos

/api/os

/api/orcamentos

/api/pagamentos

/api/comissoes

/api/dashboard

/api/financeiro

/api/bancos
```

---

# Permissões

Administrador

Gerente

Financeiro

Operador

Mecânico

Cada permissão será granular.

Exemplo:

```
clientes.criar

clientes.editar

clientes.excluir

clientes.visualizar
```

---

# Auditoria

Registrar:

Quem

Quando

Onde

O que mudou

Valor anterior

Novo valor

---

# Uploads

Documentos

Fotos

PDF

Comprovantes

Garantias

Ordens assinadas

---

# Relatórios

Clientes

Veículos

Serviços

OS

Financeiro

Fluxo Caixa

Comissões

Mecânicos

Operadores

Receitas

Pagamentos

Recebimentos

Trocas de óleo

Revisões

---

# Segurança

Autenticação JWT

Permissões RBAC

Auditoria

Backup automático

HTTPS

Logs

---

# Roadmap

## MVP

* Login
* Clientes
* Veículos
* Serviços
* Mecânicos
* Operadores
* Ordem de Serviço
* Orçamento

---

## Versão 1.0

* Financeiro
* Fluxo Caixa
* Comissão
* Relatórios
* Dashboard

---

## Versão 1.5

* Importação do DOS
* Integração SIV-NG
* Impressões
* Uploads

---

## Versão 2.0

* Aplicativo Mobile
* WhatsApp
* Assinatura Digital
* Notificações
* Agendamento

---

# Backlog Inicial

* [ ] Definir identidade visual
* [x] Criar banco PostgreSQL
* [x] Modelar tabelas
* [x] Criar autenticação
* [x] Criar RBAC
* [x] Cadastro de clientes
* [x] Cadastro de veículos
* [x] Cadastro de serviços
* [x] Cadastro de mecânicos
* [x] Cadastro de operadores
* [ ] Cadastro de bancos
* [ ] Cadastro de contas
* [x] Ordem de Serviço
* [x] Orçamento
* [x] Financeiro
* [x] Fluxo de Caixa
* [x] Comissão
* [ ] Relatórios
* [x] Dashboard
* [ ] Importação DOS
* [ ] Integração SIV-NG
* [x] API REST
* [x] Testes automatizados (inicial — RBAC e Clientes)
* [ ] Backup
* [x] Deploy

---

# Estrutura do Projeto

```
apps/
    frontend/
    backend/

packages/
    ui/
    shared/

database/

docs/

api/

storage/

tests/

docker/

scripts/
```

---

# Melhorias Futuras

* Aplicativo Android
* Aplicativo iOS
* Portal do Cliente
* Agendamento Online
* Aprovação por WhatsApp
* Assinatura Eletrônica
* OCR para documentos
* Leitura de placas
* Integração PIX
* Integração bancária
* Emissão de NF-e
* Integração SEFAZ
* Controle de garantia
* Agenda da oficina
* Controle de elevadores
* Checklist digital
* Fotos antes/depois
* Histórico completo do veículo
* IA para diagnóstico e sugestões de manutenção
* Alertas automáticos de revisão e troca de óleo

---

# Checklist de Desenvolvimento

## Infraestrutura

* [x] Repositório Git
* [x] Ambiente de Desenvolvimento
* [ ] Ambiente de Homologação
* [ ] Ambiente de Produção
* [ ] CI/CD

## Backend

* [x] Autenticação
* [x] APIs (Clientes, Veículos, Serviços, Mecânicos, Operadores, OS, Orçamentos, Financeiro, Comissões, Usuários)
* [x] Validações
* [x] Auditoria
* [ ] Logs (estruturados/centralizados)

## Frontend

* [x] Dashboard (indicadores reais consumidos de `/api/dashboard`)
* [x] Cadastros (criar, editar e excluir para Clientes, Veículos, Mecânicos, Operadores, Serviços)
* [x] Ordem de Serviço (criação com serviços+peças; mudança de status na listagem)
* [x] Financeiro (contas a pagar/receber, fluxo de caixa, comissões)
* [ ] Relatórios

## Banco de Dados

* [x] Modelagem
* [ ] Índices (além dos criados automaticamente pelas chaves/uniques do Prisma)
* [x] Migrations
* [x] Seeds

## Qualidade

* [x] Testes Unitários (inicial — RBAC Guard e ClientsService, 9 testes)
* [ ] Testes de Integração
* [ ] Testes End-to-End
* [ ] Documentação da API
* [ ] Manual do Usuário

---

# Observações

O SIG-Mechanic foi concebido para ser um sistema modular, escalável e de longa duração. Embora seu uso inicial seja exclusivamente interno, sua arquitetura permitirá futuramente a criação de versões comerciais (SaaS) com suporte a múltiplas empresas (multi-tenant), integração com sistemas fiscais, emissão de documentos eletrônicos e aplicativos móveis, caso exista interesse em expandir o projeto.
