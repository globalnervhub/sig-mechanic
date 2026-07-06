'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  active: boolean;
}

interface ModelItem {
  id: string;
  name: string;
  active: boolean;
  brandId: string;
}

export default function MarcasPage() {
  const { showToast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingBrandName, setEditingBrandName] = useState('');
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editingModelName, setEditingModelName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function loadBrands() {
    setLoading(true);
    apiFetch<Brand[]>('/marcas')
      .then(setBrands)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar marcas'))
      .finally(() => setLoading(false));
  }

  useEffect(loadBrands, []);

  useEffect(() => {
    if (!selectedBrandId) {
      setModels([]);
      return;
    }
    apiFetch<ModelItem[]>(`/modelos?brandId=${selectedBrandId}`)
      .then(setModels)
      .catch(() => setModels([]));
  }, [selectedBrandId]);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  async function handleAddBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch('/marcas', { method: 'POST', body: JSON.stringify({ name: newBrandName.trim() }) });
      showToast('Marca cadastrada com sucesso.');
      setNewBrandName('');
      loadBrands();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao cadastrar marca', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRenameBrand(id: string) {
    if (!editingBrandName.trim()) return;
    try {
      await apiFetch(`/marcas/${id}`, { method: 'PATCH', body: JSON.stringify({ name: editingBrandName.trim() }) });
      showToast('Marca atualizada.');
      setEditingBrandId(null);
      loadBrands();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar marca', 'error');
    }
  }

  async function handleDeleteBrand(id: string) {
    if (!confirm('Excluir esta marca? Isso so e possivel se nao houver modelos ou veiculos vinculados.')) return;
    try {
      await apiFetch(`/marcas/${id}`, { method: 'DELETE' });
      showToast('Marca excluida.');
      if (selectedBrandId === id) setSelectedBrandId(null);
      loadBrands();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir marca', 'error');
    }
  }

  async function handleAddModel(e: React.FormEvent) {
    e.preventDefault();
    if (!newModelName.trim() || !selectedBrandId) return;
    setSubmitting(true);
    try {
      await apiFetch('/modelos', {
        method: 'POST',
        body: JSON.stringify({ brandId: selectedBrandId, name: newModelName.trim() }),
      });
      showToast('Modelo cadastrado com sucesso.');
      setNewModelName('');
      apiFetch<ModelItem[]>(`/modelos?brandId=${selectedBrandId}`).then(setModels);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao cadastrar modelo', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRenameModel(id: string) {
    if (!editingModelName.trim()) return;
    try {
      await apiFetch(`/modelos/${id}`, { method: 'PATCH', body: JSON.stringify({ name: editingModelName.trim() }) });
      showToast('Modelo atualizado.');
      setEditingModelId(null);
      if (selectedBrandId) apiFetch<ModelItem[]>(`/modelos?brandId=${selectedBrandId}`).then(setModels);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar modelo', 'error');
    }
  }

  async function handleDeleteModel(id: string) {
    if (!confirm('Excluir este modelo? Isso so e possivel se nao houver veiculos vinculados.')) return;
    try {
      await apiFetch(`/modelos/${id}`, { method: 'DELETE' });
      showToast('Modelo excluido.');
      if (selectedBrandId) apiFetch<ModelItem[]>(`/modelos?brandId=${selectedBrandId}`).then(setModels);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir modelo', 'error');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6 md:p-8">
        <p className="mb-6 text-sm text-gray-600">
          Cadastro central de marcas e modelos de veiculos. Usado nos formularios de cadastro de veiculos,
          evitando dados livres/inconsistentes.
        </p>

        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold">Marcas</h2>
              <form onSubmit={handleAddBrand} className="mb-4 flex gap-2">
                <input
                  placeholder="Nova marca"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="flex-1 rounded border px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  Adicionar
                </button>
              </form>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {brands.map((b) => (
                    <tr
                      key={b.id}
                      className={`cursor-pointer border-t hover:bg-gray-50 ${selectedBrandId === b.id ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedBrandId(b.id)}
                    >
                      <td className="p-2">
                        {editingBrandId === b.id ? (
                          <input
                            value={editingBrandName}
                            onChange={(e) => setEditingBrandName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full rounded border px-2 py-1 text-sm"
                          />
                        ) : (
                          b.name
                        )}
                      </td>
                      <td className="w-32 space-x-2 p-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {editingBrandId === b.id ? (
                          <button onClick={() => handleRenameBrand(b.id)} className="text-blue-600 hover:underline">
                            Salvar
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingBrandId(b.id);
                              setEditingBrandName(b.name);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Editar
                          </button>
                        )}
                        <button onClick={() => handleDeleteBrand(b.id)} className="text-red-600 hover:underline">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {brands.length === 0 && (
                    <tr>
                      <td className="p-2 text-center text-gray-500">Nenhuma marca cadastrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold">
                Modelos {selectedBrand ? `de ${selectedBrand.name}` : ''}
              </h2>
              {!selectedBrandId && <p className="text-sm text-gray-500">Selecione uma marca para ver os modelos.</p>}
              {selectedBrandId && (
                <>
                  <form onSubmit={handleAddModel} className="mb-4 flex gap-2">
                    <input
                      placeholder="Novo modelo"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      className="flex-1 rounded border px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      Adicionar
                    </button>
                  </form>
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {models.map((m) => (
                        <tr key={m.id} className="border-t hover:bg-gray-50">
                          <td className="p-2">
                            {editingModelId === m.id ? (
                              <input
                                value={editingModelName}
                                onChange={(e) => setEditingModelName(e.target.value)}
                                className="w-full rounded border px-2 py-1 text-sm"
                              />
                            ) : (
                              m.name
                            )}
                          </td>
                          <td className="w-32 space-x-2 p-2 text-right">
                            {editingModelId === m.id ? (
                              <button onClick={() => handleRenameModel(m.id)} className="text-blue-600 hover:underline">
                                Salvar
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingModelId(m.id);
                                  setEditingModelName(m.name);
                                }}
                                className="text-blue-600 hover:underline"
                              >
                                Editar
                              </button>
                            )}
                            <button onClick={() => handleDeleteModel(m.id)} className="text-red-600 hover:underline">
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                      {models.length === 0 && (
                        <tr>
                          <td className="p-2 text-center text-gray-500">Nenhum modelo cadastrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
