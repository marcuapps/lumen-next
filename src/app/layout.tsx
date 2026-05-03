import * as React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QueryProvider } from "@/components/providers/QueryProvider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumen — Airport demand intelligence",
  description:
    "Turn saved airport flight snapshots into actionable pickup-demand insights for mobility operators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <React.Suspense fallback={<div className="h-[73px] border-b" />}>
            <DashboardHeader />
          </React.Suspense>
          {children}
          <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
            Lumen · Snapshot analytics, not a live tracker · Mock data
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
