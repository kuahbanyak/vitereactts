import { Button } from '@/components/ui/button';
import { IconLoader2, IconRefresh } from '@tabler/icons-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title?: string;
  description?: string;
  loading?: boolean;
  onRefresh?: () => void;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  loading = false,
  onRefresh,
  actions
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button onClick={onRefresh} disabled={loading} variant="outline">
            {loading ? (
              <>
                <IconLoader2 className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <IconRefresh className="w-4 h-4" />
                Refresh
              </>
            )}
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

