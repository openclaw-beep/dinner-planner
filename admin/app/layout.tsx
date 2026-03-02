import type { Metadata } from 'next';

import './globals.scss';
import '../styles/main.scss';

export const metadata: Metadata = {
  title: 'Restaurant Admin Dashboard',
  description: 'Admin dashboard for restaurant booking management'
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
