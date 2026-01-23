
import { Geist, Geist_Mono } from "next/font/google";
import { ClientProviders } from "./components/ClientProviders";
import { ThemeProvider } from "./components/ThemeProvider";

import { DayNightOverlay } from "./components/DayNightOverlay";
import { FloatingGameMenu } from "./components/FloatingGameMenu";
import { DemoLoginButton } from "./components/DemoLoginButton";

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
    <html lang="en" suppressHydrationWarning className="bg-background">
      <body className="min-h-screen font-sans bg-background text-primary">
        <ThemeProvider>
          <ClientProviders>
            <div id="fantasy-bg-root" className="fantasy-bg" />

            <DayNightOverlay />
            <FloatingGameMenu />
            <DemoLoginButton />
            <main className="max-w-4xl mx-auto py-8 px-4 relative z-10 bg-surface border border-color rounded-xl shadow-lg">{children}</main>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
