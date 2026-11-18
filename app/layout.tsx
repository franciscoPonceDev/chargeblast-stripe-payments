import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { Gtm } from "@/components/analytics/Gtm";
import { allowIndexing } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Payments",
  robots: allowIndexing
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false },
      },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Gtm />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
