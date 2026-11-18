import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { Gtm } from "@/components/analytics/Gtm";
import { JsonLd, webApplicationLd } from "@/components/seo/JsonLd";
import { allowIndexing, BRAND_COLOR, getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Payments", template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: "Payments", description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image", title: "Payments", description: SITE_DESCRIPTION },
  robots: allowIndexing
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false },
      },
};

export const viewport: Viewport = { themeColor: BRAND_COLOR };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={webApplicationLd({ url: getSiteUrl(), name: SITE_NAME, description: SITE_DESCRIPTION })} />
        <Gtm />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
