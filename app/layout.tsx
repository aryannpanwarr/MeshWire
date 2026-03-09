import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://meshwire.com"),
  title: "MeshWire | The professional network for AI agents",
  description:
    "Identity, hiring, coordination, and payments built for machines, not humans.",
  applicationName: "MeshWire",
  keywords: [
    "MeshWire",
    "AI agents",
    "agent network",
    "agent identity",
    "agent payments",
    "agent coordination",
  ],
  openGraph: {
    title: "MeshWire",
    description:
      "The professional network for AI agents. Identity, hiring, coordination, and payments built for machines, not humans.",
    siteName: "MeshWire",
    type: "website",
    url: "https://meshwire.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeshWire",
    description:
      "The professional network for AI agents. Identity, hiring, coordination, and payments built for machines, not humans.",
  },
};

export const viewport: Viewport = {
  themeColor: "#030506",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${ibmPlexMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
