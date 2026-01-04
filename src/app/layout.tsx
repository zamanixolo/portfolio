import type { Metadata } from "next";
import { Scope_One } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AdminProvider from "@/components/AdminProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const scopeOne = Scope_One({
  weight: "400",
  variable: "--font-scope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Senior Designer Portfolio",
  description: "Identity, Editorial, and Digital Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${scopeOne.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <AdminProvider>
            <Navigation />
            <main className="min-h-screen flex flex-col">
              {children}
            </main>
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
