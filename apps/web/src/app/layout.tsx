import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import "../index.css";
import { DemoToolbar } from "@/components/demo-toolbar";
import Header from "@/components/header";
import Providers from "@/components/providers";
import PwaRegistration from "@/components/pwa-registration";

const lineSeedSans = localFont({
	src: [
		{
			path: "./fonts/LINESeedSansTH_W_Th.woff2",
			weight: "100",
			style: "normal",
		},
		{
			path: "./fonts/LINESeedSansTH_W_Rg.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/LINESeedSansTH_W_Bd.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "./fonts/LINESeedSansTH_W_XBd.woff2",
			weight: "800",
			style: "normal",
		},
		{
			path: "./fonts/LINESeedSansTH_W_He.woff2",
			weight: "900",
			style: "normal",
		},
	],
	variable: "--font-line-seed-sans",
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Smile Craft Dental Clinic | จองคิวนัดหมายออนไลน์",
	description:
		"ระบบจองคิวนัดหมายออนไลน์ คลินิกทันตกรรมสไมล์คราฟต์ เปิดบริการ 10:00 - 20:00 น. ทุกวัน",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="th"
			className={`${lineSeedSans.variable} ${geistMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex min-h-screen flex-col font-sans antialiased">
				<PwaRegistration />

				<Providers>
					<div className="flex min-h-screen flex-col">
						<DemoToolbar />
						<Header />
						<main className="flex-1">{children}</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
