import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 rounded-lg p-8 shadow-md border border-purple-300 mt-12">
      <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Sign In to Isekai Gate</h2>
      {/* NextAuth.js sign-in form will go here */}
      <div className="flex flex-col gap-4 mt-6">
        <button className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded shadow">Sign in with Email</button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow">Sign in with Google</button>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-6 text-center">
        By signing in, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
