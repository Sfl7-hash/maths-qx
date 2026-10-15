import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MATHESIS — AI-Powered Holographic Mathematics",
  description: "Next-generation AI mathematics platform for all educational levels. Algebra, calculus, geometry, statistics, and more — visualized and explained step by step.",
  keywords: ["mathematics", "AI tutor", "calculus", "algebra", "geometry", "holographic", "interactive math"],
  authors: [{ name: "MATHESIS Platform" }],
  openGraph: {
    title: "MATHESIS",
    description: "AI-Powered Holographic Mathematics Platform",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020817",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-holo-dark">
        {children}
      </body>
    </html>
  );
}
