'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year?: string;
  color?: string;
  client: { name: string };
}

interface ClientOption {
  id: string;
  name: string;
}

const emptyForm = { clientId: '', brand: '', model: '', year: '', plate: '', color: '' };

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([apiFetch<Vehicle[]>('/veiculos'), apiFetch<ClientOption[]>('/clientes')])
      .then(([v, c]) => {
        setVehicles(v);
        setClients(c);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar veiculos'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch('/veiculos', { method: 'POST', body: JSON.stringify(form) });
      setForm(emptyForm);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar veiculo');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Veiculos</h1>

        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-6">
          <select
            required
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            className="rounded border px-3 py-2 text-sm sm:col-span-2"
          >
            <option value="">Selecione o cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Marca"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Modelo"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="Ano"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Placa"
            value={form.plate}
            onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="Cor"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Adicionar Veiculo'}
          </button>
          {formError && <p className="text-sm text-red-600 sm:col-span-6">{formError}</p>}
        </form>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Placa</th>
                <th className="p-3">Marca</th>
                <th className="p-3">Modelo</th>
                <th className="p-3">Ano</th>
                <th className="p-3">Cliente</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3">{v.plate}</td>
                  <td className="p-3">{v.brand}</td>
                  <td className="p-3">{v.model}</td>
                  <td className="p-3">{v.year ?? '-'}</td>
                  <td className="p-3">{v.client?.name}</td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-500">
                    Nenhum veiculo cadastrado.
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
