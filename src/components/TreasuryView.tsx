/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Donation, ClubExpense, FinancialSummary, Player, Socio } from '../types';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CreditCard,
  Download,
  Building,
  CheckCircle2,
  X,
  PieChart
} from 'lucide-react';

interface TreasuryViewProps {
  donations: Donation[];
  expenses: ClubExpense[];
  players: Player[];
  socios: Socio[];
  financialSummary: FinancialSummary;
  onAddDonation: (donation: Donation) => void;
  onAddExpense: (expense: ClubExpense) => void;
  onExportCSV: () => void;
}

export const TreasuryView: React.FC<TreasuryViewProps> = ({
  donations,
  expenses,
  players,
  socios,
  financialSummary,
  onAddDonation,
  onAddExpense,
  onExportCSV
}) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'donations' | 'expenses' | 'dues'>('balance');
  const [isNewDonationModalOpen, setIsNewDonationModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);

  // New Donation form state
  const [donanteNombre, setDonanteNombre] = useState('');
  const [dniDonante, setDniDonante] = useState('');
  const [montoDonacion, setMontoDonacion] = useState(100000);
  const [destinoProyecto, setDestinoProyecto] = useState('');
  const [metodoPagoDonacion, setMetodoPagoDonacion] = useState('Transferencia Bancaria');
  const [notasDonacion, setNotasDonacion] = useState('');

  // New Expense form state
  const [conceptoGasto, setConceptoGasto] = useState('');
  const [categoriaGasto, setCategoriaGasto] = useState<any>('Material Deportivo');
  const [montoGasto, setMontoGasto] = useState(85000);
  const [proveedorGasto, setProveedorGasto] = useState('');
  const [facturaNumero, setFacturaNumero] = useState('');

  const handleCreateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donanteNombre || !montoDonacion || !destinoProyecto) {
      alert('Por favor complete donante, monto y destino del proyecto.');
      return;
    }

    const newDon: Donation = {
      id: `don-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      donanteNombre,
      dniDonante,
      monto: Number(montoDonacion),
      destinoProyecto,
      metodoPago: metodoPagoDonacion,
      comprobante: `TRX-DON-${Math.floor(1000 + Math.random() * 9000)}`,
      notas: notasDonacion,
      registradoPor: 'Carlos Mendoza Rivas (Presidente)'
    };

    onAddDonation(newDon);
    setIsNewDonationModalOpen(false);
    // Reset form
    setDonanteNombre('');
    setDestinoProyecto('');
    alert(`Donación de $${montoDonacion.toLocaleString()} registrada con éxito.`);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptoGasto || !montoGasto || !proveedorGasto) {
      alert('Por favor complete concepto, monto y proveedor.');
      return;
    }

    const newExp: ClubExpense = {
      id: `exp-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      concepto: conceptoGasto,
      categoria: categoriaGasto,
      monto: Number(montoGasto),
      proveedor: proveedorGasto,
      facturaNumero: facturaNumero || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      aprobadoPor: 'Carlos Mendoza Rivas (Presidente)',
      comprobante: `COMP-${Date.now()}`
    };

    onAddExpense(newExp);
    setIsNewExpenseModalOpen(false);
    setConceptoGasto('');
    setProveedorGasto('');
    alert(`Gasto de $${montoGasto.toLocaleString()} registrado y contabilizado.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Presidencia &amp; Tesorería General
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Transparencia Financiera &amp; Compras</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Gestión Económica, Donaciones y Gastos del Club
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar Libro Diario CSV
          </button>
          <button
            onClick={() => setIsNewDonationModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar Donación
          </button>
          <button
            onClick={() => setIsNewExpenseModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar Compra / Gasto
          </button>
        </div>
      </div>

      {/* 4 Financial Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Ingresos Totales (Mes)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            Bs {financialSummary.ingresosTotales.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Cuotas: Bs {(financialSummary.ingresosCuotasJugadores + financialSummary.ingresosCuotasSocios).toLocaleString()}</span>
            <span>Donaciones: Bs {financialSummary.ingresosDonaciones.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Egresos / Compras Realizadas</span>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            Bs {financialSummary.egresosTotales.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            <span>{expenses.length} facturas y órdenes de pago</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Superávit Operativo Neto</span>
          <div className={`text-2xl font-bold font-mono tabular-nums ${
            financialSummary.superavitDeficit >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            Bs {financialSummary.superavitDeficit.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-2 font-medium">
            Balance contable en Bolivianos
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Tasa de Cobranza Miembros</span>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {financialSummary.tasaCobranzaPorcentaje}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Morosos: {financialSummary.sociosMorososCount + financialSummary.jugadoresMorososCount}</span>
            <span className="text-amber-400">En gestión</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs overflow-x-auto scrollbar-none">
        {[
          { id: 'balance', label: 'Resumen & Desglose Contable' },
          { id: 'donations', label: `Donaciones Altruistas (${donations.length})` },
          { id: 'expenses', label: `Compras & Gastos Oficiales (${expenses.length})` },
          { id: 'dues', label: 'Cuotas Jugadores & Socios' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. BALANCE & DESGLOSE */}
      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incomes Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Desglose de Ingresos Recibidos
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">Cuotas Deportivas de Jugadores</span>
                  <div className="text-[11px] text-slate-400">Planteles Sub-18, Sub-20 y Primera C</div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  Bs {financialSummary.ingresosCuotasJugadores.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">Cuotas Sociales de Miembros</span>
                  <div className="text-[11px] text-slate-400">{socios.length} socios empadronados</div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  Bs {financialSummary.ingresosCuotasSocios.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">Donaciones &amp; Mecenazgo Futsal</span>
                  <div className="text-[11px] text-slate-400">{donations.length} aportes altruistas e institucionales</div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  Bs {financialSummary.ingresosDonaciones.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Breakdown by Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              Gastos de Futsal por Rubro Presupuestario
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                'Material Deportivo',
                'Arbitraje & Jueces',
                'Indumentaria Oficial',
                'Transporte & Viajes',
                'Mantenimiento Canchas',
                'Servicio Médico & Kine'
              ].map((cat) => {
                const totalCat = expenses
                  .filter((e) => e.categoria === cat)
                  .reduce((acc, curr) => acc + curr.monto, 0);

                const percent = financialSummary.egresosTotales > 0
                  ? ((totalCat / financialSummary.egresosTotales) * 100).toFixed(1)
                  : '0';

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{cat}</span>
                      <span className="font-mono font-bold text-white">
                        Bs {totalCat.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. DONACIONES */}
      {activeTab === 'donations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Donante / Entidad</th>
                  <th className="py-3 px-4">Destino del Proyecto</th>
                  <th className="py-3 px-4">Forma de Pago</th>
                  <th className="py-3 px-4 text-right">Monto Donado (Bs)</th>
                  <th className="py-3 px-4 text-center">Comprobante</th>
                  <th className="py-3 px-4">Registrado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">{d.fecha}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-white">
                      {d.donanteNombre}
                      {d.dniDonante && (
                        <div className="text-[10px] text-slate-400 font-mono">CI/NIT: {d.dniDonante}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">{d.destinoProyecto}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">{d.metodoPago}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-emerald-400 text-sm">
                      +Bs {d.monto.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center font-mono text-[11px] text-slate-400">
                      {d.comprobante}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">{d.registradoPor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. COMPRAS & GASTOS */}
      {activeTab === 'expenses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Rubro / Categoría</th>
                  <th className="py-3 px-4">Concepto de Compra</th>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4 text-center">Factura N°</th>
                  <th className="py-3 px-4 text-right">Importe Facturado</th>
                  <th className="py-3 px-4">Aprobado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">{e.fecha}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-medium text-slate-200">
                        {e.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium max-w-sm">{e.concepto}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">{e.proveedor}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-center font-mono text-slate-400 text-[11px]">
                      {e.facturaNumero}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-rose-400 text-sm">
                      -Bs {e.monto.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">{e.aprobadoPor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CUOTAS MENSUALES CONSOLIDADO */}
      {activeTab === 'dues' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Gestión Integral de Cuotas Deportivas de Futsal y Sociales (en Bolivianos)
            </h3>
            <span className="text-slate-400">Total miembros activos: {players.length + socios.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jugadores */}
            <div className="space-y-3">
              <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">
                Cuotas Deportivas - Jugadores Futsal (Sub-18, Sub-20, Primera C)
              </span>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden max-h-80 overflow-y-auto scrollbar-none">
                {players.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-950/40 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">#{p.dorsal} {p.nombre} {p.apellidos}</div>
                      <div className="text-[11px] text-slate-400">{p.equipoNombre} · Último: {p.ultimoMesPagado}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.estadoCuota === 'al_dia' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {p.estadoCuota === 'al_dia' ? 'AL DÍA' : 'PENDIENTE'}
                      </span>
                      <div className="font-mono text-white mt-0.5">Bs {p.cuotaMensualMonto}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Socios */}
            <div className="space-y-3">
              <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[11px]">
                Cuotas Sociales - Padrón de Socios ACADEMIA F.S.
              </span>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden max-h-80 overflow-y-auto scrollbar-none">
                {socios.map((s) => (
                  <div key={s.id} className="p-3 bg-slate-950/40 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{s.numeroSocio} - {s.nombre} {s.apellidos}</div>
                      <div className="text-[11px] text-slate-400">{s.tipoSocio} · Último: {s.ultimoMesPagado}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        s.estadoPago === 'al_dia' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {s.estadoPago === 'al_dia' ? 'AL DÍA' : 'MOROSO'}
                      </span>
                      <div className="font-mono text-white mt-0.5">Bs {s.cuotaMensual}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR DONACIÓN */}
      {isNewDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Registrar Donación para el Club
              </h3>
              <button
                onClick={() => setIsNewDonationModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDonation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre del Donante / Institución:</label>
                <input
                  type="text"
                  required
                  value={donanteNombre}
                  onChange={(e) => setDonanteNombre(e.target.value)}
                  placeholder="Ej: Fundación Deportiva o Nombre de Socio"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">DNI / CUIT Donante:</label>
                  <input
                    type="text"
                    value={dniDonante}
                    onChange={(e) => setDniDonante(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Monto de Donación ($):</label>
                  <input
                    type="number"
                    required
                    value={montoDonacion}
                    onChange={(e) => setMontoDonacion(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Destino / Proyecto Asignado:</label>
                <input
                  type="text"
                  required
                  value={destinoProyecto}
                  onChange={(e) => setDestinoProyecto(e.target.value)}
                  placeholder="Ej: Iluminación Cancha 2, Balones infantiles, Fondo de becas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Forma de Pago / Transferencia:</label>
                <select
                  value={metodoPagoDonacion}
                  onChange={(e) => setMetodoPagoDonacion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Cheque Corporativo">Cheque Corporativo</option>
                  <option value="Efectivo en Sede">Efectivo en Sede</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewDonationModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  Confirmar Donación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR GASTO / COMPRA */}
      {isNewExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Registrar Gasto o Compra Oficial para el Equipo
              </h3>
              <button
                onClick={() => setIsNewExpenseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Concepto del Gasto / Compra:</label>
                <input
                  type="text"
                  required
                  value={conceptoGasto}
                  onChange={(e) => setConceptoGasto(e.target.value)}
                  placeholder="Ej: Compra de 20 balones de entrenamiento, alquiler de micro..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Rubro / Categoría:</label>
                  <select
                    value={categoriaGasto}
                    onChange={(e) => setCategoriaGasto(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="Material Deportivo">Material Deportivo</option>
                    <option value="Arbitraje & Jueces">Arbitraje &amp; Jueces</option>
                    <option value="Indumentaria Oficial">Indumentaria Oficial</option>
                    <option value="Transporte & Viajes">Transporte &amp; Viajes</option>
                    <option value="Mantenimiento Canchas">Mantenimiento Canchas</option>
                    <option value="Servicio Médico & Kine">Servicio Médico &amp; Kine</option>
                    <option value="Administración & Sede">Administración &amp; Sede</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Monto a Pagar ($):</label>
                  <input
                    type="number"
                    required
                    value={montoGasto}
                    onChange={(e) => setMontoGasto(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Proveedor / Prestador:</label>
                  <input
                    type="text"
                    required
                    value={proveedorGasto}
                    onChange={(e) => setProveedorGasto(e.target.value)}
                    placeholder="Razón Social del Proveedor"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Factura / Recibo N°:</label>
                  <input
                    type="text"
                    value={facturaNumero}
                    onChange={(e) => setFacturaNumero(e.target.value)}
                    placeholder="FAC-A-0001-XXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded"
                >
                  Autorizar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
