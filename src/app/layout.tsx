import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Outpost',
  description: 'Manage your Outpost user profile',
};

// This is the root layout. For path-based i18n, it must contain
// the <html> and <body> tags. The locale-specific layout at
// /app/[locale]/layout.tsx will be rendered within this one.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
        <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var fontSize = localStorage.getItem('font-size') || '12';
                    document.documentElement.style.fontSize = fontSize + 'pt';
                  } catch (e) {}
                })();
              `,
            }}
          />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
