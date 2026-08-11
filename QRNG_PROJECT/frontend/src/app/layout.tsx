import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { InteractiveParticleBackground } from '@/components/background/InteractiveParticleBackground';
import { LearningLevelProvider } from '@/context/LearningLevelContext';
import { QuantumGlossaryPanel } from '@/components/QuantumGlossaryPanel';
import { Navbar } from '@/components/ui/Navbar';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interactive QRNG & Quantum Computing Learning Platform",
  description: "Explore quantum random number generation, superposition, measurement, and state evolution with interactive visualizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-slate-200 bg-slate-950 flex flex-col`}
      >
        <LearningLevelProvider>
          <InteractiveParticleBackground />
          <Navbar />
          <QuantumGlossaryPanel />
          <Toaster
            position="bottom-right"
            toastOptions={{ 
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #06b6d4',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
              } 
            }}
          />
          <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </LearningLevelProvider>
      </body>
    </html>
  );
}
