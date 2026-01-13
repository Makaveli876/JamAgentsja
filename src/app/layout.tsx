import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Ensures background covers the notch
  interactiveWidget: "resizes-content", // Prevents keyboard from breaking layout
};

export const metadata: Metadata = {
  title: "Jam Agents | Premium WhatsApp Assets",
  description: "Cyber-Island Luxury marketing asset generator for Jamaica.",
  manifest: "/manifest.json", // Prep for PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-yard-cyan/30`}
      >
        {children}
      </body>
    </html>
  );
}
