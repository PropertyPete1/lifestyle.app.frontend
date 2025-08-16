import './globals.css';

export const metadata = {
  title: 'Lifestyle Design Social',
  description: 'Social media automation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-dark">
      <body>
        {children}
      </body>
    </html>
  );
}
