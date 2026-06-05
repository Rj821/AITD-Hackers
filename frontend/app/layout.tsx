import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memoria AI",
  description: "Organizational memory system built with Hindsight and AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
