import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border bg-card">
        <p>Academic Project: LSB Image Steganography with Text-to-Speech</p>
        <p className="mt-1">Built with React, TypeScript, Canvas API & Web Speech API</p>
      </footer>
    </div>
  );
}
