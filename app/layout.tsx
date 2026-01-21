
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Isekai Gate",
  description: "A fantasy social RPG platform. Level up, quest, and connect!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-yellow-100 min-h-screen font-sans text-white">
        <nav className="flex items-center justify-between px-8 py-4 bg-black/60 shadow-lg border-b-2 border-yellow-400">
          <Link href="/" className="text-2xl font-extrabold text-yellow-300 tracking-wider">
            Isekai Gate
          </Link>
          <div className="flex gap-6 text-lg">
            <Link href="/quests">Quests</Link>
            <Link href="/party">Party</Link>
            <Link href="/battle">Battle</Link>
            <Link href="/leaderboards">Leaderboards</Link>
            <Link href="/profile">Profile</Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto py-8 px-4">{children}</main>
      </body>
    </html>
  );
}
