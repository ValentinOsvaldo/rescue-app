export interface OperationalKanbanColumnDef {
  id: string;
  title: string;
  /** Hex color for column top border and dropdown leading dot. */
  accentColor: string;
}

export const OPERATIONAL_KANBAN_COLUMNS: OperationalKanbanColumnDef[] = [
  { id: 'requested', title: 'Solicitado', accentColor: '#6366f1' },
  { id: 'active-unquoted', title: 'Activo sin cotizar', accentColor: '#0ea5e9' },
  { id: 'pending-authorization', title: 'Pendiente de autorizar', accentColor: '#8b5cf6' },
  { id: 'awaiting-advance', title: 'Esperando anticipo', accentColor: '#f59e0b' },
  { id: 'in-progress', title: 'En proceso', accentColor: '#10b981' },
  { id: 'closed-unpaid', title: 'Cerrado no pagado', accentColor: '#f97316' },
  { id: 'closed', title: 'Cerrado', accentColor: '#14b8a6' },
  { id: 'warranty-pending', title: 'Garantía pendiente', accentColor: '#ec4899' },
  { id: 'cancelled', title: 'Cancelado', accentColor: '#f43f5e' },
];
