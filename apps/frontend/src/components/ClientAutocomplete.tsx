'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface ClientOption {
  id: string;
  name: string;
  legacyCode?: string;
  cpf?: string;
  cnpj?: string;
  phone?: string;
}

interface Props {
  onSelect: (client: ClientOption | null) => void;
  placeholder?: string;
  initialLabel?: string;
  required?: boolean;
}

/**
 * Campo de busca dinamica de clientes (autocomplete). Substitui o antigo
 * <select> com todos os clientes pre-carregados, que nao escala com uma
 * base de +5000 registros. Busca por nome, CPF/CNPJ, telefone ou codigo do
 * sistema legado (com debounce de 300ms, minimo 2 caracteres).
 */
export default function ClientAutocomplete({ onSelect, placeholder, initialLabel, required }: Props) {
  const [term, setTerm] = useState(initialLabel ?? '');
  const [options, setOptions] = useState<ClientOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || term.trim().length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      apiFetch<ClientOption[]>(`/clientes?search=${encodeURIComponent(term.trim())}`)
        .then(setOptions)
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [term, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(client: ClientOption) {
    setTerm(`${client.name}${client.legacyCode ? ` (#${client.legacyCode})` : ''}`);
    setOpen(false);
    setOptions([]);
    onSelect(client);
  }

  function handleChange(v: string) {
    setTerm(v);
    setOpen(true);
    if (!v.trim()) onSelect(null);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        required={required}
        placeholder={placeholder ?? 'Buscar cliente por nome, CPF/CNPJ, telefone ou codigo...'}
        value={term}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        className="w-full rounded border px-3 py-2 text-sm"
        autoComplete="off"
      />
      {open && term.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded border bg-white shadow-lg">
          {loading && <div className="p-2 text-sm text-gray-500">Buscando...</div>}
          {!loading && options.length === 0 && (
            <div className="p-2 text-sm text-gray-500">Nenhum cliente encontrado.</div>
          )}
          {options.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => handleSelect(c)}
              className="block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-100"
            >
              <span className="font-medium">{c.name}</span>
              {c.legacyCode && <span className="ml-2 text-xs text-gray-400">#{c.legacyCode}</span>}
              {(c.cpf || c.cnpj) && <span className="ml-2 text-xs text-gray-500">{c.cpf ?? c.cnpj}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
