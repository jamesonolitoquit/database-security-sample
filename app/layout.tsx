
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ClientProviders } from "./components/ClientProviders";
import { UserStatus } from "./components/UserStatus";
import { NotificationBell } from "./components/notifications/NotificationBell";
import { GameMenu } from "./components/GameMenu";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-yellow-100 min-h-screen font-sans text-white">
        <ClientProviders>
          <nav className="flex items-center gap-4 py-4 bg-black/60 shadow-lg border-b-2 border-yellow-400">
            <Link href="/" className="text-2xl font-extrabold text-yellow-300 tracking-wider ml-28">
              Isekai Gate
            </Link>
            <div className="flex-1 flex justify-end items-center gap-4 mr-8">
              <NotificationBell />
              <UserStatus />
            </div>
          </nav>
          <div className="flex">
            <GameMenu />
            <main className="flex-1 max-w-4xl mx-auto py-8 px-4">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
