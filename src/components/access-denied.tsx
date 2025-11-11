import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { IconShieldX } from '@tabler/icons-react';

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export function AccessDenied({
  title = 'Access Denied',
  description = "You don't have permission to access this page."
}: AccessDeniedProps) {
  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconShieldX className="w-5 h-5 text-red-600" />
          <CardTitle className="text-red-600">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

