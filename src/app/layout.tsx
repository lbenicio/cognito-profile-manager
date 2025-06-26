import React from 'react';

// This root layout is required by Next.js and is used to wrap the
// internationalized layout. It should not contain <html> or <body> tags
// as those are handled by `src/app/[locale]/layout.tsx`.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
