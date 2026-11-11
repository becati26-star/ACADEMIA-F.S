/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Socio, SocioCategory } from '../types';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BellRing,
  CreditCard,
  Download,
  X,
  Gift,
  ShieldCheck,
  Edit3,
  Save,
  Check,
  Trash2
} from 'lucide-react';

interface SociosViewProps {
  socios: Socio[];
  onSaveSocio: (socio: Socio) => void;
  onRecordPayment: (socioId: string, mes: string, monto: number, metodo: any) => void;
  onExportCSV: () => void;
}

export const SociosView: React.FC<SociosViewProps> = ({
  socios,
  onSaveSocio,
  onRecordPayment,
  onExportCSV
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPendingOnly, setFilterPendingOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isEditingSocio, setIsEditingSocio] = useState<boolean>(false);
  const [editSocioForm, setEditSocioForm] = useState<Socio | null>(null);

  // Payment form state
  const [payMonth, setPayMonth] = useState('Noviembre 2026');
  const [payAmount, setPayAmount] = useState(150);
  const [payMethod, setPayMethod] = useState<'Transferencia' | 'Efectivo' | 'Tarjeta' | 'Débito Automático'>('Transferencia');

  // Calculate pending / moroso socios for current month (Noviembre 2026)
  const currentMonth = 'Noviembre 2026';
  const pendingSocios = socios.filter((s) => s.estadoPago === 'pendiente' || s.estadoPago === 'moroso');
  const totalPendingSociosBs = pendingSocios.reduce((acc, s) => acc + s.cuotaMensual, 0);

  // New Socio Form State
  const [newSocio, setNewSocio] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoSocio: 'Pleno' as SocioCategory,
    cuotaMensual: 150,
    estadoMembresia: 'activo' as 'activo' | 'inactivo' | 'suspendido',
    estadoPago: 'al_dia' as 'al_dia' | 'pendiente' | 'moroso'
  });

  const handleOpenSocio = (s: Socio) => {
    setSelectedSocio(s);
    setPayAmount(s.cuotaMensual);
    setIsEditingSocio(false);
    setEditSocioForm({ ...s });
  };

  const handleSaveEditSocio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSocioForm) return;

    onSaveSocio(editSocioForm);
    setSelectedSocio(editSocioForm);
    setIsEditingSocio(false);
  };

  const filteredSocios = socios.filter((s) => {
    if (filterPendingOnly && s.estadoPago === 'al_dia') {
      return false;
    }

    const matchesType = filterType === 'all' || s.tipoSocio === filterType;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      s.nombre.toLowerCase().includes(q) ||
      s.apellidos.toLowerCase().includes(q) ||
      s.numeroSocio.toLowerCase().includes(q) ||
      s.dni.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocio.nombre || !newSocio.apellidos || !newSocio.dni) {
      alert('Por favor complete nombre, apellidos y documento DNI.');
      return;
    }

    const nextNumber = `SOC-00${Math.floor(100 + Math.random() * 900)}`;

    const socioToSave: Socio = {
      id: `soc-${Date.now()}`,
      numeroSocio: nextNumber,
      nombre: newSocio.nombre,
      apellidos: newSocio.apellidos,
      dni: newSocio.dni,
      email: newSocio.email || '',
      telefono: newSocio.telefono || '',
      direccion: newSocio.direccion || 'ACADEMIA F.S. Sede Social, La Paz',
      tipoSocio: newSocio.tipoSocio,
      estadoMembresia: newSocio.estadoMembresia,
      cuotaMensual: Number(newSocio.cuotaMensual) || 150,
      estadoPago: newSocio.estadoPago,
      ultimoMesPagado: 'Noviembre 2026',
      fechaIngreso: new Date().toISOString().split('T')[0],
      beneficios: [
        'Acceso libre a tribunas en partidos oficiales de ACADEMIA F.S.',
        'Descuento 20% en indumentaria y balones oficiales',
        'Voz y voto en asambleas ordinarias del club'
      ],
      historialAportaciones: []
    };

    onSaveSocio(socioToSave);
    setIsCreatingNew(false);
    handleOpenSocio(socioToSave);
  };

  return (
    <div className="space-y-5">
      {/* Visual Notification Banner for Pending Socios */}
      {pendingSocios.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  Alerta de Cobranzas en Socios: {pendingSocios.length} {pendingSocios.length === 1 ? 'socio tiene' : 'socios tienen'} aportaciones pendientes
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {currentMonth}
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                Total adeudado en cuotas sociales: <strong className="font-mono text-white">Bs {totalPendingSociosBs}</strong>. Los socios con cuota pendiente están resaltados en rojo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterPendingOnly
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 border border-rose-700/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              {filterPendingOnly ? 'Ver Todo el Padrón' : `Ver ${pendingSocios.length} Socios en Rojo`}
            </button>
          </div>
        </div>
      )}

      {/* Top Filter & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setFilterType('all');
              setFilterPendingOnly(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              filterType === 'all' && !filterPendingOnly
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Todos ({socios.length})
          </button>
          {['Fundador', 'Pleno', 'Familiar', 'Cadete', 'Honorario'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilterType(t);
                setFilterPendingOnly(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                filterType === t && !filterPendingOnly
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t} ({socios.filter((s) => s.tipoSocio === t).length})
            </button>
          ))}

          {/* Red Filter Button for Pending Socios */}
          {pendingSocios.length > 0 && (
            <button
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                filterPendingOnly
                  ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-500'
                  : 'bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Cuotas Pendientes ({pendingSocios.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por socio, nombre, DNI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={onExportCSV}
            title="Exportar padrón a CSV / Excel"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCreatingNew(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Socio
          </button>
        </div>
      </div>

      {/* Socios Grid Table with Red Visual Highlighting for Pending Fees */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">N° Socio</th>
                <th className="py-3 px-4">Nombre y Apellidos</th>
                <th className="py-3 px-4">Categoría de Socio</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4 text-right">Cuota Mensual (Bs)</th>
                <th className="py-3 px-4 text-center">Estado de Pago</th>
                <th className="py-3 px-4 text-center">Último Pago</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSocios.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron socios registrados con este criterio.
                  </td>
                </tr>
              ) : (
                filteredSocios.map((s) => {
                  const isPending = s.estadoPago === 'pendiente' || s.estadoPago === 'moroso';

                  return (
                    <tr
                      key={s.id}
                      onClick={() => handleOpenSocio(s)}
                      className={`transition-colors cursor-pointer group ${
                        isPending
                          ? 'bg-rose-950/30 border-l-4 border-l-rose-500 hover:bg-rose-900/40'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <td className={`py-3 px-4 whitespace-nowrap font-mono font-bold ${
                        isPending ? 'text-rose-400 font-extrabold' : 'text-amber-400'
                      }`}>
                        {s.numeroSocio}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold transition-colors ${
                            isPending ? 'text-rose-100 font-bold' : 'text-white group-hover:text-amber-400'
                          }`}>
                            {s.nombre} {s.apellidos}
                          </span>
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" /> DEUDA
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          CI: {s.dni}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                          {s.tipoSocio}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        <div>{s.email || '-'}</div>
                        <div className="font-mono text-[11px]">{s.telefono || '-'}</div>
                      </td>
                      <td className={`py-3 px-4 text-right whitespace-nowrap font-mono font-bold tabular-nums text-sm ${
                        isPending ? 'text-rose-400 font-extrabold' : 'text-white'
                      }`}>
                        Bs {s.cuotaMensual}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800">
                            {s.estadoPago.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            Al Día
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {s.ultimoMesPagado}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        {isPending && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSocio(s);
                            }}
                            className="px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <CreditCard className="w-3 h-3" />
                            Cobrar
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSocio(s);
                          }}
                          className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          Ver / Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLE Y EDICIÓN DE SOCIO */}
      {selectedSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-mono font-bold text-xs ${
                  selectedSocio.estadoPago === 'pendiente' || selectedSocio.estadoPago === 'moroso'
                    ? 'bg-rose-950 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-amber-500/60 text-amber-400'
                }`}>
                  {selectedSocio.numeroSocio.split('-')[1] || 'SOC'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedSocio.nombre} {selectedSocio.apellidos}
                    {(selectedSocio.estadoPago === 'pendiente' || selectedSocio.estadoPago === 'moroso') && (
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-bold animate-pulse">
                        Cuota Pendiente
                      </span>
                    )}
                    {isEditingSocio && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-normal">
                        Modo Edición
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400 font-semibold">{selectedSocio.tipoSocio}</span>
                    <span>·</span>
                    <span>CI: {selectedSocio.dni}</span>
                    <span>·</span>
                    <span>Miembro desde {selectedSocio.fechaIngreso}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingSocio) {
                      setEditSocioForm({ ...selectedSocio });
                      setIsEditingSocio(true);
                    } else {
                      setIsEditingSocio(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isEditingSocio
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingSocio ? 'Ver Perfil' : 'Editar Socio'}
                </button>

                <button
                  onClick={() => setSelectedSocio(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* IF EDITING SOCIO: SHOW EDIT FORM */}
            {isEditingSocio && editSocioForm ? (
              <form onSubmit={handleSaveEditSocio} className="p-6 space-y-4 text-xs">
                <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3 flex items-center gap-2 text-amber-200">
                  <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Modifique los datos del socio y haga clic en <strong>Guardar Cambios</strong>.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Nombres:</label>
                    <input
                      type="text"
                      required
                      value={editSocioForm.nombre}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, nombre: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Apellidos:</label>
                    <input
                      type="text"
                      required
                      value={editSocioForm.apellidos}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, apellidos: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Documento CI / DNI:</label>
                    <input
                      type="text"
                      required
                      value={editSocioForm.dni}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, dni: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">N° de Socio:</label>
                    <input
                      type="text"
                      required
                      value={editSocioForm.numeroSocio}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, numeroSocio: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Categoría de Socio:</label>
                    <select
                      value={editSocioForm.tipoSocio}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, tipoSocio: e.target.value as SocioCategory })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="Pleno">Pleno</option>
                      <option value="Fundador">Fundador</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Cadete">Cadete</option>
                      <option value="Honorario">Honorario (Vitalicio)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Cuota Mensual (Bs):</label>
                    <input
                      type="number"
                      required
                      value={editSocioForm.cuotaMensual}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, cuotaMensual: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Estado de Membresía:</label>
                    <select
                      value={editSocioForm.estadoMembresia}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, estadoMembresia: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Estado de Pago:</label>
                    <select
                      value={editSocioForm.estadoPago}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, estadoPago: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="al_dia">Al Día</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="moroso">Moroso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Correo Electrónico:</label>
                    <input
                      type="email"
                      value={editSocioForm.email}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Teléfono Móvil:</label>
                    <input
                      type="text"
                      value={editSocioForm.telefono}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, telefono: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1 font-semibold">Dirección / Domicilio:</label>
                    <input
                      type="text"
                      value={editSocioForm.direccion}
                      onChange={(e) => setEditSocioForm({ ...editSocioForm, direccion: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingSocio(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE */
              <div className="p-6 space-y-5 text-xs">
                {/* Pending Debt Warning Banner */}
                {(selectedSocio.estadoPago === 'pendiente' || selectedSocio.estadoPago === 'moroso') && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 flex items-center gap-2.5 text-rose-200">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>
                      <strong>Aviso de Tesorería:</strong> Este socio presenta aportación pendiente para {currentMonth} por Bs {selectedSocio.cuotaMensual}.
                    </span>
                  </div>
                )}

                {/* Financial State Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Cuota Social Mensual</span>
                    <div className="text-xl font-bold text-white font-mono mt-0.5">
                      Bs {selectedSocio.cuotaMensual}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Estado de Cuenta</span>
                    <div className={`text-base font-bold mt-1 ${
                      selectedSocio.estadoPago === 'al_dia' ? 'text-emerald-400' : 'text-rose-400 font-extrabold'
                    }`}>
                      {selectedSocio.estadoPago === 'al_dia' ? 'AL DÍA' : 'PENDIENTE'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Último Periodo Abonado</span>
                    <div className="text-sm font-semibold text-slate-200 mt-1">
                      {selectedSocio.ultimoMesPagado}
                    </div>
                  </div>
                </div>

                {/* Personal & Contact Details */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-white">Datos de Contacto y Dirección</h5>
                    <button
                      onClick={() => {
                        setEditSocioForm({ ...selectedSocio });
                        setIsEditingSocio(true);
                      }}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                    >
                      <Edit3 className="w-3 h-3" /> Editar Datos
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <span className="text-slate-400">Email:</span>
                    <span>{selectedSocio.email || '-'}</span>
                    <span className="text-slate-400">Teléfono:</span>
                    <span className="font-mono">{selectedSocio.telefono || '-'}</span>
                    <span className="text-slate-400">Dirección:</span>
                    <span>{selectedSocio.direccion || '-'}</span>
                    <span className="text-slate-400">Estado Membresía:</span>
                    <span className="capitalize font-semibold text-emerald-400">{selectedSocio.estadoMembresia}</span>
                  </div>
                </div>

                {/* Beneficios Asignados */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    Beneficios y Derechos Estatutarios
                  </h5>
                  <ul className="space-y-1.5 text-slate-300">
                    {selectedSocio.beneficios.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Registrar Cobro de Cuota Social */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h5 className="font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Registrar Aporte / Cobro de Cuota Social (en Bolivianos)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Periodo:</label>
                      <select
                        value={payMonth}
                        onChange={(e) => setPayMonth(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                      >
                        <option value="Noviembre 2026">Noviembre 2026</option>
                        <option value="Diciembre 2026">Diciembre 2026</option>
                        <option value="Enero 2027">Enero 2027</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Monto (Bs):</label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Forma de Pago:</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                      >
                        <option value="Transferencia">Transferencia QR</option>
                        <option value="Efectivo">Efectivo en Sede</option>
                        <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          onRecordPayment(selectedSocio.id, payMonth, payAmount, payMethod);
                          const updatedSocio: Socio = {
                            ...selectedSocio,
                            estadoPago: 'al_dia',
                            ultimoMesPagado: payMonth
                          };
                          setSelectedSocio(updatedSocio);
                          alert(`Aporte de Bs ${payAmount} registrado para socio ${selectedSocio.numeroSocio}. Estado actualizado a 'Al Día'.`);
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded transition-colors"
                      >
                        Cobrar Cuota
                      </button>
                    </div>
                  </div>
                </div>

                {/* Historial de Aportaciones */}
                <div className="space-y-2">
                  <h5 className="font-semibold text-white">Historial de Aportes Registrados</h5>
                  {selectedSocio.historialAportaciones.length === 0 ? (
                    <p className="text-slate-400">Sin historial de pagos previos.</p>
                  ) : (
                    <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden">
                      {selectedSocio.historialAportaciones.map((pay) => (
                        <div key={pay.id} className="p-3 bg-slate-950/40 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{pay.concepto}</div>
                            <div className="text-[11px] text-slate-400">
                              {pay.fecha} · {pay.metodo} · Comprobante {pay.comprobante}
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-emerald-400 text-sm">
                            +Bs {pay.monto}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedSocio(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALTA DE NUEVO SOCIO */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Registrar Nuevo Socio en ACADEMIA F.S.
              </h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre:</label>
                  <input
                    type="text"
                    required
                    value={newSocio.nombre}
                    onChange={(e) => setNewSocio({ ...newSocio, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Apellidos:</label>
                  <input
                    type="text"
                    required
                    value={newSocio.apellidos}
                    onChange={(e) => setNewSocio({ ...newSocio, apellidos: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Documento CI / DNI:</label>
                  <input
                    type="text"
                    required
                    value={newSocio.dni}
                    onChange={(e) => setNewSocio({ ...newSocio, dni: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Categoría de Membresía:</label>
                  <select
                    value={newSocio.tipoSocio}
                    onChange={(e) => {
                      const tipo = e.target.value as SocioCategory;
                      const cuota = tipo === 'Fundador' ? 300 : tipo === 'Familiar' ? 200 : tipo === 'Cadete' ? 80 : tipo === 'Honorario' ? 0 : 150;
                      setNewSocio({ ...newSocio, tipoSocio: tipo, cuotaMensual: cuota });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="Pleno">Pleno (Bs 150)</option>
                    <option value="Fundador">Fundador (Bs 300)</option>
                    <option value="Familiar">Familiar (Bs 200)</option>
                    <option value="Cadete">Cadete (Bs 80)</option>
                    <option value="Honorario">Honorario (Vitalicio Bs 0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cuota Mensual (Bs):</label>
                  <input
                    type="number"
                    value={newSocio.cuotaMensual}
                    onChange={(e) => setNewSocio({ ...newSocio, cuotaMensual: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Teléfono Móvil / WhatsApp:</label>
                  <input
                    type="text"
                    value={newSocio.telefono}
                    onChange={(e) => setNewSocio({ ...newSocio, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    value={newSocio.email}
                    onChange={(e) => setNewSocio({ ...newSocio, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Dirección / Residencia:</label>
                  <input
                    type="text"
                    value={newSocio.direccion}
                    onChange={(e) => setNewSocio({ ...newSocio, direccion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  Confirmar Alta de Socio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
