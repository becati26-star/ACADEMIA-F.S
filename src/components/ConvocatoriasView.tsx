/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Sliders,
  ArrowRightLeft
} from 'lucide-react';

interface ConvocatoriasViewProps {
  players: Player[];
  categories: Category[];
  rosters: MatchRoster[];
  onSaveRoster: (roster: MatchRoster) => void;
  onSelectPlayer: (player: Player) => void;
}

export const ConvocatoriasView: React.FC<ConvocatoriasViewProps> = ({
  players,
  categories,
  rosters,
  onSaveRoster,
  onSelectPlayer
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('primera-c');
  const [rival, setRival] = useState<string>('Club Deportivo CRE Futsal (Filial)');
  const [matchDate, setMatchDate] = useState<string>('2026-11-14');
  const [matchTime, setMatchTime] = useState<string>('20:45');
  const [matchLocation, setMatchLocation] = useState<string>('Coliseo Julio Borelli Viteritto (Cancha Central)');
  const [formation, setFormation] = useState<'1-2-1 (Rombo)' | '2-2 (Cuadrado)' | '1-3-0 (Sin Pívot)' | '1-1-2 (Ofensivo)'>('1-2-1 (Rombo)');
  const [includeCrossCategory, setIncludeCrossCategory] = useState<boolean>(true);
  const [tacticalNotes, setTacticalNotes] = useState<string>(
    'Esquema Rombo 1-2-1. Salida con pases tensos al ras de piso. Explotar giro en el pívot con desdoble veloz de alas. Presión en zona 2 tras pérdida.'
  );

  // Algorithm Weights
  const [weightPerf, setWeightPerf] = useState<number>(45);
  const [weightAtt, setWeightAtt] = useState<number>(35);
  const [weightPunc, setWeightPunc] = useState<number>(20);

  // Pool of candidate players for this match (including cross-category eligibility)
  const candidatePlayers = players.filter((p) => {
    if (p.categoriaId === selectedCategory) return true;
    if (includeCrossCategory) {
      // In Primera C, we can call up Sub-18 or Sub-20 players with double registration
      if (selectedCategory === 'primera-c' && (p.dobleFichaPrimeraC || p.categoriasSecundarias?.includes('primera-c'))) {
        return true;
      }
      // In Sub-20, can call up Sub-18 players or eligible Primera C under 20
      if (selectedCategory === 'sub-20' && (p.categoriaId === 'sub-18' || p.categoriasSecundarias?.includes('sub-20'))) {
        return true;
      }
      // In Sub-18, only Sub-18
      if (selectedCategory === 'sub-18' && p.categoriaId === 'sub-18') {
        return true;
      }
    }
    return false;
  });

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  const [activeRoster, setActiveRoster] = useState<MatchRoster>(() => {
    const existing = rosters.find((r) => r.categoriaId === selectedCategory);
    if (existing) return existing;

    const auto = ConvocatoriaEngine.generateAutomaticRoster(candidatePlayers, '1-2-1 (Rombo)', {
      pesoRendimiento: 0.45,
      pesoAsistencia: 0.35,
      pesoPuntualidad: 0.20
    }, selectedCategory);

    return {
      id: `rst-${Date.now()}`,
      rival: 'Club Deportivo CRE Futsal (Filial)',
      fecha: '2026-11-14',
      hora: '20:45',
      lugar: 'Coliseo Julio Borelli Viteritto (Cancha Central)',
      categoriaId: selectedCategory,
      equipoNombre: currentCategoryObj.name,
      formacion: '1-2-1 (Rombo)',
      estado: 'publicada',
      titulares: auto.titulares,
      suplentes: auto.suplentes,
      noConvocados: auto.noConvocados,
      puntuacionPonderadaConfig: {
        pesoRendimiento: 0.45,
        pesoAsistencia: 0.35,
        pesoPuntualidad: 0.20
      },
      notasTacticas: 'Esquema Rombo 1-2-1 en Futsal.',
      creadoPor: 'Prof. Diego Vera (DT ACADEMIA F.S.)'
    };
  });

  // Evaluate scores for all candidate players
  const evaluatedScores: PlayerConvocatoriaScore[] = ConvocatoriaEngine.evaluatePlayers(candidatePlayers, {
    pesoRendimiento: weightPerf / 100,
    pesoAsistencia: weightAtt / 100,
    pesoPuntualidad: weightPunc / 100
  }, selectedCategory);

  const runIntelligentAlgorithm = () => {
    const totalWeights = weightPerf + weightAtt + weightPunc;
    if (totalWeights !== 100) {
      alert(`La suma de ponderaciones debe ser 100% (actual: ${totalWeights}%). Ajuste los controles.`);
      return;
    }

    const auto = ConvocatoriaEngine.generateAutomaticRoster(candidatePlayers, formation, {
      pesoRendimiento: weightPerf / 100,
      pesoAsistencia: weightAtt / 100,
      pesoPuntualidad: weightPunc / 100
    }, selectedCategory);

    const updatedRoster: MatchRoster = {
      ...activeRoster,
      rival,
      fecha: matchDate,
      hora: matchTime,
      lugar: matchLocation,
      categoriaId: selectedCategory,
      equipoNombre: currentCategoryObj.name,
      formacion: formation,
      titulares: auto.titulares,
      suplentes: auto.suplentes,
      noConvocados: auto.noConvocados,
      puntuacionPonderadaConfig: {
        pesoRendimiento: weightPerf / 100,
        pesoAsistencia: weightAtt / 100,
        pesoPuntualidad: weightPunc / 100
      },
      notasTacticas: tacticalNotes
    };

    setActiveRoster(updatedRoster);
    onSaveRoster(updatedRoster);
    alert(`Quinteto titular y suplentes generados para ${currentCategoryObj.name} con inclusión de refuerzos cruzados.`);
  };

  const handleSaveAndPublish = () => {
    const toSave: MatchRoster = {
      ...activeRoster,
      rival,
      fecha: matchDate,
      hora: matchTime,
      lugar: matchLocation,
      formacion: formation,
      notasTacticas: tacticalNotes,
      estado: 'publicada'
    };
    onSaveRoster(toSave);
    alert('Convocatoria Oficial de Futsal publicada en el sistema de ACADEMIA F.S.');
  };

  // Tactical Pitch Positions for 5-player Futsal Systems (x, y in percentage)
  const getFutsalCoordinates = (posCode: string, form: string) => {
    const coords: Record<string, { x: number; y: number }> = {
      // Arquero
      GK: { x: 50, y: 88 },
      // Rombo 1-2-1
      CIERRE: { x: 50, y: 66 },
      'ALA-I': { x: 22, y: 45 },
      'ALA-D': { x: 78, y: 45 },
      PIVOT: { x: 50, y: 22 },
      UNIVERSAL: { x: 50, y: 45 },
      // Cuadrado 2-2
      'CIERRE-I': { x: 30, y: 66 },
      'CIERRE-D': { x: 70, y: 66 },
      'PIVOT-I': { x: 32, y: 24 },
      'PIVOT-D': { x: 68, y: 24 }
    };

    return coords[posCode] || { x: 50, y: 50 };
  };

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
            <span className="text-xs text-slate-400">Quinteto Inicial &amp; Refuerzos Cruzados</span>
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
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Publicar Convocatoria
          </button>
        </div>
      </div>

      {/* Configuration & Algorithm Tuning Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Categoría Oficial:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const cat = e.target.value as CategoryId;
                setSelectedCategory(cat);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-semibold"
            >
              <option value="sub-18">Sub-18 Futsal</option>
              <option value="sub-20">Sub-20 Futsal</option>
              <option value="primera-c">Primera C Futsal</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Rival de Partido:</label>
            <input
              type="text"
              value={rival}
              onChange={(e) => setRival(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Fecha &amp; Horario:</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-2/3 bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-1/3 bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Sistema Táctico de Futsal:</label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-amber-400 font-bold"
            >
              <option value="1-2-1 (Rombo)">1-2-1 (Rombo Clásico: Cierre, 2 Alas, Pívot)</option>
              <option value="2-2 (Cuadrado)">2-2 (Cuadrado: 2 Cierres y 2 Pívots/Alas)</option>
              <option value="1-3-0 (Sin Pívot)">1-3-0 (Sin Pívot Fijo / Universal)</option>
              <option value="1-1-2 (Ofensivo)">1-1-2 (Ataque con 2 Pívots)</option>
            </select>
          </div>
        </div>

        {/* Multi-category Double Registration Checkbox */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="crossCategoryToggle"
              checked={includeCrossCategory}
              onChange={(e) => setIncludeCrossCategory(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <label htmlFor="crossCategoryToggle" className="cursor-pointer text-xs">
              <span className="font-bold text-white block flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                Permitir Convocatoria Cruzada (Sub-18 y Sub-20 en Primera C y viceversa)
              </span>
              <span className="text-slate-400 text-[11px] block">
                {candidatePlayers.length} jugadores en el banco de elegibilidad para este partido.
              </span>
            </label>
          </div>

          <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">
            Reglamento ADFS Habilitado
          </span>
        </div>

        {/* Algorithm Weights Tuning */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Ponderación Algorítmica de Selección del Entrenador (Futsal)
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
                <span className="font-mono font-bold text-sky-400">{weightPunc}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weightPunc}
                onChange={(e) => setWeightPunc(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={runIntelligentAlgorithm}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Calcular Quinteto Inicial Óptimo
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Futsal Court Pitch (Left 55%) + Squad Rosters (Right 45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* TACTICAL FUTSAL COURT (40x20m proportions) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider">
                Cancha Oficial de Futsal · {activeRoster.formacion}
              </span>
              <span className="text-emerald-400 font-mono">5 en Cancha</span>
            </div>
            <span className="text-slate-400 font-mono">Piso Parquet / Polideportivo</span>
          </div>

          {/* Stylized Futsal Court */}
          <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-blue-900/90 via-sky-950/90 to-blue-950/95 rounded-xl border-2 border-sky-600/60 overflow-hidden shadow-2xl flex items-center justify-center select-none">
            {/* Futsal Markings SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-white/80"
              strokeWidth="2.5"
              fill="none"
              viewBox="0 0 400 500"
              preserveAspectRatio="none"
            >
              {/* Outer boundary lines */}
              <rect x="20" y="20" width="360" height="460" rx="3" />
              {/* Center Line */}
              <line x1="20" y1="250" x2="380" y2="250" />
              {/* Center Circle 3m radius */}
              <circle cx="200" cy="250" r="45" />
              <circle cx="200" cy="250" r="3" fill="currentColor" />

              {/* Futsal Penalty Area 6m (Top) */}
              <path d="M 140 20 L 140 70 A 60 60 0 0 0 260 70 L 260 20" />
              <circle cx="200" cy="80" r="3" fill="currentColor" />
              {/* Double Penalty Spot 10m (Top) */}
              <line x1="195" y1="125" x2="205" y2="125" strokeWidth="3" />

              {/* Futsal Penalty Area 6m (Bottom) */}
              <path d="M 140 480 L 140 430 A 60 60 0 0 1 260 430 L 260 480" />
              <circle cx="200" cy="420" r="3" fill="currentColor" />
              {/* Double Penalty Spot 10m (Bottom) */}
              <line x1="195" y1="375" x2="205" y2="375" strokeWidth="3" />

              {/* Corner arcs (25cm) */}
              <path d="M 20 35 A 15 15 0 0 0 35 20" />
              <path d="M 365 20 A 15 15 0 0 0 380 35" />
              <path d="M 20 465 A 15 15 0 0 1 35 480" />
              <path d="M 365 480 A 15 15 0 0 1 380 465" />
            </svg>

            {/* Parquet/Futsal Flooring Subtle Grain */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(90deg,#fff_0px,#fff_2px,transparent_2px,transparent_40px)]" />

            {/* Render 5 Starters on Pitch */}
            {activeRoster.titulares.slice(0, 5).map((tit) => {
              const player = players.find((p) => p.id === tit.jugadorId);
              if (!player) return null;

              const coords = getFutsalCoordinates(tit.posicionCancha, activeRoster.formacion);
              const hasAlert = player.partidosSuspensionPendientes > 0 || !player.medico.grupoSanguineo;
              const isCrossPlayer = player.categoriaId !== selectedCategory;

              return (
                <div
                  key={tit.jugadorId}
                  onClick={() => onSelectPlayer(player)}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shadow-xl transition-transform group-hover:scale-110 ${
                    hasAlert
                      ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                      : isCrossPlayer
                      ? 'bg-amber-600 text-slate-950 border-white'
                      : 'bg-slate-950 text-amber-400 border-amber-400'
                  }`}>
                    #{player.dorsal}
                  </div>

                  <div className="mt-1 bg-slate-950/95 border border-slate-700 rounded px-2 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap shadow-md text-center">
                    <div>{player.nombre[0]}. {player.apellidos.split(' ')[0]}</div>
                    <div className="text-[9px] text-amber-400 font-mono flex items-center justify-center gap-1">
                      <span>{tit.posicionCancha}</span>
                      <span>·</span>
                      <span>{player.stats.ratingGeneral} pts</span>
                    </div>
                    {isCrossPlayer && (
                      <div className="text-[8px] text-emerald-400 font-bold uppercase">
                        Refuerzo {player.categoriaId.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Instrucciones Tácticas: </span>
            {activeRoster.notasTacticas}
          </div>
        </div>

        {/* SQUAD BREAKDOWN LIST (Quinteto, Suplentes, No Convocados) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quinteto Titular */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Quinteto Titular en Cancha (5)
              </h3>
              <span className="text-slate-400 font-mono">Calificación Futsal</span>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden text-xs">
              {activeRoster.titulares.slice(0, 5).map((tit) => {
                const p = players.find((pl) => pl.id === tit.jugadorId);
                if (!p) return null;
                const score = evaluatedScores.find((s) => s.player.id === p.id);
                const isCross = p.categoriaId !== selectedCategory;

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlayer(p)}
                    className="p-2.5 bg-slate-950/40 hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono font-bold text-amber-400">
                        #{p.dorsal}
                      </span>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{p.nombre} {p.apellidos}</span>
                          {isCross && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-mono">
                              {p.categoriaId.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tit.posicionCancha} · {p.posicion}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-emerald-400">
                        {score?.scoreGlobal || p.stats.ratingGeneral} pts
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {p.porcentajeAsistencia}% asist.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suplentes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400" />
              Banco de Suplentes ({activeRoster.suplentes.length})
            </h3>

            {activeRoster.suplentes.length === 0 ? (
              <p className="text-xs text-slate-400">Sin suplentes adicionales en la lista.</p>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden text-xs">
                {activeRoster.suplentes.map((supId) => {
                  const p = players.find((pl) => pl.id === supId);
                  if (!p) return null;
                  const score = evaluatedScores.find((s) => s.player.id === p.id);
                  const isCross = p.categoriaId !== selectedCategory;

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="p-2.5 bg-slate-950/40 hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-mono font-bold text-sky-400">
                          #{p.dorsal}
                        </span>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{p.nombre} {p.apellidos}</span>
                            {isCross && (
                              <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">
                                {p.categoriaId.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.posicion}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-sky-400">
                          {score?.scoreGlobal || p.stats.ratingGeneral} pts
                        </span>
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
              <div className="space-y-2 text-xs">
                {activeRoster.noConvocados.map((nc) => {
                  const p = players.find((pl) => pl.id === nc.jugadorId);
                  if (!p) return null;

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="p-2.5 rounded bg-rose-950/20 border border-rose-900/50 hover:border-rose-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-rose-200">
                          #{p.dorsal} {p.nombre} {p.apellidos}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.posicion} ({p.equipoNombre})
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-300 mt-1">
                        {nc.motivo}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
