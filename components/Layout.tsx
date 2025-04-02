"use client"
// import { Link, useLocation } from 'react-router-dom';
import Link from 'next/link';

import { Award, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/70 border-b border-border shadow-sm w-full">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="font-semibold text-lg">
              Shop Management
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 justify-center">
            <Link href="/">
              <button className='px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200'>
                Contests
              </button>
            </Link>
            <Link href="/videos">
              <button className='px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200'>
                Videos
              </button>
            </Link>
          </nav>
          
          <div className="flex items-center justify-end">
            
            <div className="block md:hidden ml-2">
              <button  onClick={toggleMobileMenu} aria-label="Toggle menu">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="container py-3 flex flex-col space-y-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <button 
                 
                  className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 w-full justify-start"
                >
                  Contests
                </button>
              </Link>
              <Link href="/videos" onClick={() => setMobileMenuOpen(false)}>
                <button 
                
                  className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 w-full justify-start"
                >
                  Videos
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 container py-6 md:py-8">
        {children}
      </main>
      
      <footer className="border-t border-border py-6 bg-muted/50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
             
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Medical Analyzer 
          </p>
        </div>
      </footer>
    </div>
  );
}
