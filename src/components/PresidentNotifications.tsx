/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, Socio } from '../types';
import { whatsappService, WhatsAppReminderLog } from '../services/whatsappService';
import {
  Bell,
  BellRing,
  AlertTriangle,
  CreditCard,
  User,
  Users,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  Send,
  MessageCircle,
  Filter,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Calendar,
  DollarSign
} from 'lucide-react';

interface PresidentNotificationsProps {
  players: Player[];
  socios: Socio[];
  onNavigateToTab: (tab: string) => void;
  onOpenPlayerModal?: (player: Player) => void;
}

export const PresidentNotifications: React.FC<PresidentNotificationsProps> = ({
  players,
  socios,
  onNavigateToTab,
  onOpenPlayerModal
}) => {
  const [filterType, setFilterType] = useState<'all' | 'players' | 'socios'>('all');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(true);
  const [waLogs, setWaLogs] = useState<WhatsAppReminderLog[]>(() => whatsappService.getLogs());

  useEffect(() => {
    const unsub = whatsappService.subscribe(() => {
      setWaLogs(whatsappService.getLogs());
    });
    return unsub;
  }, []);

  // Play soft subtle chime when sound enabled and alert clicked
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext fallback
    }
  };

  // Find overdue players
  const overduePlayers = players.filter(
    (p) => p.estadoCuota === 'pendiente' || p.estadoCuota === 'moroso'
  );

  // Find overdue socios
  const overdueSocios = socios.filter(
    (s) => s.estadoPago === 'pendiente' || s.estadoPago === 'moroso'
  );

  // Total debt in Bs
  const totalPlayerDebt = overduePlayers.reduce((acc, p) => acc + p.cuotaMensualMonto, 0);
  const totalSocioDebt = overdueSocios.reduce((acc, s) => acc + s.cuotaMensual, 0);
  const totalGlobalDebt = totalPlayerDebt + totalSocioDebt;
  const totalNotifications = overduePlayers.length + overdueSocios.length;

  // Build unified notification list
  const playerNotifications = overduePlayers.map((p) => ({
    id: `notif-ply-${p.id}`,
    entityId: p.id,
    type: 'player' as const,
    title: `${p.nombre} ${p.apellidos}`,
    subtitle: `Dorsal #${p.dorsal} · ${p.equipoNombre}`,
    amount: p.cuotaMensualMonto,
    period: 'Noviembre 2026',
    phone: p.telefono || (p.tutorLegal?.telefono) || '',
    guardian: p.tutorLegal?.nombre,
    photo: p.foto,
    rawObject: p
  }));

  const socioNotifications = overdueSocios.map((s) => ({
    id: `notif-soc-${s.id}`,
    entityId: s.id,
    type: 'socio' as const,
    title: `${s.nombre} ${s.apellidos}`,
    subtitle: `Socio #${s.numeroSocio} · ${s.tipoSocio}`,
    amount: s.cuotaMensual,
    period: 'Noviembre 2026',
    phone: s.telefono || '',
    guardian: undefined,
    photo: undefined,
    rawObject: s
  }));

  const allNotifications = [...playerNotifications, ...socioNotifications].filter(
    (n) => !dismissedIds.has(n.id)
  );

  const displayedNotifications = allNotifications.filter((n) => {
    if (filterType === 'players') return n.type === 'player';
    if (filterType === 'socios') return n.type === 'socio';
    return true;
  });

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const getWhatsAppDetails = (item: (typeof allNotifications)[0]) => {
    if (item.type === 'player') {
      const playerObj = item.rawObject as Player;
      const primary = whatsappService.getPrimaryPlayerTarget(playerObj);
      const msg = whatsappService.buildPlayerMessage(
        playerObj,
        primary?.targetType || 'jugador',
        item.period
      );
      const phone = primary?.phone || item.phone || '';
      return {
        url: whatsappService.buildWhatsAppUrl(phone, msg),
        recipientName: primary?.recipientName || item.title,
        targetType: primary?.targetType || ('jugador' as const),
        phone: phone || 'WhatsApp'
      };
    }

    const socioObj = item.rawObject as Socio;
    const msg = whatsappService.buildSocioMessage(socioObj, item.period);
    return {
      url: whatsappService.buildWhatsAppUrl(item.phone, msg),
      recipientName: item.title,
      targetType: 'socio' as const,
      phone: item.phone || 'WhatsApp'
    };
  };

  const handleTrackWhatsAppClick = (item: (typeof allNotifications)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    playAlertChime();
    const details = getWhatsAppDetails(item);
    whatsappService.logDispatch({
      entityId: item.entityId,
      entityType: item.type,
      entityName: item.title,
      recipientName: details.recipientName,
      targetType: details.targetType,
      phone: details.phone,
      amountBs: item.amount,
      period: item.period
    });
  };

  if (totalNotifications === 0) {
    return (
      <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              Cobranzas al Día · Sin Vencimientos Detectados
            </h4>
            <p className="text-slate-400">
              Todos los jugadores y socios de ACADEMIA F.S. se encuentran solventes y con sus cuotas al día para el periodo actual.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold rounded-lg text-[11px]">
          100% Solvencia
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border-2 border-rose-600/70 rounded-2xl overflow-hidden shadow-2xl space-y-0 relative">
      {/* Visual Beacon Strip */}
      <div className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 h-1.5 w-full animate-pulse" />

      {/* Main Alert Header */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-900/50">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 shrink-0">
              <BellRing className="w-6 h-6 animate-bounce-short" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-950">
              !
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Alerta Presidencial Automática
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-amber-400 font-semibold font-mono">
                Noviembre 2026
              </span>
            </div>

            <h3 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-2">
              <span>Vencimiento de Cuotas Detectado:</span>
              <span className="text-rose-400 font-mono">
                {allNotifications.length} pendiente{allNotifications.length !== 1 ? 's' : ''}
              </span>
            </h3>

            <p className="text-xs text-slate-300">
              Monto total adeudado por cobrar al club:{' '}
              <strong className="text-rose-400 font-mono text-sm">
                Bs {totalGlobalDebt.toLocaleString()}
              </strong>{' '}
              ({overduePlayers.length} jugadores · {overdueSocios.length} socios).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sound alert chime toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertChime();
            }}
            title={soundEnabled ? 'Silenciar alertas sonoras' : 'Activar sonido de alerta'}
            className={`p-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sonido Activo' : 'Sonido'}</span>
          </button>

          {/* Quick go to Mensualidades */}
          <button
            onClick={() => onNavigateToTab('mensualidades')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Gestionar Cobros en Bs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-700"
          >
            {isExpanded ? 'Contraer' : `Ver Detalles (${allNotifications.length})`}
          </button>
        </div>
      </div>

      {/* Expanded Notifications Feed */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Sub-filter tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'all'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Todas las Alertas ({allNotifications.length})
              </button>
              <button
                onClick={() => setFilterType('players')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'players'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Jugadores en Mora ({overduePlayers.length})
              </button>
              <button
                onClick={() => setFilterType('socios')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'socios'
                    ? 'bg-white text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Socios con Deuda ({overdueSocios.length})
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Actualización en tiempo real · Alertas automáticas ISO 27001
            </span>
          </div>

          {/* List of Overdue Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {displayedNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-900/50 hover:border-rose-500/60 transition-all flex items-center justify-between gap-3 shadow-md group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Photo or Initials Avatar */}
                  <div className="relative shrink-0">
                    {notif.photo ? (
                      <img
                        src={notif.photo}
                        alt={notif.title}
                        className="w-11 h-11 rounded-xl object-cover border-2 border-rose-500 shadow-sm"
                      />
                    ) : (
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold font-mono text-xs ${
                        notif.type === 'player'
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-white/10 border-white/30 text-white'
                      }`}>
                        {notif.type === 'player' ? `#${(notif.rawObject as Player).dorsal}` : <Users className="w-5 h-5" />}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950 animate-ping" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs truncate">
                        {notif.title}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                        notif.type === 'player'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-white/10 text-white border border-white/30'
                      }`}>
                        {notif.type === 'player' ? 'Jugador' : 'Socio'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {notif.subtitle}
                    </p>

                    <div className="text-[10px] text-rose-300 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>Cuota vencida: {notif.period}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block text-[10px]">Deuda:</span>
                    <span className="text-sm font-extrabold text-rose-400 font-mono">
                      Bs {notif.amount}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Direct WhatsApp anchor link (iframe-safe) */}
                    {(() => {
                      const details = getWhatsAppDetails(notif);
                      const wasSent = waLogs.some((l) => l.entityId === notif.entityId);
                      return (
                        <a
                          href={details.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleTrackWhatsAppClick(notif, e)}
                          title={`Enviar recordatorio por WhatsApp a ${details.recipientName}`}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                            wasSent
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900'
                              : 'bg-emerald-600/90 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{wasSent ? 'Enviado' : 'WhatsApp'}</span>
                        </a>
                      );
                    })()}

                    {/* Action button */}
                    <button
                      onClick={() => {
                        if (notif.type === 'player') {
                          onNavigateToTab('mensualidades');
                        } else {
                          onNavigateToTab('socios');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Cobrar
                    </button>

                    {/* Dismiss */}
                    <button
                      onClick={(e) => handleDismiss(notif.id, e)}
                      title="Descartar esta notificación"
                      className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
