import type { Metadata } from "next";
import "./globals.css";
import "../styles/main.scss";

export const metadata: Metadata = {
  title: "Dinner Planner",
  description: "Find and book your next dinner in minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased app-shell">{children}</body>
    </html>
  );
}
