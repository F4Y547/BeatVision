import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { SWRegistration } from "@/components/sw-registration";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "BeatVision - Advanced Music Visualizer",
  description:
    "Transform your music and artwork into synchronized, real-time visual experiences.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BeatVision",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://beatvision.app",
    siteName: "BeatVision",
    title: "BeatVision - Advanced Music Visualizer",
    description:
      "Transform your music and artwork into synchronized, real-time visual experiences.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BeatVision",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeatVision - Advanced Music Visualizer",
    description:
      "Transform your music and artwork into synchronized, real-time visual experiences.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-surface-0 text-white antialiased safe-area-inset">
        <ToastProvider>
          {children}
        </ToastProvider>
        <SWRegistration />
      </body>
    </html>
  );
}
