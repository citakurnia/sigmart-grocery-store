import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import ReusableOrGlobalComponent from '@/components/feature-or-module/ReusableOrGlobalComponent';
import { Toaster } from '@/components/ui/toaster';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import StoreProvider from '@/components/providers/StoreProvider';
import FirstLoad from '@/components/FirstLoad';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s - Sigmart',
    default: 'Sigmart',
  },
  description: 'Belanja terus tanpa putus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <StoreProvider>
            {/* <ExampleProvider> */}
            {/* <ReusableOrGlobalComponent /> */}
            <FirstLoad>{children}</FirstLoad>
            {/* </ExampleProvider> */}
          </StoreProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
