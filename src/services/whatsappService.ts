/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WhatsApp Business / Web Reminder Service for ACADEMIA F.S.
 * Handles club WhatsApp linking, Bolivia (+591) phone normalization,
 * personalized overdue payment templates (Player & Legal Guardian),
 * and audit logging of sent reminders.
 */

import { Player, Socio } from '../types';
import { clubStorage } from './clubStorage';

export interface WhatsAppClubConfig {
  clubPhone: string;
  clubName: string;
  linkedStatus: boolean;
  linkedAt: string;
  paymentInstructions: string;
  customTemplate: string;
}

export interface WhatsAppReminderLog {
  id: string;
  entityId: string;
  entityType: 'player' | 'socio';
  entityName: string;
  recipientName: string;
  targetType: 'jugador' | 'tutor' | 'socio';
  phone: string;
  amountBs: number;
  period: string;
  sentAt: string;
  sentBy: string;
}

export interface WhatsAppTarget {
  targetType: 'jugador' | 'tutor';
  label: string;
  recipientName: string;
  phone: string;
  formattedPhone: string;
}

const STORAGE_KEYS = {
  CONFIG: 'academia_fs_whatsapp_config_v1',
  LOGS: 'academia_fs_whatsapp_logs_v1'
};

const DEFAULT_TEMPLATE =
  'Hola {destinatario}, te saludamos cordialmente de *{club}* ⚽🏆. ' +
  'Te recordamos amablemente que {referencia} registra una mensualidad pendiente de *Bs {monto}* correspondiente al periodo *{periodo}*. ' +
  '{instrucciones} ¡Muchas gracias por tu compromiso con el club!';

const DEFAULT_CONFIG: WhatsAppClubConfig = {
  clubPhone: '+591 700-12026',
  clubName: 'ACADEMIA F.S.',
  linkedStatus: true,
  linkedAt: '2026-11-01T10:00:00.000Z',
  paymentInstructions: 'Puedes realizar tu pago por QR / Transferencia o en caja del Coliseo Polideportivo Central.',
  customTemplate: DEFAULT_TEMPLATE
};

type Listener = () => void;

class WhatsAppService {
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getConfig(): WhatsAppClubConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  public saveConfig(partial: Partial<WhatsAppClubConfig>): WhatsAppClubConfig {
    const current = this.getConfig();
    const updated: WhatsAppClubConfig = {
      ...current,
      ...partial,
      linkedAt: partial.linkedStatus ? new Date().toISOString() : current.linkedAt
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    clubStorage.addAuditLog(
      'Configuración WhatsApp Actualizada',
      'Finanzas',
      'whatsapp-config',
      `Número vinculado: ${updated.clubPhone || 'Sin número'} (Estado: ${updated.linkedStatus ? 'Enlazado' : 'Desconectado'})`,
      'info'
    );
    this.notify();
    return updated;
  }

  public resetTemplate(): WhatsAppClubConfig {
    return this.saveConfig({
      customTemplate: DEFAULT_TEMPLATE,
      paymentInstructions: DEFAULT_CONFIG.paymentInstructions
    });
  }

  public getLogs(): WhatsAppReminderLog[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public getLastLogForEntity(entityId: string): WhatsAppReminderLog | undefined {
    return this.getLogs().find((l) => l.entityId === entityId);
  }

  /**
   * Normalizes a phone string into international digits without '+' for wa.me links.
   * Automatically prepends Bolivia country code 591 for 8-digit local mobile numbers.
   */
  public formatPhone(rawPhone?: string): string {
    if (!rawPhone) return '';
    let digits = rawPhone.replace(/[^0-9]/g, '');
    if (!digits) return '';

    // Strip leading international 00 if present
    if (digits.startsWith('00')) {
      digits = digits.slice(2);
    }
    // Standard 8-digit Bolivian phone (starts with 6, 7, or 2/3/4)
    if (digits.length === 8) {
      digits = `591${digits}`;
    }
    return digits;
  }

  public getPlayerTargets(player: Player): WhatsAppTarget[] {
    const targets: WhatsAppTarget[] = [];
    const playerClean = this.formatPhone(player.telefono);
    const tutorClean = this.formatPhone(player.tutorLegal?.telefono);

    if (playerClean) {
      targets.push({
        targetType: 'jugador',
        label: `Jugador (${player.telefono})`,
        recipientName: `${player.nombre} ${player.apellidos}`,
        phone: player.telefono,
        formattedPhone: playerClean
      });
    }

    if (tutorClean && tutorClean !== playerClean) {
      targets.push({
        targetType: 'tutor',
        label: `Tutor: ${player.tutorLegal?.nombre || 'Responsable'} (${player.tutorLegal?.telefono})`,
        recipientName: player.tutorLegal?.nombre || `Tutor de ${player.nombre}`,
        phone: player.tutorLegal?.telefono || '',
        formattedPhone: tutorClean
      });
    }

    return targets;
  }

  public getPrimaryPlayerTarget(player: Player): WhatsAppTarget | null {
    const targets = this.getPlayerTargets(player);
    if (targets.length === 0) return null;

    // For minors with a legal guardian phone, prefer guardian or allow both
    const isMinor = this.isPlayerMinor(player.fechaNacimiento);
    if (isMinor) {
      const tutor = targets.find((t) => t.targetType === 'tutor');
      if (tutor) return tutor;
    }
    return targets[0];
  }

  private isPlayerMinor(dob: string): boolean {
    if (!dob) return false;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age < 18;
  }

  public buildPlayerMessage(
    player: Player,
    targetType: 'jugador' | 'tutor' = 'jugador',
    period: string = 'Noviembre 2026'
  ): string {
    const cfg = this.getConfig();
    const isTutor = targetType === 'tutor' && player.tutorLegal?.nombre;
    const destinatario = isTutor
      ? `${player.tutorLegal!.nombre}`
      : `${player.nombre} ${player.apellidos}`;

    const referencia = isTutor
      ? `el jugador *${player.nombre} ${player.apellidos}* (#${player.dorsal}, ${player.equipoNombre})`
      : `tu ficha (#${player.dorsal}, ${player.equipoNombre})`;

    return cfg.customTemplate
      .replace(/\{destinatario\}/g, destinatario)
      .replace(/\{jugador\}/g, `${player.nombre} ${player.apellidos}`)
      .replace(/\{dorsal\}/g, `#${player.dorsal}`)
      .replace(/\{categoria\}/g, player.equipoNombre)
      .replace(/\{referencia\}/g, referencia)
      .replace(/\{monto\}/g, String(player.cuotaMensualMonto))
      .replace(/\{periodo\}/g, period)
      .replace(/\{club\}/g, cfg.clubName || 'ACADEMIA F.S.')
      .replace(/\{instrucciones\}/g, cfg.paymentInstructions || '');
  }

  public buildSocioMessage(socio: Socio, period: string = 'Noviembre 2026'): string {
    const cfg = this.getConfig();
    return (
      `Hola ${socio.nombre} ${socio.apellidos}, te saludamos cordialmente de *${cfg.clubName}* ⚽🏆. ` +
      `Te recordamos amablemente que tu cuota social (Socio #${socio.numeroSocio}) presenta un saldo pendiente de *Bs ${socio.cuotaMensual}* correspondiente a *${period}*. ` +
      `${cfg.paymentInstructions} ¡Muchas gracias por apoyar al club!`
    );
  }

  public buildWhatsAppUrl(rawOrFormattedPhone: string, message: string): string {
    const cleanPhone = this.formatPhone(rawOrFormattedPhone);
    const encoded = encodeURIComponent(message);
    return cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
  }

  public logDispatch(entry: Omit<WhatsAppReminderLog, 'id' | 'sentAt' | 'sentBy'>): WhatsAppReminderLog {
    const activeUser = clubStorage.getActiveUserRole();
    const newLog: WhatsAppReminderLog = {
      ...entry,
      id: `wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString(),
      sentBy: activeUser?.name || 'Administración'
    };

    const existing = this.getLogs();
    const updated = [newLog, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));

    clubStorage.addAuditLog(
      'Recordatorio WhatsApp Enviado',
      'Finanzas',
      entry.entityId,
      `Mensaje WhatsApp de cobro (Bs ${entry.amountBs} - ${entry.period}) dirigido a ${entry.recipientName} (${entry.phone || 'sin número'})`,
      'info'
    );

    this.notify();
    return newLog;
  }
}

export const whatsappService = new WhatsAppService();
