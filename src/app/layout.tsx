import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from 'react-hot-toast';
import { AppAuthProvider } from "@/components/auth/authProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CXF Workspace | Support & Transcripts",
  description: "CXF Portal for managing call transcriptions and support tickets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <AppAuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ className: 'dark:bg-zinc-900 dark:text-white dark:border dark:border-zinc-800' }} />
        </AppAuthProvider>
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          `}
        </Script>
      </body>
    </html>
  );
}
