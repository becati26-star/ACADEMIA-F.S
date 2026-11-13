/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Player, Socio, Donation, ClubExpense } from '../types';
import { TrendingUp, ArrowUpRight, BarChart3, Activity } from 'lucide-react';

interface FinancialTrendChartProps {
  players: Player[];
  socios: Socio[];
  donations: Donation[];
  expenses: ClubExpense[];
  onNavigateToTreasury: () => void;
}

interface MonthlyPoint {
  key: string; // YYYY-MM
  mes: string;
  mesCorto: string;
  ingresosCuotas: number;
  ingresosDonaciones: number;
  ingresos: number;
  gastos: number;
  balance: number;
}

const SIX_MONTH_WINDOW = [
  { key: '2026-06', mes: 'Junio 2026', mesCorto: 'Jun', baseCuotas: 2450, baseDonaciones: 2500, baseGastos: 3820 },
  { key: '2026-07', mes: 'Julio 2026', mesCorto: 'Jul', baseCuotas: 2620, baseDonaciones: 2700, baseGastos: 4150 },
  { key: '2026-08', mes: 'Agosto 2026', mesCorto: 'Ago', baseCuotas: 2740, baseDonaciones: 3100, baseGastos: 4600 },
  { key: '2026-09', mes: 'Septiembre 2026', mesCorto: 'Sep', baseCuotas: 2810, baseDonaciones: 2800, baseGastos: 4290 },
  { key: '2026-10', mes: 'Octubre 2026', mesCorto: 'Oct', baseCuotas: 2680, baseDonaciones: 0, baseGastos: 0 },
  { key: '2026-11', mes: 'Noviembre 2026', mesCorto: 'Nov', baseCuotas: 0, baseDonaciones: 0, baseGastos: 0 }
];

const formatBs = (value: number) => `Bs ${value.toLocaleString('es-BO')}`;

export const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({
  players,
  socios,
  donations,
  expenses,
  onNavigateToTreasury
}) => {
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');

  const chartData: MonthlyPoint[] = useMemo(() => {
    return SIX_MONTH_WINDOW.map((m) => {
      const playerFees = players.reduce((acc, p) => {
        const sum = p.historialPagos
          .filter((pay) => pay.fecha?.startsWith(m.key))
          .reduce((s, pay) => s + pay.monto, 0);
        return acc + sum;
      }, 0);

      const socioFees = socios.reduce((acc, s) => {
        const sum = s.historialAportaciones
          .filter((pay) => pay.fecha?.startsWith(m.key))
          .reduce((sumAcc, pay) => sumAcc + pay.monto, 0);
        return acc + sum;
      }, 0);

      const monthDonations = donations
        .filter((d) => d.fecha?.startsWith(m.key))
        .reduce((acc, d) => acc + d.monto, 0);

      const monthExpenses = expenses
        .filter((e) => e.fecha?.startsWith(m.key))
        .reduce((acc, e) => acc + e.monto, 0);

      const ingresosCuotas = m.baseCuotas + playerFees + socioFees;
      const ingresosDonaciones = m.baseDonaciones + monthDonations;
      const ingresos = ingresosCuotas + ingresosDonaciones;
      const gastos = m.baseGastos + monthExpenses;

      return {
        key: m.key,
        mes: m.mes,
        mesCorto: m.mesCorto,
        ingresosCuotas,
        ingresosDonaciones,
        ingresos,
        gastos,
        balance: ingresos - gastos
      };
    });
  }, [players, socios, donations, expenses]);

  const totals = useMemo(() => {
    const totalIngresos = chartData.reduce((acc, d) => acc + d.ingresos, 0);
    const totalGastos = chartData.reduce((acc, d) => acc + d.gastos, 0);
    const balanceNeto = totalIngresos - totalGastos;
    const latest = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    const deltaPct =
      prev && prev.ingresos > 0
        ? (((latest.ingresos - prev.ingresos) / prev.ingresos) * 100).toFixed(1)
        : '0.0';

    return { totalIngresos, totalGastos, balanceNeto, deltaPct };
  }, [chartData]);

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-amber-400">Balance Semestral</span>
            <span aria-hidden="true">·</span>
            <span>Junio – Noviembre 2026</span>
            <span aria-hidden="true">·</span>
            <span>Moneda: Bolivianos (Bs)</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400 shrink-0" />
            Tendencia de Ingresos Mensuales vs. Gastos de la Academia
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Mode Segmented Switch */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setChartMode('area')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                chartMode === 'area'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Curva
            </button>
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                chartMode === 'bar'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Barras
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateToTreasury}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Ver Tesorería
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="py-2 px-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-slate-400 block">Ingresos Acumulados (6M)</span>
            <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
              {formatBs(totals.totalIngresos)}
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            {Number(totals.deltaPct) >= 0 ? `+${totals.deltaPct}%` : `${totals.deltaPct}%`} vs mes ant.
          </span>
        </div>

        <div className="py-2 px-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-slate-400 block">Gastos Operativos (6M)</span>
            <span className="text-lg font-bold text-rose-400 font-mono tabular-nums">
              {formatBs(totals.totalGastos)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Arbitraje, cancha y equipo</span>
        </div>

        <div className="py-2 px-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-slate-400 block">Superávit Neto (6M)</span>
            <span
              className={`text-lg font-bold font-mono tabular-nums ${
                totals.balanceNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totals.balanceNeto >= 0 ? '+' : ''}
              {formatBs(totals.balanceNeto)}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-300">
            {totals.totalIngresos > 0
              ? `${((totals.balanceNeto / totals.totalIngresos) * 100).toFixed(1)}% margen`
              : '0%'}
          </span>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="academiaIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="academiaExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FB7185" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FB7185" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#201F23" vertical={false} />
              <XAxis
                dataKey="mesCorto"
                stroke="#A19D93"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#33302A' }}
              />
              <YAxis
                stroke="#A19D93"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `Bs ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const point = payload[0].payload as MonthlyPoint;
                  return (
                    <div className="bg-[#060608] border border-amber-500/40 rounded-lg p-3 shadow-xl text-xs space-y-1.5 min-w-[200px]">
                      <div className="font-bold text-white border-b border-slate-800 pb-1">
                        {point.mes}
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-amber-300">Ingresos totales:</span>
                        <span className="font-mono font-bold text-amber-400 tabular-nums">
                          {formatBs(point.ingresos)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-[11px] text-slate-400 pl-2">
                        <span>Cuotas (Jug. / Soc.):</span>
                        <span className="font-mono tabular-nums">{formatBs(point.ingresosCuotas)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-[11px] text-slate-400 pl-2">
                        <span>Donaciones / Aportes:</span>
                        <span className="font-mono tabular-nums">{formatBs(point.ingresosDonaciones)}</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-slate-800/70">
                        <span className="text-rose-300">Gastos mensuales:</span>
                        <span className="font-mono font-bold text-rose-400 tabular-nums">
                          {formatBs(point.gastos)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                        <span className="text-slate-300 font-semibold">Saldo del mes:</span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            point.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {point.balance >= 0 ? '+' : ''}
                          {formatBs(point.balance)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                name="Ingresos (Bs)"
                stroke="#D4AF37"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#academiaIncomeGrad)"
                activeDot={{ r: 5, fill: '#E5C158', stroke: '#060608', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="gastos"
                name="Gastos (Bs)"
                stroke="#FB7185"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#academiaExpenseGrad)"
                activeDot={{ r: 5, fill: '#FB7185', stroke: '#060608', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#201F23" vertical={false} />
              <XAxis
                dataKey="mesCorto"
                stroke="#A19D93"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#33302A' }}
              />
              <YAxis
                stroke="#A19D93"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `Bs ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(212, 175, 55, 0.06)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const point = payload[0].payload as MonthlyPoint;
                  return (
                    <div className="bg-[#060608] border border-amber-500/40 rounded-lg p-3 shadow-xl text-xs space-y-1.5 min-w-[200px]">
                      <div className="font-bold text-white border-b border-slate-800 pb-1">
                        {point.mes}
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-amber-300">Ingresos:</span>
                        <span className="font-mono font-bold text-amber-400 tabular-nums">
                          {formatBs(point.ingresos)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-rose-300">Gastos:</span>
                        <span className="font-mono font-bold text-rose-400 tabular-nums">
                          {formatBs(point.gastos)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                        <span className="text-slate-300">Saldo:</span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            point.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {point.balance >= 0 ? '+' : ''}
                          {formatBs(point.balance)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="ingresos" name="Ingresos (Bs)" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="gastos" name="Gastos (Bs)" fill="#FB7185" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-2 text-slate-200">
            <span className="w-3 h-0.5 bg-[#D4AF37] inline-block" />
            Ingresos Mensuales (Cuotas + Donaciones)
          </span>
          <span className="inline-flex items-center gap-2 text-slate-200">
            <span className="w-3 h-0.5 bg-[#FB7185] inline-block" />
            Gastos Mensuales
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Actualizado automáticamente con registros de Tesorería y Mensualidades
        </span>
      </div>
    </section>
  );
};
