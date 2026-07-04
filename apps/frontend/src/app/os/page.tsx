'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

interface Order {
  id: string;
  legacyNumber?: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  partsTotal: string;
  servicesTotal: string;
  client: { name: string };
  vehicle: { plate: string; brand: string; model: string };
}

interface ClientOption {
  id: string;
  name: string;
}

interface VehicleOption {
  id: string;
  clientId: string;
  plate: string;
  brand: string;
  model: string;
}

interface ServiceOption {
  id: string;
  name: string;
  price: string;
}

interface MechanicOption {
  id: string;
  name: string;
}

interface ServiceLine {
  serviceId: string;
  mechanicId: string;
  price: string;
}

interface PartLine {
  description: string;
  quantity: string;
  unitPrice: string;
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  WAITING_PARTS: 'Aguardando Pecas',
  IN_PROGRESS: 'Em Execucao',
  WAITING_CLIENT: 'Aguardando Cliente',
  DONE: 'Finalizada',
  CANCELLED: 'Cancelada',
};

export default function OrdensServicoPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [mechanics, setMechanics] = useState<MechanicOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);
  const [partLines, setPartLines] = useState<PartLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      apiFetch<Order[]>('/os'),
      apiFetch<ClientOption[]>('/clientes'),
      apiFetch<VehicleOption[]>('/veiculos'),
      apiFetch<ServiceOption[]>('/servicos'),
      apiFetch<MechanicOption[]>('/mecanicos'),
    ])
      .then(([o, c, v, s, m]) => {
        setOrders(o);
        setClients(c);
        setVehicles(v);
        setServices(s);
        setMechanics(m);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar ordens de servico'))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(id: string, status: string) {
    await apiFetch(`/os/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  }

  useEffect(load, []);

  function addServiceLine() {
    setServiceLines([...serviceLines, { serviceId: '', mechanicId: '', price: '' }]);
  }

  function addPartLine() {
    setPartLines([...partLines, { description: '', quantity: '1', unitPrice: '' }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch('/os', {
        method: 'POST',
        body: JSON.stringify({
          clientId,
          vehicleId,
          notes: notes || undefined,
          services: serviceLines
            .filter((s) => s.serviceId)
            .map((s) => ({ serviceId: s.serviceId, mechanicId: s.mechanicId || undefined, price: Number(s.price) })),
          items: partLines
            .filter((p) => p.description)
            .map((p) => ({ description: p.description, quantity: Number(p.quantity), unitPrice: Number(p.unitPrice) })),
        }),
      });
      setClientId('');
      setVehicleId('');
      setNotes('');
      setServiceLines([]);
      setPartLines([]);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar ordem de servico');
    } finally {
      setSubmitting(false);
    }
  }

  const vehiclesForClient = vehicles.filter((v) => v.clientId === clientId);

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Ordens de Servico</h1>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={!clientId}
              className="rounded border px-3 py-2 text-sm"
            >
              <option value="">Selecione o veiculo</option>
              {vehiclesForClient.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.brand} {v.model}
                </option>
              ))}
            </select>
            <input
              placeholder="Observacoes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Servicos</h2>
              <button type="button" onClick={addServiceLine} className="text-sm text-blue-600 hover:underline">
                + adicionar servico
              </button>
            </div>
            {serviceLines.map((line, idx) => (
              <div key={idx} className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
                <select
                  value={line.serviceId}
                  onChange={(e) => {
                    const service = services.find((s) => s.id === e.target.value);
                    const updated = [...serviceLines];
                    updated[idx] = { ...updated[idx], serviceId: e.target.value, price: service?.price ?? updated[idx].price };
                    setServiceLines(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm sm:col-span-2"
                >
                  <option value="">Selecione o servico</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (R$ {s.price})
                    </option>
                  ))}
                </select>
                <select
                  value={line.mechanicId}
                  onChange={(e) => {
                    const updated = [...serviceLines];
                    updated[idx] = { ...updated[idx], mechanicId: e.target.value };
                    setServiceLines(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm"
                >
                  <option value="">Mecanico (opcional)</option>
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Preco"
                  type="number"
                  step="0.01"
                  value={line.price}
                  onChange={(e) => {
                    const updated = [...serviceLines];
                    updated[idx] = { ...updated[idx], price: e.target.value };
                    setServiceLines(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Pecas</h2>
              <button type="button" onClick={addPartLine} className="text-sm text-blue-600 hover:underline">
                + adicionar peca
              </button>
            </div>
            {partLines.map((line, idx) => (
              <div key={idx} className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
                <input
                  placeholder="Descricao"
                  value={line.description}
                  onChange={(e) => {
                    const updated = [...partLines];
                    updated[idx] = { ...updated[idx], description: e.target.value };
                    setPartLines(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  placeholder="Quantidade"
                  type="number"
                  value={line.quantity}
                  onChange={(e) => {
                    const updated = [...partLines];
                    updated[idx] = { ...updated[idx], quantity: e.target.value };
                    setPartLines(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="Preco unitario"
                  type="number"
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) => {
                    const updated = [...partLines];
                    updated[idx] = { ...updated[idx], unitPrice: e.target.value };
                    setPartLines(updated);
                  }}
                  className="rounded border px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || !clientId || !vehicleId}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Abrir Ordem de Servico'}
          </button>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Veiculo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total Pecas</th>
                <th className="p-3">Total Servicos</th>
                <th className="p-3">Abertura</th>
                <th className="p-3">Mudar Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3">{o.client?.name}</td>
                  <td className="p-3">
                    {o.vehicle?.plate} ({o.vehicle?.brand} {o.vehicle?.model})
                  </td>
                  <td className="p-3">{STATUS_LABELS[o.status] ?? o.status}</td>
                  <td className="p-3">R$ {o.partsTotal}</td>
                  <td className="p-3">R$ {o.servicesTotal}</td>
                  <td className="p-3">{new Date(o.openedAt).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-gray-500">
                    Nenhuma ordem de servico cadastrada.
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
