import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface LoginCardProps {
  title?: string;
  description?: string;
  onSubmit?: (e: React.FormEvent) => void;
  signUpLink?: string;
  showGoogleLogin?: boolean;
  additionalActions?: ReactNode;
}

export function LoginCard({
  title = 'Login to your account',
  description = 'Enter your email below to login to your account',
  onSubmit,
  signUpLink = '/register',
  showGoogleLogin = true,
  additionalActions,
}: LoginCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="flex items-center justify-end">
          <Button asChild variant="link">
            <Link to={signUpLink}>Sign Up</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        {showGoogleLogin && (
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        )}
        {additionalActions}
      </CardFooter>
    </Card>
  );
}

