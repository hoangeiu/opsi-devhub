import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { TopHeader } from "@/components/top-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
          <StoreProvider>
            <SidebarProvider>
              <AppSidebar />

              <SidebarInset className="overflow-hidden bg-background">
                <TopHeader />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </StoreProvider>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
