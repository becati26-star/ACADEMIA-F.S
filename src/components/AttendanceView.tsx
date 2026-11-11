/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Category, AttendanceRecord } from '../types';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  MapPin,
  Check,
  AlertTriangle,
  UserX,
  History,
  Save,
  CheckCircle2,
  Users
} from 'lucide-react';

interface AttendanceViewProps {
  players: Player[];
  categories: Category[];
  attendances: AttendanceRecord[];
  onSaveAttendance: (record: AttendanceRecord) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  players,
  categories,
  attendances,
  onSaveAttendance
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('sub-20');
  const [sessionType, setSessionType] = useState<'entrenamiento' | 'partido'>('entrenamiento');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState<string>('19:00');
  const [sessionLocation, setSessionLocation] = useState<string>('Coliseo Municipal - Cancha Parquet 1');
  const [rivalName, setRivalName] = useState<string>('Club Futsal CRE (Filial)');
  const [coachName, setCoachName] = useState<string>('Prof. Diego Vera');
  const [viewMode, setViewMode] = useState<'take' | 'history'>('take');

  // Filter players by selected category
  const categoryPlayers = players.filter((p) => p.categoriaId === selectedCategory);

  // Attendance state dictionary: playerId -> { estado, minutosTarde, observacion }
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { estado: 'presente' | 'tarde' | 'justificado' | 'ausente'; minutosTarde: number; observacion: string }>
  >(() => {
    const initial: Record<string, any> = {};
    categoryPlayers.forEach((p) => {
      initial[p.id] = { estado: 'presente', minutosTarde: 0, observacion: '' };
    });
    return initial;
  });

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  const setPlayerStatus = (
    playerId: string,
    estado: 'presente' | 'tarde' | 'justificado' | 'ausente',
    minutosTarde = 0
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { observacion: '' }),
        estado,
        minutosTarde: estado === 'tarde' ? (minutosTarde || 10) : 0
      }
    }));
  };

  const setPlayerObservation = (playerId: string, observacion: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { estado: 'presente', minutosTarde: 0 }),
        observacion
      }
    }));
  };

  const markAllPresent = () => {
    const updated: Record<string, any> = {};
    categoryPlayers.forEach((p) => {
      updated[p.id] = { estado: 'presente', minutosTarde: 0, observacion: '' };
    });
    setAttendanceState(updated);
  };

  // Compute live session metrics
  const totalCount = categoryPlayers.length;
  const presentCount = categoryPlayers.filter((p) => {
    const s = attendanceState[p.id]?.estado;
    return s === 'presente' || s === 'tarde';
  }).length;
  const onTimeCount = categoryPlayers.filter((p) => attendanceState[p.id]?.estado === 'presente').length;
  const sessionAttendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '100';
  const sessionPunctualityRate = presentCount > 0 ? ((onTimeCount / presentCount) * 100).toFixed(1) : '100';

  const handleSaveSession = () => {
    const detalles = categoryPlayers.map((p) => {
      const record = attendanceState[p.id] || { estado: 'presente', minutosTarde: 0, observacion: '' };
      return {
        jugadorId: p.id,
        estado: record.estado,
        minutosTarde: record.minutosTarde,
        observacion: record.observacion
      };
    });

    const newSession: AttendanceRecord = {
      id: `att-${Date.now()}`,
      fecha: sessionDate,
      hora: sessionTime,
      tipo: sessionType,
      categoriaId: selectedCategory as any,
      equipoNombre: currentCategoryObj.name,
      rival: sessionType === 'partido' ? rivalName : undefined,
      lugar: sessionLocation,
      entrenadorNombre: coachName,
      detalles
    };

    onSaveAttendance(newSession);
    alert(`Sesión de asistencia guardada correctamente para ${currentCategoryObj.name}. Las métricas de los jugadores han sido actualizadas.`);
    setViewMode('history');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Mode Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Módulo del Cuerpo Técnico &amp; Preparación Física
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Control de Puntualidad y Presentismo</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Planilla de Asistencia a Entrenamientos y Partidos
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('take')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === 'take'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Tomar Asistencia
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === 'history'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            Historial de Sesiones ({attendances.length})
          </button>
        </div>
      </div>

      {viewMode === 'take' ? (
        <div className="space-y-5">
          {/* Session Parameters Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {/* Category */}
              <div>
                <label className="text-slate-400 block mb-1">Categoría / Plantel:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    // Reset local states for the new category
                    const pl = players.filter((p) => p.categoriaId === e.target.value);
                    const init: Record<string, any> = {};
                    pl.forEach((p) => {
                      init[p.id] = { estado: 'presente', minutosTarde: 0, observacion: '' };
                    });
                    setAttendanceState(init);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Sesión:</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-semibold"
                >
                  <option value="entrenamiento">⚽ Entrenamiento Táctico/Físico</option>
                  <option value="partido">🏆 Partido Oficial de Torneo</option>
                </select>
              </div>

              {/* Date & Time */}
              <div>
                <label className="text-slate-400 block mb-1">Fecha:</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Horario:</label>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-slate-400 block mb-1">Lugar de Convocatoria:</label>
                <input
                  type="text"
                  value={sessionLocation}
                  onChange={(e) => setSessionLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>
            </div>

            {sessionType === 'partido' && (
              <div className="pt-2 border-t border-slate-800 flex items-center gap-3 text-xs">
                <span className="text-slate-400">Rival del Partido:</span>
                <input
                  type="text"
                  value={rivalName}
                  onChange={(e) => setRivalName(e.target.value)}
                  placeholder="Nombre del Club Rival"
                  className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-white flex-1 max-w-sm"
                />
              </div>
            )}
          </div>

          {/* Quick Metrics & Bulk Actions Banner */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-400 block">Plantel Convocado:</span>
                <span className="text-lg font-bold text-white font-mono">{totalCount} jugadores</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-400 block">Presentes:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{presentCount}</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-400 block">% Asistencia Sesión:</span>
                <span className="text-lg font-bold text-sky-400 font-mono tabular-nums">{sessionAttendanceRate}%</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-400 block">% Puntualidad:</span>
                <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">{sessionPunctualityRate}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={markAllPresent}
                className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Marcar Todos Presentes
              </button>
              <button
                onClick={handleSaveSession}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar Sesión y Actualizar Rendimiento
              </button>
            </div>
          </div>

          {/* Player Attendance Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-800">
              {categoryPlayers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No hay jugadores registrados en la categoría {currentCategoryObj.name}.
                </div>
              ) : (
                categoryPlayers.map((player) => {
                  const state = attendanceState[player.id] || {
                    estado: 'presente',
                    minutosTarde: 0,
                    observacion: ''
                  };

                  return (
                    <div
                      key={player.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Player Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-amber-500/50 flex items-center justify-center font-mono font-bold text-amber-400 text-sm shrink-0">
                          #{player.dorsal}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>{player.nombre} {player.apellidos}</span>
                            <span className="text-xs text-slate-400 font-normal">({player.posicion})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                            <span>Historial: {player.porcentajeAsistencia}% asistencia</span>
                            <span>·</span>
                            <span>·</span>
                            <span className="text-amber-300 font-sans">
                              {player.medico.grupoSanguineo} ({player.medico.pesoKg}kg)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Selector Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => setPlayerStatus(player.id, 'presente')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                            state.estado === 'presente'
                              ? 'bg-emerald-600 text-white font-bold shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Presente
                        </button>

                        <button
                          onClick={() => setPlayerStatus(player.id, 'tarde', state.minutosTarde || 10)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                            state.estado === 'tarde'
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Tarde
                        </button>

                        <button
                          onClick={() => setPlayerStatus(player.id, 'justificado')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                            state.estado === 'justificado'
                              ? 'bg-sky-600 text-white font-bold shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Justificado
                        </button>

                        <button
                          onClick={() => setPlayerStatus(player.id, 'ausente')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                            state.estado === 'ausente'
                              ? 'bg-rose-600 text-white font-bold shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Ausente
                        </button>
                      </div>

                      {/* Detail inputs for late arrival or notes */}
                      <div className="flex items-center gap-2 text-xs">
                        {state.estado === 'tarde' && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-[11px]">Min:</span>
                            <input
                              type="number"
                              min={1}
                              max={90}
                              value={state.minutosTarde}
                              onChange={(e) => setPlayerStatus(player.id, 'tarde', Number(e.target.value))}
                              className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-white font-mono text-center"
                            />
                          </div>
                        )}

                        <input
                          type="text"
                          placeholder="Observación (motivo, lesión, aviso...)"
                          value={state.observacion}
                          onChange={(e) => setPlayerObservation(player.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white text-xs w-48 focus:w-60 transition-all placeholder-slate-500"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* HISTORIAL DE SESIONES DE ASISTENCIA */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">
              Registro Histórico de Sesiones de Control
            </h3>
            {attendances.length === 0 ? (
              <p className="text-xs text-slate-400">Sin sesiones registradas en el archivo.</p>
            ) : (
              <div className="space-y-3">
                {attendances.map((att) => {
                  const presentesCount = att.detalles.filter(
                    (d) => d.estado === 'presente' || d.estado === 'tarde'
                  ).length;
                  const total = att.detalles.length;
                  const rate = total > 0 ? ((presentesCount / total) * 100).toFixed(1) : '100';

                  return (
                    <div
                      key={att.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {att.tipo === 'partido' ? `🏆 Partido vs ${att.rival || 'Rival'}` : '⚽ Entrenamiento'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-semibold text-[11px]">
                              {att.equipoNombre}
                            </span>
                          </div>
                          <div className="text-slate-400 flex items-center gap-2 mt-1">
                            <span>{att.fecha} a las {att.hora}</span>
                            <span>·</span>
                            <span>{att.lugar}</span>
                            <span>·</span>
                            <span>DT: {att.entrenadorNombre}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-[11px] text-slate-400">Presentismo</span>
                            <div className="text-sm font-bold text-emerald-400 font-mono">
                              {rate}% ({presentesCount}/{total})
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Attendee Badges List */}
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {att.detalles.map((d) => {
                          const pl = players.find((p) => p.id === d.jugadorId);
                          if (!pl) return null;
                          return (
                            <span
                              key={d.jugadorId}
                              className={`px-2 py-0.5 rounded text-[11px] border font-mono flex items-center gap-1 ${
                                d.estado === 'presente'
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60'
                                  : d.estado === 'tarde'
                                  ? 'bg-amber-950/40 text-amber-300 border-amber-900/60'
                                  : d.estado === 'justificado'
                                  ? 'bg-sky-950/40 text-sky-300 border-sky-900/60'
                                  : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                              }`}
                            >
                              <span>#{pl.dorsal} {pl.nombre}</span>
                              <span className="text-[10px] opacity-80">
                                ({d.estado === 'tarde' ? `+${d.minutosTarde}m` : d.estado})
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
