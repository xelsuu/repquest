import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import AccentPalette from "@/components/AccentPalette";

export const metadata: Metadata = {
  title: "RepQuest",
  description: "Gamified Workout Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <ScrollToTop />
        <AccentPalette />
        {children}
      </body>
    </html>
  );
}
