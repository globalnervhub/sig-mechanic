'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
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
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load(term?: string) {
    setLoading(true);
    const query = term ? `?search=${encodeURIComponent(term)}` : '';
    apiFetch<ServiceItem[]>(`/servicos${query}`)
      .then(setServices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar servicos'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
        showToast('Servico atualizado com sucesso.');
      } else {
        await apiFetch('/servicos', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Servico cadastrado com sucesso.');
      }
      setForm(emptyForm);
      setEditingId(null);
      load(search);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar servico';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este servico?')) return;
    try {
      await apiFetch(`/servicos/${id}`, { method: 'DELETE' });
      showToast('Servico excluido.');
      load(search);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir servico', 'error');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6 md:p-8">
        <div className="mb-6 flex justify-end">
          <input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm sm:w-72"
          />
        </div>

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

        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

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
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.category ?? '-'}</td>
                  <td className="p-3">R$ {s.price}</td>
                  <td className="p-3">{s.avgTimeMin ?? '-'}</td>
                  <td className="p-3">
                    <StatusBadge status={s.active ? 'ATIVO' : 'INATIVO'} />
                  </td>
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
