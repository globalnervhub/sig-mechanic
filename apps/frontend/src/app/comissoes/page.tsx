'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

interface Commission {
  id: string;
  amount: string;
  status: 'PENDING' | 'PAID';
  mechanic: { name: string };
  order: { id: string; client: { name: string }; vehicle: { plate: string } };
  orderService: { service: { name: string } };
}

export default function ComissoesPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch<Commission[]>('/comissoes')
      .then(setCommissions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar comissoes'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleMarkPaid(id: string) {
    if (!confirm('Marcar esta comissao como paga?')) return;
    await apiFetch(`/comissoes/${id}/pagar`, { method: 'PATCH' });
    load();
  }

  const totalPending = commissions
    .filter((c) => c.status === 'PENDING')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-2 text-2xl font-semibold">Comissoes</h1>
        <p className="mb-6 text-sm text-gray-600">
          Total pendente:{' '}
          <span className="font-semibold">
            {totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </p>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Mecanico</th>
                <th className="p-3">Cliente / Veiculo</th>
                <th className="p-3">Servico</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Status</th>
                <th className="p-3">Acao</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.mechanic?.name}</td>
                  <td className="p-3">
                    {c.order?.client?.name} — {c.order?.vehicle?.plate}
                  </td>
                  <td className="p-3">{c.orderService?.service?.name}</td>
                  <td className="p-3">R$ {c.amount}</td>
                  <td className="p-3">{c.status === 'PAID' ? 'Paga' : 'Pendente'}</td>
                  <td className="p-3">
                    {c.status === 'PENDING' && (
                      <button onClick={() => handleMarkPaid(c.id)} className="text-blue-600 hover:underline">
                        Marcar como paga
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-gray-500">
                    Nenhuma comissao gerada ainda (comissoes sao criadas automaticamente quando uma OS e finalizada).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </AppShell>
  );
}
