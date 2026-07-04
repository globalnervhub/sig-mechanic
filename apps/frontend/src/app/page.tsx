'use client';

import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function DashboardPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Dashboard — SIG-Mechanic</h1>
        <p className="mb-8 text-gray-600">MVP inicial. Modulos disponiveis ate o momento:</p>
        <nav className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Link href="/clientes" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
            Clientes
          </Link>
          <Link href="/veiculos" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
            Veiculos
          </Link>
          <Link href="/servicos" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
            Servicos
          </Link>
          <Link href="/mecanicos" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
            Mecanicos
          </Link>
          <Link href="/operadores" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
            Operadores
          </Link>
          <Link href="/orcamentos" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
            Orcamentos
          </Link>
          <Link href="/os" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
            Ordens de Servico
          </Link>
        </nav>
      </main>
    </AppShell>
  );
}
