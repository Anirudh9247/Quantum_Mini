'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLearningLevel } from '@/context/LearningLevelContext';
import { Zap, Cpu, BarChart2, Database, BookOpen } from 'lucide-react';
import { LearningLevelSelector } from '@/components/education/LearningLevelSelector';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { openConcept } = useLearningLevel();

  const navLinks = [
    { href: '/dashboard', label: 'Control Center', icon: Zap },
    { href: '/studio', label: 'Quantum Studio', icon: Cpu },
    { href: '/compare', label: 'Quantum vs Classical', icon: BarChart2 },
    { href: '/history', label: 'Experiment Logs', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 group-hover:border-cyan-400 transition-colors subtle-glow">
            <Zap className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              QRNG <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Interactive</span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Level Selector & Glossary */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex">
            <LearningLevelSelector />
          </div>

          <button
            onClick={() => openConcept('qubit')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
            title="Quantum Concept Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
