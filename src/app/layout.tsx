import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/queryProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'CXF Workspace | Support & Transcripts',
  description: 'CXF Portal for managing call transcriptions and support tickets',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get('theme')?.value;
  const isDarkTheme = theme === 'dark';

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${isDarkTheme ? ' dark' : ''}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme') || document.cookie.match(/(?:^|; )theme=([^;]*)/)?.[1];
                var isDark = theme === 'dark' || ((theme === 'system' || !theme) && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', isDark);
                document.cookie = 'theme=' + (theme || 'system') + '; path=/; max-age=31536000; samesite=lax';
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full font-sans text-zinc-900 dark:text-zinc-50">
        <QueryProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ className: 'dark:bg-[#0e141b] dark:text-white dark:border dark:border-zinc-800' }} />
        </QueryProvider>
      </body>
    </html>
  );
}
