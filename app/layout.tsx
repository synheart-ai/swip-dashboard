/**
 * Root Layout
 *
 * Global layout with sidebar navigation and header
 */

import "./globals.css";
import { LayoutWrapper } from "../components/LayoutWrapper";

export const metadata = {
  title: "SWIP Dashboard - Wellness Transparency",
  description: "Real-time rankings and analytics for wellness applications",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className="min-h-screen bg-gray-950 text-white antialiased"
        suppressHydrationWarning={true}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
