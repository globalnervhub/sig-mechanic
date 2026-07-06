'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

interface Payable {
  id: string;
  description: string;
  supplierName?: string;
  dueDate: string;
  amount: string;
  status: 'OPEN' | 'PAID' | 'CANCELLED';
  paidAmount?: string;
}

interface Receivable {
  id: string;
  description: string;
  client?: { name: string };
  dueDate: string;
  amount: string;
  status: 'OPEN' | 'RECEIVED' | 'CANCELLED';
  receivedAmount?: string;
}

interface ClientOption {
  id: string;
  name: string;
}

const emptyPayableForm = { description: '', supplierName: '', dueDate: '', amount: '' };
const emptyReceivableForm = { description: '', clientId: '', dueDate: '', amount: '' };

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FinanceiroPage() {
  const { showToast } = useToast();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [payableForm, setPayableForm] = useState(emptyPayableForm);
  const [receivableForm, setReceivableForm] = useState(emptyReceivableForm);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      apiFetch<Payable[]>('/financeiro/pagar'),
      apiFetch<Receivable[]>('/financeiro/receber'),
      apiFetch<ClientOption[]>('/clientes'),
      apiFetch<{ currentBalance: number }>('/financeiro/fluxo-caixa'),
    ])
      .then(([p, r, c, flow]) => {
        setPayables(p);
        setReceivables(r);
        setClients(c);
        setBalance(flow.currentBalance);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar financeiro'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreatePayable(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await apiFetch('/financeiro/pagar', {
        method: 'POST',
        body: JSON.stringify({ ...payableForm, amount: Number(payableForm.amount) }),
      });
      setPayableForm(emptyPayableForm);
      showToast('Conta a pagar criada.');
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta a pagar';
      setFormError(message);
      showToast(message, 'error');
    }
  }

  async function handleCreateReceivable(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await apiFetch('/financeiro/receber', {
        method: 'POST',
        body: JSON.stringify({
          ...receivableForm,
          clientId: receivableForm.clientId || undefined,
          amount: Number(receivableForm.amount),
        }),
      });
      setReceivableForm(emptyReceivableForm);
      showToast('Conta a receber criada.');
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta a receber';
      setFormError(message);
      showToast(message, 'error');
    }
  }

  async function handlePay(id: string) {
    if (!confirm('Confirmar pagamento total desta conta?')) return;
    try {
      await apiFetch(`/financeiro/pagar/${id}/pagar`, { method: 'PATCH', body: JSON.stringify({}) });
      showToast('Conta marcada como paga.');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao pagar conta', 'error');
    }
  }

  async function handleReceive(id: string) {
    if (!confirm('Confirmar recebimento total desta conta?')) return;
    try {
      await apiFetch(`/financeiro/receber/${id}/receber`, { method: 'PATCH', body: JSON.stringify({}) });
      showToast('Conta marcada como recebida.');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao receber conta', 'error');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6 md:p-8">
        {balance !== null && (
          <p className="mb-6 text-sm text-gray-600">
            Saldo atual (fluxo de caixa): <span className="font-semibold">{formatCurrency(balance)}</span>
          </p>
        )}

        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {formError && <p className="mb-4 text-sm text-red-600">{formError}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section>
              <h2 className="mb-3 text-lg font-semibold">Contas a Pagar</h2>
              <form onSubmit={handleCreatePayable} className="mb-4 space-y-2 rounded-lg border bg-white p-4">
                <input
                  required
                  placeholder="Descricao"
                  value={payableForm.description}
                  onChange={(e) => setPayableForm({ ...payableForm, description: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="Fornecedor"
                  value={payableForm.supplierName}
                  onChange={(e) => setPayableForm({ ...payableForm, supplierName: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    required
                    type="date"
                    value={payableForm.dueDate}
                    onChange={(e) => setPayableForm({ ...payableForm, dueDate: e.target.value })}
                    className="flex-1 rounded border px-3 py-2 text-sm"
                  />
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={payableForm.amount}
                    onChange={(e) => setPayableForm({ ...payableForm, amount: e.target.value })}
                    className="w-32 rounded border px-3 py-2 text-sm"
                  />
                </div>
                <button type="submit" className="w-full rounded bg-gray-900 px-4 py-2 text-sm text-white">
                  Adicionar Conta a Pagar
                </button>
              </form>

              <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Descricao</th>
                    <th className="p-2">Vencimento</th>
                    <th className="p-2">Valor</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {payables.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{p.description}</td>
                      <td className="p-2">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">R$ {p.amount}</td>
                      <td className="p-2">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="p-2">
                        {p.status === 'OPEN' && (
                          <button onClick={() => handlePay(p.id)} className="text-blue-600 hover:underline">
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payables.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-2 text-center text-gray-500">
                        Nenhuma conta a pagar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Contas a Receber</h2>
              <form onSubmit={handleCreateReceivable} className="mb-4 space-y-2 rounded-lg border bg-white p-4">
                <input
                  required
                  placeholder="Descricao"
                  value={receivableForm.description}
                  onChange={(e) => setReceivableForm({ ...receivableForm, description: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <select
                  value={receivableForm.clientId}
                  onChange={(e) => setReceivableForm({ ...receivableForm, clientId: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="">Cliente (opcional)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    required
                    type="date"
                    value={receivableForm.dueDate}
                    onChange={(e) => setReceivableForm({ ...receivableForm, dueDate: e.target.value })}
                    className="flex-1 rounded border px-3 py-2 text-sm"
                  />
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={receivableForm.amount}
                    onChange={(e) => setReceivableForm({ ...receivableForm, amount: e.target.value })}
                    className="w-32 rounded border px-3 py-2 text-sm"
                  />
                </div>
                <button type="submit" className="w-full rounded bg-gray-900 px-4 py-2 text-sm text-white">
                  Adicionar Conta a Receber
                </button>
              </form>

              <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Descricao</th>
                    <th className="p-2">Vencimento</th>
                    <th className="p-2">Valor</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {receivables.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{r.description}</td>
                      <td className="p-2">{new Date(r.dueDate).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">R$ {r.amount}</td>
                      <td className="p-2">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="p-2">
                        {r.status === 'OPEN' && (
                          <button onClick={() => handleReceive(r.id)} className="text-blue-600 hover:underline">
                            Receber
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {receivables.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-2 text-center text-gray-500">
                        Nenhuma conta a receber.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </main>
    </AppShell>
  );
}
