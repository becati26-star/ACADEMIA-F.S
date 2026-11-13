/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Datos oficiales de ligas vinculados a Gesliga:
 * 1) Primera "C" Serie "B" Claus. 2026 (Liga ID: 510727)
 * 2) Sub-20 Clausura Serie "D" (Liga ID: 512812)
 */

export type GesligaCategoryKey = 'primera-c' | 'sub-20';

export interface GesligaStandingRow {
  pos: number;
  equipo: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  pt: number;
  dg: number;
  isAcademia?: boolean;
}

export interface GesligaMatch {
  id: string;
  jornada: number;
  local: string;
  visitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  jugado: boolean;
  fechaEstimada?: string;
  horaEstimada?: string;
  cancha?: string;
}

export interface GesligaConfig {
  ligaId: string;
  nombreTorneo: string;
  clasificacionUrl: string;
  calendarioUrl: string;
}

export interface GesligaScorer {
  id: string;
  jugadorNombre: string;
  dorsal: number;
  equipo: string;
  posicion: string;
  partidosJugados: number;
  goles: number;
}

export interface GesligaLeaguePreset {
  key: GesligaCategoryKey;
  shortLabel: string;
  categoryLabel: string;
  config: GesligaConfig;
  initialStandings: GesligaStandingRow[];
  initialMatches: GesligaMatch[];
  initialScorers: GesligaScorer[];
  defaultJornada: number;
  maxJornada: number;
  classifiedPositionsCount: number;
}

export const DEFAULT_GESLIGA_CONFIG: GesligaConfig = {
  ligaId: '510727',
  nombreTorneo: 'PRIMERA "C" SERIE "B" CLAUS. 2026',
  clasificacionUrl: 'https://www.gesliga.com/Clasificacion.aspx?Liga=510727',
  calendarioUrl: 'https://www.gesliga.com/Calendario.aspx?Liga=510727'
};

export const INITIAL_GESLIGA_STANDINGS: GesligaStandingRow[] = [
  { pos: 1, equipo: 'PST FUTSAL', pj: 10, pg: 7, pe: 1, pp: 2, gf: 80, gc: 44, pt: 22, dg: 36 },
  { pos: 2, equipo: 'C.D AGAPE FUTSAL', pj: 10, pg: 6, pe: 4, pp: 0, gf: 59, gc: 31, pt: 22, dg: 28 },
  { pos: 3, equipo: 'PETROLERO CBBA', pj: 10, pg: 7, pe: 1, pp: 2, gf: 46, gc: 30, pt: 22, dg: 16 },
  { pos: 4, equipo: 'NIQUELA2', pj: 10, pg: 6, pe: 2, pp: 2, gf: 53, gc: 30, pt: 20, dg: 23 },
  { pos: 5, equipo: 'ANGIRU', pj: 10, pg: 6, pe: 2, pp: 2, gf: 57, gc: 35, pt: 20, dg: 22 },
  { pos: 6, equipo: 'SAN JOSE DE CHIQUITOS', pj: 10, pg: 6, pe: 1, pp: 3, gf: 67, gc: 49, pt: 19, dg: 18 },
  { pos: 7, equipo: 'C.D PUERTO RICO', pj: 10, pg: 6, pe: 0, pp: 4, gf: 79, gc: 50, pt: 18, dg: 29 },
  { pos: 8, equipo: 'ACADEMIA F.S', pj: 10, pg: 4, pe: 1, pp: 5, gf: 42, gc: 39, pt: 13, dg: 3, isAcademia: true },
  { pos: 9, equipo: 'TETOS', pj: 10, pg: 4, pe: 0, pp: 6, gf: 51, gc: 59, pt: 12, dg: -8 },
  { pos: 10, equipo: 'ESCUELA DE FUTSAL JR', pj: 10, pg: 1, pe: 0, pp: 9, gf: 19, gc: 61, pt: 3, dg: -42 },
  { pos: 11, equipo: 'WARRIOR´S', pj: 10, pg: 1, pe: 0, pp: 9, gf: 27, gc: 89, pt: 3, dg: -62 },
  { pos: 12, equipo: 'F. SOCIEDAD DEPORT.', pj: 10, pg: 0, pe: 0, pp: 10, gf: 29, gc: 92, pt: 0, dg: -63 }
];

export const INITIAL_GESLIGA_MATCHES: GesligaMatch[] = [
  // Jornada 1
  { id: 'j1-1', jornada: 1, local: 'NIQUELA2', visitante: 'F. SOCIEDAD DEPORT.', golesLocal: 6, golesVisitante: 2, jugado: true },
  { id: 'j1-2', jornada: 1, local: 'PST FUTSAL', visitante: 'ANGIRU', golesLocal: 5, golesVisitante: 1, jugado: true },
  { id: 'j1-3', jornada: 1, local: 'C.D AGAPE FUTSAL', visitante: 'WARRIOR´S', golesLocal: 11, golesVisitante: 4, jugado: true },
  { id: 'j1-4', jornada: 1, local: 'C.D PUERTO RICO', visitante: 'SAN JOSE DE CHIQUITOS', golesLocal: 14, golesVisitante: 0, jugado: true },
  { id: 'j1-5', jornada: 1, local: 'ESCUELA DE FUTSAL JR', visitante: 'PETROLERO CBBA', golesLocal: 1, golesVisitante: 5, jugado: true },
  { id: 'j1-6', jornada: 1, local: 'ACADEMIA F.S', visitante: 'TETOS', golesLocal: 3, golesVisitante: 2, jugado: true },

  // Jornada 2
  { id: 'j2-1', jornada: 2, local: 'ANGIRU', visitante: 'NIQUELA2', golesLocal: 4, golesVisitante: 4, jugado: true },
  { id: 'j2-2', jornada: 2, local: 'WARRIOR´S', visitante: 'PST FUTSAL', golesLocal: 3, golesVisitante: 12, jugado: true },
  { id: 'j2-3', jornada: 2, local: 'SAN JOSE DE CHIQUITOS', visitante: 'TETOS', golesLocal: 10, golesVisitante: 4, jugado: true },
  { id: 'j2-4', jornada: 2, local: 'PETROLERO CBBA', visitante: 'C.D AGAPE FUTSAL', golesLocal: 2, golesVisitante: 2, jugado: true },
  { id: 'j2-5', jornada: 2, local: 'ESCUELA DE FUTSAL JR', visitante: 'C.D PUERTO RICO', golesLocal: 3, golesVisitante: 9, jugado: true },
  { id: 'j2-6', jornada: 2, local: 'F. SOCIEDAD DEPORT.', visitante: 'ACADEMIA F.S', golesLocal: 3, golesVisitante: 10, jugado: true },

  // Jornada 3
  { id: 'j3-1', jornada: 3, local: 'ANGIRU', visitante: 'WARRIOR´S', golesLocal: 6, golesVisitante: 4, jugado: true },
  { id: 'j3-2', jornada: 3, local: 'F. SOCIEDAD DEPORT.', visitante: 'SAN JOSE DE CHIQUITOS', golesLocal: 4, golesVisitante: 6, jugado: true },
  { id: 'j3-3', jornada: 3, local: 'PST FUTSAL', visitante: 'PETROLERO CBBA', golesLocal: 3, golesVisitante: 7, jugado: true },
  { id: 'j3-4', jornada: 3, local: 'TETOS', visitante: 'ESCUELA DE FUTSAL JR', golesLocal: 5, golesVisitante: 2, jugado: true },
  { id: 'j3-5', jornada: 3, local: 'C.D AGAPE FUTSAL', visitante: 'C.D PUERTO RICO', golesLocal: 9, golesVisitante: 3, jugado: true },
  { id: 'j3-6', jornada: 3, local: 'ACADEMIA F.S', visitante: 'NIQUELA2', golesLocal: 1, golesVisitante: 5, jugado: true },

  // Jornada 4
  { id: 'j4-1', jornada: 4, local: 'WARRIOR´S', visitante: 'NIQUELA2', golesLocal: 0, golesVisitante: 13, jugado: true },
  { id: 'j4-2', jornada: 4, local: 'PETROLERO CBBA', visitante: 'ANGIRU', golesLocal: 5, golesVisitante: 2, jugado: true },
  { id: 'j4-3', jornada: 4, local: 'ESCUELA DE FUTSAL JR', visitante: 'F. SOCIEDAD DEPORT.', golesLocal: 2, golesVisitante: 0, jugado: true },
  { id: 'j4-4', jornada: 4, local: 'C.D PUERTO RICO', visitante: 'PST FUTSAL', golesLocal: 8, golesVisitante: 10, jugado: true },
  { id: 'j4-5', jornada: 4, local: 'C.D AGAPE FUTSAL', visitante: 'TETOS', golesLocal: 8, golesVisitante: 6, jugado: true },
  { id: 'j4-6', jornada: 4, local: 'SAN JOSE DE CHIQUITOS', visitante: 'ACADEMIA F.S', golesLocal: 6, golesVisitante: 5, jugado: true },

  // Jornada 5
  { id: 'j5-1', jornada: 5, local: 'NIQUELA2', visitante: 'SAN JOSE DE CHIQUITOS', golesLocal: 5, golesVisitante: 3, jugado: true },
  { id: 'j5-2', jornada: 5, local: 'WARRIOR´S', visitante: 'PETROLERO CBBA', golesLocal: 0, golesVisitante: 2, jugado: true },
  { id: 'j5-3', jornada: 5, local: 'ANGIRU', visitante: 'C.D PUERTO RICO', golesLocal: 4, golesVisitante: 3, jugado: true },
  { id: 'j5-4', jornada: 5, local: 'F. SOCIEDAD DEPORT.', visitante: 'C.D AGAPE FUTSAL', golesLocal: 2, golesVisitante: 9, jugado: true },
  { id: 'j5-5', jornada: 5, local: 'PST FUTSAL', visitante: 'TETOS', golesLocal: 7, golesVisitante: 5, jugado: true },
  { id: 'j5-6', jornada: 5, local: 'ACADEMIA F.S', visitante: 'ESCUELA DE FUTSAL JR', golesLocal: 4, golesVisitante: 2, jugado: true },

  // Jornada 6
  { id: 'j6-1', jornada: 6, local: 'PETROLERO CBBA', visitante: 'NIQUELA2', golesLocal: 4, golesVisitante: 6, jugado: true },
  { id: 'j6-2', jornada: 6, local: 'ESCUELA DE FUTSAL JR', visitante: 'SAN JOSE DE CHIQUITOS', golesLocal: 1, golesVisitante: 12, jugado: true },
  { id: 'j6-3', jornada: 6, local: 'C.D PUERTO RICO', visitante: 'WARRIOR´S', golesLocal: 11, golesVisitante: 4, jugado: true },
  { id: 'j6-4', jornada: 6, local: 'TETOS', visitante: 'ANGIRU', golesLocal: 2, golesVisitante: 6, jugado: true },
  { id: 'j6-5', jornada: 6, local: 'PST FUTSAL', visitante: 'F. SOCIEDAD DEPORT.', golesLocal: 21, golesVisitante: 1, jugado: true },
  { id: 'j6-6', jornada: 6, local: 'C.D AGAPE FUTSAL', visitante: 'ACADEMIA F.S', golesLocal: 5, golesVisitante: 2, jugado: true },

  // Jornada 7
  { id: 'j7-1', jornada: 7, local: 'NIQUELA2', visitante: 'ESCUELA DE FUTSAL JR', golesLocal: 3, golesVisitante: 1, jugado: true },
  { id: 'j7-2', jornada: 7, local: 'PETROLERO CBBA', visitante: 'C.D PUERTO RICO', golesLocal: 0, golesVisitante: 5, jugado: true },
  { id: 'j7-3', jornada: 7, local: 'SAN JOSE DE CHIQUITOS', visitante: 'C.D AGAPE FUTSAL', golesLocal: 3, golesVisitante: 3, jugado: true },
  { id: 'j7-4', jornada: 7, local: 'WARRIOR´S', visitante: 'TETOS', golesLocal: 4, golesVisitante: 8, jugado: true },
  { id: 'j7-5', jornada: 7, local: 'ANGIRU', visitante: 'F. SOCIEDAD DEPORT.', golesLocal: 13, golesVisitante: 3, jugado: true },
  { id: 'j7-6', jornada: 7, local: 'ACADEMIA F.S', visitante: 'PST FUTSAL', golesLocal: 5, golesVisitante: 7, jugado: true },

  // Jornada 8
  { id: 'j8-1', jornada: 8, local: 'C.D PUERTO RICO', visitante: 'NIQUELA2', golesLocal: 7, golesVisitante: 4, jugado: true },
  { id: 'j8-2', jornada: 8, local: 'C.D AGAPE FUTSAL', visitante: 'ESCUELA DE FUTSAL JR', golesLocal: 5, golesVisitante: 2, jugado: true },
  { id: 'j8-3', jornada: 8, local: 'TETOS', visitante: 'PETROLERO CBBA', golesLocal: 4, golesVisitante: 6, jugado: true },
  { id: 'j8-4', jornada: 8, local: 'PST FUTSAL', visitante: 'SAN JOSE DE CHIQUITOS', golesLocal: 3, golesVisitante: 7, jugado: true },
  { id: 'j8-5', jornada: 8, local: 'F. SOCIEDAD DEPORT.', visitante: 'WARRIOR´S', golesLocal: 3, golesVisitante: 4, jugado: true },
  { id: 'j8-6', jornada: 8, local: 'ANGIRU', visitante: 'ACADEMIA F.S', golesLocal: 3, golesVisitante: 3, jugado: true },

  // Jornada 9
  { id: 'j9-1', jornada: 9, local: 'NIQUELA2', visitante: 'C.D AGAPE FUTSAL', golesLocal: 3, golesVisitante: 3, jugado: true },
  { id: 'j9-2', jornada: 9, local: 'C.D PUERTO RICO', visitante: 'TETOS', golesLocal: 9, golesVisitante: 10, jugado: true },
  { id: 'j9-3', jornada: 9, local: 'ESCUELA DE FUTSAL JR', visitante: 'PST FUTSAL', golesLocal: 3, golesVisitante: 8, jugado: true },
  { id: 'j9-4', jornada: 9, local: 'PETROLERO CBBA', visitante: 'F. SOCIEDAD DEPORT.', golesLocal: 11, golesVisitante: 5, jugado: true },
  { id: 'j9-5', jornada: 9, local: 'SAN JOSE DE CHIQUITOS', visitante: 'ANGIRU', golesLocal: 4, golesVisitante: 8, jugado: true },
  { id: 'j9-6', jornada: 9, local: 'ACADEMIA F.S', visitante: 'WARRIOR´S', golesLocal: 7, golesVisitante: 2, jugado: true },

  // Jornada 10
  { id: 'j10-1', jornada: 10, local: 'TETOS', visitante: 'NIQUELA2', golesLocal: 5, golesVisitante: 4, jugado: true },
  { id: 'j10-2', jornada: 10, local: 'PST FUTSAL', visitante: 'C.D AGAPE FUTSAL', golesLocal: 4, golesVisitante: 4, jugado: true },
  { id: 'j10-3', jornada: 10, local: 'F. SOCIEDAD DEPORT.', visitante: 'C.D PUERTO RICO', golesLocal: 6, golesVisitante: 10, jugado: true },
  { id: 'j10-4', jornada: 10, local: 'ANGIRU', visitante: 'ESCUELA DE FUTSAL JR', golesLocal: 10, golesVisitante: 2, jugado: true },
  { id: 'j10-5', jornada: 10, local: 'WARRIOR´S', visitante: 'SAN JOSE DE CHIQUITOS', golesLocal: 2, golesVisitante: 16, jugado: true },
  { id: 'j10-6', jornada: 10, local: 'PETROLERO CBBA', visitante: 'ACADEMIA F.S', golesLocal: 4, golesVisitante: 2, jugado: true },

  // Jornada 11 (Siguiente Partido / Fecha Programada)
  { id: 'j11-1', jornada: 11, local: 'NIQUELA2', visitante: 'PST FUTSAL', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Por confirmar (Fecha 11)', horaEstimada: '19:30', cancha: 'Coliseo Oficial ADFS' },
  { id: 'j11-2', jornada: 11, local: 'TETOS', visitante: 'F. SOCIEDAD DEPORT.', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Por confirmar (Fecha 11)', horaEstimada: '20:15', cancha: 'Coliseo Oficial ADFS' },
  { id: 'j11-3', jornada: 11, local: 'C.D AGAPE FUTSAL', visitante: 'ANGIRU', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Por confirmar (Fecha 11)', horaEstimada: '21:00', cancha: 'Coliseo Oficial ADFS' },
  { id: 'j11-4', jornada: 11, local: 'ESCUELA DE FUTSAL JR', visitante: 'WARRIOR´S', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Por confirmar (Fecha 11)', horaEstimada: '18:00', cancha: 'Coliseo Oficial ADFS' },
  { id: 'j11-5', jornada: 11, local: 'PETROLERO CBBA', visitante: 'SAN JOSE DE CHIQUITOS', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Por confirmar (Fecha 11)', horaEstimada: '18:45', cancha: 'Coliseo Oficial ADFS' },
  { id: 'j11-6', jornada: 11, local: 'ACADEMIA F.S', visitante: 'C.D PUERTO RICO', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Próxima Fecha · Jornada 11', horaEstimada: '20:45', cancha: 'Coliseo Polideportivo Central' }
];

// SUB-20 CLAUSURA SERIE "D" (Liga 512812)
export const SUB20_GESLIGA_CONFIG: GesligaConfig = {
  ligaId: '512812',
  nombreTorneo: 'SUB-20 CLAUSURA SERIE "D"',
  clasificacionUrl: 'https://www.gesliga.com/Clasificacion.aspx?Liga=512812',
  calendarioUrl: 'https://www.gesliga.com/Calendario.aspx?Liga=512812'
};

export const INITIAL_SUB20_STANDINGS: GesligaStandingRow[] = [
  { pos: 1, equipo: 'F.C LIDER', pj: 2, pg: 1, pe: 1, pp: 0, gf: 11, gc: 9, pt: 4, dg: 2 },
  { pos: 2, equipo: 'SAJ Y GOL', pj: 1, pg: 1, pe: 0, pp: 0, gf: 7, gc: 0, pt: 3, dg: 7 },
  { pos: 3, equipo: 'ACADEMIA F.S', pj: 1, pg: 1, pe: 0, pp: 0, gf: 4, gc: 1, pt: 3, dg: 3, isAcademia: true },
  { pos: 4, equipo: 'BOSCO PROMO 2024', pj: 2, pg: 0, pe: 1, pp: 1, gf: 4, gc: 11, pt: 1, dg: -7 },
  { pos: 5, equipo: 'TAMBO HONDO', pj: 1, pg: 0, pe: 0, pp: 1, gf: 5, gc: 7, pt: 0, dg: -2 },
  { pos: 6, equipo: 'TALENTO F.C', pj: 1, pg: 0, pe: 0, pp: 1, gf: 1, gc: 4, pt: 0, dg: -3 }
];

export const INITIAL_SUB20_MATCHES: GesligaMatch[] = [
  // Jornada 1
  { id: 's20-j1-1', jornada: 1, local: 'BOSCO PROMO 2024', visitante: 'SAJ Y GOL', golesLocal: 0, golesVisitante: 7, jugado: true },
  { id: 's20-j1-2', jornada: 1, local: 'F.C LIDER', visitante: 'TAMBO HONDO', golesLocal: 7, golesVisitante: 5, jugado: true },
  { id: 's20-j1-3', jornada: 1, local: 'ACADEMIA F.S', visitante: 'TALENTO F.C', golesLocal: 4, golesVisitante: 1, jugado: true },

  // Jornada 2 (Siguiente Partido de ACADEMIA F.S Sub-20)
  { id: 's20-j2-1', jornada: 2, local: 'TAMBO HONDO', visitante: 'TALENTO F.C', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Por confirmar (Fecha 2)', horaEstimada: '18:00', cancha: 'Coliseo Municipal Sub-20' },
  { id: 's20-j2-2', jornada: 2, local: 'F.C LIDER', visitante: 'BOSCO PROMO 2024', golesLocal: 4, golesVisitante: 4, jugado: true },
  { id: 's20-j2-3', jornada: 2, local: 'SAJ Y GOL', visitante: 'ACADEMIA F.S', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Próxima Fecha · Jornada 2', horaEstimada: '19:00', cancha: 'Coliseo Municipal Sub-20' },

  // Jornada 3
  { id: 's20-j3-1', jornada: 3, local: 'SAJ Y GOL', visitante: 'F.C LIDER', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 3 Programada' },
  { id: 's20-j3-2', jornada: 3, local: 'TALENTO F.C', visitante: 'BOSCO PROMO 2024', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 3 Programada' },
  { id: 's20-j3-3', jornada: 3, local: 'ACADEMIA F.S', visitante: 'TAMBO HONDO', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 3 Programada' },

  // Jornada 4
  { id: 's20-j4-1', jornada: 4, local: 'BOSCO PROMO 2024', visitante: 'TAMBO HONDO', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 4 Programada' },
  { id: 's20-j4-2', jornada: 4, local: 'TALENTO F.C', visitante: 'SAJ Y GOL', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 4 Programada' },
  { id: 's20-j4-3', jornada: 4, local: 'F.C LIDER', visitante: 'ACADEMIA F.S', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 4 Programada' },

  // Jornada 5
  { id: 's20-j5-1', jornada: 5, local: 'F.C LIDER', visitante: 'TALENTO F.C', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 5 Programada' },
  { id: 's20-j5-2', jornada: 5, local: 'TAMBO HONDO', visitante: 'SAJ Y GOL', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 5 Programada' },
  { id: 's20-j5-3', jornada: 5, local: 'ACADEMIA F.S', visitante: 'BOSCO PROMO 2024', golesLocal: null, golesVisitante: null, jugado: false, fechaEstimada: 'Fecha 5 Programada' }
];

export const INITIAL_PRIMERA_C_SCORERS: GesligaScorer[] = [
  { id: 'sc-pc-1', jugadorNombre: 'Ronald Justiniano Arteaga', dorsal: 10, equipo: 'ACADEMIA F.S', posicion: 'Pívot', partidosJugados: 10, goles: 14 },
  { id: 'sc-pc-2', jugadorNombre: 'Wilmer Villagómez Rojas', dorsal: 6, equipo: 'ACADEMIA F.S', posicion: 'Ala Derecha', partidosJugados: 10, goles: 9 },
  { id: 'sc-pc-3', jugadorNombre: 'Mateo García Silva', dorsal: 10, equipo: 'ACADEMIA F.S', posicion: 'Ala Izquierda', partidosJugados: 9, goles: 8 },
  { id: 'sc-pc-4', jugadorNombre: 'Christian Torrico Balderrama', dorsal: 8, equipo: 'ACADEMIA F.S', posicion: 'Universal', partidosJugados: 10, goles: 6 },
  { id: 'sc-pc-5', jugadorNombre: 'Javier Choque Saldaña', dorsal: 4, equipo: 'ACADEMIA F.S', posicion: 'Cierre', partidosJugados: 10, goles: 5 }
];

export const INITIAL_SUB20_SCORERS: GesligaScorer[] = [
  { id: 'sc-s20-1', jugadorNombre: 'Christian Torrico Balderrama', dorsal: 8, equipo: 'ACADEMIA F.S', posicion: 'Universal', partidosJugados: 1, goles: 2 },
  { id: 'sc-s20-2', jugadorNombre: 'Mauricio Guzmán Loza', dorsal: 11, equipo: 'ACADEMIA F.S', posicion: 'Ala Izquierda', partidosJugados: 1, goles: 1 },
  { id: 'sc-s20-3', jugadorNombre: 'Kevin Vargas Zeballos', dorsal: 9, equipo: 'ACADEMIA F.S', posicion: 'Pívot', partidosJugados: 1, goles: 1 }
];

export const GESLIGA_LEAGUE_PRESETS: Record<GesligaCategoryKey, GesligaLeaguePreset> = {
  'primera-c': {
    key: 'primera-c',
    shortLabel: 'Primera C',
    categoryLabel: 'Primera "C" Serie "B" Claus. 2026',
    config: DEFAULT_GESLIGA_CONFIG,
    initialStandings: INITIAL_GESLIGA_STANDINGS,
    initialMatches: INITIAL_GESLIGA_MATCHES,
    initialScorers: INITIAL_PRIMERA_C_SCORERS,
    defaultJornada: 11,
    maxJornada: 11,
    classifiedPositionsCount: 4
  },
  'sub-20': {
    key: 'sub-20',
    shortLabel: 'Sub-20',
    categoryLabel: 'Sub-20 Clausura Serie "D"',
    config: SUB20_GESLIGA_CONFIG,
    initialStandings: INITIAL_SUB20_STANDINGS,
    initialMatches: INITIAL_SUB20_MATCHES,
    initialScorers: INITIAL_SUB20_SCORERS,
    defaultJornada: 2,
    maxJornada: 5,
    classifiedPositionsCount: 2
  }
};
