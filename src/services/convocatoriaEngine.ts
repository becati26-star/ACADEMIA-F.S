/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Convocatoria Engine for Futsal - ACADEMIA F.S.
 * Evaluates performance (physical, technical, tactical), attendance, punctuality,
 * medical clearance, disciplinary sanctions, and cross-category eligibility (Sub-18/Sub-20/Primera C).
 */

import { Player, CategoryId } from '../types';

export interface PlayerConvocatoriaScore {
  player: Player;
  scoreGlobal: number;
  scoreRendimiento: number;
  scoreAsistencia: number;
  scorePuntualidad: number;
  elegible: boolean;
  motivoInelegibilidad?: string;
  advertencias: string[];
  esRefuerzoCruzado?: boolean; // E.g. Sub-18/Sub-20 playing in Primera C
}

export interface ConvocatoriaPonderation {
  pesoRendimiento: number; // default 0.45
  pesoAsistencia: number;   // default 0.35
  pesoPuntualidad: number;  // default 0.20
}

export class ConvocatoriaEngine {
  /**
   * Evaluates eligibility and computes composite selection score for each player
   */
  public static evaluatePlayers(
    players: Player[],
    weights: ConvocatoriaPonderation = { pesoRendimiento: 0.45, pesoAsistencia: 0.35, pesoPuntualidad: 0.20 },
    targetCategory?: CategoryId
  ): PlayerConvocatoriaScore[] {
    return players.map((player) => {
      const advertencias: string[] = [];
      let elegible = true;
      let motivoInelegibilidad: string | undefined = undefined;

      const esRefuerzoCruzado = targetCategory ? player.categoriaId !== targetCategory : false;
      if (esRefuerzoCruzado) {
        advertencias.push(`Doble Ficha: Jugador de ${player.equipoNombre} convocado como refuerzo`);
      }

      // 1. Verificación Médica Simplificada (Grupo Sanguíneo, Peso, Estatura)
      if (!player.medico.grupoSanguineo || !player.medico.pesoKg || !player.medico.alturaCm) {
        advertencias.push('Ficha médica incompleta: registrar peso, estatura y grupo sanguíneo');
      }

      // 2. Verificación Disciplinaria Futsal
      if (player.partidosSuspensionPendientes > 0 || player.estadoDisciplinario === 'suspendido') {
        elegible = false;
        motivoInelegibilidad = `Suspensión disciplinaria activa (${player.partidosSuspensionPendientes} fecha pendiente)`;
      } else if (player.tarjetasAmarillas >= 3) {
        advertencias.push(`Alerta Futsal: ${player.tarjetasAmarillas} tarjetas amarillas acumuladas`);
      }

      // 3. Cuotas en Bolivianos (Alerta informativa)
      if (player.estadoCuota === 'moroso') {
        advertencias.push('Cuota de futsal pendiente de pago');
      }

      // 4. Cálculo de Puntajes Normalizados (0-100)
      const scoreRendimiento = player.stats.ratingGeneral;
      const scoreAsistencia = Math.min(100, Math.max(0, player.porcentajeAsistencia));
      const scorePuntualidad = Math.min(100, Math.max(0, player.porcentajePuntualidad));

      const scoreGlobal = Number(
        (
          scoreRendimiento * weights.pesoRendimiento +
          scoreAsistencia * weights.pesoAsistencia +
          scorePuntualidad * weights.pesoPuntualidad
        ).toFixed(1)
      );

      return {
        player,
        scoreGlobal,
        scoreRendimiento,
        scoreAsistencia,
        scorePuntualidad,
        elegible,
        motivoInelegibilidad,
        advertencias,
        esRefuerzoCruzado
      };
    });
  }

  /**
   * Generates optimal Futsal Starting 5 (Quinteto Inicial) and Substitutes
   */
  public static generateAutomaticRoster(
    players: Player[],
    formation: '1-2-1 (Rombo)' | '2-2 (Cuadrado)' | '1-3-0 (Sin Pívot)' | '1-1-2 (Ofensivo)' = '1-2-1 (Rombo)',
    weights: ConvocatoriaPonderation = { pesoRendimiento: 0.45, pesoAsistencia: 0.35, pesoPuntualidad: 0.20 },
    targetCategory?: CategoryId
  ): {
    titulares: { jugadorId: string; posicionCancha: string }[];
    suplentes: string[];
    noConvocados: { jugadorId: string; motivo: string }[];
  } {
    const evaluated = this.evaluatePlayers(players, weights, targetCategory);

    const eligible = evaluated
      .filter((e) => e.elegible)
      .sort((a, b) => b.scoreGlobal - a.scoreGlobal);

    const ineligible = evaluated
      .filter((e) => !e.elegible)
      .map((e) => ({
        jugadorId: e.player.id,
        motivo: e.motivoInelegibilidad || 'No cumple criterios de habilitación'
      }));

    // Futsal formation slot definitions (5 starters)
    const formationSlots: Record<string, string[]> = {
      '1-2-1 (Rombo)': ['GK', 'CIERRE', 'ALA-I', 'ALA-D', 'PIVOT'],
      '2-2 (Cuadrado)': ['GK', 'CIERRE-I', 'CIERRE-D', 'ALA-I', 'ALA-D'],
      '1-3-0 (Sin Pívot)': ['GK', 'CIERRE', 'ALA-I', 'UNIVERSAL', 'ALA-D'],
      '1-1-2 (Ofensivo)': ['GK', 'CIERRE', 'UNIVERSAL', 'PIVOT-I', 'PIVOT-D']
    };

    const slots = formationSlots[formation] || formationSlots['1-2-1 (Rombo)'];
    const assignedPlayerIds = new Set<string>();
    const titulares: { jugadorId: string; posicionCancha: string }[] = [];

    // Helper to find best eligible player for futsal position
    const pickBestForPosition = (positionTypes: string[]): PlayerConvocatoriaScore | undefined => {
      return eligible.find(
        (cand) =>
          !assignedPlayerIds.has(cand.player.id) &&
          (positionTypes.includes(cand.player.posicion) ||
            (cand.player.posicionSecundaria && positionTypes.includes(cand.player.posicionSecundaria)))
      );
    };

    // 1. Arquero (GK)
    const bestGk = pickBestForPosition(['Arquero']) || eligible.find((c) => !assignedPlayerIds.has(c.player.id));
    if (bestGk) {
      titulares.push({ jugadorId: bestGk.player.id, posicionCancha: 'GK' });
      assignedPlayerIds.add(bestGk.player.id);
    }

    // 2. Outfield 4 Futsal Players
    for (const slot of slots) {
      if (slot === 'GK') continue;

      let positionPreferences: string[] = [];
      if (slot.includes('CIERRE')) positionPreferences = ['Cierre', 'Universal'];
      else if (slot.includes('ALA-I')) positionPreferences = ['Ala Izquierda', 'Universal', 'Ala Derecha'];
      else if (slot.includes('ALA-D')) positionPreferences = ['Ala Derecha', 'Universal', 'Ala Izquierda'];
      else if (slot.includes('PIVOT')) positionPreferences = ['Pívot', 'Universal', 'Ala Derecha'];
      else if (slot.includes('UNIVERSAL')) positionPreferences = ['Universal', 'Ala Izquierda', 'Ala Derecha', 'Cierre'];

      const bestCandidate = pickBestForPosition(positionPreferences) || eligible.find((c) => !assignedPlayerIds.has(c.player.id));
      if (bestCandidate) {
        titulares.push({ jugadorId: bestCandidate.player.id, posicionCancha: slot });
        assignedPlayerIds.add(bestCandidate.player.id);
      }
    }

    // 3. Substitutes (Suplentes - up to 7 futsal players)
    const suplentes: string[] = [];
    for (const candidate of eligible) {
      if (!assignedPlayerIds.has(candidate.player.id) && suplentes.length < 7) {
        suplentes.push(candidate.player.id);
        assignedPlayerIds.add(candidate.player.id);
      }
    }

    // 4. Remaining players become non-called
    const noConvocados = [...ineligible];
    for (const candidate of eligible) {
      if (!assignedPlayerIds.has(candidate.player.id)) {
        noConvocados.push({
          jugadorId: candidate.player.id,
          motivo: `Rotación técnica / Puntuación ponderada (${candidate.scoreGlobal} pts)`
        });
      }
    }

    return { titulares, suplentes, noConvocados };
  }
}
