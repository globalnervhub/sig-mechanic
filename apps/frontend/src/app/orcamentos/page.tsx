'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

interface Budget {
  id: string;
  legacyNumber?: string;
  status: string;
  discount: string;
  validUntil?: string;
  client: { name: string };
  vehicle?: { plate: string };
  items: { id: string; description: string; quantity: number; unitPrice: string }[];
}

interface ClientOption {
  id: string;
  name: string;
}

interface VehicleOption {
  id: string;
  clientId: string;
  plate: string;
}

interface ServiceOption {
  id: string;
  name: string;
  price: string;
}

interface ItemLine {
  type: 'SERVICE' | 'PART';
  serviceId: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export default function OrcamentosPage() {
  const { showToast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [items, setItems] = useState<ItemLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      apiFetch<Budget[]>('/orcamentos'),
      apiFetch<ClientOption[]>('/clientes'),
      apiFetch<VehicleOption[]>('/veiculos'),
      apiFetch<ServiceOption[]>('/servicos'),
    ])
      .then(([b, c, v, s]) => {
        setBudgets(b);
        setClients(c);
        setVehicles(v);
        setServices(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar orcamentos'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function addItem() {
    setItems([...items, { type: 'SERVICE', serviceId: '', description: '', quantity: '1', unitPrice: '' }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch('/orcamentos', {
        method: 'POST',
        body: JSON.stringify({
          clientId,
          vehicleId: vehicleId || undefined,
          items: items.map((i) => ({
            type: i.type,
            serviceId: i.type === 'SERVICE' ? i.serviceId || undefined : undefined,
            description: i.description,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
          })),
        }),
      });
      setClientId('');
      setVehicleId('');
      setItems([]);
      showToast('Orcamento criado com sucesso.');
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar orcamento';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConvert(id: string) {
    try {
      await apiFetch(`/orcamentos/${id}/converter`, { method: 'POST' });
      showToast('Orcamento convertido em Ordem de Servico.');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao converter orcamento', 'error');
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    try {
      await apiFetch(`/orcamentos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast('Status do orcamento atualizado.');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar status', 'error');
    }
  }

  const vehiclesForClient = vehicles.filter((v) => v.clientId === clientId);

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6 md:p-8">

        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              required
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setVehicleId('');
              }}
              className="rounded border px-3 py-2 text-sm"
            >
              <option value="">Selecione o cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={!clientId}
              className="rounded border px-3 py-2 text-sm"
            >
              <option value="">Veiculo (opcional, necessario para converter em OS)</option>
              {vehiclesForClient.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Itens</h2>
              <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">
                + adicionar item
              </button>
            </div>
            {items.map((line, idx) => (
              <div key={idx} className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-5">
                <select
                  value={line.type}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx] = { ...updated[idx], type: e.target.value as 'SERVICE' | 'PART' };
                    setItems(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm"
                >
                  <option value="SERVICE">Servico</option>
                  <option value="PART">Peca</option>
                </select>
                {line.type === 'SERVICE' ? (
                  <select
                    value={line.serviceId}
                    onChange={(e) => {
                      const service = services.find((s) => s.id === e.target.value);
                      const updated = [...items];
                      updated[idx] = {
                        ...updated[idx],
                        serviceId: e.target.value,
                        description: service?.name ?? updated[idx].description,
                        unitPrice: service?.price ?? updated[idx].unitPrice,
                      };
                      setItems(updated);
                    }}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    <option value="">Selecione o servico</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    placeholder="Descricao da peca"
                    value={line.description}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx] = { ...updated[idx], description: e.target.value };
                      setItems(updated);
                    }}
                    className="rounded border px-3 py-2 text-sm"
                  />
                )}
                <input
                  placeholder="Quantidade"
                  type="number"
                  value={line.quantity}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx] = { ...updated[idx], quantity: e.target.value };
                    setItems(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="Preco unitario"
                  type="number"
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx] = { ...updated[idx], unitPrice: e.target.value };
                    setItems(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm sm:col-span-2"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || !clientId || items.length === 0}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Criar Orcamento'}
          </button>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>

        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Veiculo</th>
                <th className="p-3">Itens</th>
                <th className="p-3">Desconto</th>
                <th className="p-3">Status</th>
                <th className="p-3">Acao</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{b.client?.name}</td>
                  <td className="p-3">{b.vehicle?.plate ?? '-'}</td>
                  <td className="p-3">{b.items?.length ?? 0}</td>
                  <td className="p-3">R$ {b.discount}</td>
                  <td className="p-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-3 space-x-2">
                    {b.status === 'DRAFT' && (
                      <button onClick={() => handleStatusUpdate(b.id, 'SENT')} className="text-blue-600 hover:underline">
                        Enviar
                      </button>
                    )}
                    {b.status === 'SENT' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'APPROVED')}
                          className="text-emerald-600 hover:underline"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'REJECTED')}
                          className="text-red-600 hover:underline"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    {(b.status === 'APPROVED' || b.status === 'SENT' || b.status === 'DRAFT') && b.vehicle && (
                      <button onClick={() => handleConvert(b.id)} className="text-indigo-600 hover:underline">
                        Converter em OS
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-gray-500">
                    Nenhum orcamento cadastrado.
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
