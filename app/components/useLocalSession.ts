
import { useSession } from "next-auth/react";

/**
 * useLocalSession is a wrapper for next-auth's useSession, for compatibility with existing imports.
 * It returns the same object as useSession().
 */
export function useLocalSession() {
	return useSession();
}

