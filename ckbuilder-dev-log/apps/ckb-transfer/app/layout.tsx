import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "../context/provider"; // Adjust path if using src/

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CKB Transfer",
  description: "Seamless Asset Management on Nervos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#141414] text-white min-h-screen font-sans antialiased selection:bg-[#EEFF54] selection:text-black`}
      >
        {/* Wrap children with the new Providers component */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}