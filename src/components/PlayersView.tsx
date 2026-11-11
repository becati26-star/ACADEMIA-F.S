/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Category, PlayerPosition, CategoryId } from '../types';
import {
  Search,
  Plus,
  HeartPulse,
  Award,
  Calendar,
  AlertCircle,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  X,
  CreditCard,
  Download,
  ArrowRightLeft,
  Edit3,
  Save,
  Check,
  User,
  UserCheck,
  Scale,
  Ruler,
  Droplet
} from 'lucide-react';

interface PlayersViewProps {
  players: Player[];
  categories: Category[];
  selectedPlayer: Player | null;
  onSelectPlayer: (player: Player | null) => void;
  onSavePlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
  onRecordPayment: (playerId: string, mes: string, monto: number, metodo: any) => void;
  onRecordCard: (playerId: string, tipo: 'amarilla' | 'roja', partido: string, minuto: number, motivo: string) => void;
  onExportCSV: () => void;
}

export const PlayersView: React.FC<PlayersViewProps> = ({
  players,
  categories,
  selectedPlayer,
  onSelectPlayer,
  onSavePlayer,
  onDeletePlayer,
  onRecordPayment,
  onRecordCard,
  onExportCSV
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPendingOnly, setFilterPendingOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalTab, setModalTab] = useState<'perfil' | 'medico' | 'stats' | 'pagos' | 'disciplina'>('perfil');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isEditingPlayer, setIsEditingPlayer] = useState<boolean>(false);
  const [editPlayerForm, setEditPlayerForm] = useState<Player | null>(null);

  // Medical inline edit state
  const [medBlood, setMedBlood] = useState<string>('O+');
  const [medWeight, setMedWeight] = useState<number>(68);
  const [medHeight, setMedHeight] = useState<number>(174);
  const [medicalSaveSuccess, setMedicalSaveSuccess] = useState<boolean>(false);

  // Payment form state inside modal
  const [payMonth, setPayMonth] = useState('Noviembre 2026');
  const [payAmount, setPayAmount] = useState(150);
  const [payMethod, setPayMethod] = useState<'Transferencia' | 'Efectivo' | 'Tarjeta' | 'Débito Automático'>('Transferencia');

  // Card form state inside modal
  const [cardType, setCardType] = useState<'amarilla' | 'roja'>('amarilla');
  const [cardMatch, setCardMatch] = useState('vs CRE Futsal');
  const [cardMinute, setCardMinute] = useState(25);
  const [cardReason, setCardReason] = useState('Falta táctica en transición rápida');

  // Calculate age and minor status helper
  const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const birth = new Date(birthDateString);
    if (isNaN(birth.getTime())) return 0;
    const today = new Date('2026-11-11');
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const isMinor = (birthDateString: string): boolean => {
    return calculateAge(birthDateString) < 18;
  };

  // Calculate pending fees for current month (Noviembre 2026)
  const currentMonth = 'Noviembre 2026';
  const pendingPlayers = players.filter((p) => p.estadoCuota === 'pendiente' || p.estadoCuota === 'moroso');
  const totalPendingBs = pendingPlayers.reduce((acc, p) => acc + p.cuotaMensualMonto, 0);

  // New Player Form State (including editable birth date and legal guardian)
  const [newPlayerForm, setNewPlayerForm] = useState({
    nombre: '',
    apellidos: '',
    dorsal: 10,
    dni: '',
    fechaNacimiento: '2009-04-12',
    telefono: '',
    email: '',
    posicion: 'Ala Izquierda' as PlayerPosition,
    piernaHabil: 'Derecha' as 'Derecha' | 'Izquierda' | 'Ambidiestro',
    categoriaId: 'sub-18' as CategoryId,
    cuotaMensualMonto: 150,
    dobleFichaPrimeraC: true,
    grupoSanguineo: 'O+',
    pesoKg: 68,
    alturaCm: 174,
    // Tutor Legal / Responsable
    tutorNombre: '',
    tutorRelacion: 'Madre',
    tutorTelefono: '',
    tutorDni: ''
  });

  const handleOpenPlayer = (p: Player, tab: 'perfil' | 'medico' | 'stats' | 'pagos' | 'disciplina' = 'perfil') => {
    onSelectPlayer(p);
    setPayAmount(p.cuotaMensualMonto);
    setModalTab(tab);
    setIsEditingPlayer(false);
    setEditPlayerForm({
      ...p,
      tutorLegal: p.tutorLegal ? { ...p.tutorLegal } : undefined
    });
    setMedBlood(p.medico.grupoSanguineo || 'O+');
    setMedWeight(p.medico.pesoKg || 70);
    setMedHeight(p.medico.alturaCm || 175);
    setMedicalSaveSuccess(false);
  };

  // Filtered players
  const filteredPlayers = players.filter((p) => {
    if (filterPendingOnly && p.estadoCuota === 'al_dia') {
      return false;
    }

    let matchesCategory = false;
    if (filterCategory === 'all') {
      matchesCategory = true;
    } else if (p.categoriaId === filterCategory) {
      matchesCategory = true;
    } else if (filterCategory === 'primera-c' && (p.dobleFichaPrimeraC || p.categoriasSecundarias?.includes('primera-c'))) {
      matchesCategory = true;
    }

    const q = searchQuery.toLowerCase();
    const matchesQuery =
      p.nombre.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q) ||
      p.dni.toLowerCase().includes(q) ||
      p.posicion.toLowerCase().includes(q) ||
      p.dorsal.toString().includes(q);

    return matchesCategory && matchesQuery;
  });

  // Save Medical only from medical tab
  const handleSaveMedicalOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    const updated: Player = {
      ...selectedPlayer,
      medico: {
        ...selectedPlayer.medico,
        grupoSanguineo: medBlood,
        pesoKg: Number(medWeight),
        alturaCm: Number(medHeight)
      }
    };
    onSavePlayer(updated);
    onSelectPlayer(updated);
    setMedicalSaveSuccess(true);
    setTimeout(() => setMedicalSaveSuccess(false), 2500);
  };

  // Save Full Player edit
  const handleSaveEditPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlayerForm) return;

    const catObj = categories.find((c) => c.id === editPlayerForm.categoriaId) || categories[0];
    const playerMinor = isMinor(editPlayerForm.fechaNacimiento);

    const updated: Player = {
      ...editPlayerForm,
      fechaNacimiento: editPlayerForm.fechaNacimiento,
      equipoNombre: catObj.name,
      categoriasSecundarias: editPlayerForm.dobleFichaPrimeraC ? ['primera-c'] : [],
      tutorLegal: (playerMinor || editPlayerForm.tutorLegal?.nombre) ? {
        nombre: editPlayerForm.tutorLegal?.nombre || 'Tutor Responsable',
        relacion: editPlayerForm.tutorLegal?.relacion || 'Madre',
        telefono: editPlayerForm.tutorLegal?.telefono || editPlayerForm.telefono || '',
        dni: editPlayerForm.tutorLegal?.dni || 'CI-TUTOR'
      } : undefined,
      medico: {
        ...editPlayerForm.medico,
        grupoSanguineo: editPlayerForm.medico.grupoSanguineo,
        pesoKg: Number(editPlayerForm.medico.pesoKg),
        alturaCm: Number(editPlayerForm.medico.alturaCm)
      }
    };

    onSavePlayer(updated);
    onSelectPlayer(updated);
    setMedBlood(updated.medico.grupoSanguineo);
    setMedWeight(updated.medico.pesoKg);
    setMedHeight(updated.medico.alturaCm);
    setIsEditingPlayer(false);
  };

  const handleCreatePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerForm.nombre || !newPlayerForm.apellidos || !newPlayerForm.dni) {
      alert('Por favor complete nombre, apellidos y documento de identidad.');
      return;
    }

    const catObj = categories.find((c) => c.id === newPlayerForm.categoriaId) || categories[0];
    const minorStatus = isMinor(newPlayerForm.fechaNacimiento);

    const playerToSave: Player = {
      id: `ply-${Date.now()}`,
      dorsal: Number(newPlayerForm.dorsal) || 99,
      nombre: newPlayerForm.nombre,
      apellidos: newPlayerForm.apellidos,
      dni: newPlayerForm.dni,
      fechaNacimiento: newPlayerForm.fechaNacimiento || '2009-04-12',
      telefono: newPlayerForm.telefono || '',
      email: newPlayerForm.email || '',
      posicion: newPlayerForm.posicion,
      piernaHabil: newPlayerForm.piernaHabil,
      categoriaId: newPlayerForm.categoriaId,
      equipoNombre: catObj.name,
      categoriasSecundarias: newPlayerForm.dobleFichaPrimeraC ? ['primera-c'] : [],
      dobleFichaPrimeraC: Boolean(newPlayerForm.dobleFichaPrimeraC),
      tutorLegal: (minorStatus || newPlayerForm.tutorNombre) ? {
        nombre: newPlayerForm.tutorNombre || 'Representante / Tutor',
        telefono: newPlayerForm.tutorTelefono || newPlayerForm.telefono || '',
        dni: newPlayerForm.tutorDni || 'DNI-TUTOR',
        relacion: newPlayerForm.tutorRelacion || 'Madre'
      } : undefined,
      medico: {
        grupoSanguineo: newPlayerForm.grupoSanguineo,
        pesoKg: Number(newPlayerForm.pesoKg) || 68,
        alturaCm: Number(newPlayerForm.alturaCm) || 174,
        aptoMedicoVigente: true,
        fechaVencimientoApto: '2027-12-31',
        lesionesPrevias: []
      },
      stats: {
        velocidad: 85,
        resistencia: 85,
        fuerza: 80,
        agilidad: 88,
        controlBalon: 88,
        precisionPase: 87,
        potenciaTiro: 86,
        regate: 89,
        visionJuego: 87,
        posicionamiento: 88,
        tomaDecisiones: 86,
        disciplinaTactica: 90,
        ratingGeneral: 87
      },
      cuotaMensualMonto: Number(newPlayerForm.cuotaMensualMonto) || 150,
      estadoCuota: 'al_dia',
      ultimoMesPagado: 'Noviembre 2026',
      historialPagos: [],
      totalSesiones: 12,
      asistencias: 12,
      llegadasTarde: 0,
      faltasJustificadas: 0,
      faltasInjustificadas: 0,
      porcentajeAsistencia: 100,
      porcentajePuntualidad: 100,
      tarjetasAmarillas: 0,
      tarjetasRojas: 0,
      partidosSuspensionPendientes: 0,
      estadoDisciplinario: 'habilitado',
      historialTarjetas: []
    };

    onSavePlayer(playerToSave);
    setIsCreatingNew(false);
    handleOpenPlayer(playerToSave);
  };

  return (
    <div className="space-y-5">
      {/* Visual Notification Banner for Pending Fees in Current Month */}
      {pendingPlayers.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  Alerta de Cobranzas: {pendingPlayers.length} {pendingPlayers.length === 1 ? 'jugador tiene' : 'jugadores tienen'} cuota pendiente
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {currentMonth}
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                Total adeudado en el mes: <strong className="font-mono text-white">Bs {totalPendingBs}</strong>. Los jugadores resaltados en rojo deben regularizar su aporte para partidos oficiales.
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
              {filterPendingOnly ? 'Ver Todos los Jugadores' : `Ver ${pendingPlayers.length} Pendientes en Rojo`}
            </button>
          </div>
        </div>
      )}

      {/* Top Filter and Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        {/* Category Segmented Filter + Red Pending Dues Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setFilterCategory('all');
              setFilterPendingOnly(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              filterCategory === 'all' && !filterPendingOnly
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Todas ({players.length})
          </button>
          {categories.map((c) => {
            const count = players.filter((p) => p.categoriaId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setFilterCategory(c.id);
                  setFilterPendingOnly(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  filterCategory === c.id && !filterPendingOnly
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}

          {/* Red Highlight Quick Filter Button */}
          {pendingPlayers.length > 0 && (
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
              Cuotas Pendientes ({pendingPlayers.length})
            </button>
          )}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por jugador, DNI, dorsal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={onExportCSV}
            title="Exportar planilla a Excel / CSV"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCreatingNew(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Jugador
          </button>
        </div>
      </div>

      {/* Players Data Grid with Visual Red Highlighting for Pending Fees */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Jugador</th>
                <th className="py-3 px-4">Categoría Principal</th>
                <th className="py-3 px-4 text-center">Doble Ficha (Primera C)</th>
                <th className="py-3 px-4 text-center">Posición Futsal</th>
                <th className="py-3 px-4 text-center">Rendimiento</th>
                <th className="py-3 px-4 text-center">Asist. / Punt.</th>
                <th className="py-3 px-4 text-center">Historial Médico</th>
                <th className="py-3 px-4 text-center">Cuota Nov-2026 (Bs)</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron jugadores registrados en este filtro.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p) => {
                  const isPending = p.estadoCuota === 'pendiente' || p.estadoCuota === 'moroso';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleOpenPlayer(p)}
                      className={`transition-colors cursor-pointer group ${
                        isPending
                          ? 'bg-rose-950/30 border-l-4 border-l-rose-500 hover:bg-rose-900/40'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Name & Dorsal */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold text-xs ${
                            isPending
                              ? 'bg-rose-950 border-rose-600 text-rose-300'
                              : 'bg-slate-800 border-slate-700 text-amber-400'
                          }`}>
                            #{p.dorsal}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold transition-colors ${
                                isPending ? 'text-rose-100 font-bold' : 'text-white group-hover:text-amber-400'
                              }`}>
                                {p.nombre} {p.apellidos}
                              </span>
                              {isPending && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5" /> DEUDA
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              CI/DNI: {p.dni} · {p.fechaNacimiento} ({calculateAge(p.fechaNacimiento)} años)
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Primary Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-200">{p.equipoNombre}</span>
                      </td>

                      {/* Multi-category badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {p.dobleFichaPrimeraC || p.categoriasSecundarias?.includes('primera-c') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 font-medium text-[11px]">
                            <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
                            Habilitado en 1ª C
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">Ficha Única</span>
                        )}
                      </td>

                      {/* Futsal Position */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200 font-medium">
                          {p.posicion}
                        </span>
                      </td>

                      {/* Performance Rating */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono font-bold text-amber-400 tabular-nums">
                          <Award className="w-3 h-3 text-amber-400" />
                          {p.stats.ratingGeneral} pts
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="font-mono text-emerald-400 font-semibold tabular-nums">
                          {p.porcentajeAsistencia}%
                        </div>
                        <div className="text-[10px] text-slate-400 tabular-nums font-mono">
                          {p.porcentajePuntualidad}% puntual
                        </div>
                      </td>

                      {/* Medical: Grupo Sanguíneo, Peso, Estatura */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {p.medico.grupoSanguineo || 'O+'}
                          </span>
                          <span className="text-slate-600">|</span>
                          <span className="text-slate-300 font-mono text-[11px]">
                            {p.medico.pesoKg}kg · {p.medico.alturaCm}cm
                          </span>
                        </div>
                      </td>

                      {/* Cuota en Bolivianos with Red Highlighting when Pending */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className={`font-mono font-bold tabular-nums text-sm ${
                          isPending ? 'text-rose-400 font-extrabold' : 'text-white'
                        }`}>
                          Bs {p.cuotaMensualMonto}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5 ${
                          isPending
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'text-emerald-400'
                        }`}>
                          {isPending ? 'PENDIENTE' : 'AL DÍA'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        {isPending && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPlayer(p, 'pagos');
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
                            handleOpenPlayer(p);
                          }}
                          className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          Ficha & Editar
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

      {/* MODAL 360° DETALLE Y EDICIÓN DE JUGADOR */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-mono font-bold ${
                  selectedPlayer.estadoCuota === 'pendiente' || selectedPlayer.estadoCuota === 'moroso'
                    ? 'bg-rose-950 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-amber-500 text-amber-400'
                }`}>
                  #{selectedPlayer.dorsal}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedPlayer.nombre} {selectedPlayer.apellidos}
                    {selectedPlayer.estadoCuota === 'pendiente' && (
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-bold animate-pulse">
                        Cuota Pendiente
                      </span>
                    )}
                    {isEditingPlayer && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-normal">
                        Modo Edición
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400 font-semibold">{selectedPlayer.posicion}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-medium">{selectedPlayer.equipoNombre}</span>
                    <span>·</span>
                    <span>Nacimiento: {selectedPlayer.fechaNacimiento} ({calculateAge(selectedPlayer.fechaNacimiento)} años)</span>
                    <span>·</span>
                    <span className="text-amber-300 font-mono">
                      {selectedPlayer.medico.grupoSanguineo} ({selectedPlayer.medico.pesoKg}kg / {selectedPlayer.medico.alturaCm}cm)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingPlayer) {
                      setEditPlayerForm({
                        ...selectedPlayer,
                        tutorLegal: selectedPlayer.tutorLegal ? { ...selectedPlayer.tutorLegal } : undefined
                      });
                      setIsEditingPlayer(true);
                    } else {
                      setIsEditingPlayer(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isEditingPlayer
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingPlayer ? 'Ver Ficha' : 'Editar Jugador'}
                </button>
                <button
                  onClick={() => onSelectPlayer(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* IF IN EDIT MODE: SHOW COMPLETE EDIT FORM (INCLUDING FECHA NACIMIENTO & TUTOR LEGAL) */}
            {isEditingPlayer && editPlayerForm ? (
              <form onSubmit={handleSaveEditPlayer} className="p-6 space-y-5 text-xs">
                <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5 flex items-center justify-between text-amber-200">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Modifique los datos personales, fecha de nacimiento, tutor responsable o ficha médica y pulse <strong>Guardar Cambios</strong>.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Nombres:</label>
                    <input
                      type="text"
                      required
                      value={editPlayerForm.nombre}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, nombre: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Apellidos:</label>
                    <input
                      type="text"
                      required
                      value={editPlayerForm.apellidos}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, apellidos: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">CI / Documento:</label>
                    <input
                      type="text"
                      required
                      value={editPlayerForm.dni}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, dni: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>

                  {/* EDITABLE FECHA DE NACIMIENTO */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Fecha de Nacimiento:</label>
                    <input
                      type="date"
                      required
                      value={editPlayerForm.fechaNacimiento}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, fechaNacimiento: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono font-bold"
                    />
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>Edad: <strong className="text-amber-400">{calculateAge(editPlayerForm.fechaNacimiento)} años</strong></span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isMinor(editPlayerForm.fechaNacimiento)
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isMinor(editPlayerForm.fechaNacimiento) ? 'Menor de edad' : 'Mayor de edad'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Dorsal (#):</label>
                    <input
                      type="number"
                      required
                      value={editPlayerForm.dorsal}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, dorsal: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Categoría Principal:</label>
                    <select
                      value={editPlayerForm.categoriaId}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, categoriaId: e.target.value as CategoryId })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="sub-18">Sub-18 Futsal</option>
                      <option value="sub-20">Sub-20 Futsal</option>
                      <option value="primera-c">Primera C Futsal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Posición Futsal:</label>
                    <select
                      value={editPlayerForm.posicion}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, posicion: e.target.value as PlayerPosition })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="Arquero">Arquero</option>
                      <option value="Cierre">Cierre</option>
                      <option value="Ala Izquierda">Ala Izquierda</option>
                      <option value="Ala Derecha">Ala Derecha</option>
                      <option value="Pívot">Pívot</option>
                      <option value="Universal">Universal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Pierna Hábil:</label>
                    <select
                      value={editPlayerForm.piernaHabil}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, piernaHabil: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="Derecha">Derecha</option>
                      <option value="Izquierda">Izquierda</option>
                      <option value="Ambidiestro">Ambidiestro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Celular / WhatsApp Jugador:</label>
                    <input
                      type="text"
                      value={editPlayerForm.telefono}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, telefono: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Cuota Mensual (Bs):</label>
                    <input
                      type="number"
                      value={editPlayerForm.cuotaMensualMonto}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, cuotaMensualMonto: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>
                </div>

                {/* EDITABLE TUTOR LEGAL / RESPONSABLE (Obligatorio si es menor de edad) */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isMinor(editPlayerForm.fechaNacimiento)
                    ? 'bg-slate-950 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Tutor Legal / Responsable del Jugador {isMinor(editPlayerForm.fechaNacimiento) ? '(Menor de 18 años)' : '(Mayor de edad - Opcional)'}
                    </h4>
                    {isMinor(editPlayerForm.fechaNacimiento) ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Obligatorio por minoría de edad ({calculateAge(editPlayerForm.fechaNacimiento)} años)
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {editPlayerForm.tutorLegal?.nombre ? 'Tutor registrado' : 'Titular autónomo (sin tutor requerido)'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Nombre Completo del Tutor:</label>
                      <input
                        type="text"
                        required={isMinor(editPlayerForm.fechaNacimiento)}
                        value={editPlayerForm.tutorLegal?.nombre || ''}
                        onChange={(e) => setEditPlayerForm({
                          ...editPlayerForm,
                          tutorLegal: {
                            nombre: e.target.value,
                            relacion: editPlayerForm.tutorLegal?.relacion || 'Madre',
                            telefono: editPlayerForm.tutorLegal?.telefono || '',
                            dni: editPlayerForm.tutorLegal?.dni || ''
                          }
                        })}
                        placeholder="Nombres y Apellidos"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Parentesco / Relación:</label>
                      <select
                        value={editPlayerForm.tutorLegal?.relacion || 'Madre'}
                        onChange={(e) => setEditPlayerForm({
                          ...editPlayerForm,
                          tutorLegal: {
                            nombre: editPlayerForm.tutorLegal?.nombre || '',
                            relacion: e.target.value,
                            telefono: editPlayerForm.tutorLegal?.telefono || '',
                            dni: editPlayerForm.tutorLegal?.dni || ''
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="Madre">Madre</option>
                        <option value="Padre">Padre</option>
                        <option value="Tutor Legal">Tutor Legal</option>
                        <option value="Apoderado">Apoderado</option>
                        <option value="Familiar">Familiar Responsable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Teléfono / WhatsApp Tutor:</label>
                      <input
                        type="text"
                        required={isMinor(editPlayerForm.fechaNacimiento)}
                        value={editPlayerForm.tutorLegal?.telefono || ''}
                        onChange={(e) => setEditPlayerForm({
                          ...editPlayerForm,
                          tutorLegal: {
                            nombre: editPlayerForm.tutorLegal?.nombre || '',
                            relacion: editPlayerForm.tutorLegal?.relacion || 'Madre',
                            telefono: e.target.value,
                            dni: editPlayerForm.tutorLegal?.dni || ''
                          }
                        })}
                        placeholder="+591 7XX-XXXXX"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">CI / DNI del Tutor:</label>
                      <input
                        type="text"
                        value={editPlayerForm.tutorLegal?.dni || ''}
                        onChange={(e) => setEditPlayerForm({
                          ...editPlayerForm,
                          tutorLegal: {
                            nombre: editPlayerForm.tutorLegal?.nombre || '',
                            relacion: editPlayerForm.tutorLegal?.relacion || 'Madre',
                            telefono: editPlayerForm.tutorLegal?.telefono || '',
                            dni: e.target.value
                          }
                        })}
                        placeholder="Documento del tutor"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Medical History Fields (Grupo Sanguíneo, Peso, Estatura) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    Historial Médico del Jugador (Grupo Sanguíneo, Peso y Estatura)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Grupo Sanguíneo:</label>
                      <select
                        value={editPlayerForm.medico.grupoSanguineo}
                        onChange={(e) => setEditPlayerForm({
                          ...editPlayerForm,
                          medico: { ...editPlayerForm.medico, grupoSanguineo: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((grp) => (
                          <option key={grp} value={grp}>{grp}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Peso (kg):</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={editPlayerForm.medico.pesoKg}
                        onChange={(e) => setEditPlayerForm({
                          ...editPlayerForm,
                          medico: { ...editPlayerForm.medico, pesoKg: Number(e.target.value) }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Estatura (cm):</label>
                      <input
                        type="number"
                        required
                        value={editPlayerForm.medico.alturaCm}
                        onChange={(e) => setEditPlayerForm({
                          ...editPlayerForm,
                          medico: { ...editPlayerForm.medico, alturaCm: Number(e.target.value) }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Multi-category double registration toggle */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="editDobleFicha"
                    checked={editPlayerForm.dobleFichaPrimeraC}
                    onChange={(e) => setEditPlayerForm({ ...editPlayerForm, dobleFichaPrimeraC: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="editDobleFicha" className="cursor-pointer">
                    <span className="font-semibold text-white block">Habilitar Doble Ficha con Primera C</span>
                    <span className="text-[11px] text-slate-400 block">
                      Permite que el entrenador convoque a este jugador en su categoría y en Primera C.
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingPlayer(false)}
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
              <>
                {/* Modal Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-800 px-5 pt-3 bg-slate-950/60 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'perfil', label: 'Datos & Tutor' },
                    { id: 'medico', label: 'Historial Médico' },
                    { id: 'stats', label: 'Rendimiento Futsal' },
                    {
                      id: 'pagos',
                      label: selectedPlayer.estadoCuota === 'pendiente' ? '🔴 Cuotas en Bs (Pendiente)' : 'Cuotas en Bolivianos (Bs)'
                    },
                    { id: 'disciplina', label: 'Tarjetas Futsal' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setModalTab(t.id as any)}
                      className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                        modalTab === t.id
                          ? 'border-amber-500 text-amber-400 font-semibold'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 text-xs">
                  {/* TAB 1: PERFIL & MULTI-CATEGORÍA & TUTOR LEGAL */}
                  {modalTab === 'perfil' && (
                    <div className="space-y-4">
                      {/* Multi-category toggle card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                            Habilitación Cruzada: Jugar en Primera C (Doble Ficha)
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Permite que el entrenador convoque a este jugador tanto en su categoría base como en Primera C oficial de ACADEMIA F.S.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const newStatus = !selectedPlayer.dobleFichaPrimeraC;
                            const updated: Player = {
                              ...selectedPlayer,
                              dobleFichaPrimeraC: newStatus,
                              categoriasSecundarias: newStatus ? ['primera-c'] : []
                            };
                            onSavePlayer(updated);
                            onSelectPlayer(updated);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            selectedPlayer.dobleFichaPrimeraC
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {selectedPlayer.dobleFichaPrimeraC ? 'Habilitado (Activo)' : 'No Habilitado'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white">Información Personal</h4>
                            <button
                              onClick={() => {
                                setEditPlayerForm({
                                  ...selectedPlayer,
                                  tutorLegal: selectedPlayer.tutorLegal ? { ...selectedPlayer.tutorLegal } : undefined
                                });
                                setIsEditingPlayer(true);
                              }}
                              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                            >
                              <Edit3 className="w-3 h-3" /> Editar Datos
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-300">
                            <span className="text-slate-400">CI / DNI:</span>
                            <span className="font-mono text-white">{selectedPlayer.dni}</span>
                            <span className="text-slate-400">Nacimiento:</span>
                            <span className="font-mono font-bold text-amber-300">
                              {selectedPlayer.fechaNacimiento} ({calculateAge(selectedPlayer.fechaNacimiento)} años)
                            </span>
                            <span className="text-slate-400">Condición:</span>
                            <span className="font-semibold text-slate-200">
                              {isMinor(selectedPlayer.fechaNacimiento) ? 'Menor de edad' : 'Mayor de edad'}
                            </span>
                            <span className="text-slate-400">Celular:</span>
                            <span className="font-mono">{selectedPlayer.telefono || '-'}</span>
                            <span className="text-slate-400">Posición Principal:</span>
                            <span className="font-semibold text-amber-400">{selectedPlayer.posicion}</span>
                            <span className="text-slate-400">Pierna Hábil:</span>
                            <span>{selectedPlayer.piernaHabil}</span>
                          </div>
                        </div>

                        {/* TUTOR LEGAL DETALLE */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-emerald-400" />
                              Tutor Legal / Responsable
                            </h4>
                            <button
                              onClick={() => {
                                setEditPlayerForm({
                                  ...selectedPlayer,
                                  tutorLegal: selectedPlayer.tutorLegal ? { ...selectedPlayer.tutorLegal } : undefined
                                });
                                setIsEditingPlayer(true);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                            >
                              <Edit3 className="w-3 h-3" /> Editar Tutor
                            </button>
                          </div>
                          {selectedPlayer.tutorLegal ? (
                            <div className="grid grid-cols-2 gap-2 text-slate-300">
                              <span className="text-slate-400">Nombre Tutor:</span>
                              <span className="font-semibold text-white">{selectedPlayer.tutorLegal.nombre}</span>
                              <span className="text-slate-400">Parentesco:</span>
                              <span className="text-emerald-300 font-medium">{selectedPlayer.tutorLegal.relacion}</span>
                              <span className="text-slate-400">Teléfono:</span>
                              <span className="font-mono">{selectedPlayer.tutorLegal.telefono}</span>
                              <span className="text-slate-400">CI / DNI:</span>
                              <span className="font-mono">{selectedPlayer.tutorLegal.dni || '-'}</span>
                            </div>
                          ) : (
                            <div className="text-slate-400 space-y-1">
                              <p>Mayor de edad (titular autónomo).</p>
                              <p className="text-[11px] text-slate-500">Puede agregar un contacto de tutor pulsando "Editar Tutor".</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: HISTORIAL MÉDICO (SOLO GRUPO SANGUÍNEO, PESO Y ESTATURA) */}
                  {modalTab === 'medico' && (
                    <div className="space-y-5">
                      {/* Top 3 Cards strictly displaying the required medical fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/40 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
                            <Droplet className="w-4 h-4" />
                            <span className="font-semibold text-xs">Grupo Sanguíneo</span>
                          </div>
                          <div className="text-3xl font-bold text-white font-mono mt-1">
                            {selectedPlayer.medico.grupoSanguineo || 'O+'}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Factor sanguíneo registrado</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-sky-900/40 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-sky-400 mb-1">
                            <Scale className="w-4 h-4" />
                            <span className="font-semibold text-xs">Peso Corporal</span>
                          </div>
                          <div className="text-3xl font-bold text-white font-mono mt-1">
                            {selectedPlayer.medico.pesoKg} <span className="text-base text-slate-400 font-normal">kg</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Control de pesaje para futsal</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                            <Ruler className="w-4 h-4" />
                            <span className="font-semibold text-xs">Estatura</span>
                          </div>
                          <div className="text-3xl font-bold text-white font-mono mt-1">
                            {selectedPlayer.medico.alturaCm} <span className="text-base text-slate-400 font-normal">cm</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Talla antropométrica</p>
                        </div>
                      </div>

                      {/* Direct Editing Form for Medical History */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                              <HeartPulse className="w-4 h-4 text-rose-400" />
                              Editar Ficha Médica de {selectedPlayer.nombre}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Actualice directamente el grupo sanguíneo, peso y estatura de este jugador.
                            </p>
                          </div>
                          {medicalSaveSuccess && (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded text-xs">
                              <Check className="w-3.5 h-3.5" /> ¡Guardado correctamente!
                            </span>
                          )}
                        </div>

                        <form onSubmit={handleSaveMedicalOnly} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="text-slate-400 block mb-1 font-semibold">Grupo Sanguíneo:</label>
                            <select
                              value={medBlood}
                              onChange={(e) => setMedBlood(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                            >
                              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((grp) => (
                                <option key={grp} value={grp}>{grp}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-slate-400 block mb-1 font-semibold">Peso (kg):</label>
                            <input
                              type="number"
                              step="0.5"
                              required
                              value={medWeight}
                              onChange={(e) => setMedWeight(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 block mb-1 font-semibold">Estatura (cm):</label>
                            <input
                              type="number"
                              required
                              value={medHeight}
                              onChange={(e) => setMedHeight(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                            />
                          </div>

                          <div>
                            <button
                              type="submit"
                              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                              Guardar Ficha Médica
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: STATS */}
                  {modalTab === 'stats' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-400">Calificación Técnica en Cancha</span>
                          <div className="text-3xl font-bold text-amber-400 font-mono mt-0.5">
                            {selectedPlayer.stats.ratingGeneral} / 100
                          </div>
                        </div>
                        <div className="text-right text-slate-400">
                          <div>Asistencia: <span className="text-emerald-400 font-bold">{selectedPlayer.porcentajeAsistencia}%</span></div>
                          <div>Puntualidad: <span className="text-sky-400 font-bold">{selectedPlayer.porcentajePuntualidad}%</span></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                          <h5 className="font-bold text-sky-400 uppercase text-[11px]">1. Físico Futsal</h5>
                          {[
                            { label: 'Velocidad', val: selectedPlayer.stats.velocidad },
                            { label: 'Resistencia', val: selectedPlayer.stats.resistencia },
                            { label: 'Fuerza', val: selectedPlayer.stats.fuerza },
                            { label: 'Agilidad', val: selectedPlayer.stats.agilidad }
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between">
                              <span className="text-slate-400">{item.label}</span>
                              <span className="font-mono text-white font-bold">{item.val}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                          <h5 className="font-bold text-emerald-400 uppercase text-[11px]">2. Técnica con Balón</h5>
                          {[
                            { label: 'Control', val: selectedPlayer.stats.controlBalon },
                            { label: 'Pase corto/rápido', val: selectedPlayer.stats.precisionPase },
                            { label: 'Potencia disparo', val: selectedPlayer.stats.potenciaTiro },
                            { label: 'Regate 1vs1', val: selectedPlayer.stats.regate }
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between">
                              <span className="text-slate-400">{item.label}</span>
                              <span className="font-mono text-white font-bold">{item.val}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                          <h5 className="font-bold text-amber-400 uppercase text-[11px]">3. Táctica Futsal</h5>
                          {[
                            { label: 'Visión de juego', val: selectedPlayer.stats.visionJuego },
                            { label: 'Posicionamiento', val: selectedPlayer.stats.posicionamiento },
                            { label: 'Toma decisiones', val: selectedPlayer.stats.tomaDecisiones },
                            { label: 'Disciplina', val: selectedPlayer.stats.disciplinaTactica }
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between">
                              <span className="text-slate-400">{item.label}</span>
                              <span className="font-mono text-white font-bold">{item.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CUOTAS EN BOLIVIANOS */}
                  {modalTab === 'pagos' && (
                    <div className="space-y-4">
                      {selectedPlayer.estadoCuota === 'pendiente' && (
                        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 flex items-center justify-between text-rose-200">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                            <span>
                              <strong>Aviso de Cobranza:</strong> Este jugador mantiene una cuota impaga para {currentMonth} por Bs {selectedPlayer.cuotaMensualMonto}.
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Cuota Mensual</span>
                          <div className="text-xl font-bold text-white font-mono mt-0.5">
                            Bs {selectedPlayer.cuotaMensualMonto}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Estado</span>
                          <div className={`text-base font-bold mt-1 ${
                            selectedPlayer.estadoCuota === 'al_dia' ? 'text-emerald-400' : 'text-rose-400 font-extrabold'
                          }`}>
                            {selectedPlayer.estadoCuota === 'al_dia' ? 'AL DÍA' : 'PENDIENTE'}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Último Mes Pagado</span>
                          <div className="text-sm font-semibold text-slate-200 mt-1">
                            {selectedPlayer.ultimoMesPagado}
                          </div>
                        </div>
                      </div>

                      {/* Payment form in Bolivianos */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h5 className="font-semibold text-white flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          Registrar Cobro de Cuota Deportiva (en Bolivianos)
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
                              <option value="Tarjeta">Tarjeta Débito</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                onRecordPayment(selectedPlayer.id, payMonth, payAmount, payMethod);
                                const updatedPlayer: Player = {
                                  ...selectedPlayer,
                                  estadoCuota: 'al_dia',
                                  ultimoMesPagado: payMonth
                                };
                                onSelectPlayer(updatedPlayer);
                                alert(`Cobro de Bs ${payAmount} registrado para ${selectedPlayer.nombre}. Estado actualizado a 'Al Día'.`);
                              }}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded transition-colors"
                            >
                              Cobrar Cuota
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Payment history */}
                      <div className="space-y-2">
                        <h5 className="font-semibold text-white">Historial de Pagos</h5>
                        {selectedPlayer.historialPagos.length === 0 ? (
                          <p className="text-slate-400">Sin pagos registrados previamente.</p>
                        ) : (
                          selectedPlayer.historialPagos.map((pay) => {
                            const parts = (pay.fecha || '').split('-');
                            const dia = parts[2] || '10';
                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                            const mes = parts[1] ? meses[parseInt(parts[1], 10) - 1] || 'Noviembre' : 'Noviembre';
                            const anio = parts[0] || '2026';

                            return (
                              <div key={pay.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{pay.concepto}</span>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                      {pay.comprobante}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                    <span>Fecha de pago:</span>
                                    <strong className="text-amber-300 font-mono">Día {dia}</strong> ·
                                    <strong className="text-sky-300 font-mono">{mes}</strong> ·
                                    <strong className="text-emerald-300 font-mono">{anio}</strong>
                                    <span className="text-slate-500">({pay.metodo})</span>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-emerald-400 text-sm">
                                  +Bs {pay.monto}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: DISCIPLINA */}
                  {modalTab === 'disciplina' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/60">
                          <span className="text-amber-300">Amarillas</span>
                          <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{selectedPlayer.tarjetasAmarillas}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/60">
                          <span className="text-rose-300">Rojas</span>
                          <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">{selectedPlayer.tarjetasRojas}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Fechas Suspensión</span>
                          <div className="text-xl font-bold text-white font-mono mt-0.5">{selectedPlayer.partidosSuspensionPendientes}</div>
                        </div>
                      </div>

                      {/* Form to Apply Card in Futsal */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h5 className="font-semibold text-white">Registrar Sanción en Partido de Futsal</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-slate-400 block mb-1">Tarjeta:</label>
                            <select
                              value={cardType}
                              onChange={(e) => setCardType(e.target.value as any)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                            >
                              <option value="amarilla">🟨 Amarilla Futsal</option>
                              <option value="roja">🟥 Roja Directa / Doble Amarilla</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">Partido / Rival:</label>
                            <input
                              type="text"
                              value={cardMatch}
                              onChange={(e) => setCardMatch(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">Minuto:</label>
                            <input
                              type="number"
                              value={cardMinute}
                              onChange={(e) => setCardMinute(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                onRecordCard(selectedPlayer.id, cardType, cardMatch, cardMinute, cardReason);
                                alert(`Sanción aplicada.`);
                              }}
                              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded"
                            >
                              Aplicar Sanción
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm(`¿Confirma eliminar a ${selectedPlayer.nombre} ${selectedPlayer.apellidos}?`)) {
                    onDeletePlayer(selectedPlayer.id);
                    onSelectPlayer(null);
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                Eliminar Registro
              </button>
              <button
                onClick={() => onSelectPlayer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALTA NUEVO JUGADOR (CON FECHA NACIMIENTO Y TUTOR LEGAL EDITABLE PARA MENORES) */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  Registrar Jugador de Futsal en ACADEMIA F.S.
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete los datos personales y deportivos. Para menores de edad se activará el registro del tutor.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlayerSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre:</label>
                  <input
                    type="text"
                    required
                    value={newPlayerForm.nombre}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Apellidos:</label>
                  <input
                    type="text"
                    required
                    value={newPlayerForm.apellidos}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, apellidos: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">CI / Documento de Identidad:</label>
                  <input
                    type="text"
                    required
                    value={newPlayerForm.dni}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, dni: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>

                {/* EDITABLE FECHA DE NACIMIENTO */}
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Fecha de Nacimiento:</label>
                  <input
                    type="date"
                    required
                    value={newPlayerForm.fechaNacimiento}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, fechaNacimiento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono font-bold"
                  />
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <span>Edad: <strong className="text-amber-400">{calculateAge(newPlayerForm.fechaNacimiento)} años</strong></span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isMinor(newPlayerForm.fechaNacimiento)
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isMinor(newPlayerForm.fechaNacimiento) ? 'Menor de edad (Requiere Tutor)' : 'Mayor de edad'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Dorsal:</label>
                  <input
                    type="number"
                    value={newPlayerForm.dorsal}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, dorsal: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Categoría Principal:</label>
                  <select
                    value={newPlayerForm.categoriaId}
                    onChange={(e) => {
                      const cat = e.target.value as CategoryId;
                      const defaultFee = cat === 'primera-c' ? 220 : cat === 'sub-20' ? 180 : 150;
                      setNewPlayerForm({
                        ...newPlayerForm,
                        categoriaId: cat,
                        cuotaMensualMonto: defaultFee
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="sub-18">Sub-18 Futsal</option>
                    <option value="sub-20">Sub-20 Futsal</option>
                    <option value="primera-c">Primera C Futsal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Posición en Cancha:</label>
                  <select
                    value={newPlayerForm.posicion}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, posicion: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="Arquero">Arquero</option>
                    <option value="Cierre">Cierre</option>
                    <option value="Ala Izquierda">Ala Izquierda</option>
                    <option value="Ala Derecha">Ala Derecha</option>
                    <option value="Pívot">Pívot</option>
                    <option value="Universal">Universal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cuota Mensual (Bs):</label>
                  <input
                    type="number"
                    value={newPlayerForm.cuotaMensualMonto}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, cuotaMensualMonto: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Celular / WhatsApp del Jugador:</label>
                  <input
                    type="text"
                    value={newPlayerForm.telefono}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, telefono: e.target.value })}
                    placeholder="+591 7XX-XXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* SECCIÓN TUTOR LEGAL / RESPONSABLE (SE ACTIVA OBLIGATORIAMENTE SI ES MENOR DE EDAD) */}
              {isMinor(newPlayerForm.fechaNacimiento) ? (
                <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400 block flex items-center gap-1.5 text-sm">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Tutor Legal / Responsable (Obligatorio para menor de edad)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Edad: {calculateAge(newPlayerForm.fechaNacimiento)} años
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Al ser menor de 18 años, la Asociación Departamental exige registrar los datos y contacto del padre, madre o apoderado legal.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px] font-semibold">Nombre Completo del Tutor:</label>
                      <input
                        type="text"
                        required
                        value={newPlayerForm.tutorNombre}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, tutorNombre: e.target.value })}
                        placeholder="Ej: Carmen Flores Pérez"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px] font-semibold">Parentesco / Relación:</label>
                      <select
                        value={newPlayerForm.tutorRelacion}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, tutorRelacion: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="Madre">Madre</option>
                        <option value="Padre">Padre</option>
                        <option value="Tutor Legal">Tutor Legal</option>
                        <option value="Apoderado">Apoderado</option>
                        <option value="Familiar">Familiar Responsable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px] font-semibold">Teléfono / WhatsApp del Tutor:</label>
                      <input
                        type="text"
                        required
                        value={newPlayerForm.tutorTelefono}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, tutorTelefono: e.target.value })}
                        placeholder="Ej: +591 765-43210"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px] font-semibold">CI / Documento del Tutor:</label>
                      <input
                        type="text"
                        value={newPlayerForm.tutorDni}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, tutorDni: e.target.value })}
                        placeholder="Ej: 5819020 LP"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between text-slate-400 text-[11px]">
                  <span>El jugador es mayor de edad ({calculateAge(newPlayerForm.fechaNacimiento)} años). No requiere tutor legal obligatorio.</span>
                </div>
              )}

              {/* Medical History Section in Creation */}
              <div className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-lg space-y-2">
                <span className="font-semibold text-amber-400 block flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  Historial Médico (Grupo Sanguíneo, Peso y Estatura)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Grupo Sanguíneo:</label>
                    <select
                      value={newPlayerForm.grupoSanguineo}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, grupoSanguineo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono font-bold"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((grp) => (
                        <option key={grp} value={grp}>{grp}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Peso (kg):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newPlayerForm.pesoKg}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, pesoKg: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Estatura (cm):</label>
                    <input
                      type="number"
                      value={newPlayerForm.alturaCm}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, alturaCm: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-category double registration toggle */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dobleFicha"
                  checked={newPlayerForm.dobleFichaPrimeraC}
                  onChange={(e) => setNewPlayerForm({ ...newPlayerForm, dobleFichaPrimeraC: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <label htmlFor="dobleFicha" className="cursor-pointer">
                  <span className="font-semibold text-white block">Habilitar Doble Ficha con Primera C</span>
                  <span className="text-[11px] text-slate-400 block">
                    Permite que el DT lo convoque indistintamente entre su categoría y Primera C de ascenso.
                  </span>
                </label>
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
                  Registrar Jugador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
