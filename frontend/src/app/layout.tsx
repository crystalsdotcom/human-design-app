import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-jetbrains",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HDOS — Your Personal Operating System",
  description: "Discover who you were designed to be. Personalized Human Design charts with AI-powered guidance, daily transit readings, and relationship compatibility.",
  openGraph: {
    title: "HDOS — Your Personal Operating System",
    description: "Enter your birth details and find out who you were designed to be — in 60 seconds.",
    siteName: "Human Design OS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Playfair Display — loaded via CDN for display/heading font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
