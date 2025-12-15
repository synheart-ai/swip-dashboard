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
      { url: '/logos/swip-fav.png', type: 'image/png' },

      { url: '/logos/swip-fav.png', sizes: 'any' },
      { url: '/logos/swip-fav.png', type: 'image/png' }
    ],
    shortcut: '/logos/swip-fav.png',
    apple: '/logos/swip-fav.png',
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
