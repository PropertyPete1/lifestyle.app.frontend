import './globals.css';
import Particles from '@/components/Particles';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Lifestyle App - Dashboard',
  description: 'Modern dashboard UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-dark">
      <body>
        <div id="particles" className="bg-particles" />
        <Particles />
        <Navbar />
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
