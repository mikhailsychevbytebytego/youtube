import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CatConfetti } from "@/components/cat-confetti";
import { getTheme } from "@/lib/get-theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MewTube",
  description: "A toy YouTube reimplementation.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <CatConfetti />
      </body>
    </html>
  );
}
