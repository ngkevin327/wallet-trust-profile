import { Providers } from "./providers";
import { defaultMetadata } from "../lib/seo/metadata";
import "./globals.css";

export const metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
