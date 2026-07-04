'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

interface ServiceItem {
  id: string;
  name: string;
  category?: string;
  price: string;
  avgTimeMin?: number;
  active: boolean;
}

const emptyForm = { name: '', category: '', price: '', avgTimeMin: '' };

export default function ServicosPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiFetch<ServiceItem[]>('/servicos')
      .then(setServices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar servicos'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(service: ServiceItem) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      category: service.category ?? '',
      price: service.price,
      avgTimeMin: service.avgTimeMin ? String(service.avgTimeMin) : '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        avgTimeMin: form.avgTimeMin ? Number(form.avgTimeMin) : undefined,
      };
      if (editingId) {
        await apiFetch(`/servicos/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/servicos', { method: 'POST', body: JSON.stringify(payload) });
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar servico');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este servico?')) return;
    setRowError(null);
    try {
      await apiFetch(`/servicos/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Erro ao excluir servico');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Servicos</h1>

        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-5">
          <input
            required
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            placeholder="Categoria"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Preco"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="Tempo medio (min)"
            type="number"
            value={form.avgTimeMin}
            onChange={(e) => setForm({ ...form, avgTimeMin: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar Servico'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded border px-3 py-2 text-sm">
                Cancelar
              </button>
            )}
          </div>
          {formError && <p className="text-sm text-red-600 sm:col-span-5">{formError}</p>}
        </form>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}
        {rowError && <p className="mb-4 text-sm text-red-600">{rowError}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Preco</th>
                <th className="p-3">Tempo Medio (min)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.category ?? '-'}</td>
                  <td className="p-3">R$ {s.price}</td>
                  <td className="p-3">{s.avgTimeMin ?? '-'}</td>
                  <td className="p-3">{s.active ? 'Ativo' : 'Inativo'}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => startEdit(s)} className="text-blue-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-gray-500">
                    Nenhum servico cadastrado.
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
