import { Button } from '@/components/ui/button'

export default function LoginForm() {
  return (
    <Button asChild className="w-full">
      <a href="/auth/login" className="button login">
        Log In
      </a>
    </Button>
  );
} 