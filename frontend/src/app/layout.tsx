import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'STK Menu Tree System',
  description:
    'Hierarchical Menu Tree Management System with unlimited depth and CRUD operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${notoSansKR.variable}`}
    >
      <body className="font-sans min-h-screen bg-white">{children}</body>
    </html>
  );
}
