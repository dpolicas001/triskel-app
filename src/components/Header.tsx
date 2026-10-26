import React from 'react';
import { Calendar, Trophy, Database, Activity, ShieldCheck, Flame } from 'lucide-react';

interface HeaderProps {
  activeTab: 'clases' | 'prs' | 'calculator' | 'sql';
  setActiveTab: (tab: 'clases' | 'prs' | 'calculator' | 'sql') => void;
  dbStatus?: { isPostgresConnected: boolean; mode: string };
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, dbStatus }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#27272A]/80 shadow-2xl">
      {/* Top micro bar for announcements / status */}
      <div className="bg-[#141417] border-b border-[#27272A]/50 py-1 px-4 text-xs font-semibold tracking-wider text-zinc-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#84B026] animate-pulse"></span>
            <span className="text-zinc-300 font-bold uppercase tracking-widest text-[11px]">
              BOX OFICIAL CROSSFIT &amp; HYROX
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="hidden sm:inline text-zinc-400 text-[11px]">
              HORARIOS DEL DÍA DISPONIBLES
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#1F1F23] px-2.5 py-0.5 rounded-full border border-zinc-800 text-[10px]">
              <Database className="w-3 h-3 text-[#84B026]" />
              <span className="text-zinc-300 font-medium">
                {dbStatus?.isPostgresConnected ? 'PostgreSQL Supabase (Conectado)' : 'Almacenamiento Local Activo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Brand title */}
          <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => setActiveTab('clases')}>
            <div className="relative">
              <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-[#6E9320] via-[#84B026] to-[#A3D933] shadow-lg shadow-[#84B026]/20 flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/aistudio/Logo_Triskel_6fa6e464.jpeg"
                  alt="Triskel Hybrid Training Club Logo"
                  className="w-full h-full object-cover rounded-full bg-black scale-105"
                  onError={(e) => {
                    // Fallback visual if image fails to render
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#84B026] text-black font-black text-[9px] px-1.5 py-0.2 rounded-full border border-black uppercase tracking-tighter">
                PRO
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white font-heading leading-tight drop-shadow-sm">
                  TRISKEL
                </h1>
                <span className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#84B026] font-heading leading-tight">
                  HYBRID
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-heading">
                TRAINING CLUB <span className="text-[#84B026] font-normal">•</span> CROSSFIT &amp; HYROX
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('clases')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-heading font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'clases'
                  ? 'bg-[#84B026] text-black font-black shadow-lg shadow-[#84B026]/30'
                  : 'bg-[#18181B] text-zinc-300 hover:text-white hover:bg-[#1F1F23] border border-zinc-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Reservas Clases</span>
            </button>

            <button
              onClick={() => setActiveTab('prs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-heading font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'prs'
                  ? 'bg-[#84B026] text-black font-black shadow-lg shadow-[#84B026]/30'
                  : 'bg-[#18181B] text-zinc-300 hover:text-white hover:bg-[#1F1F23] border border-zinc-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Tablero de PRs</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-heading font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-[#84B026] text-black font-black shadow-lg shadow-[#84B026]/30'
                  : 'bg-[#18181B] text-zinc-300 hover:text-white hover:bg-[#1F1F23] border border-zinc-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Calculadora 1RM</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-heading font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'sql'
                  ? 'bg-[#84B026] text-black font-black shadow-lg shadow-[#84B026]/30'
                  : 'bg-[#18181B] text-zinc-300 hover:text-white hover:bg-[#1F1F23] border border-zinc-800'
              }`}
            >
              <Database className="w-4 h-4 text-zinc-400" />
              <span>Supabase SQL</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
