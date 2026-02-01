import { Badge } from '@/components/ui/badge';
import { IconShield } from '@tabler/icons-react';
import type { Role } from '@/types/user.types';

interface RoleBadgeProps {
  // Can accept either a single role string or the roles array from backend
  role?: string;
  roles?: Role[];
}

export function RoleBadge({ role, roles }: RoleBadgeProps) {
  // Get the role name - prefer roles array if available
  const getRoleName = (): string => {
    if (roles && roles.length > 0) {
      return roles[0].display_name || roles[0].name;
    }
    return role || 'customer';
  };

  const roleName = getRoleName();

  const getRoleBadgeVariant = (roleName: string) => {
    const normalizedRole = roleName.toLowerCase();
    switch (normalizedRole) {
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

  const isAdmin = roleName.toLowerCase() === 'admin';

  return (
    <Badge variant={getRoleBadgeVariant(roleName)}>
      {isAdmin && <IconShield className="w-3 h-3 mr-1" />}
      {roleName}
    </Badge>
  );
}

// Component to show all roles as badges
export function RoleBadges({ roles }: { roles?: Role[] }) {
  if (!roles || roles.length === 0) {
    return <RoleBadge role="customer" />;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <RoleBadge key={role.id} role={role.display_name || role.name} />
      ))}
    </div>
  );
}

