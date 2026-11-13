/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Interactive WhatsApp Link & Payment Reminder Modal for ACADEMIA F.S.
 * Allows linking the official club WhatsApp number, customizing templates,
 * choosing Player or Legal Guardian recipients, and launching pre-filled
 * WhatsApp reminders without popups blocked by iframe environments.
 */

import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import {
  whatsappService,
  WhatsAppClubConfig,
  WhatsAppReminderLog
} from '../services/whatsappService';
import {
  MessageCircle,
  X,
  CheckCircle2,
  Send,
  Copy,
  Check,
  Settings,
  Users,
  History,
  Phone,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  overduePlayers: Player[];
  initialPlayer?: Player | null;
  period?: string;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  overduePlayers,
  initialPlayer = null,
  period = 'Noviembre 2026'
}) => {
  const [modalTab, setModalTab] = useState<'enviar' | 'config' | 'historial'>('enviar');
  const [config, setConfig] = useState<WhatsAppClubConfig>(() => whatsappService.getConfig());
  const [logs, setLogs] = useState<WhatsAppReminderLog[]>(() => whatsappService.getLogs());

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(
    initialPlayer || overduePlayers[0] || null
  );
  const [targetType, setTargetType] = useState<'jugador' | 'tutor'>('jugador');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);

  // Config edit fields
  const [cfgPhone, setCfgPhone] = useState(config.clubPhone);
  const [cfgInstructions, setCfgInstructions] = useState(config.paymentInstructions);
  const [cfgTemplate, setCfgTemplate] = useState(config.customTemplate);
  const [cfgSaved, setCfgSaved] = useState(false);

  useEffect(() => {
    const unsub = whatsappService.subscribe(() => {
      const latestCfg = whatsappService.getConfig();
      setConfig(latestCfg);
      setLogs(whatsappService.getLogs());
    });
    return unsub;
  }, []);

  // Initialize selected player & target when modal opens or player switches
  useEffect(() => {
    if (!isOpen) return;
    const p = initialPlayer || overduePlayers[0] || null;
    setSelectedPlayer(p);
    setModalTab('enviar');
    setSentFeedback(null);
    const latestCfg = whatsappService.getConfig();
    setConfig(latestCfg);
    setCfgPhone(latestCfg.clubPhone);
    setCfgInstructions(latestCfg.paymentInstructions);
    setCfgTemplate(latestCfg.customTemplate);
  }, [isOpen, initialPlayer]);

  // Update recipient phone and pre-filled message whenever selectedPlayer or targetType changes
  useEffect(() => {
    if (!selectedPlayer) return;
    const primary = whatsappService.getPrimaryPlayerTarget(selectedPlayer);
    const hasTutorPhone = Boolean(whatsappService.formatPhone(selectedPlayer.tutorLegal?.telefono));
    const hasPlayerPhone = Boolean(whatsappService.formatPhone(selectedPlayer.telefono));

    let chosenType: 'jugador' | 'tutor' = targetType;
    if (chosenType === 'tutor' && !hasTutorPhone) chosenType = 'jugador';
    if (chosenType === 'jugador' && !hasPlayerPhone && hasTutorPhone) chosenType = 'tutor';

    if (chosenType !== targetType) {
      setTargetType(chosenType);
    }

    const phone =
      chosenType === 'tutor'
        ? selectedPlayer.tutorLegal?.telefono || selectedPlayer.telefono || ''
        : selectedPlayer.telefono || selectedPlayer.tutorLegal?.telefono || '';

    setCustomPhone(phone || primary?.phone || '');
    setMessageText(whatsappService.buildPlayerMessage(selectedPlayer, chosenType, period));
  }, [selectedPlayer, targetType, period, config]);

  if (!isOpen) return null;

  const handleSelectPlayer = (p: Player) => {
    setSelectedPlayer(p);
    const primary = whatsappService.getPrimaryPlayerTarget(p);
    setTargetType(primary?.targetType || 'jugador');
    setSentFeedback(null);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedId(selectedPlayer?.id || 'msg');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleRecordLaunch = (p: Player, recipientType: 'jugador' | 'tutor', phoneUsed: string) => {
    const recipientName =
      recipientType === 'tutor' && p.tutorLegal?.nombre
        ? `${p.tutorLegal.nombre} (Tutor de ${p.nombre})`
        : `${p.nombre} ${p.apellidos}`;

    whatsappService.logDispatch({
      entityId: p.id,
      entityType: 'player',
      entityName: `${p.nombre} ${p.apellidos}`,
      recipientName,
      targetType: recipientType,
      phone: phoneUsed || 'WhatsApp Web',
      amountBs: p.cuotaMensualMonto,
      period
    });

    setSentFeedback(`Recordatorio registrado para ${recipientName}.`);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    whatsappService.saveConfig({
      clubPhone: cfgPhone.trim(),
      linkedStatus: Boolean(cfgPhone.trim()),
      paymentInstructions: cfgInstructions.trim(),
      customTemplate: cfgTemplate.trim()
    });
    setCfgSaved(true);
    setTimeout(() => setCfgSaved(false), 3000);
  };

  const currentWhatsAppUrl = selectedPlayer
    ? whatsappService.buildWhatsAppUrl(customPhone, messageText)
    : 'https://wa.me/';

  const formatTimeShort = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.16)] text-slate-100 overflow-hidden">
        {/* Top Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-white">
                  Centro de Recordatorios WhatsApp · {config.clubName}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                  config.linkedStatus
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.linkedStatus ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {config.linkedStatus ? `Enlazado: ${config.clubPhone}` : 'Sin número enlazado'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Envíe recordatorios directos de mensualidad pendiente por WhatsApp al jugador o a su tutor responsable.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 self-end sm:self-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setModalTab('enviar')}
            className={`pb-3 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              modalTab === 'enviar'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Enviar Recordatorios ({overduePlayers.length} pendientes)
          </button>
          <button
            type="button"
            onClick={() => setModalTab('config')}
            className={`pb-3 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              modalTab === 'config'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Enlazar WhatsApp &amp; Plantilla
          </button>
          <button
            type="button"
            onClick={() => setModalTab('historial')}
            className={`pb-3 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              modalTab === 'historial'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historial Enviados ({logs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {/* TAB 1: SEND REMINDERS */}
          {modalTab === 'enviar' && (
            <>
              {overduePlayers.length === 0 ? (
                <div className="p-8 text-center space-y-2 bg-slate-950/60 rounded-xl border border-emerald-900/40">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Sin jugadores con cuotas pendientes</h4>
                  <p className="text-slate-400">Todos los jugadores del plantel están al día en sus mensualidades.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Overdue Players Queue */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      <span>Jugadores con Mensualidad Pendiente</span>
                      <span className="text-rose-400 font-mono">{overduePlayers.length} en mora</span>
                    </div>

                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {overduePlayers.map((p) => {
                        const isSelected = selectedPlayer?.id === p.id;
                        const lastSent = logs.find((l) => l.entityId === p.id);
                        const primaryTarget = whatsappService.getPrimaryPlayerTarget(p);

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPlayer(p)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-emerald-950/30 border-emerald-500/70 shadow-md'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {p.foto ? (
                                <img
                                  src={p.foto}
                                  alt={p.nombre}
                                  className="w-9 h-9 rounded-lg object-cover border border-rose-500/60 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-rose-950 border border-rose-700 flex items-center justify-center font-mono font-bold text-rose-300 shrink-0">
                                  #{p.dorsal}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate">
                                  {p.nombre} {p.apellidos}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {p.equipoNombre} · {primaryTarget ? primaryTarget.phone : 'Sin teléfono'}
                                </div>
                                {lastSent && (
                                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
                                    <Check className="w-3 h-3" />
                                    Enviado {formatTimeShort(lastSent.sentAt)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono font-extrabold text-rose-400 text-xs block">
                                Bs {p.cuotaMensualMonto}
                              </span>
                              <span className="text-[10px] text-rose-300/80 uppercase font-semibold">
                                Pendiente
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Message Composer & Direct WhatsApp Launch */}
                  {selectedPlayer && (
                    <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                            Destinatario del Recordatorio
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            #{selectedPlayer.dorsal} {selectedPlayer.nombre} {selectedPlayer.apellidos}
                          </h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-700/60 text-rose-300 font-mono font-bold">
                          Debe: Bs {selectedPlayer.cuotaMensualMonto}
                        </span>
                      </div>

                      {/* Target Selector: Jugador vs Tutor Legal */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setTargetType('jugador')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            targetType === 'jugador'
                              ? 'bg-emerald-950/40 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                            WhatsApp del Jugador
                          </div>
                          <div className="text-[11px] font-mono mt-0.5 text-slate-300">
                            {selectedPlayer.telefono || 'Sin número registrado'}
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={!selectedPlayer.tutorLegal?.telefono}
                          onClick={() => setTargetType('tutor')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            !selectedPlayer.tutorLegal?.telefono
                              ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                              : targetType === 'tutor'
                              ? 'bg-amber-950/40 border-amber-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                            WhatsApp Tutor / Responsable
                          </div>
                          <div className="text-[11px] font-mono mt-0.5 truncate">
                            {selectedPlayer.tutorLegal?.telefono
                              ? `${selectedPlayer.tutorLegal.nombre} · ${selectedPlayer.tutorLegal.telefono}`
                              : 'Sin tutor registrado'}
                          </div>
                        </button>
                      </div>

                      {/* Editable WhatsApp Phone */}
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Número WhatsApp Destino (formato Bolivia +591 automático si son 8 dígitos):
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={customPhone}
                            onChange={(e) => setCustomPhone(e.target.value)}
                            placeholder="+591 7XXXXXXX"
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        {!whatsappService.formatPhone(customPhone) && (
                          <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Sin número guardado: al abrir WhatsApp podrá seleccionar el contacto directamente en su dispositivo.
                          </p>
                        )}
                      </div>

                      {/* Editable Message Text */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-400 font-semibold">
                            Mensaje de Recordatorio (editable antes de enviar):
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setMessageText(
                                whatsappService.buildPlayerMessage(selectedPlayer, targetType, period)
                              )
                            }
                            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restaurar texto
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {sentFeedback && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{sentFeedback}</span>
                        </div>
                      )}

                      {/* Direct Launch Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={handleCopyMessage}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          {copiedId ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copiar Texto
                            </>
                          )}
                        </button>

                        <a
                          href={currentWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleRecordLaunch(selectedPlayer, targetType, customPhone)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Abrir WhatsApp y Enviar Recordatorio</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: LINK WHATSAPP & TEMPLATE CONFIG */}
          {modalTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-800/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">
                    Enlace Directo con WhatsApp Web / WhatsApp Business
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Vincule el número oficial de Tesorería o Presidencia de <strong>{config.clubName}</strong>. Cada recordatorio abre WhatsApp directamente con el mensaje personalizado, monto exacto en Bolivianos y número del jugador o tutor responsable.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Número Oficial de WhatsApp del Club (Emisor / Cobranzas):
                </label>
                <input
                  type="text"
                  required
                  value={cfgPhone}
                  onChange={(e) => setCfgPhone(e.target.value)}
                  placeholder="+591 700-12026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Instrucciones de Pago (se agregan automáticamente al mensaje):
                </label>
                <input
                  type="text"
                  value={cfgInstructions}
                  onChange={(e) => setCfgInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">
                    Plantilla de Mensaje Automático:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const reset = whatsappService.resetTemplate();
                      setCfgTemplate(reset.customTemplate);
                      setCfgInstructions(reset.paymentInstructions);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Plantilla por defecto
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={cfgTemplate}
                  onChange={(e) => setCfgTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Variables disponibles: {'{destinatario}'}, {'{referencia}'}, {'{monto}'}, {'{periodo}'}, {'{club}'}, {'{instrucciones}'}
                </p>
              </div>

              {cfgSaved && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600 text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ¡Enlace WhatsApp y plantilla guardados correctamente!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition-colors"
                >
                  Guardar Enlace WhatsApp
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: REMINDER LOGS HISTORY */}
          {modalTab === 'historial' && (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800">
                  Aún no se han enviado recordatorios de WhatsApp en esta sesión.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{log.recipientName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-amber-300">
                            {log.targetType.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Tel: {log.phone} · Periodo: {log.period} · Enviado por: {log.sentBy}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-rose-400 block">
                          Bs {log.amountBs}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatTimeShort(log.sentAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
