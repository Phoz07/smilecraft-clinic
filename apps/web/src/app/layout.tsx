import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import { DemoToolbar } from "@/components/demo-toolbar";
import Header from "@/components/header";
import Providers from "@/components/providers";
import PwaRegistration from "@/components/pwa-registration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smile Craft Dental Clinic | จองคิวนัดหมายออนไลน์",
  description: "ระบบจองคิวนัดหมายออนไลน์ คลินิกทันตกรรมสไมล์คราฟต์ เปิดบริการ 10:00 - 20:00 น. ทุกวัน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <PwaRegistration />

        <Providers>
          <div className="flex flex-col min-h-screen">
            <DemoToolbar />
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
