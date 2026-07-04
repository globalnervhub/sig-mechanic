'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

interface DashboardSummary {
  osOpen: number;
  osDone: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  pendingCommissions: number;
  servicesPerformedThisMonth: number;
  newClientsThisMonth: number;
  vehiclesRegistered: number;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const MODULES = [
  { href: '/clientes', label: 'Clientes' },
  { href: '/veiculos', label: 'Veiculos' },
  { href: '/servicos', label: 'Servicos' },
  { href: '/mecanicos', label: 'Mecanicos' },
  { href: '/operadores', label: 'Operadores' },
  { href: '/orcamentos', label: 'Orcamentos' },
  { href: '/os', label: 'Ordens de Servico' },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DashboardSummary>('/dashboard')
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar indicadores'))
      .finally(() => setLoading(false));
  }, []);

  const cards = summary
    ? [
        { label: 'OS em Aberto', value: summary.osOpen },
        { label: 'OS Finalizadas', value: summary.osDone },
        { label: 'Receita Diaria', value: formatCurrency(summary.dailyRevenue) },
        { label: 'Receita Mensal', value: formatCurrency(summary.monthlyRevenue) },
        { label: 'Comissoes Pendentes', value: formatCurrency(summary.pendingCommissions) },
        { label: 'Servicos Realizados (mes)', value: summary.servicesPerformedThisMonth },
        { label: 'Clientes Novos (mes)', value: summary.newClientsThisMonth },
        { label: 'Veiculos Cadastrados', value: summary.vehiclesRegistered },
      ]
    : [];

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Dashboard — SIG-Mechanic</h1>

        {loading && <p>Carregando indicadores...</p>}
        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="mt-1 text-xl font-semibold">{c.value}</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="mb-4 text-lg font-semibold text-gray-700">Modulos</h2>
        <nav className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
              {m.label}
            </Link>
          ))}
        </nav>
      </main>
    </AppShell>
  );
}
