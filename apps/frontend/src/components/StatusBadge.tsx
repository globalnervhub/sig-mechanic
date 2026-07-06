const COLOR_MAP: Record<string, string> = {
  // genericos
  ATIVO: 'bg-emerald-100 text-emerald-700',
  INATIVO: 'bg-gray-200 text-gray-600',
  // Ordem de Servico
  OPEN: 'bg-blue-100 text-blue-700',
  WAITING_PARTS: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  WAITING_CLIENT: 'bg-purple-100 text-purple-700',
  DONE: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  // Orcamento
  DRAFT: 'bg-gray-200 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  CONVERTED: 'bg-indigo-100 text-indigo-700',
  EXPIRED: 'bg-gray-200 text-gray-500',
  // Financeiro
  PAID: 'bg-emerald-100 text-emerald-700',
  RECEIVED: 'bg-emerald-100 text-emerald-700',
  // Comissao
  PENDING: 'bg-amber-100 text-amber-700',
};

const LABEL_MAP: Record<string, string> = {
  OPEN: 'Aberta',
  WAITING_PARTS: 'Aguardando Pecas',
  IN_PROGRESS: 'Em Execucao',
  WAITING_CLIENT: 'Aguardando Cliente',
  DONE: 'Finalizada',
  CANCELLED: 'Cancelada',
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  CONVERTED: 'Convertido em OS',
  EXPIRED: 'Expirado',
  PAID: 'Paga',
  RECEIVED: 'Recebida',
  PENDING: 'Pendente',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

/** Pill colorido para exibir status de forma consistente em todas as telas. */
export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const color = COLOR_MAP[status] ?? 'bg-gray-100 text-gray-700';
  const text = label ?? LABEL_MAP[status] ?? status;

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{text}</span>
  );
}
