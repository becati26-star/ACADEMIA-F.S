/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, Category, PaymentRecord } from '../types';
import { whatsappService, WhatsAppReminderLog } from '../services/whatsappService';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';
import {
  Calendar,
  CreditCard,
  Search,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Filter,
  Receipt,
  Printer,
  X,
  ArrowUpDown,
  History,
  TrendingUp,
  FileSpreadsheet,
  MessageCircle,
  Check
} from 'lucide-react';

interface MensualidadesViewProps {
  players: Player[];
  categories: Category[];
  onRecordPayment: (playerId: string, mes: string, monto: number, metodo: any, fechaPago?: string) => void;
  onSelectPlayer?: (player: Player) => void;
}

export const MensualidadesView: React.FC<MensualidadesViewProps> = ({
  players,
  categories,
  onRecordPayment,
  onSelectPlayer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'al_dia' | 'pendiente'>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // Modal State for new payment
  const [isRegisteringPayment, setIsRegisteringPayment] = useState(false);
  const [selectedPlayerForPay, setSelectedPlayerForPay] = useState<Player | null>(null);
  const [payPeriodMonth, setPayPeriodMonth] = useState('Noviembre 2026');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [payAmount, setPayAmount] = useState(150);
  const [payMethod, setPayMethod] = useState<'Transferencia' | 'Efectivo' | 'Tarjeta' | 'Débito Automático'>('Transferencia');

  // Modal State for player payment history
  const [historyPlayer, setHistoryPlayer] = useState<Player | null>(null);

  // WhatsApp Integration State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppInitialPlayer, setWhatsAppInitialPlayer] = useState<Player | null>(null);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppReminderLog[]>(() => whatsappService.getLogs());
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = whatsappService.subscribe(() => {
      setWhatsAppLogs(whatsappService.getLogs());
    });
    return unsub;
  }, []);

  // Helper to parse Day, Month name and Year from YYYY-MM-DD
  const parsePaymentDateDetails = (dateStr: string) => {
    if (!dateStr) return { dia: '-', mes: '-', anio: '-', formatted: 'Sin fecha' };

    // Format YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthName = monthNames[monthIndex] || `Mes ${parts[1]}`;

      return {
        dia: day < 10 ? `0${day}` : `${day}`,
        mes: monthName,
        mesNumero: parts[1],
        anio: `${year}`,
        formatted: `${day} de ${monthName} de ${year}`
      };
    }

    // Fallback for non-standard string
    return {
      dia: '10',
      mes: 'Noviembre',
      mesNumero: '11',
      anio: '2026',
      formatted: dateStr
    };
  };

  // Metrics
  const totalPlayers = players.length;
  const playersAlDia = players.filter((p) => p.estadoCuota === 'al_dia').length;
  const playersPendientes = players.filter((p) => p.estadoCuota === 'pendiente' || p.estadoCuota === 'moroso');
  const totalDebtBs = playersPendientes.reduce((acc, p) => acc + p.cuotaMensualMonto, 0);

  // Calculate total fees collected
  const allRecordedPayments = players.flatMap((p) =>
    (p.historialPagos || []).map((pay) => ({ ...pay, player: p }))
  );
  const totalRecaudadoHistorico = allRecordedPayments.reduce((acc, p) => acc + p.monto, 0);
  const recaudadoNoviembre = allRecordedPayments
    .filter((p) => p.mes?.includes('Noviembre 2026') || p.fecha?.startsWith('2026-11'))
    .reduce((acc, p) => acc + p.monto, 0);

  // Filtered player list
  const filteredPlayers = players.filter((p) => {
    // Category filter
    if (filterCategory !== 'all') {
      if (filterCategory === 'primera-c') {
        const isPrimC = p.categoriaId === 'primera-c' || p.dobleFichaPrimeraC || p.categoriasSecundarias?.includes('primera-c');
        if (!isPrimC) return false;
      } else if (p.categoriaId !== filterCategory) {
        return false;
      }
    }

    // Status filter
    if (filterStatus === 'al_dia' && p.estadoCuota !== 'al_dia') return false;
    if (filterStatus === 'pendiente' && p.estadoCuota === 'al_dia') return false;

    // Search query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.nombre.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q) ||
      p.dni.toLowerCase().includes(q) ||
      p.dorsal.toString().includes(q);

    return matchesSearch;
  });

  const handleOpenRegisterPayment = (p: Player) => {
    setSelectedPlayerForPay(p);
    setPayAmount(p.cuotaMensualMonto);
    setPayPeriodMonth('Noviembre 2026');
    setPayDate(new Date().toISOString().split('T')[0]);
    setIsRegisteringPayment(true);
  };

  const handleSavePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerForPay) return;

    onRecordPayment(
      selectedPlayerForPay.id,
      payPeriodMonth,
      Number(payAmount),
      payMethod,
      payDate
    );

    const dateDetails = parsePaymentDateDetails(payDate);
    setToastSuccess(
      `Pago registrado para ${selectedPlayerForPay.nombre} ${selectedPlayerForPay.apellidos}: Bs ${payAmount} (${dateDetails.dia} de ${dateDetails.mes} de ${dateDetails.anio}).`
    );
    setTimeout(() => setToastSuccess(null), 5000);

    setIsRegisteringPayment(false);
  };

  const exportPaymentsToCSV = () => {
    const headers = [
      'Dorsal',
      'Jugador',
      'Apellidos',
      'CI',
      'Categoria',
      'Periodo Mensual',
      'Fecha Pago (Dia-Mes-Año)',
      'Dia',
      'Mes',
      'Año',
      'Monto (Bs)',
      'Metodo',
      'Nro Comprobante',
      'Registrado Por'
    ];

    const rows = allRecordedPayments.map((pay) => {
      const d = parsePaymentDateDetails(pay.fecha);
      return [
        pay.player.dorsal,
        `"${pay.player.nombre}"`,
        `"${pay.player.apellidos}"`,
        `"${pay.player.dni}"`,
        `"${pay.player.equipoNombre}"`,
        `"${pay.mes}"`,
        `"${d.formatted}"`,
        d.dia,
        `"${d.mes}"`,
        d.anio,
        pay.monto,
        `"${pay.metodo}"`,
        `"${pay.comprobante}"`,
        `"${pay.registradoPor || 'Tesorería'}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mensualidades_Jugadores_ACADEMIA_FS_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Date details of the current payment input form
  const currentFormDateDetails = parsePaymentDateDetails(payDate);

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white">
              Control de Mensualidades de Jugadores
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Temporada 2026 · Bs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro detallado de cuotas deportivas de futsal con desglose exacto de la fecha de pago: <strong>Día</strong>, <strong>Mes</strong> y <strong>Año</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setWhatsAppInitialPlayer(null);
              setIsWhatsAppModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            Recordatorios WhatsApp ({playersPendientes.length})
          </button>
          <button
            onClick={exportPaymentsToCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Exportar CSV
          </button>
          <button
            onClick={() => {
              if (players.length > 0) {
                handleOpenRegisterPayment(players[0]);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Cobro de Mensualidad
          </button>
        </div>
      </div>

      {toastSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastSuccess}</span>
          </div>
          <button onClick={() => setToastSuccess(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Recaudación Total Histórica</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            Bs {totalRecaudadoHistorico.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {allRecordedPayments.length} pagos registrados en sistema
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cobrado en Noviembre 2026</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            Bs {recaudadoNoviembre.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block">
            Cuotas correspondientes al mes corriente
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Jugadores al Día</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {playersAlDia} <span className="text-xs font-normal text-slate-400">/ {totalPlayers}</span>
          </div>
          <span className="text-[11px] text-emerald-300/80 block">
            {Math.round((playersAlDia / (totalPlayers || 1)) * 100)}% de solvencia mensual
          </span>
        </div>

        <div className={`p-4 rounded-xl border space-y-1 transition-all ${
          playersPendientes.length > 0
            ? 'bg-rose-950/40 border-rose-800/80'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-rose-300">
            <span className="text-xs font-medium">Cuotas Pendientes (Mes Actual)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            Bs {totalDebtBs.toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-300 block font-semibold">
            {playersPendientes.length} jugadores con pago pendiente
          </span>
        </div>
      </div>

      {/* Pending Alert Banner if any player is in debt */}
      {playersPendientes.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/60 border-2 border-rose-700/80 text-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-rose-900/60 rounded-lg text-rose-300 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">
                Atención Directiva: {playersPendientes.length} jugadores registran cuotas pendientes en Noviembre 2026
              </p>
              <p className="text-xs text-rose-200 mt-0.5">
                Total por cobrar en Bolivianos: <strong>Bs {totalDebtBs}</strong>. Los jugadores con deuda aparecen resaltados en color rojo en la lista.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setWhatsAppInitialPlayer(null);
                setIsWhatsAppModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Enviar Recordatorios WhatsApp
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'pendiente' ? 'all' : 'pendiente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                filterStatus === 'pendiente'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700'
              }`}
            >
              {filterStatus === 'pendiente' ? 'Ver Todos los Jugadores' : 'Filtrar Solo Pendientes'}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, apellido, CI o dorsal..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="all">Todas las Categorías</option>
            <option value="sub-18">Sub-18 Futsal</option>
            <option value="sub-20">Sub-20 Futsal</option>
            <option value="primera-c">Primera C Futsal</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="all">Todos los Estados</option>
            <option value="al_dia">Solo Al Día</option>
            <option value="pendiente">Solo Pendientes (Deuda)</option>
          </select>
        </div>
      </div>

      {/* Main Players Monthly Fees Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            Padrón de Jugadores y Fechas de Pago de Mensualidad
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Mostrando {filteredPlayers.length} de {players.length} jugadores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Jugador</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Cuota (Bs)</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Periodo</th>
                <th className="py-3 px-4 font-bold text-amber-400">
                  Fecha que Pagó (Día · Mes · Año)
                </th>
                <th className="py-3 px-3">Comprobante</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No se encontraron jugadores con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const isPending = player.estadoCuota === 'pendiente' || player.estadoCuota === 'moroso';
                  const lastPayment = player.historialPagos && player.historialPagos.length > 0
                    ? player.historialPagos[0]
                    : null;

                  const dateInfo = lastPayment
                    ? parsePaymentDateDetails(lastPayment.fecha)
                    : null;

                  return (
                    <tr
                      key={player.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isPending ? 'bg-rose-950/25' : ''
                      }`}
                    >
                      {/* Player Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {player.foto ? (
                            <img
                              src={player.foto}
                              alt={player.nombre}
                              className="w-8 h-8 rounded-full object-cover border border-amber-500/60 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0 font-mono">
                              #{player.dorsal}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white block">
                              {player.nombre} {player.apellidos}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              CI: {player.dni}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                            player.categoriaId === 'primera-c'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : player.categoriaId === 'sub-20'
                              ? 'bg-white/10 text-white border border-white/25'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {player.equipoNombre}
                          </span>
                          {player.dobleFichaPrimeraC && player.categoriaId !== 'primera-c' && (
                            <span className="text-[10px] text-amber-400 font-semibold">
                              + Doble Ficha Primera C
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cuota Monto */}
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        Bs {player.cuotaMensualMonto}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            PENDIENTE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            AL DÍA
                          </span>
                        )}
                      </td>

                      {/* Periodo Pagado */}
                      <td className="py-3 px-3 font-semibold text-slate-300">
                        {player.ultimoMesPagado || 'Noviembre 2026'}
                      </td>

                      {/* FECHA QUE PAGÓ: DÍA, MES Y AÑO */}
                      <td className="py-3 px-4">
                        {dateInfo ? (
                          <div className="space-y-1">
                            {/* Human-readable full date */}
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>{dateInfo.formatted}</span>
                            </div>

                            {/* Explicit badges for Día, Mes, Año */}
                            <div className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-amber-300 font-mono font-bold">
                                Día: <strong>{dateInfo.dia}</strong>
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-white font-mono font-bold">
                                Mes: <strong>{dateInfo.mes}</strong>
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-amber-400 font-mono font-bold">
                                Año: <strong>{dateInfo.anio}</strong>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-rose-400 italic">
                            Sin registro de pago reciente
                          </div>
                        )}
                      </td>

                      {/* Comprobante / Método */}
                      <td className="py-3 px-3">
                        {lastPayment ? (
                          <div>
                            <span className="font-mono text-[11px] text-slate-300 block">
                              {lastPayment.comprobante}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {lastPayment.metodo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (() => {
                            const primary = whatsappService.getPrimaryPlayerTarget(player);
                            const msg = whatsappService.buildPlayerMessage(
                              player,
                              primary?.targetType || 'jugador',
                              'Noviembre 2026'
                            );
                            const waUrl = whatsappService.buildWhatsAppUrl(
                              primary?.phone || player.telefono || '',
                              msg
                            );
                            const alreadySent = whatsAppLogs.some((l) => l.entityId === player.id);

                            return (
                              <>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    whatsappService.logDispatch({
                                      entityId: player.id,
                                      entityType: 'player',
                                      entityName: `${player.nombre} ${player.apellidos}`,
                                      recipientName: primary?.recipientName || `${player.nombre} ${player.apellidos}`,
                                      targetType: primary?.targetType || 'jugador',
                                      phone: primary?.phone || player.telefono || 'WhatsApp',
                                      amountBs: player.cuotaMensualMonto,
                                      period: 'Noviembre 2026'
                                    });
                                  }}
                                  title={`Enviar recordatorio de pago por WhatsApp a ${primary?.recipientName || player.nombre}`}
                                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                                    alreadySent
                                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900'
                                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  }`}
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{alreadySent ? 'WA Enviado' : 'WhatsApp'}</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWhatsAppInitialPlayer(player);
                                    setIsWhatsAppModalOpen(true);
                                  }}
                                  title="Personalizar mensaje o elegir tutor en WhatsApp"
                                  className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded text-[10px] font-bold"
                                >
                                  Editar WA
                                </button>
                              </>
                            );
                          })()}
                          <button
                            onClick={() => handleOpenRegisterPayment(player)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Cobrar
                          </button>
                          <button
                            onClick={() => setHistoryPlayer(player)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors"
                            title="Ver historial de mensualidades de este jugador"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA REGISTRAR COBRO DE MENSUALIDAD (CON DÍA, MES Y AÑO EDITABLE) */}
      {isRegisteringPayment && selectedPlayerForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Registrar Cobro de Mensualidad
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jugador: <strong className="text-white">{selectedPlayerForPay.nombre} {selectedPlayerForPay.apellidos}</strong> (Dorsal #{selectedPlayerForPay.dorsal})
                </p>
              </div>
              <button
                onClick={() => setIsRegisteringPayment(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Jugador Seleccionado:</label>
                <select
                  value={selectedPlayerForPay.id}
                  onChange={(e) => {
                    const found = players.find((p) => p.id === e.target.value);
                    if (found) {
                      setSelectedPlayerForPay(found);
                      setPayAmount(found.cuotaMensualMonto);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.dorsal} {p.nombre} {p.apellidos} · {p.equipoNombre} (Cuota: Bs {p.cuotaMensualMonto})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Periodo Mensual:</label>
                  <select
                    value={payPeriodMonth}
                    onChange={(e) => setPayPeriodMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="Noviembre 2026">Noviembre 2026</option>
                    <option value="Diciembre 2026">Diciembre 2026</option>
                    <option value="Enero 2027">Enero 2027</option>
                    <option value="Octubre 2026">Octubre 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Monto en Bolivianos (Bs):</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* SECCIÓN CRÍTICA: FECHA EXACTA DE PAGO (DÍA, MES Y AÑO) */}
              <div className="p-3.5 bg-slate-950 border border-amber-500/40 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5 text-xs">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Fecha que Pagó (Día, Mes y Año):
                  </span>
                  <span className="text-[10px] text-slate-400">Selector de fecha oficial</span>
                </div>

                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm"
                />

                {/* Live breakdown of Day, Month and Year */}
                <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-around text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Día:</span>
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      {currentFormDateDetails.dia}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Mes:</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      {currentFormDateDetails.mes}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Año:</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      {currentFormDateDetails.anio}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Forma de Pago:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="Transferencia">Transferencia Bancaria / QR</option>
                  <option value="Efectivo">Efectivo en Sede de Futsal</option>
                  <option value="Tarjeta">Tarjeta de Débito</option>
                  <option value="Débito Automático">Débito Automático</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisteringPayment(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-950/40"
                >
                  Confirmar Cobro de Mensualidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL DE MENSUALIDADES DEL JUGADOR */}
      {historyPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  Historial de Pagos de {historyPlayer.nombre} {historyPlayer.apellidos}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dorsal #{historyPlayer.dorsal} · {historyPlayer.equipoNombre} · Cuota mensual: Bs {historyPlayer.cuotaMensualMonto}
                </p>
              </div>
              <button
                onClick={() => setHistoryPlayer(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {historyPlayer.historialPagos.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  Sin mensualidades previas registradas para este jugador.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {historyPlayer.historialPagos.map((pay) => {
                    const d = parsePaymentDateDetails(pay.fecha);
                    return (
                      <div
                        key={pay.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{pay.concepto || pay.mes}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                              {pay.comprobante}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span>Fecha de pago:</span>
                            <strong className="text-amber-300">Día {d.dia}</strong> ·
                            <strong className="text-white">{d.mes}</strong> ·
                            <strong className="text-amber-400">{d.anio}</strong>
                            <span className="text-slate-500">({pay.metodo})</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-extrabold text-emerald-400 text-base">
                            +Bs {pay.monto}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  onClick={() => setHistoryPlayer(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Cerrar Historial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP REMINDER & LINKING MODAL */}
      <WhatsAppReminderModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        overduePlayers={playersPendientes}
        initialPlayer={whatsAppInitialPlayer}
        period="Noviembre 2026"
      />
    </div>
  );
};
