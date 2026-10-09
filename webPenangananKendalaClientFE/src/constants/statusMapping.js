export const STATUS_ORDER = [
  'pending_confirmation',
  'open',
  'escalated_to_pm',
  'waiting_programmer',
  'waiting_pm_approval',
  'assigned',
  'in_progress',
  'pending_review',
  'escalated_to_owner',
  'resolved',
  'closed',
  'rejected',
];

export const STATUS_LABEL = {
  pending_confirmation: 'Pending Confirmation',
  open: 'Open',
  escalated_to_pm: 'Escalated to PM',
  waiting_programmer: 'Waiting Programmer',
  waiting_pm_approval: 'Waiting PM Approval',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending_review: 'Pending Review',
  escalated_to_owner: 'Escalated to Owner',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected',
};

export const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    border: 'border-l-4 border-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  medium: {
    label: 'Med',
    border: 'border-l-4 border-orange-500',
    badge: 'bg-orange-100 text-orange-700',
  },
  low: {
    label: 'Low',
    border: 'border-l-4 border-green-500',
    badge: 'bg-green-100 text-green-700',
  },
  belum_ditentukan: {
    label: '—',
    border: 'border-l-4 border-gray-300',
    badge: 'bg-gray-100 text-gray-600',
  },
};

export const DRAG_ALLOWED_ROLES = ['owner', 'admin'];
