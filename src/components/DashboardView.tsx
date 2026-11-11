/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, Socio, MatchRoster, FinancialSummary, AttendanceRecord } from '../types';
import { CLUB_INFO } from '../data/mockData';
import {
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  HeartPulse,
  ClipboardList,
  ShieldAlert
} from 'lucide-react';

interface DashboardViewProps {
  players: Player[];
  socios: Socio[];
  rosters: MatchRoster[];
  attendances: AttendanceRecord[];
  financialSummary: FinancialSummary;
  onNavigate: (tab: string) => void;
  onSelectPlayer: (player: Player) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  players,
  socios,
  rosters,
  financialSummary,
  onNavigate,
  onSelectPlayer
}) => {
  // Compute key stats
  const totalPlayers = players.length;
  const avgAttendance = players.length > 0
    ? (players.reduce((acc, p) => acc + p.porcentajeAsistencia, 0) / players.length).toFixed(1)
    : '0';
  const avgPunctuality = players.length > 0
    ? (players.reduce((acc, p) => acc + p.porcentajePuntualidad, 0) / players.length).toFixed(1)
    : '0';

  const medicalAlerts = players.filter(
    (p) => !p.medico.grupoSanguineo || !p.medico.pesoKg || !p.medico.alturaCm
  );

  const disciplinaryAlerts = players.filter(
    (p) => p.partidosSuspensionPendientes > 0 || p.tarjetasAmarillas >= 3
  );

  const nextRoster = rosters[0];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Club Identity Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
              Panel de Control Deportivo &amp; Institucional
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Temporada Oficial 2026</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {CLUB_INFO.nombre}
          </h1>
          <p className="text-xs text-slate-400">
            {CLUB_INFO.lema} · {CLUB_INFO.sede} · Afiliación Oficial {CLUB_INFO.afiliacion}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Tomar Asistencia DT
          </button>
          <button
            onClick={() => onNavigate('convocatorias')}
            className="px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5" />
            Armar Convocatoria
          </button>
          <button
            onClick={() => onNavigate('treasury')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Registrar Tesorería
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Jugadores */}
        <div
          onClick={() => onNavigate('players')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Plantel de Jugadores</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {totalPlayers}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>4 Categorías activas</span>
            <span className="text-emerald-400 flex items-center font-medium">
              100% Federados
            </span>
          </div>
        </div>

        {/* Card 2: Socios & Cobranza */}
        <div
          onClick={() => onNavigate('socios')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Padrón de Socios</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {socios.length}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Cobranza al día</span>
            <span className="text-emerald-400 font-medium tabular-nums">
              {financialSummary.tasaCobranzaPorcentaje}%
            </span>
          </div>
        </div>

        {/* Card 3: Asistencia a Entrenamientos */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Asistencia Promedio</span>
            <ClipboardList className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {avgAttendance}%
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Puntualidad en cancha</span>
            <span className="text-sky-400 font-medium tabular-nums">
              {avgPunctuality}%
            </span>
          </div>
        </div>

        {/* Card 4: Balance Tesorería */}
        <div
          onClick={() => onNavigate('treasury')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Superávit / Caja Mes</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums">
            Bs {financialSummary.superavitDeficit.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Ingresos Bs {financialSummary.ingresosTotales.toLocaleString()}</span>
            <span className="text-rose-400 font-medium">
              -Bs {financialSummary.egresosTotales.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Match Spotlight + Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Match & Convocatoria Card (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Próximo Partido Oficial de Futsal &amp; Quinteto Titular
              </h2>
              <p className="text-xs text-slate-400">
                Torneo Oficial de Ascenso · Primera C Futsal
              </p>
            </div>
            <button
              onClick={() => onNavigate('convocatorias')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Ver Pizarra Táctica de Futsal
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {nextRoster ? (
            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                    {nextRoster.equipoNombre}
                  </span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    vs. {nextRoster.rival}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span>{nextRoster.fecha} a las {nextRoster.hora} hs</span>
                    <span>·</span>
                    <span>{nextRoster.lugar}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs font-mono">
                    {nextRoster.formacion}
                  </div>
                  <span className="px-2 py-0.5 text-xs rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-medium">
                    {nextRoster.estado.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Quick Starters Preview */}
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-2">
                  Quinteto Titular en Cancha (5 Jugadores + Doble Ficha Sub-18/Sub-20):
                </span>
                <div className="flex flex-wrap gap-2">
                  {nextRoster.titulares.map((tit) => {
                    const pl = players.find((p) => p.id === tit.jugadorId);
                    if (!pl) return null;
                    return (
                      <span
                        key={tit.jugadorId}
                        onClick={() => onSelectPlayer(pl)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-200 hover:border-amber-500/60 cursor-pointer"
                      >
                        <span className="font-mono text-amber-400 font-bold text-[11px]">
                          #{pl.dorsal}
                        </span>
                        <span>{pl.nombre} {pl.apellidos.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({tit.posicionCancha})
                        </span>
                        {pl.dobleFichaPrimeraC && pl.categoriaId !== 'primera-c' && (
                          <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                            {pl.categoriaId.toUpperCase()}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded border border-slate-800/80">
                "{nextRoster.notasTacticas}"
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No hay convocatorias activas.</p>
          )}

          {/* 3 Categories distribution summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { cat: 'Sub-18 Futsal', id: 'sub-18', desc: 'Cantera con doble ficha' },
              { cat: 'Sub-20 Futsal', id: 'sub-20', desc: 'Pre-competitiva & Primera' },
              { cat: 'Primera C Futsal', id: 'primera-c', desc: 'Equipo Mayor de Ascenso' }
            ].map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/70 text-center">
                <div className="text-xs font-semibold text-slate-300 truncate">{c.cat}</div>
                <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                  {players.filter((p) => p.categoriaId === c.id).length} jugadores
                </div>
                <div className="text-[10px] text-amber-400/80 mt-1">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational & Medical Alerts Column (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Alertas Prioritarias
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {medicalAlerts.length + disciplinaryAlerts.length} pendientes
            </span>
          </div>

          <div className="space-y-3">
            {/* Medical Alerts */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5" /> Departamento Médico
              </span>
              {medicalAlerts.length === 0 ? (
                <p className="text-xs text-slate-500">Todo el plantel cuenta con apto médico vigente.</p>
              ) : (
                medicalAlerts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlayer(p)}
                    className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60 hover:border-rose-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-200">
                        #{p.dorsal} {p.nombre} {p.apellidos}
                      </span>
                      <span className="text-[10px] text-rose-300 font-mono">
                        {p.equipoNombre}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-300/90 mt-1">
                      Ficha médica incompleta: registrar grupo sanguíneo, peso o estatura.
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Disciplinary Alerts */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Tribunal de Disciplina
              </span>
              {disciplinaryAlerts.length === 0 ? (
                <p className="text-xs text-slate-500">Sin sanciones ni suspensiones activas.</p>
              ) : (
                disciplinaryAlerts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlayer(p)}
                    className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/60 hover:border-amber-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-200">
                        #{p.dorsal} {p.nombre} {p.apellidos}
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono">
                        {p.estadoDisciplinario.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-300/90 mt-1">
                      {p.partidosSuspensionPendientes > 0
                        ? `Sanción: ${p.partidosSuspensionPendientes} fecha(s) pendiente por tarjeta roja`
                        : `${p.tarjetasAmarillas} amarillas acumuladas`}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Financial Dues Alert */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Morosidad Cuotas
                </span>
                <span className="text-amber-400 font-mono font-semibold">
                  {financialSummary.sociosMorososCount + financialSummary.jugadoresMorososCount} miembros
                </span>
              </div>
              <button
                onClick={() => onNavigate('treasury')}
                className="w-full text-center py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Auditar Estado de Cobranzas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
