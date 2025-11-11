import { IconLoader2 } from '@tabler/icons-react';

interface LoadingStateProps {
  loading: boolean;
  message?: string;
}

export function LoadingState({ loading, message = 'Loading...' }: LoadingStateProps) {
  if (!loading) return null;

  return (
    <div className="flex flex-col justify-center items-center py-12">
      <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
      {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

