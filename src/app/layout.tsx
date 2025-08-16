import './globals.css';

export const metadata = {
  title: 'Lifestyle App - Dashboard',
  description: 'Modern dashboard UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-dark">
      <body>{children}</body>
    </html>
  );
}
