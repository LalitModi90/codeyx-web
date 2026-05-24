import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SignupSSOCallbackPage() {
  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-6 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
        <p className="text-sm font-bold text-gray-400">Completing authentication...</p>
      </div>
      <div className="hidden">
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
