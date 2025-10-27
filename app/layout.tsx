import type { Metadata } from "next";
import { AuthProvider } from '@/contexts/AuthContext';
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
    variable: '--font-montserrat-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Virgo Daily Standup",
  description: "Submit you daily standup update here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${montserrat.className} ${geistMono.className} antialiased`}
      >
          <AuthProvider>
              {children}
          </AuthProvider>
      </body>
    </html>
  );
}
