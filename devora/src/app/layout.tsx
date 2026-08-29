import type { Metadata } from "next";
import { Press_Start_2P, Space_Mono, Unbounded } from "next/font/google";
import "@/ui/globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const unbounded = Unbounded({
  weight: ["300", "400", "600", "800"],
  subsets: ["latin"],
  variable: "--font-display",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Devora — Connect. Collaborate. Create.",
  description: "UofM Dearborn CECS Networking Hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceMono.variable} ${unbounded.variable} ${pressStart.variable} font-mono antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
