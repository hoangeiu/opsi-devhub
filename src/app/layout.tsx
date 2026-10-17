import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import StoreProvider from "@/lib/redux/StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ops Hub | Internal Tools",
  description: "Centralized internal web application for ops and devs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>{children}</StoreProvider>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
