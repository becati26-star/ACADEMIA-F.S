/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { FounderMember, HistoryMilestone, TeamHistory, UserRole } from '../types';
import { CLUB_INFO } from '../data/mockData';
import {
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  RotateCcw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';

interface TeamHistoryViewProps {
  teamHistory: TeamHistory;
  activeRole: UserRole;
  onSaveHistory: (updated: TeamHistory) => { success: boolean; error?: string };
  onResetHistory: () => { success: boolean; error?: string };
}

export const TeamHistoryView: React.FC<TeamHistoryViewProps> = ({
  teamHistory,
  activeRole,
  onSaveHistory,
  onResetHistory
}) => {
  const isAdmin = activeRole.role === 'administrador';

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TeamHistory>(teamHistory);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync draft when external teamHistory updates or role switches
  useEffect(() => {
    setDraft(teamHistory);
  }, [teamHistory]);

  useEffect(() => {
    if (!isAdmin) {
      setIsEditing(false);
    }
  }, [isAdmin]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleStartEdit = () => {
    if (!isAdmin) return;
    setDraft(JSON.parse(JSON.stringify(teamHistory)));
    setIsEditing(true);
    setFeedback(null);
  };

  const handleCancelEdit = () => {
    setDraft(teamHistory);
    setIsEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('error', 'Solo el Administrador puede editar la Historia del Equipo.');
      return;
    }

    const cleanedFounders = draft.fundadores.filter((f) => f.nombre.trim() !== '');
    const cleanedMilestones = draft.hitos.filter((h) => h.titulo.trim() !== '' || h.anio.trim() !== '');

    const res = onSaveHistory({
      ...draft,
      fundadores: cleanedFounders,
      hitos: cleanedMilestones
    });

    if (res.success) {
      setIsEditing(false);
      showFeedback(
        'success',
        'Historia del Equipo actualizada. Los cambios ya son visibles para el Presidente y el Director Técnico.'
      );
    } else {
      showFeedback('error', res.error || 'No se pudo guardar la historia.');
    }
  };

  const handleReset = () => {
    if (!isAdmin) return;
    const res = onResetHistory();
    if (res.success) {
      setIsEditing(false);
      showFeedback('success', 'Historia del Equipo restaurada a la versión fundacional.');
    } else {
      showFeedback('error', res.error || 'No se pudo restaurar.');
    }
  };

  // Founders CRUD inside draft
  const handleAddFounder = () => {
    const newFounder: FounderMember = {
      id: `fnd-${Date.now()}`,
      nombre: '',
      cargoFundador: 'Miembro Fundador',
      anioIngreso: '2018',
      aporte: ''
    };
    setDraft((prev) => ({ ...prev, fundadores: [...prev.fundadores, newFounder] }));
  };

  const handleUpdateFounder = (id: string, field: keyof FounderMember, value: string) => {
    setDraft((prev) => ({
      ...prev,
      fundadores: prev.fundadores.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    }));
  };

  const handleRemoveFounder = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      fundadores: prev.fundadores.filter((f) => f.id !== id)
    }));
  };

  // Milestones CRUD inside draft
  const handleAddMilestone = () => {
    const newHito: HistoryMilestone = {
      id: `hit-${Date.now()}`,
      anio: '2026',
      titulo: '',
      descripcion: ''
    };
    setDraft((prev) => ({ ...prev, hitos: [...prev.hitos, newHito] }));
  };

  const handleUpdateMilestone = (id: string, field: keyof HistoryMilestone, value: string) => {
    setDraft((prev) => ({
      ...prev,
      hitos: prev.hitos.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    }));
  };

  const handleRemoveMilestone = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      hitos: prev.hitos.filter((h) => h.id !== id)
    }));
  };

  const currentData = isEditing ? draft : teamHistory;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[#050507] border border-amber-500/60 p-1 flex items-center justify-center shrink-0">
            <img
              src={CLUB_INFO.crestUrl}
              alt="Escudo Oficial ACADEMIA F.S."
              className="w-full h-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-amber-400">Identidad Institucional</span>
              <span aria-hidden="true">·</span>
              <span>Fundado: {currentData.fechaFundacion}</span>
              <span aria-hidden="true">·</span>
              <span>Última actualización: {teamHistory.ultimaEdicionFecha}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              HISTORIA DEL EQUIPO
            </h1>
            <p className="text-xs text-slate-400">
              {currentData.nombreClub} · {currentData.ciudadOrigen}
            </p>
          </div>
        </div>

        {/* Strict Admin-Only Edit Controls vs Read-Only Indicator */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isAdmin ? (
            isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Original
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="team-history-edit-form"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                Editar Historia del Equipo
              </button>
            )
          ) : (
            <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Solo lectura · Edición exclusiva del Administrador</span>
            </div>
          )}
        </div>
      </div>

      {/* Inline Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            feedback.type === 'error'
              ? 'bg-rose-950/80 border-rose-600 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="opacity-75 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ADMIN EDIT MODE FORM */}
      {isAdmin && isEditing ? (
        <form id="team-history-edit-form" onSubmit={handleSave} className="space-y-6">
          {/* General Founding Details */}
          <section className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen className="w-4 h-4" />
              Datos Generales y Cómo se Creó el Equipo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre Oficial del Club:</label>
                <input
                  type="text"
                  required
                  value={draft.nombreClub}
                  onChange={(e) => setDraft({ ...draft, nombreClub: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Fecha de Fundación:</label>
                <input
                  type="text"
                  required
                  value={draft.fechaFundacion}
                  onChange={(e) => setDraft({ ...draft, fechaFundacion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Ciudad / Sede / Afiliación:</label>
                <input
                  type="text"
                  required
                  value={draft.ciudadOrigen}
                  onChange={(e) => setDraft({ ...draft, ciudadOrigen: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Lema Fundacional:</label>
                <input
                  type="text"
                  required
                  value={draft.lemaFundacional}
                  onChange={(e) => setDraft({ ...draft, lemaFundacional: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1">
                Cómo se creó el equipo (Relato de Fundación):
              </label>
              <textarea
                rows={6}
                required
                value={draft.comoSeCreo}
                onChange={(e) => setDraft({ ...draft, comoSeCreo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1">Misión Institucional:</label>
              <textarea
                rows={3}
                value={draft.misionInstitucional}
                onChange={(e) => setDraft({ ...draft, misionInstitucional: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>
          </section>

          {/* Editable Founders Section */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Fundadores del Equipo ({draft.fundadores.length})
              </h2>
              <button
                type="button"
                onClick={handleAddFounder}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Fundador
              </button>
            </div>

            <div className="space-y-3">
              {draft.fundadores.map((f, index) => (
                <div
                  key={f.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-400 font-bold">Fundador #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFounder(f.id)}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Nombre Completo:</label>
                      <input
                        type="text"
                        required
                        value={f.nombre}
                        onChange={(e) => handleUpdateFounder(f.id, 'nombre', e.target.value)}
                        placeholder="Nombre del fundador"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Cargo / Rol Fundador:</label>
                      <input
                        type="text"
                        value={f.cargoFundador}
                        onChange={(e) => handleUpdateFounder(f.id, 'cargoFundador', e.target.value)}
                        placeholder="Ej. Presidente Fundador"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Año:</label>
                      <input
                        type="text"
                        value={f.anioIngreso}
                        onChange={(e) => handleUpdateFounder(f.id, 'anioIngreso', e.target.value)}
                        placeholder="2018"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Reseña / Aporte a la creación:</label>
                    <textarea
                      rows={2}
                      value={f.aporte}
                      onChange={(e) => handleUpdateFounder(f.id, 'aporte', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Editable Historical Milestones */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Hitos Históricos del Club ({draft.hitos.length})
              </h2>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Hito
              </button>
            </div>

            <div className="space-y-3">
              {draft.hitos.map((h) => (
                <div
                  key={h.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-slate-400 mb-1">Año:</label>
                      <input
                        type="text"
                        value={h.anio}
                        onChange={(e) => handleUpdateMilestone(h.id, 'anio', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-400 font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 mb-1">Título del Hito:</label>
                      <input
                        type="text"
                        value={h.titulo}
                        onChange={(e) => handleUpdateMilestone(h.id, 'titulo', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(h.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-900/60 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Quitar
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Descripción:</label>
                    <textarea
                      rows={2}
                      value={h.descripcion}
                      onChange={(e) => handleUpdateMilestone(h.id, 'descripcion', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </form>
      ) : (
        /* READ-ONLY VIEW (VISIBLE TO ADMINISTRADOR, PRESIDENTE & DIRECTOR TÉCNICO) */
        <div className="space-y-6">
          {/* Quick Founding Facts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Fecha de Fundación
              </div>
              <div className="text-base font-bold text-white">{teamHistory.fechaFundacion}</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Origen y Afiliación
              </div>
              <div className="text-sm font-bold text-white">{teamHistory.ciudadOrigen}</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Lema Fundacional
              </div>
              <div className="text-sm font-bold text-amber-300">
                &ldquo;{teamHistory.lemaFundacional}&rdquo;
              </div>
            </div>
          </div>

          {/* Cómo se creó el equipo */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Cómo se Creó el Equipo
            </h2>

            <div className="space-y-3 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {teamHistory.comoSeCreo}
            </div>

            {teamHistory.misionInstitucional && (
              <div className="pt-4 border-t border-slate-800/80 space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Misión Institucional
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {teamHistory.misionInstitucional}
                </p>
              </div>
            )}
          </section>

          {/* Fundadores del Equipo */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Fundadores del Equipo
              </h2>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {teamHistory.fundadores.length} miembros fundadores
              </span>
            </div>

            {teamHistory.fundadores.length === 0 ? (
              <p className="text-xs text-slate-400">
                No hay fundadores registrados en la ficha histórica.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamHistory.fundadores.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">{f.nombre}</h3>
                        <p className="text-xs font-semibold text-amber-400">{f.cargoFundador}</p>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                        Desde {f.anioIngreso}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{f.aporte}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Hitos Históricos */}
          {teamHistory.hitos.length > 0 && (
            <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Award className="w-5 h-5 text-amber-400" />
                Trayectoria e Hitos de {teamHistory.nombreClub}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamHistory.hitos.map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 tabular-nums">
                      <span>{h.anio}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-white font-sans text-sm">{h.titulo}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{h.descripcion}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Last Updated Attribution Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
            <span>
              Última edición institucional: <strong className="text-slate-200">{teamHistory.ultimaEdicionPor}</strong>
            </span>
            <span className="font-mono tabular-nums">
              Fecha de registro: {teamHistory.ultimaEdicionFecha}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
