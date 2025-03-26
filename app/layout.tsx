import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemedToastContainer } from '@/components/ThemedToastContainer';
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL("https://devsnippets-eta.vercel.app"),
  title: {
    default: 'DevSnippets - Code snippet manager for developers',
    template: '%s | DevSnippets'
  },
  description: 'A powerful code snippet manager for developers. Save, organize, and quickly find code snippets for your development projects.',
  keywords: ['code snippets', 'developer tool', 'code manager', 'programming', 'developer productivity', 'code organization'],
  authors: [{ name: 'Stefan Vet' }],
  creator: 'Stefan Vet',
  publisher: 'Stefan Vet',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  
  // Open Graph metadata
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devsnippets-eta.vercel.app',
    siteName: 'DevSnippets',
    title: 'DevSnippets - code snippet manager for developers',
    description: 'Save, organize and quickly find code snippets for your development projects',
    images: [
      {
        url: `https://devsnippets-eta.vercel.app/DevSnippets.png`,
        width: 1200,
        height: 630,
        alt: 'DevSnippets - Code snippet manager',
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'DevSnippets - Code Snippet Manager for Developers',
    description: 'Save, organize and quickly find code snippets for your development projects',
    images: [`https://devsnippets-eta.vercel.app/DevSnippets.png`],
    creator: '@devsnippets',
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/logo.svg' },
    ],
    apple: [
      { url: '/logo.svg' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo.svg',
        color: '#5bbad5',
      },
    ],
  },
  
  // Web manifest and theme colors
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  viewport: 'width=device-width, initial-scale=1',
  
  // Verification for search console
  verification: {
    google: 'google-site-verification-code-here',
    // yandex: 'yandex-verification-code',
    // bing: 'bing-verification-code',
  },
  
  // App specific metadata
  applicationName: 'DevSnippets',
  appleWebApp: {
    capable: true,
    title: 'DevSnippets',
    statusBarStyle: 'black-translucent',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ThemedToastContainer />
          <Analytics/>
        </ThemeProvider>
      </body>
    </html>
  );
}