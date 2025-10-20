import "./globals.css";
import Header from "../components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body 
        className="min-h-screen bg-synheart-dark text-white font-synheart"
        suppressHydrationWarning={true}
      >
        {/* Background gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-synheart-pink/10 via-transparent to-synheart-blue/10 pointer-events-none" />
        
        <Header />
        
        <main className="relative mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
        
        <footer className="relative border-t border-synheart-light-gray/50 py-10 text-center text-xs text-gray-400 bg-black/30">
          <div className="mx-auto max-w-6xl px-4 space-y-2">
            <p className="text-sm text-gray-300">MIT © Synheart AI</p>
            <p className="text-synheart-pink/70">Built with ❤️ for wellness transparency</p>
          </div>
        </footer>
      </body>
    </html>
  );
}