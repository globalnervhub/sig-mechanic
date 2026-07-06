'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ClientAutocomplete, { ClientOption } from '@/components/ClientAutocomplete';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

interface Vehicle {
  id: string;
  clientId: string;
  brand: { id: string; name: string };
  model: { id: string; name: string };
  plate: string;
  year?: string;
  color?: string;
  client: { name: string };
}

interface BrandOption {
  id: string;
  name: string;
}

interface ModelOption {
  id: string;
  name: string;
  brandId: string;
}

const emptyForm = { clientId: '', brandId: '', modelId: '', year: '', plate: '', color: '' };

export default function VeiculosPage() {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [clientLabel, setClientLabel] = useState('');
  const [formKey, setFormKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load(term?: string) {
    setLoading(true);
    const query = term ? `?search=${encodeURIComponent(term)}` : '';
    apiFetch<Vehicle[]>(`/veiculos${query}`)
      .then(setVehicles)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar veiculos'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    apiFetch<BrandOption[]>('/marcas').then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (!form.brandId) {
      setModels([]);
      return;
    }
    apiFetch<ModelOption[]>(`/modelos?brandId=${form.brandId}`)
      .then(setModels)
      .catch(() => setModels([]));
  }, [form.brandId]);

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setClientLabel(vehicle.client?.name ?? '');
    setForm({
      clientId: vehicle.clientId,
      brandId: vehicle.brand.id,
      modelId: vehicle.model.id,
      year: vehicle.year ?? '',
      plate: vehicle.plate,
      color: vehicle.color ?? '',
    });
    setFormKey((k) => k + 1);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setClientLabel('');
    setFormKey((k) => k + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await apiFetch(`/veiculos/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
        showToast('Veiculo atualizado com sucesso.');
      } else {
        await apiFetch('/veiculos', { method: 'POST', body: JSON.stringify(form) });
        showToast('Veiculo cadastrado com sucesso.');
      }
      cancelEdit();
      load(search);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar veiculo';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este veiculo?')) return;
    try {
      await apiFetch(`/veiculos/${id}`, { method: 'DELETE' });
      showToast('Veiculo excluido.');
      load(search);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir veiculo', 'error');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/marcas" className="text-sm text-blue-600 hover:underline">
            Gerenciar Marcas e Modelos
          </Link>
          <input
            placeholder="Buscar por placa, marca ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm sm:w-72"
          />
        </div>

        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-6"
        >
          <div className="sm:col-span-2">
            <ClientAutocomplete
              required
              initialLabel={clientLabel}
              onSelect={(c: ClientOption | null) => setForm({ ...form, clientId: c?.id ?? '' })}
            />
          </div>
          <select
            required
            value={form.brandId}
            onChange={(e) => setForm({ ...form, brandId: e.target.value, modelId: '' })}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">Marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            required
            value={form.modelId}
            onChange={(e) => setForm({ ...form, modelId: e.target.value })}
            disabled={!form.brandId}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">Modelo</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
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
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !form.clientId}
              className="flex-1 rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar Veiculo'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded border px-3 py-2 text-sm">
                Cancelar
              </button>
            )}
          </div>
          {formError && <p className="text-sm text-red-600 sm:col-span-6">{formError}</p>}
        </form>

        {loading && <p className="text-gray-500">Carregando...</p>}
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
                <th className="p-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{v.plate}</td>
                  <td className="p-3">{v.brand?.name}</td>
                  <td className="p-3">{v.model?.name}</td>
                  <td className="p-3">{v.year ?? '-'}</td>
                  <td className="p-3">{v.client?.name}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => startEdit(v)} className="text-blue-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-gray-500">
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
