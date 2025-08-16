'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
        <Link href="/autopilot" className={`nav-link ${isActive('/autopilot') ? 'active' : ''}`}>AutoPilot</Link>
        <a href="#" className="nav-link" onClick={(e)=>{e.preventDefault(); console.log('Analytics clicked')}}>Analytics</a>
      </div>
      <div className="navbar-right">
        <a href="#" className="nav-link" onClick={(e)=>{e.preventDefault(); console.log('Upload clicked')}}>Upload</a>
        <a href="#" className="nav-link" onClick={(e)=>{e.preventDefault(); console.log('Manual Post clicked')}}>Manual Post</a>
        <Link href="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>Settings</Link>
      </div>
    </nav>
  );
}


