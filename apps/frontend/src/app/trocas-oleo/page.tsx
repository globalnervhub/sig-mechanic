'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import ClientAutocomplete, { ClientOption } from '@/components/ClientAutocomplete';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

interface VehicleOption {
  id: string;
  clientId: string;
  plate: string;
  brand: { name: string };
  model: { name: string };
}

interface OilChangeRecord {
  id: string;
  changeDate: string;
  currentKm: number;
  nextChangeKm?: number;
  nextChangeDate?: string;
  oilType?: string;
  notes?: string;
}

interface VehicleOverview {
  id: string;
  plate: string;
  currentKm?: number;
  client: { name: string };
  brand: { name: string };
  model: { name: string };
  lastOilChange: OilChangeRecord | null;
}

const emptyForm = {
  vehicleId: '',
  changeDate: new Date().toISOString().slice(0, 10),
  currentKm: '',
  nextChangeKm: '',
  nextChangeDate: '',
  oilType: '',
  notes: '',
};

export default function TrocasOleoPage() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<VehicleOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [clientId, setClientId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formKey, setFormKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [historyVehicleId, setHistoryVehicleId] = useState<string | null>(null);
  const [history, setHistory] = useState<OilChangeRecord[]>([]);

  function loadOverview(term?: string) {
    setLoading(true);
    const query = term ? `?search=${encodeURIComponent(term)}` : '';
    apiFetch<VehicleOverview[]>(`/trocas-oleo/veiculos${query}`)
      .then(setOverview)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar veiculos'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(() => loadOverview(search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (!clientId) {
      setVehicles([]);
      return;
    }
    apiFetch<VehicleOption[]>(`/veiculos?clientId=${clientId}`)
      .then(setVehicles)
      .catch(() => setVehicles([]));
  }, [clientId]);

  function showHistory(vehicleId: string) {
    setHistoryVehicleId(vehicleId);
    apiFetch<OilChangeRecord[]>(`/trocas-oleo?vehicleId=${vehicleId}`)
      .then(setHistory)
      .catch(() => setHistory([]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch('/trocas-oleo', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: form.vehicleId,
          changeDate: form.changeDate,
          currentKm: Number(form.currentKm),
          nextChangeKm: form.nextChangeKm ? Number(form.nextChangeKm) : undefined,
          nextChangeDate: form.nextChangeDate || undefined,
          oilType: form.oilType || undefined,
          notes: form.notes || undefined,
        }),
      });
      showToast('Troca de oleo registrada com sucesso.');
      setClientId('');
      setForm(emptyForm);
      setFormKey((k) => k + 1);
      loadOverview(search);
      if (historyVehicleId === form.vehicleId) showHistory(form.vehicleId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar troca de oleo';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRecord(id: string) {
    if (!confirm('Excluir este registro de troca de oleo?')) return;
    try {
      await apiFetch(`/trocas-oleo/${id}`, { method: 'DELETE' });
      showToast('Registro excluido.');
      if (historyVehicleId) showHistory(historyVehicleId);
      loadOverview(search);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir registro', 'error');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6 md:p-8">
        <p className="mb-6 text-sm text-gray-600">
          Acompanhamento das trocas de oleo dos veiculos dos clientes, com historico completo por veiculo.
        </p>

        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-3"
        >
          <ClientAutocomplete
            required
            onSelect={(c: ClientOption | null) => {
              setClientId(c?.id ?? '');
              setForm({ ...form, vehicleId: '' });
            }}
          />
          <select
            required
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            disabled={!clientId}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">Selecione o veiculo</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} — {v.brand.name} {v.model.name}
              </option>
            ))}
          </select>
          <input
            required
            type="date"
            value={form.changeDate}
            onChange={(e) => setForm({ ...form, changeDate: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            placeholder="Km atual"
            value={form.currentKm}
            onChange={(e) => setForm({ ...form, currentKm: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Proxima troca (km)"
            value={form.nextChangeKm}
            onChange={(e) => setForm({ ...form, nextChangeKm: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            type="date"
            placeholder="Proxima troca (data)"
            value={form.nextChangeDate}
            onChange={(e) => setForm({ ...form, nextChangeDate: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="Tipo de oleo"
            value={form.oilType}
            onChange={(e) => setForm({ ...form, oilType: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="Observacoes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="rounded border px-3 py-2 text-sm sm:col-span-2"
          />
          <button
            type="submit"
            disabled={submitting || !form.vehicleId}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Registrar Troca'}
          </button>
          {formError && <p className="text-sm text-red-600 sm:col-span-3">{formError}</p>}
        </form>

        <div className="mb-4 flex justify-end">
          <input
            placeholder="Buscar por placa ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm sm:w-72"
          />
        </div>

        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Placa</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Veiculo</th>
                <th className="p-3">Km Atual</th>
                <th className="p-3">Ultima Troca</th>
                <th className="p-3">Proxima Troca</th>
                <th className="p-3">Historico</th>
              </tr>
            </thead>
            <tbody>
              {overview.map((v) => (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{v.plate}</td>
                  <td className="p-3">{v.client?.name}</td>
                  <td className="p-3">
                    {v.brand?.name} {v.model?.name}
                  </td>
                  <td className="p-3">{v.currentKm ?? '-'}</td>
                  <td className="p-3">
                    {v.lastOilChange
                      ? `${new Date(v.lastOilChange.changeDate).toLocaleDateString('pt-BR')} (${v.lastOilChange.currentKm} km)`
                      : '-'}
                  </td>
                  <td className="p-3">
                    {v.lastOilChange?.nextChangeKm ?? '-'}
                    {v.lastOilChange?.nextChangeDate
                      ? ` / ${new Date(v.lastOilChange.nextChangeDate).toLocaleDateString('pt-BR')}`
                      : ''}
                  </td>
                  <td className="p-3">
                    <button onClick={() => showHistory(v.id)} className="text-blue-600 hover:underline">
                      Ver historico
                    </button>
                  </td>
                </tr>
              ))}
              {overview.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-gray-500">
                    Nenhum veiculo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {historyVehicleId && (
          <div className="mt-6 rounded-lg border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold">Historico de Trocas</h2>
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">Data</th>
                  <th className="p-2">Km</th>
                  <th className="p-2">Proxima (km/data)</th>
                  <th className="p-2">Oleo</th>
                  <th className="p-2">Observacoes</th>
                  <th className="p-2">Acao</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{new Date(h.changeDate).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2">{h.currentKm}</td>
                    <td className="p-2">
                      {h.nextChangeKm ?? '-'}
                      {h.nextChangeDate ? ` / ${new Date(h.nextChangeDate).toLocaleDateString('pt-BR')}` : ''}
                    </td>
                    <td className="p-2">{h.oilType ?? '-'}</td>
                    <td className="p-2">{h.notes ?? '-'}</td>
                    <td className="p-2">
                      <button onClick={() => handleDeleteRecord(h.id)} className="text-red-600 hover:underline">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-2 text-center text-gray-500">
                      Nenhum registro de troca de oleo para este veiculo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AppShell>
  );
}
