import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-700 mb-2">PostFlow AI</h1>
          <p className="text-gray-500">Create your free account</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
