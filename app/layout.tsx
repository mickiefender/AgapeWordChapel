import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agapewordchapel.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Agape Word Chapel International",
    template: "%s | Agape Word Chapel International",
  },
  description:
    "Agape Word Chapel International is a Christ-centred church family where you can encounter God, grow in His Word and discover your purpose. Join us for worship, sermons, ministries and community.",
  keywords: [
    "Agape Word Chapel International",
    "church",
    "worship",
    "sermons",
    "ministries",
    "church events",
    "Christian community",
    "bible teaching",
    "grow in faith",
    "church in Ghana",
  ],
  authors: [{ name: "Agape Word Chapel International" }],
  creator: "Agape Word Chapel International",
  publisher: "Agape Word Chapel International",
  applicationName: "Agape Word Chapel International",
  category: "church",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    siteName: "Agape Word Chapel International",
    title: "Agape Word Chapel International",
    description:
      "A Christ-centred church family where you can encounter God, grow in His Word and discover your purpose.",
    images: [
      {
        url: "/Agape%20logo.png",
        width: 512,
        height: 512,
        alt: "Agape Word Chapel International",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agape Word Chapel International",
    description:
      "A Christ-centred church family where you can encounter God, grow in His Word and discover your purpose.",
    images: ["/Agape%20logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Agape Word Chapel",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/Agape%20logo.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
