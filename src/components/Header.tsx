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
    if (role === 'presidente') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element wordmark with official club crest */}
          <div
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => {
              if (activeRole.allowedTabs?.includes('dashboard')) {
                setActiveTab('dashboard');
              } else if (navItems[0]) {
                setActiveTab(navItems[0].id);
              }
            }}
          >
            <img
              src={CLUB_INFO.crestUrl}
              alt="Escudo Oficial ACADEMIA F.S."
              className="w-10 h-10 rounded-full border border-amber-500/40 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                {CLUB_INFO.nombre}
              </span>
              <span className="text-[11px] text-amber-400/90 font-medium tracking-wide">
                Futsal Bolivia · Sub-18 / Sub-20 / Primera C
              </span>
            </div>
          </div>

          {/* Zone 2: Filtered navigation links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 font-semibold shadow-inner border border-slate-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
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
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
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
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              aria-label="Imprimir informe"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onResetData}
              title="Restaurar datos de demostración"
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              aria-label="Restaurar datos iniciales"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Cerrar Sesión e ir al Login"
              className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'bg-slate-800 text-amber-400 font-semibold'
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
