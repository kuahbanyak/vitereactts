import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
}

export function EmptyState({
  icon,
  title = 'No data found',
  description
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      {icon && <div className="w-12 h-12 mx-auto mb-4 opacity-50">{icon}</div>}
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm mt-2">{description}</p>}
    </div>
  );
}

