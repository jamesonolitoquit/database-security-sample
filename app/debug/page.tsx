"use client";

import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      <div className="bg-gray-800 p-4 rounded">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Session:</strong></p>
        <pre className="text-sm text-green-400 mt-2">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}