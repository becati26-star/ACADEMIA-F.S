/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CLUB_INFO } from '../data/mockData';
import { UserRole } from '../types';
import { ShieldCheck, Printer, RefreshCw, LogOut, User, Lock } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  allRoles: UserRole[];
  onSelectRole: (role: UserRole) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  allRoles,
  onSelectRole,
  onResetData,
  onLogout
}) => {
  const allNavItems = [
    { id: 'dashboard', label: 'Tablero' },
    { id: 'players', label: 'Jugadores' },
    { id: 'mensualidades', label: 'Mensualidades' },
    { id: 'socios', label: 'Socios' },
    { id: 'attendance', label: 'Asistencia DT' },
    { id: 'convocatorias', label: 'Convocatorias' },
    { id: 'treasury', label: 'Tesorería' },
    { id: 'reports', label: 'Reportes Directiva' },
    { id: 'neon', label: 'Neon SQL' }
  ];

  // Strictly filter navigation according to the active role's permissions
  const navItems = allNavItems.filter((item) => {
    if (!activeRole.allowedTabs || activeRole.allowedTabs.length === 0) return true;
    return activeRole.allowedTabs.includes(item.id);
  });

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'entrenador') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (role === 'presidente') return 'bg-white/10 text-white border-amber-400/50';
    return 'bg-amber-400 text-slate-950 border-amber-300';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 text-slate-100 no-print shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element wordmark with official club crest */}
          <div
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
            onClick={() => {
              if (activeRole.allowedTabs?.includes('dashboard')) {
                setActiveTab('dashboard');
              } else if (navItems[0]) {
                setActiveTab(navItems[0].id);
              }
            }}
          >
            <div className="w-11 h-11 rounded-xl bg-[#050507] border border-amber-500/50 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.18)] group-hover:border-amber-400 transition-colors shrink-0">
              <img
                src={CLUB_INFO.crestUrl}
                alt="Escudo Oficial ACADEMIA F.S."
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
                {CLUB_INFO.nombre}
              </span>
              <span className="text-[11px] text-amber-400 font-semibold tracking-wide">
                Fútbol de Salón · Sub-18 / Sub-20 / Primera C
              </span>
            </div>
          </div>

          {/* Zone 2: Filtered navigation links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/40 shadow-[0_0_12px_rgba(212,175,55,0.12)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Active role selector & Quick Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Active role badge & switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900/95 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeStyle(activeRole.role)}`}>
                {activeRole.role === 'entrenador'
                  ? 'DT'
                  : activeRole.role === 'presidente'
                  ? 'Presidente'
                  : 'Admin'}
              </span>

              <select
                value={activeRole.id}
                onChange={(e) => {
                  const found = allRoles.find((r) => r.id === e.target.value);
                  if (found) onSelectRole(found);
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
                aria-label="Cambiar rol activo"
              >
                {allRoles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.username ? `${r.username} · ${r.title}` : `${r.name} (${r.title})`}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              title="Imprimir vista oficial de reporte"
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
              aria-label="Imprimir informe"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onResetData}
              title="Restaurar datos de demostración"
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
              aria-label="Restaurar datos iniciales"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Cerrar Sesión e ir al Login"
              className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 border border-rose-800/70 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
