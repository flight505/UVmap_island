import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Kitchen Island Stone Visualizer",
  description: "Professional 3D visualization tool for planning stone slab cutting patterns on kitchen islands. Optimize your natural stone layout with high-resolution texture mapping.",
  keywords: ["stone visualizer", "kitchen island", "granite", "marble", "stone fabrication", "3D visualization"],
  authors: [{ name: "Stone Visualizer Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
