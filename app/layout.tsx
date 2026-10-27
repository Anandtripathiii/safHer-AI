import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-serif" });

export const metadata: Metadata = {
  title: "SafeHer AI",
  description: "A calm safety companion for every journey. Hackathon demo — all data is synthetic.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F2F9FF" };

// Applies the saved theme before paint so dark mode doesn't flash.
const themeScript = `try{var s=JSON.parse(localStorage.getItem('safeher')||'{}').state;if(s&&s.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
