import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import { defaultMetadata } from "../lib/seo/metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
});

export const metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
