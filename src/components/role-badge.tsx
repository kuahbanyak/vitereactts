import { Badge } from '@/components/ui/badge';
import { IconShield } from '@tabler/icons-react';

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'mechanic':
        return 'default';
      case 'customer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getRoleBadgeVariant(role)}>
      {role.toLowerCase() === 'admin' && <IconShield className="w-3 h-3 mr-1" />}
      {role}
    </Badge>
  );
}

