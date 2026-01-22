"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { memo } from "react";

function UserStatusComponent() {
  const { data: session, status } = useSession();

  // Remove the automatic update call that was causing infinite re-renders
  // The session will update automatically when authentication state changes

  if (status === "loading") {
    return <div className="text-sm text-gray-300">Loading...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-green-400">
          Welcome, {session.user.name || session.user.email}! (Role: {session.user.role || 'user'})
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Link href="/auth" className="text-sm hover:text-yellow-300">
        Login
      </Link>
      <Link href="/auth/register" className="text-sm hover:text-yellow-300">
        Register
      </Link>
    </div>
  );
}

export const UserStatus = memo(UserStatusComponent);