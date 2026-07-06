"use client";

interface BadgeProps {
  status: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
}

const statusConfig = {
  PENDING: { label: '待接单', cls: 'badge-pending' },
  PREPARING: { label: '制作中', cls: 'badge-preparing' },
  COMPLETED: { label: '已完成', cls: 'badge-completed' },
  CANCELLED: { label: '已取消', cls: 'badge-cancelled' },
} as const;

export function StatusBadge({ status }: BadgeProps) {
  const { label, cls } = statusConfig[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
