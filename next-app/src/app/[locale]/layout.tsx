import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FutureMemory Cart",
  description: "Premium Fashion E-commerce",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="font-bold text-xl text-brand-800">FutureMemory Cart</div>
                <div className="hidden md:flex flex-1 max-w-md mx-4">
                  <input type="text" placeholder="Search..." className="w-full px-4 py-2 rounded-xl border border-border focus:outline-none focus:border-brand-500" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">EN | தமிழ் | हिन्दी</div>
                  <div>🛒 Cart</div>
                  <div>❤️ Wishlist</div>
                  <button className="px-4 py-2 bg-brand-800 text-white rounded-xl hover:bg-brand-900 transition-colors">Login</button>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center gap-8 h-10 bg-brand-50 text-brand-900 text-sm font-medium border-b border-border">
                <span>Men</span>
                <span>Women</span>
                <span>Kids</span>
                <span>Footwear</span>
                <span>Accessories</span>
              </div>
            </header>
            
            <main className="flex-1">
              {children}
            </main>
            
            <footer className="border-t border-border bg-white mt-12 py-8">
              <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                <p>© 2024 FutureMemory Cart. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
