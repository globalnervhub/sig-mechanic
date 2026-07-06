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

const QUICK_LINKS = [
  { href: '/clientes', label: 'Novo Cliente' },
  { href: '/veiculos', label: 'Novo Veiculo' },
  { href: '/orcamentos', label: 'Novo Orcamento' },
  { href: '/os', label: 'Nova Ordem de Servico' },
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
        { label: 'OS em Aberto', value: summary.osOpen, accent: 'border-l-blue-500' },
        { label: 'OS Finalizadas', value: summary.osDone, accent: 'border-l-emerald-500' },
        { label: 'Receita Diaria', value: formatCurrency(summary.dailyRevenue), accent: 'border-l-emerald-500' },
        { label: 'Receita Mensal', value: formatCurrency(summary.monthlyRevenue), accent: 'border-l-emerald-500' },
        { label: 'Comissoes Pendentes', value: formatCurrency(summary.pendingCommissions), accent: 'border-l-amber-500' },
        { label: 'Servicos Realizados (mes)', value: summary.servicesPerformedThisMonth, accent: 'border-l-indigo-500' },
        { label: 'Clientes Novos (mes)', value: summary.newClientsThisMonth, accent: 'border-l-purple-500' },
        { label: 'Veiculos Cadastrados', value: summary.vehiclesRegistered, accent: 'border-l-gray-400' },
      ]
    : [];

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl p-6 md:p-8">
        {loading && <p className="text-gray-500">Carregando indicadores...</p>}
        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className={`rounded-lg border-l-4 bg-white p-4 shadow-sm ${c.accent}`}>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-800">{c.value}</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Acoes Rapidas</h2>
        <nav className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-lg border bg-white p-4 text-center text-sm font-medium shadow-sm transition-shadow hover:shadow-md"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      </main>
    </AppShell>
  );
}
