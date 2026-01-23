import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions as any) as Session | null;

  return Response.json({
    session,
    hasSession: !!session,
    user: session?.user,
  });
}