/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Socio, MatchRoster, AttendanceRecord, FinancialSummary, Donation, ClubExpense } from '../types';
import { CLUB_INFO } from '../data/mockData';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  Award,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

interface ReportsViewProps {
  players: Player[];
  socios: Socio[];
  rosters: MatchRoster[];
  attendances: AttendanceRecord[];
  donations: Donation[];
  expenses: ClubExpense[];
  financialSummary: FinancialSummary;
  onExportPlayersCSV: () => void;
  onExportSociosCSV: () => void;
  onExportFinanceCSV: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  players,
  socios,
  rosters,
  attendances,
  donations,
  expenses,
  financialSummary,
  onExportPlayersCSV,
  onExportSociosCSV,
  onExportFinanceCSV
}) => {
  const [selectedReportType, setSelectedReportType] = useState<
    'general' | 'asistencia' | 'convocatorias' | 'stats_jugadores' | 'financiero_junta'
  >('financiero_junta');

  const [reportPeriod, setReportPeriod] = useState('Noviembre 2026');

  // Attendance ranking
  const sortedByAttendance = [...players].sort((a, b) => b.porcentajeAsistencia - a.porcentajeAsistencia);
  const topAttendance = sortedByAttendance.slice(0, 5);

  // Performance ranking
  const sortedByRating = [...players].sort((a, b) => b.stats.ratingGeneral - a.stats.ratingGeneral);
  const topRating = sortedByRating.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header & Export Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
              Junta Directiva &amp; Comité Ejecutivo
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Generación Automática de Reportes Oficiales</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Informes de Primera Etapa (Deportivos &amp; Financieros)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Periodo:</span>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="Noviembre 2026" className="bg-slate-900">Noviembre 2026</option>
              <option value="Octubre 2026" className="bg-slate-900">Octubre 2026</option>
              <option value="Septiembre 2026" className="bg-slate-900">Septiembre 2026</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Informe Oficial
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs overflow-x-auto scrollbar-none no-print">
        {[
          { id: 'financiero_junta', label: '1. Financiero Mensual Junta Directiva' },
          { id: 'general', label: '2. Reporte General del Club' },
          { id: 'asistencia', label: '3. Reporte de Asistencias & Puntualidad' },
          { id: 'convocatorias', label: '4. Reporte de Convocatorias' },
          { id: 'stats_jugadores', label: '5. Estadísticas de Jugadores' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedReportType(t.id as any)}
            className={`pb-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              selectedReportType === t.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CSV Export Quick Bar */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-amber-400" />
          Exportación de planillas compatibles con Excel / Neon Tech:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportFinanceCSV}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Libro Contable CSV
          </button>
          <button
            onClick={onExportPlayersCSV}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Jugadores CSV
          </button>
          <button
            onClick={onExportSociosCSV}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Padrón Socios CSV
          </button>
        </div>
      </div>

      {/* OFFICIAL PRINTABLE REPORT CONTAINER (Styled with Club Letterhead) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-200 shadow-xl print:bg-white print:text-black print:border-none print:p-0">
        {/* Official Header with Club Crest & Institutional Seals */}
        <div className="flex items-start justify-between border-b-2 border-amber-500/80 pb-5 print:border-black">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-[#050507] border-2 border-amber-500 p-1 flex items-center justify-center shrink-0 print:w-16 print:h-16 print:bg-black">
              <img
                src={CLUB_INFO.crestUrl}
                alt="Escudo"
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white print:text-black">
                {CLUB_INFO.nombre}
              </h1>
              <p className="text-xs text-amber-400 print:text-black font-semibold">
                {CLUB_INFO.afiliacion} · CUIT: {CLUB_INFO.cuit}
              </p>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                {CLUB_INFO.sede} · Fundado en {CLUB_INFO.fundacion}
              </p>
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono font-bold uppercase print:text-black print:border-black">
              Documento Oficial
            </span>
            <div className="text-slate-400 print:text-gray-700 font-mono mt-1">
              Periodo: {reportPeriod}
            </div>
            <div className="text-slate-400 print:text-gray-700 font-mono text-[11px]">
              Emisión: {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        {/* 1. REPORTE FINANCIERO MENSUAL JUNTA DIRECTIVA */}
        {selectedReportType === 'financiero_junta' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400 print:text-black" />
                Informe Económico y Estado de Resultados para la Junta Directiva
              </h3>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Dictamen contable mensual con rendición de cuentas de compras, gastos y donaciones recibidas.
              </p>
            </div>

            {/* Financial Summary Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300">
                <span className="text-xs text-slate-400 print:text-gray-600">Total Ingresos Operativos</span>
                <div className="text-2xl font-bold text-emerald-400 print:text-black font-mono mt-1">
                  Bs {financialSummary.ingresosTotales.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300">
                <span className="text-xs text-slate-400 print:text-gray-600">Total Gastos y Compras</span>
                <div className="text-2xl font-bold text-rose-400 print:text-black font-mono mt-1">
                  Bs {financialSummary.egresosTotales.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300">
                <span className="text-xs text-slate-400 print:text-gray-600">Superávit Neto del Periodo</span>
                <div className="text-2xl font-bold text-emerald-400 print:text-black font-mono mt-1">
                  +Bs {financialSummary.superavitDeficit.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Income breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white print:text-black">
                1. Estructura de Ingresos (en Bolivianos)
              </h4>
              <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
                <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black font-semibold">
                  <tr>
                    <th className="p-2.5">Concepto</th>
                    <th className="p-2.5">Detalle Institucional</th>
                    <th className="p-2.5 text-right">Monto (Bs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-200 print:text-black">Cuotas Deportivas de Jugadores</td>
                    <td className="p-2.5 text-slate-400 print:text-gray-700">Sub-18, Sub-20 y Primera C Futsal</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-400 print:text-black">
                      Bs {financialSummary.ingresosCuotasJugadores.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-200 print:text-black">Cuotas Sociales de Miembros</td>
                    <td className="p-2.5 text-slate-400 print:text-gray-700">Socios Plenos, Familiares y Fundadores</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-400 print:text-black">
                      Bs {financialSummary.ingresosCuotasSocios.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-200 print:text-black">Donaciones Altruistas Registradas</td>
                    <td className="p-2.5 text-slate-400 print:text-gray-700">Fondo de balones y equipamiento de futsal</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-400 print:text-black">
                      Bs {financialSummary.ingresosDonaciones.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Purchases & Expenses Itemized */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white print:text-black">
                2. Rendición de Compras &amp; Gastos del Periodo
              </h4>
              <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
                <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black font-semibold">
                  <tr>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Rubro</th>
                    <th className="p-2.5">Concepto</th>
                    <th className="p-2.5">Proveedor</th>
                    <th className="p-2.5 text-center">Factura</th>
                    <th className="p-2.5 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="p-2.5 font-mono text-slate-400 print:text-gray-700">{exp.fecha}</td>
                      <td className="p-2.5 text-slate-200 print:text-black font-medium">{exp.categoria}</td>
                      <td className="p-2.5 text-slate-300 print:text-black">{exp.concepto}</td>
                      <td className="p-2.5 text-slate-400 print:text-gray-700">{exp.proveedor}</td>
                      <td className="p-2.5 text-center font-mono text-slate-400 print:text-gray-700 text-[11px]">{exp.facturaNumero}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-rose-400 print:text-black">
                        -Bs {exp.monto.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. REPORTE GENERAL DEL CLUB */}
        {selectedReportType === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400 print:text-black" />
                Reporte General del Club: Padrón y Categorías Federadas
              </h3>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Resumen ejecutivo de divisiones, plantilla total y padrón social.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300 text-center">
                <span className="text-xs text-slate-400 print:text-gray-600">Jugadores Federados</span>
                <div className="text-2xl font-bold text-white print:text-black font-mono mt-1">
                  {players.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300 text-center">
                <span className="text-xs text-slate-400 print:text-gray-600">Socios Empadronados</span>
                <div className="text-2xl font-bold text-white print:text-black font-mono mt-1">
                  {socios.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300 text-center">
                <span className="text-xs text-slate-400 print:text-gray-600">Fichas Médicas Registradas</span>
                <div className="text-2xl font-bold text-emerald-400 print:text-black font-mono mt-1">
                  {((players.filter((p) => p.medico.grupoSanguineo && p.medico.pesoKg && p.medico.alturaCm).length / (players.length || 1)) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300 text-center">
                <span className="text-xs text-slate-400 print:text-gray-600">Tasa de Cobranza</span>
                <div className="text-2xl font-bold text-amber-400 print:text-black font-mono mt-1">
                  {financialSummary.tasaCobranzaPorcentaje}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white print:text-black">
                Desglose por Categoría Deportiva
              </h4>
              <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
                <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black font-semibold">
                  <tr>
                    <th className="p-2.5">Categoría</th>
                    <th className="p-2.5">Director Técnico</th>
                    <th className="p-2.5">Rango de Edad</th>
                    <th className="p-2.5 text-center">Jugadores</th>
                    <th className="p-2.5 text-center">Asistencia Prom.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {[
                    { name: 'Sub-18 Futsal', dt: 'Prof. Diego Vera', edad: '16 a 18 años (Doble Ficha)', id: 'sub-18' },
                    { name: 'Sub-20 Futsal', dt: 'Prof. Diego Vera', edad: '18 a 20 años (Doble Ficha)', id: 'sub-20' },
                    { name: 'Primera C Futsal', dt: 'DT Diego Vera & Marcelo Rossi', edad: 'División de Ascenso Oficial', id: 'primera-c' }
                  ].map((cat) => {
                    const pl = players.filter((p) => p.categoriaId === cat.id);
                    const avg = pl.length > 0
                      ? (pl.reduce((a, b) => a + b.porcentajeAsistencia, 0) / pl.length).toFixed(1)
                      : '0';

                    return (
                      <tr key={cat.id}>
                        <td className="p-2.5 font-bold text-white print:text-black">{cat.name}</td>
                        <td className="p-2.5 text-slate-300 print:text-black">{cat.dt}</td>
                        <td className="p-2.5 text-slate-400 print:text-gray-700">{cat.edad}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-amber-400 print:text-black">{pl.length}</td>
                        <td className="p-2.5 text-center font-mono text-emerald-400 print:text-black">{avg}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. REPORTE DE ASISTENCIAS */}
        {selectedReportType === 'asistencia' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-400 print:text-black" />
                Reporte Oficial de Asistencia y Puntualidad a Entrenamientos y Partidos
              </h3>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Auditoría del cuerpo técnico sobre presentismo, minutos de retraso y disciplina horaria.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white print:text-black">
                Ranking de Regularidad y Puntualidad
              </h4>
              <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
                <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black font-semibold">
                  <tr>
                    <th className="p-2.5">Dorsal &amp; Jugador</th>
                    <th className="p-2.5">Categoría</th>
                    <th className="p-2.5 text-center">Sesiones Totales</th>
                    <th className="p-2.5 text-center">Asistencias</th>
                    <th className="p-2.5 text-center">Llegadas Tarde</th>
                    <th className="p-2.5 text-center">% Asistencia</th>
                    <th className="p-2.5 text-center">% Puntualidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {sortedByAttendance.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2.5 font-bold text-white print:text-black">
                        #{p.dorsal} {p.nombre} {p.apellidos}
                      </td>
                      <td className="p-2.5 text-slate-300 print:text-black">{p.equipoNombre}</td>
                      <td className="p-2.5 text-center font-mono text-slate-400 print:text-black">{p.totalSesiones}</td>
                      <td className="p-2.5 text-center font-mono text-slate-200 print:text-black">{p.asistencias}</td>
                      <td className="p-2.5 text-center font-mono text-amber-400 print:text-black">{p.llegadasTarde}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-400 print:text-black">
                        {p.porcentajeAsistencia}%
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-amber-300 print:text-black">
                        {p.porcentajePuntualidad}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. REPORTE DE CONVOCATORIAS */}
        {selectedReportType === 'convocatorias' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400 print:text-black" />
                Historial de Convocatorias Oficiales para Partidos
              </h3>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Registro de alineaciones, esquemas tácticos y convocados según algoritmo de rendimiento.
              </p>
            </div>

            {rosters.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:border-gray-300 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 print:border-gray-300 pb-2">
                  <div>
                    <span className="text-sm font-bold text-white print:text-black">
                      vs. {r.rival} ({r.equipoNombre})
                    </span>
                    <div className="text-xs text-slate-400 print:text-gray-600">
                      Fecha: {r.fecha} a las {r.hora} · Sede: {r.lugar}
                    </div>
                  </div>
                  <span className="font-mono text-amber-400 print:text-black font-bold">
                    Esquema {r.formacion}
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div className="font-semibold text-slate-300 print:text-black">Titulares Seleccionados:</div>
                  <div className="flex flex-wrap gap-2">
                    {r.titulares.map((tit) => {
                      const pl = players.find((p) => p.id === tit.jugadorId);
                      if (!pl) return null;
                      return (
                        <span key={tit.jugadorId} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] print:border-gray-400 print:text-black font-mono">
                          #{pl.dorsal} {pl.nombre} {pl.apellidos.split(' ')[0]} ({tit.posicionCancha})
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-slate-400 print:text-gray-700 italic border-t border-slate-800/80 pt-2">
                  Instrucción táctica: "{r.notasTacticas}"
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. REPORTE DE ESTADÍSTICAS DE JUGADORES */}
        {selectedReportType === 'stats_jugadores' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400 print:text-black" />
                Matriz de Rendimiento Técnico, Físico, Táctico y Sanciones
              </h3>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Puntuaciones normalizadas 0-100 para evaluación de evolución deportiva.
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
              <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black font-semibold">
                <tr>
                  <th className="p-2.5">Dorsal / Jugador</th>
                  <th className="p-2.5">Posición</th>
                  <th className="p-2.5 text-center">Físico</th>
                  <th className="p-2.5 text-center">Técnico</th>
                  <th className="p-2.5 text-center">Táctico</th>
                  <th className="p-2.5 text-center">Rating General</th>
                  <th className="p-2.5 text-center">Tarjetas</th>
                  <th className="p-2.5 text-center">Ficha Médica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {players.map((p) => {
                  const fis = Math.round((p.stats.velocidad + p.stats.resistencia + p.stats.fuerza + p.stats.agilidad) / 4);
                  const tec = Math.round((p.stats.controlBalon + p.stats.precisionPase + p.stats.potenciaTiro + p.stats.regate) / 4);
                  const tac = Math.round((p.stats.visionJuego + p.stats.posicionamiento + p.stats.tomaDecisiones + p.stats.disciplinaTactica) / 4);

                  return (
                    <tr key={p.id}>
                      <td className="p-2.5 font-bold text-white print:text-black">
                        #{p.dorsal} {p.nombre} {p.apellidos}
                      </td>
                      <td className="p-2.5 text-slate-300 print:text-black">{p.posicion}</td>
                      <td className="p-2.5 text-center font-mono text-white print:text-black">{fis}</td>
                      <td className="p-2.5 text-center font-mono text-emerald-400 print:text-black">{tec}</td>
                      <td className="p-2.5 text-center font-mono text-amber-400 print:text-black">{tac}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-amber-400 print:text-black">
                        {p.stats.ratingGeneral} pts
                      </td>
                      <td className="p-2.5 text-center font-mono text-[11px]">
                        {p.tarjetasAmarillas}🟨 {p.tarjetasRojas}🟥
                      </td>
                      <td className="p-2.5 text-center font-mono text-xs">
                        <span className="text-amber-300 font-semibold">{p.medico.grupoSanguineo}</span>{' '}
                        <span className="text-slate-400 print:text-black">({p.medico.pesoKg}kg)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signatures Strip for Board of Directors */}
        <div className="pt-10 border-t border-slate-800 print:border-black grid grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-1">
            <div className="w-36 border-b border-slate-500 print:border-black mx-auto mb-1 h-12 flex items-end justify-center font-script italic text-slate-400 print:text-black">
              C. Mendoza Rivas
            </div>
            <div className="font-bold text-white print:text-black">{CLUB_INFO.presidente}</div>
            <div className="text-[11px] text-slate-400 print:text-gray-600">Presidente de la Junta Directiva</div>
          </div>

          <div className="space-y-1">
            <div className="w-36 border-b border-slate-500 print:border-black mx-auto mb-1 h-12 flex items-end justify-center font-script italic text-slate-400 print:text-black">
              V. Santillán
            </div>
            <div className="font-bold text-white print:text-black">{CLUB_INFO.directoraFinanciera}</div>
            <div className="text-[11px] text-slate-400 print:text-gray-600">Tesorera General &amp; Finanzas</div>
          </div>

          <div className="space-y-1">
            <div className="w-36 border-b border-slate-500 print:border-black mx-auto mb-1 h-12 flex items-end justify-center font-script italic text-slate-400 print:text-black">
              D. Vera DT
            </div>
            <div className="font-bold text-white print:text-black">{CLUB_INFO.directorTecnicoPrincipal}</div>
            <div className="text-[11px] text-slate-400 print:text-gray-600">Director Técnico &amp; Cantera</div>
          </div>
        </div>
      </div>
    </div>
  );
};
