/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ACADEMIA F.S. - Sistema Integral de Gestión de Futsal
 * Categorías: Sub-18, Sub-20 y Primera C (con Doble Ficha y Refuerzos Cruzados)
 * Moneda oficial: Bolivianos (Bs)
 */

import React, { useState, useEffect } from 'react';
import { clubStorage } from './services/clubStorage';
import { Player, Socio, MatchRoster, AttendanceRecord, Donation, ClubExpense, AuditLog, Category, UserRole } from './types';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { PlayersView } from './components/PlayersView';
import { MensualidadesView } from './components/MensualidadesView';
import { SociosView } from './components/SociosView';
import { AttendanceView } from './components/AttendanceView';
import { ConvocatoriasView } from './components/ConvocatoriasView';
import { TreasuryView } from './components/TreasuryView';
import { ReportsView } from './components/ReportsView';
import { SecurityAndNeonView } from './components/SecurityAndNeonView';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserRole | null>(() => clubStorage.getCurrentUser());
  const [activeRole, setActiveRole] = useState<UserRole>(() => clubStorage.getActiveUserRole());
  const [allRoles] = useState<UserRole[]>(() => clubStorage.getAllRoles());

  // Default active tab based on allowed tabs
  const [activeTab, setActiveTab] = useState<string>(() => {
    const user = clubStorage.getCurrentUser() || clubStorage.getActiveUserRole();
    return user?.allowedTabs?.[0] || 'dashboard';
  });

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Storage states
  const [players, setPlayers] = useState<Player[]>(() => clubStorage.getPlayers());
  const [socios, setSocios] = useState<Socio[]>(() => clubStorage.getSocios());
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => clubStorage.getAttendances());
  const [rosters, setRosters] = useState<MatchRoster[]>(() => clubStorage.getRosters());
  const [donations, setDonations] = useState<Donation[]>(() => clubStorage.getDonations());
  const [expenses, setExpenses] = useState<ClubExpense[]>(() => clubStorage.getExpenses());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => clubStorage.getAuditLogs());
  const [categories, setCategories] = useState<Category[]>(() => clubStorage.getCategories());

  // Re-sync on storage change
  useEffect(() => {
    const unsubscribe = clubStorage.subscribe(() => {
      setPlayers(clubStorage.getPlayers());
      setSocios(clubStorage.getSocios());
      setAttendances(clubStorage.getAttendances());
      setRosters(clubStorage.getRosters());
      setDonations(clubStorage.getDonations());
      setExpenses(clubStorage.getExpenses());
      setAuditLogs(clubStorage.getAuditLogs());
      setCategories(clubStorage.getCategories());
      setActiveRole(clubStorage.getActiveUserRole());
    });
    return unsubscribe;
  }, []);

  // Ensure activeTab is strictly within the allowed tabs of the active user role
  useEffect(() => {
    if (activeRole.allowedTabs && !activeRole.allowedTabs.includes(activeTab)) {
      setActiveTab(activeRole.allowedTabs[0] || 'dashboard');
    }
  }, [activeRole, activeTab]);

  const financialSummary = clubStorage.getBoardFinancialSummary();

  const handleLogin = (user: UserRole) => {
    clubStorage.setCurrentUser(user);
    setCurrentUser(user);
    setActiveRole(user);
    if (user.allowedTabs && user.allowedTabs.length > 0) {
      setActiveTab(user.allowedTabs[0]);
    }
  };

  const handleLogout = () => {
    clubStorage.logout();
    setCurrentUser(null);
  };

  const handleSelectRole = (role: UserRole) => {
    clubStorage.setCurrentUser(role);
    setCurrentUser(role);
    setActiveRole(role);
    if (role.allowedTabs && !role.allowedTabs.includes(activeTab)) {
      setActiveTab(role.allowedTabs[0]);
    }
  };

  // CSV download helper
  const triggerCSVDownload = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user is not authenticated, render LoginView
  if (!currentUser) {
    return (
      <LoginView
        allRoles={allRoles}
        onLogin={handleLogin}
      />
    );
  }

  // Check if current activeTab is permitted for this role
  const isTabAllowed = !activeRole.allowedTabs || activeRole.allowedTabs.includes(activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Application Bar with role-filtered navigation and Logout button */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        allRoles={allRoles}
        onSelectRole={handleSelectRole}
        onResetData={() => {
          if (confirm('¿Restaurar datos iniciales de ACADEMIA F.S. (Futsal Bolivia)?')) {
            clubStorage.resetToDefault();
          }
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isTabAllowed ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Módulo No Autorizado</h2>
            <p className="text-xs text-slate-400">
              El perfil actual (<strong className="text-amber-400">{activeRole.title}</strong>) no dispone de permisos para acceder a esta sección.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab(activeRole.allowedTabs[0] || 'dashboard')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5"
              >
                Volver a {activeRole.allowedTabs[0]?.toUpperCase() || 'MÓDULO PERMITIDO'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                players={players}
                socios={socios}
                rosters={rosters}
                attendances={attendances}
                financialSummary={financialSummary}
                onNavigate={(tab) => {
                  if (activeRole.allowedTabs?.includes(tab)) {
                    setActiveTab(tab);
                  }
                }}
                onSelectPlayer={(p) => {
                  setSelectedPlayer(p);
                  setActiveTab('players');
                }}
              />
            )}

            {activeTab === 'players' && (
              <PlayersView
                players={players}
                categories={categories}
                selectedPlayer={selectedPlayer}
                onSelectPlayer={(p) => setSelectedPlayer(p)}
                onSavePlayer={(p) => clubStorage.savePlayer(p)}
                onDeletePlayer={(id) => clubStorage.deletePlayer(id)}
                onRecordPayment={(id, mes, monto, metodo) => clubStorage.recordPlayerPayment(id, mes, monto, metodo)}
                onRecordCard={(id, tipo, partido, minuto, motivo) => clubStorage.recordPlayerCard(id, tipo, partido, minuto, motivo)}
                onExportCSV={() => triggerCSVDownload(clubStorage.exportPlayersCSV(), 'jugadores_academia_fs.csv')}
              />
            )}

            {activeTab === 'mensualidades' && (
              <MensualidadesView
                players={players}
                categories={categories}
                onRecordPayment={(id, mes, monto, metodo, fechaPago) => clubStorage.recordPlayerPayment(id, mes, monto, metodo, fechaPago)}
                onSelectPlayer={(p) => {
                  setSelectedPlayer(p);
                  setActiveTab('players');
                }}
              />
            )}

            {activeTab === 'socios' && (
              <SociosView
                socios={socios}
                onSaveSocio={(s) => clubStorage.saveSocio(s)}
                onRecordPayment={(id, mes, monto, metodo) => clubStorage.recordSocioPayment(id, mes, monto, metodo)}
                onExportCSV={() => triggerCSVDownload(clubStorage.exportSociosCSV(), 'socios_academia_fs.csv')}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                players={players}
                categories={categories}
                attendances={attendances}
                onSaveAttendance={(record) => clubStorage.saveAttendance(record)}
              />
            )}

            {activeTab === 'convocatorias' && (
              <ConvocatoriasView
                players={players}
                categories={categories}
                rosters={rosters}
                onSaveRoster={(roster) => clubStorage.saveRoster(roster)}
                onSelectPlayer={(p) => {
                  setSelectedPlayer(p);
                  setActiveTab('players');
                }}
              />
            )}

            {activeTab === 'treasury' && (
              <TreasuryView
                donations={donations}
                expenses={expenses}
                players={players}
                socios={socios}
                financialSummary={financialSummary}
                onAddDonation={(d) => clubStorage.addDonation(d)}
                onAddExpense={(e) => clubStorage.addExpense(e)}
                onExportCSV={() => triggerCSVDownload(clubStorage.exportFinancialLedgerCSV(), 'libro_contable_academia_fs.csv')}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                players={players}
                socios={socios}
                rosters={rosters}
                attendances={attendances}
                donations={donations}
                expenses={expenses}
                financialSummary={financialSummary}
                onExportPlayersCSV={() => triggerCSVDownload(clubStorage.exportPlayersCSV(), 'reporte_jugadores_futsal.csv')}
                onExportSociosCSV={() => triggerCSVDownload(clubStorage.exportSociosCSV(), 'reporte_socios_futsal.csv')}
                onExportFinanceCSV={() => triggerCSVDownload(clubStorage.exportFinancialLedgerCSV(), 'reporte_financiero_junta_bs.csv')}
              />
            )}

            {activeTab === 'neon' && (
              <SecurityAndNeonView
                auditLogs={auditLogs}
                activeRole={activeRole}
                allRoles={allRoles}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ACADEMIA F.S. · Sesión activa: <strong className="text-slate-300">{activeRole.name}</strong> ({activeRole.title})
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Control de Acceso RBAC</span>
            <span>·</span>
            <span>ISO 27001 Audit Trail</span>
            <span>·</span>
            <span>Neon PostgreSQL Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
