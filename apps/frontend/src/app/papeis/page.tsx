'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  description?: string;
  userCount: number;
  permissionCodes: string[];
}

interface PermissionGroup {
  module: string;
  codes: string[];
}

const ACTION_LABELS: Record<string, string> = {
  criar: 'Criar',
  editar: 'Editar',
  excluir: 'Excluir',
  visualizar: 'Visualizar',
};

const MODULE_LABELS: Record<string, string> = {
  clientes: 'Clientes',
  veiculos: 'Veiculos',
  servicos: 'Servicos',
  mecanicos: 'Mecanicos',
  operadores: 'Operadores',
  os: 'Ordens de Servico',
  orcamentos: 'Orcamentos',
  financeiro: 'Financeiro',
  usuarios: 'Usuarios',
  papeis: 'Papeis e Permissoes',
  trocas_oleo: 'Trocas de Oleo',
};

const ACTION_ORDER = ['visualizar', 'criar', 'editar', 'excluir'];

export default function PapeisPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      apiFetch<Role[]>('/papeis'),
      apiFetch<PermissionGroup[]>('/papeis/permissoes-disponiveis'),
    ])
      .then(([r, g]) => {
        setRoles(r);
        setGroups(g);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar papeis'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function selectRole(role: Role) {
    setSelectedRoleId(role.id);
    setSelectedCodes(new Set(role.permissionCodes));
  }

  function toggleCode(code: string) {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function handleSavePermissions() {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      await apiFetch(`/papeis/${selectedRoleId}/permissoes`, {
        method: 'PATCH',
        body: JSON.stringify({ permissionCodes: Array.from(selectedCodes) }),
      });
      showToast('Permissoes atualizadas com sucesso.');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar permissoes', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setCreating(true);
    try {
      await apiFetch('/papeis', {
        method: 'POST',
        body: JSON.stringify({ name: newRoleName.trim(), description: newRoleDescription.trim() || undefined }),
      });
      showToast('Papel criado com sucesso.');
      setNewRoleName('');
      setNewRoleDescription('');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao criar papel', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteRole(role: Role) {
    if (role.userCount > 0) {
      showToast('Nao e possivel excluir: existem usuarios com este papel.', 'error');
      return;
    }
    if (!confirm(`Excluir o papel "${role.name}"?`)) return;
    try {
      await apiFetch(`/papeis/${role.id}`, { method: 'DELETE' });
      showToast('Papel excluido.');
      if (selectedRoleId === role.id) setSelectedRoleId(null);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir papel', 'error');
    }
  }

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl p-6 md:p-8">
        <p className="mb-6 text-sm text-gray-600">
          Gerencie os papeis (perfis de acesso) do sistema e as permissoes granulares de cada um.
        </p>

        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="mb-4 rounded-lg border bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold">Papeis</h2>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {roles.map((role) => (
                      <tr
                        key={role.id}
                        onClick={() => selectRole(role)}
                        className={`cursor-pointer border-t hover:bg-gray-50 ${
                          selectedRoleId === role.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <td className="p-2">
                          <div className="font-medium">{role.name}</div>
                          {role.description && <div className="text-xs text-gray-500">{role.description}</div>}
                        </td>
                        <td className="p-2 text-right text-xs text-gray-500">{role.userCount} usuario(s)</td>
                        <td className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleDeleteRole(role)} className="text-red-600 hover:underline">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleCreateRole} className="rounded-lg border bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold">Novo Papel</h2>
                <div className="space-y-2">
                  <input
                    required
                    placeholder="Nome do papel"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Descricao (opcional)"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {creating ? 'Criando...' : 'Criar Papel'}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold">
                  Permissoes {selectedRole ? `de ${selectedRole.name}` : ''}
                </h2>
                {!selectedRole && <p className="text-sm text-gray-500">Selecione um papel para editar suas permissoes.</p>}
                {selectedRole && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="text-left">
                            <th className="p-2">Modulo</th>
                            {ACTION_ORDER.map((action) => (
                              <th key={action} className="p-2 text-center">
                                {ACTION_LABELS[action]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {groups.map((group) => (
                            <tr key={group.module} className="border-t">
                              <td className="p-2 font-medium">{MODULE_LABELS[group.module] ?? group.module}</td>
                              {ACTION_ORDER.map((action) => {
                                const code = `${group.module}.${action}`;
                                const exists = group.codes.includes(code);
                                return (
                                  <td key={action} className="p-2 text-center">
                                    {exists ? (
                                      <input
                                        type="checkbox"
                                        checked={selectedCodes.has(code)}
                                        onChange={() => toggleCode(code)}
                                        className="h-4 w-4"
                                      />
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : 'Salvar Permissoes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
