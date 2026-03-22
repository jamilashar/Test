import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Glimpse — Connect Through Instagram',
  description: 'The dating app where Instagram tells your story',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen max-w-md mx-auto bg-white relative overflow-hidden" style={{ height: '100dvh' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
