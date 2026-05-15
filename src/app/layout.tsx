import type { Metadata } from "next";
import "./globals.css";
import {
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Instrument_Serif,
} from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "AI Triage Assistant",
  description: "Browser-based AI healthcare triage assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        geist.variable,
        geistMono.variable,
        bricolage.variable,
        instrumentSerif.variable
      )}
    >
      <body>{children}</body>
    </html>
  );
}
