import './globals.css';
import Particles from '@/components/Particles';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'Lifestyle App - Dashboard',
  description: 'Modern dashboard UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-dark">
      <head>
        <link
          rel="icon"
          href={'data:image/svg+xml,' + encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
               <rect width="64" height="64" rx="12" fill="#111"/>
               <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="34" fill="#fff">L</text>
             </svg>`
          )}
        />
      </head>
      <body>
        <div id="particles" className="bg-particles" />
        <Particles />
        <ToastProvider>
          <Navbar />
          <div className="container">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
