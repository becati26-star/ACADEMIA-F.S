/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, Category, MatchRoster, CategoryId } from '../types';
import { ConvocatoriaEngine, PlayerConvocatoriaScore } from '../services/convocatoriaEngine';
import { CLUB_INFO } from '../data/mockData';
import {
  Award,
  Sparkles,
  Users,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Save,
  Sliders,
  ArrowRightLeft,
  Search,
  UserPlus,
  UserMinus,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

interface ConvocatoriasViewProps {
  players: Player[];
  categories: Category[];
  rosters: MatchRoster[];
  onSaveRoster: (roster: MatchRoster) => void;
  onSelectPlayer: (player: Player) => void;
}

const FORMATION_SLOTS: Record<string, string[]> = {
  '1-2-1 (Rombo)': ['GK', 'CIERRE', 'ALA-I', 'ALA-D', 'PIVOT'],
  '2-2 (Cuadrado)': ['GK', 'CIERRE-I', 'CIERRE-D', 'ALA-I', 'ALA-D'],
  '1-3-0 (Sin Pívot)': ['GK', 'CIERRE', 'ALA-I', 'UNIVERSAL', 'ALA-D'],
  '1-1-2 (Ofensivo)': ['GK', 'CIERRE', 'UNIVERSAL', 'PIVOT-I', 'PIVOT-D']
};

const CATEGORY_ORDER: CategoryId[] = ['primera-c', 'sub-20', 'sub-18'];

export const ConvocatoriasView: React.FC<ConvocatoriasViewProps> = ({
  players,
  categories,
  rosters,
  onSaveRoster,
  onSelectPlayer
}) => {
  // Active apartado (3 separate categories: Primera C, Sub-20, Sub-18)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('primera-c');

  // Show ALL players across Primera C, Sub-20, Sub-18 for match call-ups by default
  const [includeAllCategories, setIncludeAllCategories] = useState<boolean>(true);
  const [poolCategoryFilter, setPoolCategoryFilter] = useState<'all' | CategoryId>('all');
  const [poolSearch, setPoolSearch] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Algorithm Weights
  const [weightPerf, setWeightPerf] = useState<number>(45);
  const [weightAtt, setWeightAtt] = useState<number>(35);
  const [weightPunc, setWeightPunc] = useState<number>(20);

  // Build or fetch independent roster per category
  const buildDefaultRosterForCategory = (catId: CategoryId): MatchRoster => {
    const existing = rosters.find((r) => r.categoriaId === catId);
    if (existing) return existing;

    const catObj = categories.find((c) => c.id === catId);
    const defaultPool = players; // All players available across Primera C, Sub-20, Sub-18
    const catFirstPool = [
      ...defaultPool.filter((p) => p.categoriaId === catId),
      ...defaultPool.filter((p) => p.categoriaId !== catId)
    ];

    const auto = ConvocatoriaEngine.generateAutomaticRoster(
      catFirstPool,
      '1-2-1 (Rombo)',
      { pesoRendimiento: 0.45, pesoAsistencia: 0.35, pesoPuntualidad: 0.20 },
      catId
    );

    const defaultRivals: Record<CategoryId, string> = {
      'primera-c': 'Club Deportivo CRE Futsal (Filial)',
      'sub-20': 'Atlético Juventud Futsal Sub-20',
      'sub-18': 'Cantera Bolívar Futsal Sub-18'
    };

    const defaultDates: Record<CategoryId, { fecha: string; hora: string }> = {
      'primera-c': { fecha: '2026-11-14', hora: '20:45' },
      'sub-20': { fecha: '2026-11-15', hora: '17:00' },
      'sub-18': { fecha: '2026-11-15', hora: '15:00' }
    };

    return {
      id: `rst-${catId}`,
      rival: defaultRivals[catId],
      fecha: defaultDates[catId].fecha,
      hora: defaultDates[catId].hora,
      lugar: 'Coliseo Julio Borelli Viteritto (Cancha Central)',
      categoriaId: catId,
      equipoNombre: catObj?.name || catId.toUpperCase(),
      formacion: '1-2-1 (Rombo)',
      estado: 'borrador',
      titulares: auto.titulares,
      suplentes: auto.suplentes,
      noConvocados: auto.noConvocados,
      puntuacionPonderadaConfig: {
        pesoRendimiento: 0.45,
        pesoAsistencia: 0.35,
        pesoPuntualidad: 0.20
      },
      notasTacticas:
        catId === 'primera-c'
          ? 'Esquema Rombo 1-2-1. Presión alta tras pérdida y rotación dinámica con refuerzos Sub-20 y Sub-18.'
          : `Esquema Rombo 1-2-1 para ${catObj?.name || catId}. Salida limpia desde cierre y desdoble rápido por las alas.`,
      creadoPor: 'Prof. Diego Vera (DT ACADEMIA F.S.)'
    };
  };

  // Independent roster state map for all 3 categories
  const [rostersByCategory, setRostersByCategory] = useState<Record<CategoryId, MatchRoster>>(() => ({
    'primera-c': buildDefaultRosterForCategory('primera-c'),
    'sub-20': buildDefaultRosterForCategory('sub-20'),
    'sub-18': buildDefaultRosterForCategory('sub-18')
  }));

  // Keep synced if parent `rosters` prop updates externally
  useEffect(() => {
    setRostersByCategory((prev) => {
      const next = { ...prev };
      CATEGORY_ORDER.forEach((catId) => {
        const external = rosters.find((r) => r.categoriaId === catId);
        if (external) {
          next[catId] = external;
        }
      });
      return next;
    });
  }, [rosters]);

  const activeRoster = rostersByCategory[selectedCategory];
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4500);
  };

  const updateActiveRoster = (updated: MatchRoster, persist: boolean = true) => {
    setRostersByCategory((prev) => ({
      ...prev,
      [selectedCategory]: updated
    }));
    if (persist) {
      onSaveRoster(updated);
    }
  };

  // Pool of candidate players: either ALL players (Primera C, Sub-20, Sub-18) or strictly primary category
  const candidatePlayers = includeAllCategories
    ? players
    : players.filter((p) => p.categoriaId === selectedCategory);

  // Evaluate scores for all players in the club so every badge/rating is visible
  const evaluatedScores: PlayerConvocatoriaScore[] = ConvocatoriaEngine.evaluatePlayers(
    players,
    {
      pesoRendimiento: weightPerf / 100,
      pesoAsistencia: weightAtt / 100,
      pesoPuntualidad: weightPunc / 100
    },
    selectedCategory
  );

  // Update formation and remap slot names for starters
  const handleChangeFormation = (
    newForm: '1-2-1 (Rombo)' | '2-2 (Cuadrado)' | '1-3-0 (Sin Pívot)' | '1-1-2 (Ofensivo)'
  ) => {
    const newSlots = FORMATION_SLOTS[newForm] || FORMATION_SLOTS['1-2-1 (Rombo)'];
    const remappedTitulares = activeRoster.titulares.slice(0, 5).map((tit, idx) => ({
      ...tit,
      posicionCancha: newSlots[idx] || tit.posicionCancha
    }));
    updateActiveRoster({
      ...activeRoster,
      formacion: newForm,
      titulares: remappedTitulares
    });
  };

  // Replace or assign a player into a specific starter slot (0..4)
  const handleAssignStarterSlot = (slotIndex: number, newPlayerId: string) => {
    if (!newPlayerId) return;

    const slots = FORMATION_SLOTS[activeRoster.formacion] || FORMATION_SLOTS['1-2-1 (Rombo)'];
    const currentTitulares = [...activeRoster.titulares];

    // Ensure 5 slot entries exist up to slotIndex if fewer than 5
    while (currentTitulares.length <= slotIndex && currentTitulares.length < 5) {
      const idx = currentTitulares.length;
      currentTitulares.push({ jugadorId: '', posicionCancha: slots[idx] || 'UNIVERSAL' });
    }

    const previousPlayerId = currentTitulares[slotIndex]?.jugadorId;
    if (previousPlayerId === newPlayerId) return;

    // Check if newPlayerId is already a starter in another slot -> swap positions
    const existingOtherSlot = currentTitulares.findIndex(
      (t, idx) => idx !== slotIndex && t.jugadorId === newPlayerId
    );

    let updatedSuplentes = [...activeRoster.suplentes].filter((id) => id !== newPlayerId);
    let updatedNoConvocados = activeRoster.noConvocados.filter((nc) => nc.jugadorId !== newPlayerId);

    if (existingOtherSlot !== -1) {
      // Swap two starters
      currentTitulares[existingOtherSlot] = {
        ...currentTitulares[existingOtherSlot],
        jugadorId: previousPlayerId || ''
      };
      currentTitulares[slotIndex] = {
        ...currentTitulares[slotIndex],
        jugadorId: newPlayerId
      };
    } else {
      // Put new player in starter slot, demote replaced starter to substitutes
      currentTitulares[slotIndex] = {
        jugadorId: newPlayerId,
        posicionCancha: currentTitulares[slotIndex]?.posicionCancha || slots[slotIndex] || 'UNIVERSAL'
      };
      if (previousPlayerId && !updatedSuplentes.includes(previousPlayerId)) {
        updatedSuplentes = [previousPlayerId, ...updatedSuplentes];
      }
    }

    // Filter out any empty placeholder slots
    const cleanTitulares = currentTitulares.filter((t) => Boolean(t.jugadorId));

    const newP = players.find((p) => p.id === newPlayerId);
    updateActiveRoster({
      ...activeRoster,
      titulares: cleanTitulares,
      suplentes: updatedSuplentes,
      noConvocados: updatedNoConvocados
    });

    if (newP) {
      showToast(
        `Titular actualizado en ${currentCategoryObj.name}: #${newP.dorsal} ${newP.nombre} ${newP.apellidos} (${currentTitulares[slotIndex]?.posicionCancha || 'Titular'}).`
      );
    }
  };

  // Update court position label of a starter
  const handleChangeStarterCourtPosition = (slotIndex: number, posCode: string) => {
    const updatedTitulares = activeRoster.titulares.map((t, idx) =>
      idx === slotIndex ? { ...t, posicionCancha: posCode } : t
    );
    updateActiveRoster({
      ...activeRoster,
      titulares: updatedTitulares
    });
  };

  // Move player to Substitutes (Suplentes)
  const handleMoveToBench = (playerId: string) => {
    const updatedTitulares = activeRoster.titulares.filter((t) => t.jugadorId !== playerId);
    const updatedNoConvocados = activeRoster.noConvocados.filter((nc) => nc.jugadorId !== playerId);
    const updatedSuplentes = activeRoster.suplentes.includes(playerId)
      ? activeRoster.suplentes
      : [...activeRoster.suplentes, playerId];

    updateActiveRoster({
      ...activeRoster,
      titulares: updatedTitulares,
      suplentes: updatedSuplentes,
      noConvocados: updatedNoConvocados
    });

    const p = players.find((pl) => pl.id === playerId);
    if (p) {
      showToast(`#${p.dorsal} ${p.nombre} movido a Suplentes de ${currentCategoryObj.name}.`);
    }
  };

  // Move player to No Convocados
  const handleMoveToNonCalled = (playerId: string) => {
    const updatedTitulares = activeRoster.titulares.filter((t) => t.jugadorId !== playerId);
    const updatedSuplentes = activeRoster.suplentes.filter((id) => id !== playerId);
    const alreadyNc = activeRoster.noConvocados.some((nc) => nc.jugadorId === playerId);
    const updatedNoConvocados = alreadyNc
      ? activeRoster.noConvocados
      : [
          ...activeRoster.noConvocados,
          { jugadorId: playerId, motivo: 'Decisión técnica del entrenador / Rotación' }
        ];

    updateActiveRoster({
      ...activeRoster,
      titulares: updatedTitulares,
      suplentes: updatedSuplentes,
      noConvocados: updatedNoConvocados
    });
  };

  // Add player to next open starter slot or replace last/matching slot
  const handlePromoteToStarter = (playerId: string, preferredSlotIndex?: number) => {
    if (activeRoster.titulares.some((t) => t.jugadorId === playerId)) return;

    const slots = FORMATION_SLOTS[activeRoster.formacion] || FORMATION_SLOTS['1-2-1 (Rombo)'];

    // If fewer than 5 starters, fill next empty slot
    if (activeRoster.titulares.length < 5 && preferredSlotIndex === undefined) {
      const nextSlot = slots[activeRoster.titulares.length] || 'UNIVERSAL';
      const updatedTitulares = [
        ...activeRoster.titulares,
        { jugadorId: playerId, posicionCancha: nextSlot }
      ];
      updateActiveRoster({
        ...activeRoster,
        titulares: updatedTitulares,
        suplentes: activeRoster.suplentes.filter((id) => id !== playerId),
        noConvocados: activeRoster.noConvocados.filter((nc) => nc.jugadorId !== playerId)
      });
      const p = players.find((pl) => pl.id === playerId);
      if (p) showToast(`#${p.dorsal} ${p.nombre} ingresado como Titular (${nextSlot}).`);
      return;
    }

    // Determine target slot index
    const player = players.find((pl) => pl.id === playerId);
    let targetIdx = preferredSlotIndex ?? 4;
    if (preferredSlotIndex === undefined && player) {
      if (player.posicion === 'Arquero') targetIdx = 0;
      else if (player.posicion === 'Cierre') targetIdx = 1;
      else if (player.posicion === 'Ala Izquierda') targetIdx = 2;
      else if (player.posicion === 'Ala Derecha') targetIdx = 3;
      else targetIdx = 4;
    }
    handleAssignStarterSlot(Math.min(targetIdx, Math.max(0, activeRoster.titulares.length - 1)), playerId);
  };

  const runIntelligentAlgorithm = () => {
    const totalWeights = weightPerf + weightAtt + weightPunc;
    if (totalWeights !== 100) {
      showToast(
        `La suma de ponderaciones debe ser 100% (actual: ${totalWeights}%). Ajuste los controles.`,
        'error'
      );
      return;
    }

    // Prioritize current category players slightly on tie, while allowing all categories in pool
    const pool = includeAllCategories
      ? [
          ...players.filter((p) => p.categoriaId === selectedCategory),
          ...players.filter((p) => p.categoriaId !== selectedCategory)
        ]
      : candidatePlayers;

    const auto = ConvocatoriaEngine.generateAutomaticRoster(
      pool,
      activeRoster.formacion,
      {
        pesoRendimiento: weightPerf / 100,
        pesoAsistencia: weightAtt / 100,
        pesoPuntualidad: weightPunc / 100
      },
      selectedCategory
    );

    const updatedRoster: MatchRoster = {
      ...activeRoster,
      categoriaId: selectedCategory,
      equipoNombre: currentCategoryObj.name,
      titulares: auto.titulares,
      suplentes: auto.suplentes,
      noConvocados: auto.noConvocados,
      puntuacionPonderadaConfig: {
        pesoRendimiento: weightPerf / 100,
        pesoAsistencia: weightAtt / 100,
        pesoPuntualidad: weightPunc / 100
      }
    };

    updateActiveRoster(updatedRoster);
    showToast(`Quinteto titular óptimo y suplentes recalculados para ${currentCategoryObj.name}.`);
  };

  const handleSaveAndPublish = () => {
    const toSave: MatchRoster = {
      ...activeRoster,
      categoriaId: selectedCategory,
      equipoNombre: currentCategoryObj.name,
      estado: 'publicada'
    };
    updateActiveRoster(toSave);
    showToast(`Convocatoria Oficial de ${currentCategoryObj.name} publicada correctamente.`);
  };

  // Tactical Pitch Positions for 5-player Futsal Systems (x, y in percentage)
  const getFutsalCoordinates = (posCode: string) => {
    const coords: Record<string, { x: number; y: number }> = {
      GK: { x: 50, y: 88 },
      CIERRE: { x: 50, y: 66 },
      'ALA-I': { x: 22, y: 45 },
      'ALA-D': { x: 78, y: 45 },
      PIVOT: { x: 50, y: 22 },
      UNIVERSAL: { x: 50, y: 45 },
      'CIERRE-I': { x: 30, y: 66 },
      'CIERRE-D': { x: 70, y: 66 },
      'PIVOT-I': { x: 32, y: 24 },
      'PIVOT-D': { x: 68, y: 24 }
    };
    return coords[posCode] || { x: 50, y: 50 };
  };

  const getCategoryBadgeClass = (catId: CategoryId) => {
    if (catId === 'primera-c') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (catId === 'sub-20') return 'bg-white/10 text-white border-white/25';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  const getCategoryShortLabel = (catId: CategoryId) => {
    if (catId === 'primera-c') return 'PRIMERA C';
    if (catId === 'sub-20') return 'SUB-20';
    return 'SUB-18';
  };

  // Filtered full club pool for manual call-up selection
  const filteredPoolPlayers = candidatePlayers.filter((p) => {
    if (poolCategoryFilter !== 'all' && p.categoriaId !== poolCategoryFilter) return false;
    if (!poolSearch.trim()) return true;
    const q = poolSearch.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q) ||
      p.dorsal.toString().includes(q) ||
      p.posicion.toLowerCase().includes(q)
    );
  });

  // Grouped players by category for <select> dropdowns
  const groupedPlayersForSelect = CATEGORY_ORDER.map((catId) => ({
    catId,
    label: categories.find((c) => c.id === catId)?.name || catId.toUpperCase(),
    list: candidatePlayers.filter((p) => p.categoriaId === catId)
  })).filter((g) => g.list.length > 0);

  const slotsForFormation = FORMATION_SLOTS[activeRoster.formacion] || FORMATION_SLOTS['1-2-1 (Rombo)'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
              Cuerpo Técnico · ACADEMIA F.S.
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">3 Categorías · Edición Manual de Titulares</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Pizarra Táctica de Futsal &amp; Convocatoria Oficial
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Planilla Arbitral ADFS
          </button>
          <button
            onClick={handleSaveAndPublish}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Publicar Convocatoria ({getCategoryShortLabel(selectedCategory)})
          </button>
        </div>
      </div>

      {/* Inline Toast Feedback */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            toastMsg.type === 'error'
              ? 'bg-rose-950/80 border-rose-600 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="opacity-75 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 DEDICATED CATEGORY APARTADOS (PRIMERA C, SUB-20, SUB-18) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold uppercase tracking-wider text-amber-400">
            Apartados de Convocatoria por Categoría (Seleccione para editar titulares)
          </span>
          <span className="text-slate-400 font-mono">
            {players.length} jugadores totales disponibles en el club
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {CATEGORY_ORDER.map((catId, index) => {
            const cat = categories.find((c) => c.id === catId);
            const roster = rostersByCategory[catId];
            const isSelected = selectedCategory === catId;
            const catPlayersCount = players.filter((p) => p.categoriaId === catId).length;

            return (
              <button
                key={catId}
                type="button"
                onClick={() => setSelectedCategory(catId)}
                className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_25px_rgba(212,175,55,0.18)]'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${getCategoryBadgeClass(
                      catId
                    )}`}
                  >
                    Apartado {index + 1} · {getCategoryShortLabel(catId)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      roster.estado === 'publicada'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                        : 'bg-slate-950 text-amber-300 border border-slate-700'
                    }`}
                  >
                    {roster.estado}
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-extrabold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                    {cat?.name || catId.toUpperCase()}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    vs. {roster.rival} · {roster.fecha} ({roster.hora})
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono w-full">
                  <span className="text-emerald-400 font-bold">
                    {roster.titulares.length}/5 Titulares
                  </span>
                  <span className="text-slate-300">
                    {roster.suplentes.length} Suplentes
                  </span>
                  <span className="text-slate-400">
                    {catPlayersCount} propios
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Details & Multi-Category Toggle for the Active Apartado */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Apartado Activo:</label>
            <div className="w-full bg-slate-950 border border-amber-500/40 rounded p-2 text-amber-300 font-bold">
              {currentCategoryObj.name}
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Rival de Partido:</label>
            <input
              type="text"
              value={activeRoster.rival}
              onChange={(e) => updateActiveRoster({ ...activeRoster, rival: e.target.value }, false)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Fecha &amp; Horario:</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={activeRoster.fecha}
                onChange={(e) => updateActiveRoster({ ...activeRoster, fecha: e.target.value }, false)}
                className="w-2/3 bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
              <input
                type="time"
                value={activeRoster.hora}
                onChange={(e) => updateActiveRoster({ ...activeRoster, hora: e.target.value }, false)}
                className="w-1/3 bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Sistema Táctico de Futsal:</label>
            <select
              value={activeRoster.formacion}
              onChange={(e) => handleChangeFormation(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-amber-400 font-bold"
            >
              <option value="1-2-1 (Rombo)">1-2-1 (Rombo Clásico: Cierre, 2 Alas, Pívot)</option>
              <option value="2-2 (Cuadrado)">2-2 (Cuadrado: 2 Cierres y 2 Pívots/Alas)</option>
              <option value="1-3-0 (Sin Pívot)">1-3-0 (Sin Pívot Fijo / Universal)</option>
              <option value="1-1-2 (Ofensivo)">1-1-2 (Ataque con 2 Pívots)</option>
            </select>
          </div>
        </div>

        {/* All-Categories Player Pool Toggle */}
        <div className="p-3 bg-slate-950/80 border border-amber-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="crossCategoryToggle"
              checked={includeAllCategories}
              onChange={(e) => setIncludeAllCategories(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <label htmlFor="crossCategoryToggle" className="cursor-pointer text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                Mostrar y Permitir Convocar Jugadores de las 3 Categorías (Primera C, Sub-20 y Sub-18)
              </span>
              <span className="text-slate-400 text-[11px] block">
                {candidatePlayers.length} jugadores disponibles para convocar a este partido (Primera C: {players.filter((p) => p.categoriaId === 'primera-c').length} · Sub-20: {players.filter((p) => p.categoriaId === 'sub-20').length} · Sub-18: {players.filter((p) => p.categoriaId === 'sub-18').length}).
              </span>
            </label>
          </div>

          <span className="text-[11px] text-emerald-400 font-mono shrink-0">
            Convocatoria Abierta Habilitada
          </span>
        </div>

        {/* Algorithm Weights Tuning */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Sugerencia Automática del Quinteto ({currentCategoryObj.name})
            </span>
            <span className="text-xs font-mono text-slate-400">
              Total: {weightPerf + weightAtt + weightPunc}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Rendimiento Físico / Técnico / Táctico:</span>
                <span className="font-mono font-bold text-amber-400">{weightPerf}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={70}
                value={weightPerf}
                onChange={(e) => setWeightPerf(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>% Asistencia a Entrenamientos:</span>
                <span className="font-mono font-bold text-emerald-400">{weightAtt}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={70}
                value={weightAtt}
                onChange={(e) => setWeightAtt(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>% Puntualidad en Horario:</span>
                <span className="font-mono font-bold text-amber-300">{weightPunc}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weightPunc}
                onChange={(e) => setWeightPunc(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={runIntelligentAlgorithm}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Recalcular Quinteto Óptimo ({getCategoryShortLabel(selectedCategory)})
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Futsal Court Pitch (Left) + Interactive Starter & Bench Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* TACTICAL FUTSAL COURT (40x20m proportions) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider">
                Cancha {getCategoryShortLabel(selectedCategory)} · {activeRoster.formacion}
              </span>
              <span className="text-emerald-400 font-mono">{activeRoster.titulares.length}/5 en Cancha</span>
            </div>
            <span className="text-slate-400 font-mono">Vista Táctica</span>
          </div>

          {/* Stylized Futsal Court (Official Crest Pitch Black, White Markings & Gold Trim) */}
          <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#060608] via-[#101014] to-[#060608] rounded-xl border-2 border-amber-500/60 overflow-hidden shadow-2xl flex items-center justify-center select-none">
            <img
              src={CLUB_INFO.crestUrl}
              alt=""
              aria-hidden="true"
              className="w-28 h-28 object-contain opacity-15 pointer-events-none select-none"
              referrerPolicy="no-referrer"
            />
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-white/80"
              strokeWidth="2.5"
              fill="none"
              viewBox="0 0 400 500"
              preserveAspectRatio="none"
            >
              <rect x="20" y="20" width="360" height="460" rx="3" stroke="#D4AF37" strokeOpacity="0.85" />
              <line x1="20" y1="250" x2="380" y2="250" />
              <circle cx="200" cy="250" r="45" />
              <circle cx="200" cy="250" r="3" fill="currentColor" />
              <path d="M 140 20 L 140 70 A 60 60 0 0 0 260 70 L 260 20" />
              <circle cx="200" cy="80" r="3" fill="currentColor" />
              <line x1="195" y1="125" x2="205" y2="125" strokeWidth="3" />
              <path d="M 140 480 L 140 430 A 60 60 0 0 1 260 430 L 260 480" />
              <circle cx="200" cy="420" r="3" fill="currentColor" />
              <line x1="195" y1="375" x2="205" y2="375" strokeWidth="3" />
              <path d="M 20 35 A 15 15 0 0 0 35 20" />
              <path d="M 365 20 A 15 15 0 0 0 380 35" />
              <path d="M 20 465 A 15 15 0 0 1 35 480" />
              <path d="M 365 480 A 15 15 0 0 1 380 465" />
            </svg>

            <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[repeating-linear-gradient(90deg,#D4AF37_0px,#D4AF37_1px,transparent_1px,transparent_40px)]" />

            {/* Render 5 Starters on Pitch */}
            {activeRoster.titulares.slice(0, 5).map((tit) => {
              const player = players.find((p) => p.id === tit.jugadorId);
              if (!player) return null;

              const coords = getFutsalCoordinates(tit.posicionCancha);
              const hasAlert = player.partidosSuspensionPendientes > 0 || !player.medico.grupoSanguineo;
              const isCrossPlayer = player.categoriaId !== selectedCategory;

              return (
                <div
                  key={`${tit.posicionCancha}-${tit.jugadorId}`}
                  onClick={() => onSelectPlayer(player)}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div
                    className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shadow-xl transition-transform group-hover:scale-110 ${
                      hasAlert
                        ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                        : isCrossPlayer
                        ? 'bg-amber-500 text-slate-950 border-white'
                        : 'bg-slate-950 text-amber-400 border-amber-400'
                    }`}
                  >
                    #{player.dorsal}
                  </div>

                  <div className="mt-1 bg-slate-950/95 border border-slate-700 rounded px-2 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap shadow-md text-center">
                    <div>{player.nombre[0]}. {player.apellidos.split(' ')[0]}</div>
                    <div className="text-[9px] text-amber-400 font-mono flex items-center justify-center gap-1">
                      <span>{tit.posicionCancha}</span>
                      <span>·</span>
                      <span>{player.stats.ratingGeneral} pts</span>
                    </div>
                    <div className="text-[8px] text-emerald-400 font-bold uppercase">
                      {getCategoryShortLabel(player.categoriaId)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Instrucciones Tácticas ({currentCategoryObj.name}):
            </label>
            <textarea
              rows={2}
              value={activeRoster.notasTacticas}
              onChange={(e) => updateActiveRoster({ ...activeRoster, notasTacticas: e.target.value }, false)}
              className="w-full p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: EDITABLE 5 STARTERS + SUBSTITUTES + NOT CALLED */}
        <div className="lg:col-span-6 space-y-4">
          {/* EDITABLE QUINTETO TITULAR */}
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Modificar Jugadores Titulares en Cancha (5)
              </h3>
              <span className="text-amber-400 font-mono font-semibold">
                {getCategoryShortLabel(selectedCategory)}
              </span>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden text-xs">
              {slotsForFormation.map((defaultSlot, slotIdx) => {
                const tit = activeRoster.titulares[slotIdx];
                const p = tit ? players.find((pl) => pl.id === tit.jugadorId) : undefined;
                const score = p ? evaluatedScores.find((s) => s.player.id === p.id) : undefined;
                const currentSlotLabel = tit?.posicionCancha || defaultSlot;

                return (
                  <div
                    key={`${slotIdx}-${defaultSlot}`}
                    className="p-3 bg-slate-950/60 hover:bg-slate-900/80 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <select
                          value={currentSlotLabel}
                          onChange={(e) => handleChangeStarterCourtPosition(slotIdx, e.target.value)}
                          className="bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-bold text-[11px] rounded px-1.5 py-0.5 focus:outline-none"
                          aria-label="Posición táctica en cancha"
                        >
                          {['GK', 'CIERRE', 'CIERRE-I', 'CIERRE-D', 'ALA-I', 'ALA-D', 'PIVOT', 'PIVOT-I', 'PIVOT-D', 'UNIVERSAL'].map(
                            (pos) => (
                              <option key={pos} value={pos}>
                                {pos}
                              </option>
                            )
                          )}
                        </select>

                        {p ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono font-bold text-amber-400">#{p.dorsal}</span>
                            <span className="font-bold text-white truncate">
                              {p.nombre} {p.apellidos}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded border font-mono shrink-0 ${getCategoryBadgeClass(
                                p.categoriaId
                              )}`}
                            >
                              {getCategoryShortLabel(p.categoriaId)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-rose-400 italic">Puesto vacío — seleccione un titular</span>
                        )}
                      </div>

                      {p && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono font-bold text-emerald-400 text-[11px]">
                            {score?.scoreGlobal || p.stats.ratingGeneral} pts
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectPlayer(p)}
                            title="Ver ficha completa"
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveToBench(p.id)}
                            title="Mover a Suplentes"
                            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                          >
                            Suplente
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Direct Dropdown to Swap/Change Starter with ANY Player from Primera C, Sub-20 or Sub-18 */}
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <select
                        value={p?.id || ''}
                        onChange={(e) => handleAssignStarterSlot(slotIdx, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 hover:border-amber-500/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="">-- Seleccionar / Cambiar Titular ({currentSlotLabel}) --</option>
                        {groupedPlayersForSelect.map((grp) => (
                          <optgroup key={grp.catId} label={`══ ${grp.label} ══`}>
                            {grp.list.map((cand) => {
                              const isAlreadyStarter = activeRoster.titulares.some(
                                (t, idx) => idx !== slotIdx && t.jugadorId === cand.id
                              );
                              return (
                                <option key={cand.id} value={cand.id}>
                                  #{cand.dorsal} {cand.nombre} {cand.apellidos} · {cand.posicion} ({cand.stats.ratingGeneral} pts)
                                  {isAlreadyStarter ? ' [Titular en otro puesto - Intercambiar]' : ''}
                                </option>
                              );
                            })}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suplentes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              Banco de Suplentes ({activeRoster.suplentes.length})
            </h3>

            {activeRoster.suplentes.length === 0 ? (
              <p className="text-xs text-slate-400">Sin suplentes adicionales en la lista.</p>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden text-xs max-h-64 overflow-y-auto">
                {activeRoster.suplentes.map((supId) => {
                  const p = players.find((pl) => pl.id === supId);
                  if (!p) return null;
                  const score = evaluatedScores.find((s) => s.player.id === p.id);

                  return (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-950/40 hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 text-center font-mono font-bold text-amber-400 shrink-0">
                          #{p.dorsal}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{p.nombre} {p.apellidos}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${getCategoryBadgeClass(
                                p.categoriaId
                              )}`}
                            >
                              {getCategoryShortLabel(p.categoriaId)}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.posicion} · {score?.scoreGlobal || p.stats.ratingGeneral} pts
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePromoteToStarter(p.id)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Poner Titular
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveToNonCalled(p.id)}
                          title="Quitar de convocatoria"
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* No Convocados */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              No Convocados &amp; Justificaciones ({activeRoster.noConvocados.length})
            </h3>

            {activeRoster.noConvocados.length === 0 ? (
              <p className="text-xs text-slate-400">Todos los jugadores disponibles fueron citados.</p>
            ) : (
              <div className="space-y-2 text-xs max-h-52 overflow-y-auto pr-1">
                {activeRoster.noConvocados.map((nc) => {
                  const p = players.find((pl) => pl.id === nc.jugadorId);
                  if (!p) return null;

                  return (
                    <div
                      key={p.id}
                      className="p-2.5 rounded bg-rose-950/20 border border-rose-900/50 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="font-semibold text-rose-200">
                            #{p.dorsal} {p.nombre} {p.apellidos}
                          </span>
                          <span className={`text-[9px] px-1 py-0.2 rounded border font-mono ${getCategoryBadgeClass(p.categoriaId)}`}>
                            {getCategoryShortLabel(p.categoriaId)}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-300 mt-0.5">{nc.motivo}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMoveToBench(p.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-semibold shrink-0"
                      >
                        Convocar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL CLUB PLAYER POOL (PRIMERA C + SUB-20 + SUB-18) FOR EASY CALL-UP */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              Todos los Jugadores del Club para Convocar ({currentCategoryObj.name})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Visualice jugadores de <strong className="text-amber-300">Primera C</strong>,{' '}
              <strong className="text-white">Sub-20</strong> y{' '}
              <strong className="text-emerald-300">Sub-18</strong> y asígnelos como Titular o Suplente con un clic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              {[
                { id: 'all', label: `Todos (${candidatePlayers.length})` },
                { id: 'primera-c', label: `Primera C (${players.filter((p) => p.categoriaId === 'primera-c').length})` },
                { id: 'sub-20', label: `Sub-20 (${players.filter((p) => p.categoriaId === 'sub-20').length})` },
                { id: 'sub-18', label: `Sub-18 (${players.filter((p) => p.categoriaId === 'sub-18').length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPoolCategoryFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    poolCategoryFilter === tab.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={poolSearch}
                onChange={(e) => setPoolSearch(e.target.value)}
                placeholder="Buscar jugador o dorsal..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Jugador</th>
                <th className="py-3 px-3">Categoría Origen</th>
                <th className="py-3 px-3">Posición Futsal</th>
                <th className="py-3 px-3 text-center">Rating</th>
                <th className="py-3 px-3 text-center">Asistencia</th>
                <th className="py-3 px-3 text-center">Rol en {getCategoryShortLabel(selectedCategory)}</th>
                <th className="py-3 px-4 text-right">Asignar / Modificar en Convocatoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredPoolPlayers.map((p) => {
                const starterSlotIdx = activeRoster.titulares.findIndex((t) => t.jugadorId === p.id);
                const isStarter = starterSlotIdx !== -1;
                const isSub = activeRoster.suplentes.includes(p.id);
                const starterSlotName = isStarter ? activeRoster.titulares[starterSlotIdx].posicionCancha : null;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-bold text-amber-400 text-[11px] shrink-0">
                          #{p.dorsal}
                        </span>
                        <div>
                          <span className="font-bold text-white block">
                            {p.nombre} {p.apellidos}
                          </span>
                          {p.partidosSuspensionPendientes > 0 && (
                            <span className="text-[10px] text-rose-400 font-semibold">
                              ⚠ {p.partidosSuspensionPendientes} fecha(s) de suspensión
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${getCategoryBadgeClass(
                          p.categoriaId
                        )}`}
                      >
                        {p.equipoNombre}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                      {p.posicion}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400">
                      {p.stats.ratingGeneral} pts
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400">
                      {p.porcentajeAsistencia}%
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isStarter ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
                          TITULAR ({starterSlotName})
                        </span>
                      ) : isSub ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          SUPLENTE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                          NO CONVOCADO
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick pick which starter slot to assign this player into */}
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value !== '') {
                              handleAssignStarterSlot(Number(e.target.value), p.id);
                            }
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded px-2 py-1 text-[11px] cursor-pointer focus:outline-none"
                          aria-label={`Poner de titular a ${p.nombre}`}
                        >
                          <option value="">Poner Titular en...</option>
                          {slotsForFormation.map((slotCode, sIdx) => {
                            const currentHolderId = activeRoster.titulares[sIdx]?.jugadorId;
                            const currentHolder = players.find((pl) => pl.id === currentHolderId);
                            return (
                              <option key={slotCode} value={sIdx}>
                                {slotCode}
                                {currentHolder ? ` (Reemplaza a #${currentHolder.dorsal} ${currentHolder.nombre})` : ''}
                              </option>
                            );
                          })}
                        </select>

                        {!isSub && (
                          <button
                            type="button"
                            onClick={() => handleMoveToBench(p.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded text-[11px] font-semibold transition-colors"
                          >
                            Suplente
                          </button>
                        )}

                        {(isStarter || isSub) && (
                          <button
                            type="button"
                            onClick={() => handleMoveToNonCalled(p.id)}
                            className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded text-[11px] font-semibold transition-colors"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
