
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ClientProviders } from "./components/ClientProviders";
import { ThemeProvider } from "./components/ThemeProvider";

import { DayNightOverlay } from "./components/DayNightOverlay";
import { UserStatus } from "./components/UserStatus";
import { NotificationBell } from "./components/notifications/NotificationBell";
import { FloatingGameMenu } from "./components/FloatingGameMenu";

import { LocalTestPanelClient } from "./components/LocalTestPanelClient";
import { Suspense } from "react";
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
        <ThemeProvider>
          <ClientProviders>
            <div id="fantasy-bg-root" className="fantasy-bg" />

            <DayNightOverlay />
            <FloatingGameMenu />
            <main className="max-w-4xl mx-auto py-8 px-4 relative z-10">{children}</main>
            {/* Local test panel only on localhost/dev */}
            <Suspense fallback={null}>
              <LocalTestPanelClient />
            </Suspense>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
