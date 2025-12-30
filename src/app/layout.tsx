import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { DevToolsGuard } from "@/components/shared/DevToolsGuard";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Sistema de Evaluación 2026",
  description: "Plataforma de preparación para exámenes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quiz 2026",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ServiceWorkerRegister />
          <DevToolsGuard>
            {children}
          </DevToolsGuard>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
