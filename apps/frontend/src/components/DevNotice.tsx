'use client';

/**
 * Aviso visual de desenvolvimento (senhas/credenciais de teste, etc.).
 * TODO: remover este componente e todos os seus usos antes de ir para producao.
 */
export default function DevNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-800">
      <strong>Aviso (ambiente de desenvolvimento — remover em produção):</strong> {children}
    </div>
  );
}
