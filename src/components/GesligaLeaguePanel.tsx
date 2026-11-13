/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Player } from '../types';
import {
  GESLIGA_LEAGUE_PRESETS,
  GesligaCategoryKey,
  GesligaConfig,
  GesligaMatch,
  GesligaScorer,
  GesligaStandingRow
} from '../data/gesligaData';
import {
  Trophy,
  Calendar,
  ExternalLink,
  Link2,
  Award,
  Check,
  Edit3,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  X
} from 'lucide-react';

interface GesligaLeaguePanelProps {
  players?: Player[];
  onNavigateToConvocatorias: () => void;
}

const getConfigStorageKey = (cat: GesligaCategoryKey) =>
  cat === 'primera-c' ? 'academia_fs_gesliga_config_v1' : `academia_fs_gesliga_config_${cat}_v1`;

const getMatchesStorageKey = (cat: GesligaCategoryKey) =>
  cat === 'primera-c' ? 'academia_fs_gesliga_matches_v1' : `academia_fs_gesliga_matches_${cat}_v1`;

const getScorersStorageKey = (cat: GesligaCategoryKey) =>
  `academia_fs_gesliga_scorers_${cat}_v1`;

const parseGesligaUrl = (rawUrl: string, fallbackName: string): GesligaConfig | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    const ligaParam = url.searchParams.get('Liga') || url.searchParams.get('liga');
    if (ligaParam) {
      let defaultName = `Torneo Gesliga · Liga ${ligaParam}`;
      if (ligaParam === '510727') defaultName = 'PRIMERA "C" SERIE "B" CLAUS. 2026';
      if (ligaParam === '512812') defaultName = 'SUB-20 CLAUSURA SERIE "D"';
      return {
        ligaId: ligaParam,
        nombreTorneo: fallbackName || defaultName,
        clasificacionUrl: `https://www.gesliga.com/Clasificacion.aspx?Liga=${ligaParam}`,
        calendarioUrl: `https://www.gesliga.com/Calendario.aspx?Liga=${ligaParam}`
      };
    }
    return {
      ligaId: 'custom',
      nombreTorneo: fallbackName || 'Liga Oficial Vinculada (Gesliga)',
      clasificacionUrl: withProtocol,
      calendarioUrl: withProtocol
    };
  } catch {
    return null;
  }
};

const computeStandingsFromMatches = (
  initialStandings: GesligaStandingRow[],
  matches: GesligaMatch[]
): GesligaStandingRow[] => {
  const teamMap = new Map<string, GesligaStandingRow>();
  initialStandings.forEach((row) => {
    teamMap.set(row.equipo, {
      ...row,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      pt: 0,
      dg: 0
    });
  });

  matches.forEach((m) => {
    if (!m.jugado || m.golesLocal === null || m.golesVisitante === null) return;
    const home = teamMap.get(m.local);
    const away = teamMap.get(m.visitante);
    if (!home || !away) return;

    home.pj += 1;
    away.pj += 1;
    home.gf += m.golesLocal;
    home.gc += m.golesVisitante;
    away.gf += m.golesVisitante;
    away.gc += m.golesLocal;

    if (m.golesLocal > m.golesVisitante) {
      home.pg += 1;
      home.pt += 3;
      away.pp += 1;
    } else if (m.golesLocal < m.golesVisitante) {
      away.pg += 1;
      away.pt += 3;
      home.pp += 1;
    } else {
      home.pe += 1;
      away.pe += 1;
      home.pt += 1;
      away.pt += 1;
    }
    home.dg = home.gf - home.gc;
    away.dg = away.gf - away.gc;
  });

  const sorted = Array.from(teamMap.values()).sort((a, b) => {
    if (b.pt !== a.pt) return b.pt - a.pt;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.equipo.localeCompare(b.equipo);
  });

  return sorted.map((row, idx) => ({ ...row, pos: idx + 1 }));
};

const loadStoredConfig = (cat: GesligaCategoryKey): GesligaConfig => {
  try {
    const saved = localStorage.getItem(getConfigStorageKey(cat));
    return saved ? JSON.parse(saved) : GESLIGA_LEAGUE_PRESETS[cat].config;
  } catch {
    return GESLIGA_LEAGUE_PRESETS[cat].config;
  }
};

const loadStoredMatches = (cat: GesligaCategoryKey): GesligaMatch[] => {
  try {
    const saved = localStorage.getItem(getMatchesStorageKey(cat));
    return saved ? JSON.parse(saved) : GESLIGA_LEAGUE_PRESETS[cat].initialMatches;
  } catch {
    return GESLIGA_LEAGUE_PRESETS[cat].initialMatches;
  }
};

const loadStoredScorers = (cat: GesligaCategoryKey): GesligaScorer[] => {
  try {
    const saved = localStorage.getItem(getScorersStorageKey(cat));
    return saved ? JSON.parse(saved) : GESLIGA_LEAGUE_PRESETS[cat].initialScorers;
  } catch {
    return GESLIGA_LEAGUE_PRESETS[cat].initialScorers;
  }
};

export const GesligaLeaguePanel: React.FC<GesligaLeaguePanelProps> = ({
  players = [],
  onNavigateToConvocatorias
}) => {
  const [selectedLeague, setSelectedLeague] = useState<GesligaCategoryKey>('primera-c');

  const [configsByCat, setConfigsByCat] = useState<Record<GesligaCategoryKey, GesligaConfig>>(() => ({
    'primera-c': loadStoredConfig('primera-c'),
    'sub-20': loadStoredConfig('sub-20')
  }));

  const [matchesByCat, setMatchesByCat] = useState<Record<GesligaCategoryKey, GesligaMatch[]>>(() => ({
    'primera-c': loadStoredMatches('primera-c'),
    'sub-20': loadStoredMatches('sub-20')
  }));

  const [scorersByCat, setScorersByCat] = useState<Record<GesligaCategoryKey, GesligaScorer[]>>(() => ({
    'primera-c': loadStoredScorers('primera-c'),
    'sub-20': loadStoredScorers('sub-20')
  }));

  const [activeTab, setActiveTab] = useState<'resumen' | 'resultados' | 'calendario' | 'goleadores'>('resumen');
  const [jornadaByCat, setJornadaByCat] = useState<Record<GesligaCategoryKey, number>>({
    'primera-c': GESLIGA_LEAGUE_PRESETS['primera-c'].defaultJornada,
    'sub-20': GESLIGA_LEAGUE_PRESETS['sub-20'].defaultJornada
  });
  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  // Link anchor editor state
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkInput, setLinkInput] = useState(configsByCat['primera-c'].clasificacionUrl);
  const [tournamentNameInput, setTournamentNameInput] = useState(configsByCat['primera-c'].nombreTorneo);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Match editor state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editHomeGoals, setEditHomeGoals] = useState<string>('');
  const [editAwayGoals, setEditAwayGoals] = useState<string>('');

  // Scorers add / inline edit state
  const [isAddingScorer, setIsAddingScorer] = useState(false);
  const [newScorerName, setNewScorerName] = useState('');
  const [newScorerDorsal, setNewScorerDorsal] = useState<number>(10);
  const [newScorerTeam, setNewScorerTeam] = useState('ACADEMIA F.S');
  const [newScorerPosition, setNewScorerPosition] = useState('Pívot');
  const [newScorerMatches, setNewScorerMatches] = useState<number>(1);
  const [newScorerGoals, setNewScorerGoals] = useState<number>(1);

  const [editingScorerId, setEditingScorerId] = useState<string | null>(null);
  const [editScorerForm, setEditScorerForm] = useState<Omit<GesligaScorer, 'id'>>({
    jugadorNombre: '',
    dorsal: 10,
    equipo: 'ACADEMIA F.S',
    posicion: 'Pívot',
    partidosJugados: 1,
    goles: 0
  });

  const preset = GESLIGA_LEAGUE_PRESETS[selectedLeague];
  const config = configsByCat[selectedLeague];
  const matches = matchesByCat[selectedLeague];
  const selectedJornada = jornadaByCat[selectedLeague];
  const currentScorers = scorersByCat[selectedLeague];

  const sortedScorers = useMemo(() => {
    return [...currentScorers].sort((a, b) => {
      if (b.goles !== a.goles) return b.goles - a.goles;
      const avgA = a.partidosJugados > 0 ? a.goles / a.partidosJugados : 0;
      const avgB = b.partidosJugados > 0 ? b.goles / b.partidosJugados : 0;
      if (avgB !== avgA) return avgB - avgA;
      return a.jugadorNombre.localeCompare(b.jugadorNombre);
    });
  }, [currentScorers]);

  const handleSelectLeague = (cat: GesligaCategoryKey) => {
    setSelectedLeague(cat);
    setLinkInput(configsByCat[cat].clasificacionUrl);
    setTournamentNameInput(configsByCat[cat].nombreTorneo);
    setIsEditingLink(false);
    setEditingMatchId(null);
    setEditingScorerId(null);
    setIsAddingScorer(false);
    setLinkError(null);
  };

  // Compute standings per category for summary cards & active table
  const standingsByCat = useMemo(() => {
    return {
      'primera-c': computeStandingsFromMatches(
        GESLIGA_LEAGUE_PRESETS['primera-c'].initialStandings,
        matchesByCat['primera-c']
      ),
      'sub-20': computeStandingsFromMatches(
        GESLIGA_LEAGUE_PRESETS['sub-20'].initialStandings,
        matchesByCat['sub-20']
      )
    };
  }, [matchesByCat]);

  const standings = standingsByCat[selectedLeague];
  const academiaStanding = standings.find((r) => r.isAcademia || r.equipo === 'ACADEMIA F.S');

  const academiaNextMatch = useMemo(() => {
    return (
      matches.find(
        (m) => !m.jugado && (m.local === 'ACADEMIA F.S' || m.visitante === 'ACADEMIA F.S')
      ) ||
      matches.find(
        (m) =>
          m.jornada === preset.defaultJornada &&
          (m.local === 'ACADEMIA F.S' || m.visitante === 'ACADEMIA F.S')
      )
    );
  }, [matches, preset.defaultJornada]);

  const academiaPlayedMatches = useMemo(() => {
    return matches
      .filter((m) => m.jugado && (m.local === 'ACADEMIA F.S' || m.visitante === 'ACADEMIA F.S'))
      .sort((a, b) => b.jornada - a.jornada);
  }, [matches]);

  const allPlayedMatches = useMemo(() => {
    return matches.filter((m) => m.jugado).sort((a, b) => b.jornada - a.jornada);
  }, [matches]);

  const jornadaNumbers = useMemo(() => {
    return Array.from(new Set(matches.map((m) => m.jornada))).sort((a, b) => a - b);
  }, [matches]);

  const highestPlayedJornada = useMemo(() => {
    const played = matches.filter((m) => m.jugado).map((m) => m.jornada);
    return played.length > 0 ? Math.max(...played) : 1;
  }, [matches]);

  const matchesForSelectedJornada = useMemo(() => {
    return matches.filter((m) => m.jornada === selectedJornada);
  }, [matches, selectedJornada]);

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseGesligaUrl(linkInput, tournamentNameInput.trim());
    if (!parsed) {
      setLinkError(
        `Ingrese una URL válida de Gesliga (ej. ${preset.config.clasificacionUrl}).`
      );
      return;
    }
    setConfigsByCat((prev) => ({ ...prev, [selectedLeague]: parsed }));
    localStorage.setItem(getConfigStorageKey(selectedLeague), JSON.stringify(parsed));
    setLinkError(null);
    setIsEditingLink(false);
  };

  const handleResetDefault = () => {
    const defaultCfg = preset.config;
    const defaultMatches = preset.initialMatches;
    setConfigsByCat((prev) => ({ ...prev, [selectedLeague]: defaultCfg }));
    setMatchesByCat((prev) => ({ ...prev, [selectedLeague]: defaultMatches }));
    localStorage.removeItem(getConfigStorageKey(selectedLeague));
    localStorage.removeItem(getMatchesStorageKey(selectedLeague));
    setLinkInput(defaultCfg.clasificacionUrl);
    setTournamentNameInput(defaultCfg.nombreTorneo);
    setIsEditingLink(false);
    setEditingMatchId(null);
  };

  // Scorers persistence & handlers
  const persistScorers = (cat: GesligaCategoryKey, nextList: GesligaScorer[]) => {
    setScorersByCat((prev) => ({ ...prev, [cat]: nextList }));
    localStorage.setItem(getScorersStorageKey(cat), JSON.stringify(nextList));
  };

  const handleResetScorers = () => {
    const defaults = preset.initialScorers;
    setScorersByCat((prev) => ({ ...prev, [selectedLeague]: defaults }));
    localStorage.removeItem(getScorersStorageKey(selectedLeague));
    setEditingScorerId(null);
  };

  const handlePickClubPlayerForNewScorer = (playerId: string) => {
    const p = players.find((pl) => pl.id === playerId);
    if (!p) return;
    setNewScorerName(`${p.nombre} ${p.apellidos}`);
    setNewScorerDorsal(p.dorsal);
    setNewScorerTeam('ACADEMIA F.S');
    setNewScorerPosition(p.posicion);
  };

  const handleAddScorer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScorerName.trim()) return;
    const item: GesligaScorer = {
      id: `sc-${selectedLeague}-${Date.now()}`,
      jugadorNombre: newScorerName.trim(),
      dorsal: Math.max(0, Number(newScorerDorsal) || 0),
      equipo: newScorerTeam.trim() || 'ACADEMIA F.S',
      posicion: newScorerPosition.trim() || 'Universal',
      partidosJugados: Math.max(1, Number(newScorerMatches) || 1),
      goles: Math.max(0, Number(newScorerGoals) || 0)
    };
    persistScorers(selectedLeague, [...currentScorers, item]);
    setNewScorerName('');
    setNewScorerDorsal(10);
    setNewScorerTeam('ACADEMIA F.S');
    setNewScorerPosition('Pívot');
    setNewScorerMatches(1);
    setNewScorerGoals(1);
    setIsAddingScorer(false);
  };

  const handleQuickAdjustGoals = (scorerId: string, delta: number) => {
    const next = currentScorers.map((s) =>
      s.id === scorerId ? { ...s, goles: Math.max(0, s.goles + delta) } : s
    );
    persistScorers(selectedLeague, next);
  };

  const handleStartEditScorer = (scorer: GesligaScorer) => {
    setEditingScorerId(scorer.id);
    setEditScorerForm({
      jugadorNombre: scorer.jugadorNombre,
      dorsal: scorer.dorsal,
      equipo: scorer.equipo,
      posicion: scorer.posicion,
      partidosJugados: scorer.partidosJugados,
      goles: scorer.goles
    });
  };

  const handleSaveEditScorer = (scorerId: string) => {
    if (!editScorerForm.jugadorNombre.trim()) return;
    const next = currentScorers.map((s) =>
      s.id === scorerId
        ? {
            ...s,
            jugadorNombre: editScorerForm.jugadorNombre.trim(),
            dorsal: Math.max(0, Number(editScorerForm.dorsal) || 0),
            equipo: editScorerForm.equipo.trim() || 'ACADEMIA F.S',
            posicion: editScorerForm.posicion.trim() || 'Universal',
            partidosJugados: Math.max(0, Number(editScorerForm.partidosJugados) || 0),
            goles: Math.max(0, Number(editScorerForm.goles) || 0)
          }
        : s
    );
    persistScorers(selectedLeague, next);
    setEditingScorerId(null);
  };

  const handleDeleteScorer = (scorerId: string) => {
    const next = currentScorers.filter((s) => s.id !== scorerId);
    persistScorers(selectedLeague, next);
    if (editingScorerId === scorerId) setEditingScorerId(null);
  };

  const openMatchEditor = (m: GesligaMatch) => {
    setEditingMatchId(m.id);
    setEditDate(m.fechaEstimada || '');
    setEditTime(m.horaEstimada || '');
    setEditVenue(m.cancha || '');
    setEditHomeGoals(m.golesLocal !== null ? String(m.golesLocal) : '');
    setEditAwayGoals(m.golesVisitante !== null ? String(m.golesVisitante) : '');
  };

  const saveMatchEdit = (m: GesligaMatch) => {
    const hasScore = editHomeGoals.trim() !== '' && editAwayGoals.trim() !== '';
    const updated = matches.map((item) => {
      if (item.id !== m.id) return item;
      return {
        ...item,
        fechaEstimada: editDate || item.fechaEstimada,
        horaEstimada: editTime || item.horaEstimada,
        cancha: editVenue || item.cancha,
        golesLocal: hasScore ? Math.max(0, Number(editHomeGoals)) : null,
        golesVisitante: hasScore ? Math.max(0, Number(editAwayGoals)) : null,
        jugado: hasScore
      };
    });
    setMatchesByCat((prev) => ({ ...prev, [selectedLeague]: updated }));
    localStorage.setItem(getMatchesStorageKey(selectedLeague), JSON.stringify(updated));
    setEditingMatchId(null);
  };

  const getAcademiaOutcome = (m: GesligaMatch): { label: string; cls: string } | null => {
    if (!m.jugado || m.golesLocal === null || m.golesVisitante === null) return null;
    const isHome = m.local === 'ACADEMIA F.S';
    const isAway = m.visitante === 'ACADEMIA F.S';
    if (!isHome && !isAway) return null;

    const gf = isHome ? m.golesLocal : m.golesVisitante;
    const gc = isHome ? m.golesVisitante : m.golesLocal;
    if (gf > gc) return { label: 'Victoria', cls: 'text-emerald-400' };
    if (gf === gc) return { label: 'Empate', cls: 'text-amber-400' };
    return { label: 'Derrota', cls: 'text-rose-400' };
  };

  const rivalNextStanding = academiaNextMatch
    ? standings.find(
        (r) =>
          r.equipo ===
          (academiaNextMatch.local === 'ACADEMIA F.S'
            ? academiaNextMatch.visitante
            : academiaNextMatch.local)
      )
    : undefined;

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Category Apartados Selector: Primera C vs Sub-20 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(['primera-c', 'sub-20'] as GesligaCategoryKey[]).map((catKey) => {
          const itemPreset = GESLIGA_LEAGUE_PRESETS[catKey];
          const itemConfig = configsByCat[catKey];
          const itemStandings = standingsByCat[catKey];
          const itemAcademia = itemStandings.find((r) => r.isAcademia || r.equipo === 'ACADEMIA F.S');
          const itemNext = matchesByCat[catKey].find(
            (m) => !m.jugado && (m.local === 'ACADEMIA F.S' || m.visitante === 'ACADEMIA F.S')
          );
          const isSelected = selectedLeague === catKey;
          const nextRival = itemNext
            ? itemNext.local === 'ACADEMIA F.S'
              ? itemNext.visitante
              : itemNext.local
            : 'Por definir';

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => handleSelectLeague(catKey)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                  Apartado {itemPreset.shortLabel} · Liga {itemConfig.ligaId}
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {itemStandings.length} equipos
                </span>
              </div>

              <div className={`text-sm font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {itemConfig.nombreTorneo}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono tabular-nums text-slate-300">
                <span>
                  Posición:{' '}
                  <strong className="text-amber-400">
                    {itemAcademia ? `${itemAcademia.pos}.º (${itemAcademia.pt} pts)` : '-'}
                  </strong>
                </span>
                <span className="text-slate-400 truncate">
                  Próx: <strong className="text-emerald-400">vs {nextRival}</strong>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Top Header + Anchored Gesliga Links */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-amber-400">
              Apartado {preset.shortLabel} · Gesliga
            </span>
            <span aria-hidden="true">·</span>
            <span>Liga {config.ligaId}</span>
            <span aria-hidden="true">·</span>
            <span>
              {standings.length} Equipos · {preset.maxJornada} Jornadas
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            {config.nombreTorneo}
          </h2>
        </div>

        {/* Anchored External Links & Link Editor Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={config.clasificacionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir Clasificación Gesliga
          </a>

          <a
            href={config.calendarioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Calendario en Gesliga
          </a>

          <button
            type="button"
            onClick={() => {
              setLinkInput(config.clasificacionUrl);
              setTournamentNameInput(config.nombreTorneo);
              setIsEditingLink((v) => !v);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5 text-amber-400" />
            {isEditingLink ? 'Cerrar Enlace' : 'Cambiar Link'}
          </button>
        </div>
      </div>

      {/* Inline Anchored Link Configuration Form */}
      {isEditingLink && (
        <form
          onSubmit={handleSaveLink}
          className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-xl space-y-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400">
              Anclar enlace oficial de partidos / tabla en Gesliga ({preset.shortLabel})
            </span>
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar Liga {preset.config.ligaId}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Enlace URL de Gesliga:</label>
              <input
                type="url"
                required
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder={preset.config.clasificacionUrl}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Nombre del Torneo:</label>
              <input
                type="text"
                value={tournamentNameInput}
                onChange={(e) => setTournamentNameInput(e.target.value)}
                placeholder={preset.config.nombreTorneo}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {linkError && <p className="text-rose-400 font-medium">{linkError}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingLink(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Guardar Enlace Anclado
            </button>
          </div>
        </form>
      )}

      {/* NEXT MATCH SPOTLIGHT + ACADEMIA POSITION */}
      {academiaNextMatch && (
        <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-amber-400">
                Siguiente Partido ({preset.shortLabel}) · Jornada {academiaNextMatch.jornada}
              </span>
              <span aria-hidden="true">·</span>
              <span>{academiaNextMatch.fechaEstimada || 'Por confirmar'}</span>
              {academiaNextMatch.horaEstimada && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-200">{academiaNextMatch.horaEstimada} hs</span>
                </>
              )}
              {academiaNextMatch.cancha && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{academiaNextMatch.cancha}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-extrabold text-white">
              <span className={academiaNextMatch.local === 'ACADEMIA F.S' ? 'text-amber-400' : 'text-white'}>
                {academiaNextMatch.local}
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">vs</span>
              <span className={academiaNextMatch.visitante === 'ACADEMIA F.S' ? 'text-amber-400' : 'text-white'}>
                {academiaNextMatch.visitante}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
              {academiaStanding && (
                <span>
                  ACADEMIA F.S: {academiaStanding.pos}.º lugar ({academiaStanding.pt} pts · DG {academiaStanding.dg >= 0 ? `+${academiaStanding.dg}` : academiaStanding.dg})
                </span>
              )}
              {rivalNextStanding && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Rival: {rivalNextStanding.pos}.º lugar ({rivalNextStanding.pt} pts · DG {rivalNextStanding.dg >= 0 ? `+${rivalNextStanding.dg}` : rivalNextStanding.dg})
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openMatchEditor(academiaNextMatch)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              Horario / Marcador
            </button>

            <button
              type="button"
              onClick={onNavigateToConvocatorias}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              Convocar Jugadores
            </button>
          </div>
        </div>
      )}

      {/* Inline Match Editor (Date/Time/Venue/Score) */}
      {editingMatchId && (
        (() => {
          const target = matches.find((m) => m.id === editingMatchId);
          if (!target) return null;
          return (
            <div className="p-4 bg-slate-950 border border-slate-700 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-white">
                Editar Partido ({preset.shortLabel} · Jornada {target.jornada}): {target.local} vs {target.visitante}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Fecha / Etiqueta:</label>
                  <input
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    placeholder="Ej. Sábado 15 Nov"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hora:</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="19:00"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Coliseo / Cancha:</label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    placeholder="Coliseo Municipal"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Goles {target.local}:</label>
                  <input
                    type="number"
                    min={0}
                    value={editHomeGoals}
                    onChange={(e) => setEditHomeGoals(e.target.value)}
                    placeholder="-"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Goles {target.visitante}:</label>
                  <input
                    type="number"
                    min={0}
                    value={editAwayGoals}
                    onChange={(e) => setEditAwayGoals(e.target.value)}
                    placeholder="-"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMatchId(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => saveMatchEdit(target)}
                  className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          );
        })()
      )}

      {/* Navigation Sub-Tabs inside League Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('resumen')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'resumen'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tabla de Posiciones ({standings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resultados')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'resultados'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resultados (J1–J{highestPlayedJornada})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendario')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'calendario'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Calendario Completo (J1–J{preset.maxJornada})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('goleadores')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'goleadores'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Goleadores ({currentScorers.length})
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Fuente anclada:{' '}
          <a
            href={config.clasificacionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            gesliga.com/Clasificacion.aspx?Liga={config.ligaId}
          </a>
        </span>
      </div>

      {/* TAB 1: STANDINGS TABLE + RECENT ACADEMIA RESULTS */}
      {activeTab === 'resumen' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Standings Table (8 cols) */}
          <div className="xl:col-span-8 overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">Equipo</th>
                  <th className="py-2.5 px-2 text-center font-mono">PJ</th>
                  <th className="py-2.5 px-2 text-center font-mono">PG</th>
                  <th className="py-2.5 px-2 text-center font-mono">PE</th>
                  <th className="py-2.5 px-2 text-center font-mono">PP</th>
                  <th className="py-2.5 px-2 text-center font-mono hidden sm:table-cell">GF</th>
                  <th className="py-2.5 px-2 text-center font-mono hidden sm:table-cell">GC</th>
                  <th className="py-2.5 px-2 text-center font-mono">DG</th>
                  <th className="py-2.5 px-3 text-right font-mono text-amber-400">Pt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {standings.map((row) => {
                  const isAcademia = row.isAcademia || row.equipo === 'ACADEMIA F.S';
                  const inClassificationZone = row.pos <= preset.classifiedPositionsCount;
                  return (
                    <tr
                      key={row.equipo}
                      className={
                        isAcademia
                          ? 'bg-amber-500/15 text-white font-semibold'
                          : 'hover:bg-slate-900/70 transition-colors'
                      }
                    >
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-400">
                        <span
                          className={
                            inClassificationZone
                              ? 'text-emerald-400 font-bold'
                              : isAcademia
                              ? 'text-amber-400 font-bold'
                              : ''
                          }
                        >
                          {row.pos}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={isAcademia ? 'text-amber-300 font-extrabold' : 'text-slate-100 font-medium'}>
                            {row.equipo}
                          </span>
                          {inClassificationZone && (
                            <span className="text-[10px] text-emerald-400/90 hidden md:inline">
                              · Clasificado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono tabular-nums">{row.pj}</td>
                      <td className="py-2.5 px-2 text-center font-mono tabular-nums text-emerald-400">{row.pg}</td>
                      <td className="py-2.5 px-2 text-center font-mono tabular-nums text-slate-400">{row.pe}</td>
                      <td className="py-2.5 px-2 text-center font-mono tabular-nums text-rose-400">{row.pp}</td>
                      <td className="py-2.5 px-2 text-center font-mono tabular-nums hidden sm:table-cell">{row.gf}</td>
                      <td className="py-2.5 px-2 text-center font-mono tabular-nums hidden sm:table-cell">{row.gc}</td>
                      <td
                        className={`py-2.5 px-2 text-center font-mono tabular-nums ${
                          row.dg > 0 ? 'text-emerald-400' : row.dg < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {row.dg > 0 ? `+${row.dg}` : row.dg}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold tabular-nums text-amber-400">
                        {row.pt}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent Results & Form of ACADEMIA F.S (4 cols) */}
          <div className="xl:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-white">
                Últimos Resultados · {preset.shortLabel}
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('resultados')}
                className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                Ver los {academiaPlayedMatches.length} partidos
              </button>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/50 overflow-hidden">
              {academiaPlayedMatches.slice(0, 5).map((m) => {
                const outcome = getAcademiaOutcome(m);
                return (
                  <div key={m.id} className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Jornada {m.jornada}</span>
                      {outcome && <span className={`font-bold ${outcome.cls}`}>{outcome.label}</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2 font-medium">
                      <span
                        className={`truncate ${
                          m.local === 'ACADEMIA F.S' ? 'text-amber-300 font-bold' : 'text-slate-200'
                        }`}
                      >
                        {m.local}
                      </span>
                      <span className="font-mono font-bold text-white tabular-nums shrink-0 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
                        {m.golesLocal} - {m.golesVisitante}
                      </span>
                      <span
                        className={`truncate text-right ${
                          m.visitante === 'ACADEMIA F.S' ? 'text-amber-300 font-bold' : 'text-slate-200'
                        }`}
                      >
                        {m.visitante}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>
                  Próxima Fecha (Jornada {academiaNextMatch?.jornada || preset.defaultJornada}):
                </span>
                <span className="text-amber-400 font-semibold">Pendiente de juego</span>
              </div>
              <div className="font-bold text-white">
                {academiaNextMatch
                  ? `${academiaNextMatch.local} vs ${academiaNextMatch.visitante}`
                  : 'Todos los partidos completados'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESULTS */}
      {activeTab === 'resultados' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Historial de marcadores oficiales disputados en {config.nombreTorneo}.
            </p>
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setShowAllResults(false)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  !showAllResults ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Partidos ACADEMIA F.S ({academiaPlayedMatches.length})
              </button>
              <button
                type="button"
                onClick={() => setShowAllResults(true)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  showAllResults ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Toda la Liga ({allPlayedMatches.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Jornada</th>
                  <th className="py-2.5 px-3 text-right">Local</th>
                  <th className="py-2.5 px-3 text-center">Marcador</th>
                  <th className="py-2.5 px-3">Visitante</th>
                  <th className="py-2.5 px-3 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {(showAllResults ? allPlayedMatches : academiaPlayedMatches).map((m) => {
                  const outcome = getAcademiaOutcome(m);
                  const involvesAcademia = m.local === 'ACADEMIA F.S' || m.visitante === 'ACADEMIA F.S';
                  return (
                    <tr
                      key={m.id}
                      className={involvesAcademia ? 'bg-amber-500/10' : 'hover:bg-slate-900/60'}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                        Jornada {m.jornada}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right whitespace-nowrap ${
                          m.local === 'ACADEMIA F.S' ? 'text-amber-300 font-bold' : 'text-slate-200'
                        }`}
                      >
                        {m.local}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-white tabular-nums px-2.5 py-0.5 bg-slate-900 border border-slate-700 rounded">
                          {m.golesLocal} - {m.golesVisitante}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 whitespace-nowrap ${
                          m.visitante === 'ACADEMIA F.S' ? 'text-amber-300 font-bold' : 'text-slate-200'
                        }`}
                      >
                        {m.visitante}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-semibold">
                        {outcome ? (
                          <span className={outcome.cls}>{outcome.label}</span>
                        ) : (
                          <span className="text-slate-500">Finalizado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FULL FIXTURE CALENDAR */}
      {activeTab === 'calendario' && (
        <div className="space-y-4">
          {/* Jornada Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {jornadaNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setJornadaByCat((prev) => ({ ...prev, [selectedLeague]: num }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    selectedJornada === num
                      ? 'bg-amber-500 text-slate-950'
                      : num === preset.defaultJornada
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  J{num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={selectedJornada <= 1}
                onClick={() =>
                  setJornadaByCat((prev) => ({
                    ...prev,
                    [selectedLeague]: Math.max(1, prev[selectedLeague] - 1)
                  }))
                }
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                aria-label="Jornada anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-white min-w-[125px] text-center">
                Jornada {selectedJornada}{' '}
                {selectedJornada === preset.defaultJornada ? '(Próxima)' : ''}
              </span>
              <button
                type="button"
                disabled={selectedJornada >= preset.maxJornada}
                onClick={() =>
                  setJornadaByCat((prev) => ({
                    ...prev,
                    [selectedLeague]: Math.min(preset.maxJornada, prev[selectedLeague] + 1)
                  }))
                }
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                aria-label="Siguiente jornada"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/50 overflow-hidden">
            {matchesForSelectedJornada.map((m) => {
              const involvesAcademia = m.local === 'ACADEMIA F.S' || m.visitante === 'ACADEMIA F.S';
              const outcome = getAcademiaOutcome(m);
              return (
                <div
                  key={m.id}
                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    involvesAcademia ? 'bg-amber-500/12' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`font-semibold truncate flex-1 text-right ${
                        m.local === 'ACADEMIA F.S' ? 'text-amber-300 font-bold' : 'text-slate-100'
                      }`}
                    >
                      {m.local}
                    </span>

                    {m.jugado && m.golesLocal !== null && m.golesVisitante !== null ? (
                      <span className="font-mono font-bold text-white tabular-nums px-3 py-1 bg-slate-900 border border-slate-700 rounded shrink-0">
                        {m.golesLocal} - {m.golesVisitante}
                      </span>
                    ) : (
                      <span className="font-mono text-amber-400 px-3 py-1 bg-slate-900 border border-amber-500/40 rounded shrink-0">
                        vs
                      </span>
                    )}

                    <span
                      className={`font-semibold truncate flex-1 ${
                        m.visitante === 'ACADEMIA F.S' ? 'text-amber-300 font-bold' : 'text-slate-100'
                      }`}
                    >
                      {m.visitante}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 text-[11px] text-slate-400 shrink-0">
                    {m.jugado ? (
                      outcome ? (
                        <span className={`font-bold ${outcome.cls}`}>{outcome.label}</span>
                      ) : (
                        <span>Finalizado</span>
                      )
                    ) : (
                      <span>
                        {m.fechaEstimada || 'Programado'}
                        {m.horaEstimada ? ` · ${m.horaEstimada}` : ''}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => openMatchEditor(m)}
                      className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: EDITABLE TOP SCORERS TABLE (PRIMERA C & SUB-20) */}
      {activeTab === 'goleadores' && (
        <div className="space-y-4">
          {/* Header Actions & Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>
                Tabla de Goleadores · <strong className="text-amber-400">{preset.shortLabel}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-200">
                Total goles registrados:{' '}
                <strong className="text-emerald-400">
                  {sortedScorers.reduce((acc, s) => acc + s.goles, 0)}
                </strong>
              </span>
              {sortedScorers[0] && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Líder:{' '}
                    <strong className="text-amber-300">
                      {sortedScorers[0].jugadorNombre} ({sortedScorers[0].goles})
                    </strong>
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetScorers}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Lista
              </button>
              <button
                type="button"
                onClick={() => setIsAddingScorer((v) => !v)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isAddingScorer ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {isAddingScorer ? 'Cerrar Formulario' : 'Agregar Goleador'}
              </button>
            </div>
          </div>

          {/* Add New Scorer Form */}
          {isAddingScorer && (
            <form
              onSubmit={handleAddScorer}
              className="p-4 bg-slate-950/90 border border-amber-500/40 rounded-xl space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <span className="font-bold text-amber-400">
                  Nuevo Goleador · Apartado {preset.shortLabel}
                </span>
                {players.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => handlePickClubPlayerForNewScorer(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    aria-label="Cargar jugador del plantel"
                  >
                    <option value="">-- Cargar jugador del plantel (opcional) --</option>
                    {players.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        #{pl.dorsal} {pl.nombre} {pl.apellidos} ({pl.equipoNombre})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-slate-400 mb-1">Nombre del Jugador:</label>
                  <input
                    type="text"
                    required
                    value={newScorerName}
                    onChange={(e) => setNewScorerName(e.target.value)}
                    placeholder="Ej. Ronald Justiniano"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Dorsal (#):</label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={newScorerDorsal}
                    onChange={(e) => setNewScorerDorsal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Equipo:</label>
                  <input
                    type="text"
                    value={newScorerTeam}
                    onChange={(e) => setNewScorerTeam(e.target.value)}
                    list={`teams-${selectedLeague}`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <datalist id={`teams-${selectedLeague}`}>
                    {standings.map((st) => (
                      <option key={st.equipo} value={st.equipo} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Posición:</label>
                  <select
                    value={newScorerPosition}
                    onChange={(e) => setNewScorerPosition(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="Pívot">Pívot</option>
                    <option value="Ala Izquierda">Ala Izquierda</option>
                    <option value="Ala Derecha">Ala Derecha</option>
                    <option value="Universal">Universal</option>
                    <option value="Cierre">Cierre</option>
                    <option value="Arquero">Arquero</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">PJ:</label>
                    <input
                      type="number"
                      min={0}
                      value={newScorerMatches}
                      onChange={(e) => setNewScorerMatches(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Goles:</label>
                    <input
                      type="number"
                      min={0}
                      value={newScorerGoals}
                      onChange={(e) => setNewScorerGoals(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-amber-400 font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingScorer(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar Goleador
                </button>
              </div>
            </form>
          )}

          {/* Scorers Table */}
          {sortedScorers.length === 0 ? (
            <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-950/50 space-y-2">
              <p className="text-xs text-slate-400">
                No hay goleadores registrados en el apartado {preset.shortLabel}.
              </p>
              <button
                type="button"
                onClick={() => setIsAddingScorer(true)}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Primer Goleador
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3 text-center w-14">Dorsal</th>
                    <th className="py-2.5 px-3">Jugador</th>
                    <th className="py-2.5 px-3">Equipo</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Posición</th>
                    <th className="py-2.5 px-2 text-center font-mono">PJ</th>
                    <th className="py-2.5 px-3 text-center font-mono text-amber-400">Goles</th>
                    <th className="py-2.5 px-2 text-center font-mono hidden md:table-cell">Prom. G/P</th>
                    <th className="py-2.5 px-3 text-right">Editar / Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {sortedScorers.map((scorer, idx) => {
                    const isEditing = editingScorerId === scorer.id;
                    const isLeader = idx === 0 && scorer.goles > 0;
                    const isAcademia = scorer.equipo.toUpperCase().includes('ACADEMIA');
                    const avg =
                      scorer.partidosJugados > 0
                        ? (scorer.goles / scorer.partidosJugados).toFixed(2)
                        : '0.00';

                    if (isEditing) {
                      return (
                        <tr key={scorer.id} className="bg-amber-500/10">
                          <td className="py-2 px-3 text-center font-mono tabular-nums text-amber-400 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min={0}
                              max={99}
                              value={editScorerForm.dorsal}
                              onChange={(e) =>
                                setEditScorerForm({ ...editScorerForm, dorsal: Number(e.target.value) })
                              }
                              className="w-14 bg-slate-900 border border-amber-500/50 rounded px-1.5 py-1 text-center font-mono text-white"
                              aria-label="Editar dorsal"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={editScorerForm.jugadorNombre}
                              onChange={(e) =>
                                setEditScorerForm({ ...editScorerForm, jugadorNombre: e.target.value })
                              }
                              className="w-full min-w-[160px] bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-white"
                              aria-label="Editar nombre del jugador"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={editScorerForm.equipo}
                              onChange={(e) =>
                                setEditScorerForm({ ...editScorerForm, equipo: e.target.value })
                              }
                              list={`teams-${selectedLeague}`}
                              className="w-full min-w-[120px] bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-white"
                              aria-label="Editar equipo"
                            />
                          </td>
                          <td className="py-2 px-2 hidden sm:table-cell">
                            <select
                              value={editScorerForm.posicion}
                              onChange={(e) =>
                                setEditScorerForm({ ...editScorerForm, posicion: e.target.value })
                              }
                              className="bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-white"
                              aria-label="Editar posición"
                            >
                              <option value="Pívot">Pívot</option>
                              <option value="Ala Izquierda">Ala Izquierda</option>
                              <option value="Ala Derecha">Ala Derecha</option>
                              <option value="Universal">Universal</option>
                              <option value="Cierre">Cierre</option>
                              <option value="Arquero">Arquero</option>
                            </select>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={editScorerForm.partidosJugados}
                              onChange={(e) =>
                                setEditScorerForm({
                                  ...editScorerForm,
                                  partidosJugados: Number(e.target.value)
                                })
                              }
                              className="w-14 bg-slate-900 border border-amber-500/50 rounded px-1.5 py-1 text-center font-mono text-white"
                              aria-label="Editar partidos jugados"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={editScorerForm.goles}
                              onChange={(e) =>
                                setEditScorerForm({ ...editScorerForm, goles: Number(e.target.value) })
                              }
                              className="w-16 bg-slate-900 border border-amber-500 rounded px-1.5 py-1 text-center font-mono font-bold text-amber-400"
                              aria-label="Editar goles"
                            />
                          </td>
                          <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-400 hidden md:table-cell">
                            {editScorerForm.partidosJugados > 0
                              ? (editScorerForm.goles / editScorerForm.partidosJugados).toFixed(2)
                              : '0.00'}
                          </td>
                          <td className="py-2 px-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveEditScorer(scorer.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingScorerId(null)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={scorer.id}
                        className={isLeader ? 'bg-amber-500/12' : 'hover:bg-slate-900/70 transition-colors'}
                      >
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                          <span className={isLeader ? 'text-amber-400 font-extrabold' : 'text-slate-400'}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400 tabular-nums">
                          #{scorer.dorsal}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={isLeader ? 'font-bold text-white' : 'font-semibold text-slate-100'}>
                            {scorer.jugadorNombre}
                          </span>
                          {isLeader && (
                            <span className="text-[10px] text-amber-400 ml-2 font-medium">
                              · Puntero
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={isAcademia ? 'text-amber-300 font-semibold' : 'text-slate-300'}>
                            {scorer.equipo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 hidden sm:table-cell">
                          {scorer.posicion}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono tabular-nums text-slate-300">
                          {scorer.partidosJugados}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustGoals(scorer.id, -1)}
                              disabled={scorer.goles <= 0}
                              title="Restar 1 gol"
                              className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center disabled:opacity-35 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-extrabold text-amber-400 tabular-nums min-w-[26px] text-center text-sm">
                              {scorer.goles}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustGoals(scorer.id, 1)}
                              title="Sumar 1 gol"
                              className="w-6 h-6 rounded bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-amber-300 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono tabular-nums text-emerald-400 hidden md:table-cell">
                          {avg}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditScorer(scorer)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteScorer(scorer.id)}
                              title="Eliminar goleador"
                              className="p-1.5 rounded bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-900/60 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
