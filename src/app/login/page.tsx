import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg border-2 border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PrepWise</h1>
          <p className="text-gray-600 mb-6">Your smart kitchen companion</p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Sign in to your account
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            Don&apos;t have access yet? Email me at{' '}
            <a href="mailto:adamgiesey@gmail.com" className="text-blue-600 hover:underline">
              adamgiesey@gmail.com
            </a>{' '}
            to request a login.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            I can&apos;t let just anyone use up all my tokens.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 