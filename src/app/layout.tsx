import type { Metadata } from "next";
import { Scope_One } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AdminProvider from "@/components/AdminProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import SmoothScrolling from "@/components/SmoothScrolling";
import { LayoutGroup } from "framer-motion";
import HealthTrigger from "@/components/HealthTrigger";

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
        <SmoothScrolling>
          <ThemeProvider>
            <AdminProvider>
              <Navigation />
              <HealthTrigger />
              <main className="min-h-screen flex flex-col">
                <LayoutGroup>
                  {children}
                </LayoutGroup>
              </main>
            </AdminProvider>
          </ThemeProvider>
        </SmoothScrolling>
      </body>
    </html>
  );
}
