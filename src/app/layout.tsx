import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"

import { TRPCReactProvider } from "~/trpc/react";

const title = "Vecta";
const description =
  "Join vecta for remote AI roles with top-tier teams. Build production-grade agents, retrieval, and automation with great pay and flexibility.";
const url = "https://vecta.co";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    type: "website",
    siteName: "vecta",
    images: [
      {
        url: "/og/card-rail.png",
        width: 1200,
        height: 630,
        alt: "vecta remote AI talent showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og/card-rail.png"],
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=*" />
      </head>
      <body>
        <Analytics />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
