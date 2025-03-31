import { GoogleAnalytics } from "@next/third-parties/google";
import { Source_Sans_3, Manrope } from "next/font/google";
import { siteDetails } from "@/data/siteDetails";
import { Providers } from "./providers";

import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased`}
      >
        {siteDetails.googleAnalyticsId && (
          <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />
        )}
        <main>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
