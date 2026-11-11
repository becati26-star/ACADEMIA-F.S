/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Club Storage Service & Data Repository (SOLID, Single Responsibility)
 * Manages reactive state, localStorage persistence, ISO 27001 audit logging,
 * and data exports for Vercel/Neon Tech compatibility.
 */

import {
  Player,
  Socio,
  AttendanceRecord,
  MatchRoster,
  Donation,
  ClubExpense,
  AuditLog,
  Category,
  UserRole,
  RoleType,
  FinancialSummary
} from '../types';
import {
  INITIAL_PLAYERS,
  INITIAL_SOCIOS,
  INITIAL_ATTENDANCES,
  INITIAL_ROSTERS,
  INITIAL_DONATIONS,
  INITIAL_EXPENSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_ROLES,
  NEON_TECH_POSTGRES_SCHEMA
} from '../data/mockData';

const STORAGE_KEYS = {
  PLAYERS: 'academia_fs_players_v3',
  SOCIOS: 'academia_fs_socios_v3',
  ATTENDANCES: 'academia_fs_attendances_v3',
  ROSTERS: 'academia_fs_rosters_v3',
  DONATIONS: 'academia_fs_donations_v3',
  EXPENSES: 'academia_fs_expenses_v3',
  AUDIT_LOGS: 'academia_fs_audit_logs_v3',
  CATEGORIES: 'academia_fs_categories_v3',
  ACTIVE_ROLE: 'academia_fs_active_role_v3',
  CURRENT_USER: 'academia_fs_current_user_v3'
};

type Listener = () => void;

class ClubStorageService {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOCIOS)) {
      localStorage.setItem(STORAGE_KEYS.SOCIOS, JSON.stringify(INITIAL_SOCIOS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCES)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(INITIAL_ATTENDANCES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROSTERS)) {
      localStorage.setItem(STORAGE_KEYS.ROSTERS, JSON.stringify(INITIAL_ROSTERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(INITIAL_DONATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, JSON.stringify(INITIAL_ROLES[0]));
    }
  }

  public resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
    localStorage.setItem(STORAGE_KEYS.SOCIOS, JSON.stringify(INITIAL_SOCIOS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(INITIAL_ATTENDANCES));
    localStorage.setItem(STORAGE_KEYS.ROSTERS, JSON.stringify(INITIAL_ROSTERS));
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(INITIAL_DONATIONS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    this.notify();
  }

  // Active Role Management
  public getActiveUserRole(): UserRole {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
    if (!raw) return INITIAL_ROLES[0];
    try {
      const parsed = JSON.parse(raw);
      const matched = INITIAL_ROLES.find((r) => r.id === parsed.id || r.role === parsed.role);
      return matched ? { ...parsed, ...matched } : parsed;
    } catch {
      return INITIAL_ROLES[0];
    }
  }

  public setActiveUserRole(role: UserRole) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, JSON.stringify(role));
    this.addAuditLog(
      'Cambio de Perfil Activo',
      'Seguridad',
      role.id,
      `Sesión cambiada a perfil: ${role.name} (${role.title})`,
      'info'
    );
    this.notify();
  }

  public getAllRoles(): UserRole[] {
    return INITIAL_ROLES;
  }

  // User Authentication & Session
  public getCurrentUser(): UserRole | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const matched = INITIAL_ROLES.find((r) => r.id === parsed.id || r.role === parsed.role);
      return matched ? { ...parsed, ...matched } : parsed;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: UserRole | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, JSON.stringify(user));
      this.addAuditLog(
        'Inicio de Sesión Exitoso',
        'Seguridad',
        user.id,
        `Usuario autenticado: ${user.name} (${user.title})`,
        'info'
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      this.addAuditLog(
        'Cierre de Sesión',
        'Seguridad',
        'auth-logout',
        'Sesión finalizada por el usuario',
        'info'
      );
    }
    this.notify();
  }

  public authenticate(identifier: string, pass: string): { success: boolean; user?: UserRole; error?: string } {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Por favor ingrese su nombre de usuario o correo.' };
    }
    if (!pass) {
      return { success: false, error: 'Por favor ingrese su contraseña.' };
    }

    const normalize = (str: string) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    const idNorm = normalize(identifier);
    const roles = this.getAllRoles();

    const found = roles.find((r) => {
      const uNorm = normalize(r.username || '');
      const emailNorm = normalize(r.email || '');
      const roleNorm = normalize(r.role || '');
      const titleNorm = normalize(r.title || '');

      return (
        uNorm === idNorm ||
        emailNorm === idNorm ||
        roleNorm === idNorm ||
        titleNorm.includes(idNorm) ||
        (idNorm === 'dt' && r.role === 'entrenador') ||
        (idNorm === 'director tecnico' && r.role === 'entrenador') ||
        (idNorm === 'admin' && r.role === 'administrador') ||
        (idNorm === 'presidente' && r.role === 'presidente')
      );
    });

    if (!found) {
      this.addAuditLog(
        'Intento Fallido de Inicio de Sesión',
        'Seguridad',
        'auth-fail',
        `Intento con usuario inexistente: "${identifier}"`,
        'advertencia'
      );
      return { success: false, error: 'Usuario o contraseña incorrectas' };
    }

    // Strict password match with fallback support
    const matchesPassword =
      found.password === pass ||
      found.password === pass.trim();

    if (!matchesPassword) {
      this.addAuditLog(
        'Contraseña Incorrecta',
        'Seguridad',
        found.id,
        `Contraseña fallida para usuario: "${found.username || found.name}"`,
        'advertencia'
      );
      return { success: false, error: 'Usuario o contraseña incorrectas' };
    }

    this.setCurrentUser(found);
    return { success: true, user: found };
  }

  public login(identifier: string, pass: string): UserRole | null {
    const res = this.authenticate(identifier, pass);
    return res.success && res.user ? res.user : null;
  }

  public logout() {
    this.setCurrentUser(null);
  }

  // Categories
  public getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  }

  // Players
  public getPlayers(): Player[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return raw ? JSON.parse(raw) : INITIAL_PLAYERS;
  }

  public getPlayerById(id: string): Player | undefined {
    return this.getPlayers().find((p) => p.id === id);
  }

  public savePlayer(player: Player) {
    const players = this.getPlayers();
    const idx = players.findIndex((p) => p.id === player.id);
    const isNew = idx === -1;

    if (isNew) {
      players.unshift(player);
    } else {
      players[idx] = player;
    }

    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    this.addAuditLog(
      isNew ? 'Alta de Jugador' : 'Actualización de Ficha de Jugador',
      'Jugador',
      player.id,
      `Jugador: ${player.nombre} ${player.apellidos} (Dorsal ${player.dorsal}, Cat: ${player.equipoNombre})`,
      'info'
    );
    this.notify();
  }

  public deletePlayer(id: string) {
    const players = this.getPlayers();
    const player = players.find((p) => p.id === id);
    const updated = players.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
    if (player) {
      this.addAuditLog(
        'Baja de Jugador',
        'Jugador',
        id,
        `Se eliminó registro de ${player.nombre} ${player.apellidos}`,
        'advertencia'
      );
    }
    this.notify();
  }

  public recordPlayerPayment(
    playerId: string,
    mes: string,
    monto: number,
    metodo: 'Transferencia' | 'Efectivo' | 'Tarjeta' | 'Débito Automático',
    fechaPago?: string
  ) {
    const players = this.getPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;

    const player = players[idx];
    const newPayment = {
      id: `pay-${Date.now()}`,
      fecha: fechaPago || new Date().toISOString().split('T')[0],
      mes,
      monto,
      metodo,
      comprobante: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      registradoPor: this.getActiveUserRole().name,
      concepto: `Cuota deportiva ${mes}`
    };

    player.historialPagos.unshift(newPayment);
    player.estadoCuota = 'al_dia';
    player.ultimoMesPagado = mes;

    players[idx] = player;
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

    this.addAuditLog(
      'Cobro de Cuota de Jugador',
      'Finanzas',
      playerId,
      `Cobro Bs ${monto.toLocaleString()} para ${player.nombre} ${player.apellidos} - Periodo: ${mes}`,
      'info'
    );
    this.notify();
  }

  public recordPlayerCard(
    playerId: string,
    tipo: 'amarilla' | 'roja',
    partido: string,
    minuto: number,
    motivo: string
  ) {
    const players = this.getPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;

    const player = players[idx];
    const newCard = {
      id: `card-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      partido,
      tipo,
      minuto,
      motivo
    };

    player.historialTarjetas.unshift(newCard);
    if (tipo === 'amarilla') {
      player.tarjetasAmarillas += 1;
      if (player.tarjetasAmarillas % 5 === 0) {
        player.partidosSuspensionPendientes += 1;
        player.estadoDisciplinario = 'suspendido';
      } else if (player.tarjetasAmarillas % 5 >= 3) {
        player.estadoDisciplinario = 'advertencia';
      }
    } else {
      player.tarjetasRojas += 1;
      player.partidosSuspensionPendientes += 1;
      player.estadoDisciplinario = 'suspendido';
    }

    players[idx] = player;
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

    this.addAuditLog(
      'Sanción Disciplinaria Aplicada',
      'Jugador',
      playerId,
      `Tarjeta ${tipo.toUpperCase()} en minuto ${minuto} vs ${partido}: ${motivo}`,
      tipo === 'roja' ? 'critico' : 'advertencia'
    );
    this.notify();
  }

  // Socios
  public getSocios(): Socio[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SOCIOS);
    return raw ? JSON.parse(raw) : INITIAL_SOCIOS;
  }

  public saveSocio(socio: Socio) {
    const socios = this.getSocios();
    const idx = socios.findIndex((s) => s.id === socio.id);
    const isNew = idx === -1;

    if (isNew) {
      socios.unshift(socio);
    } else {
      socios[idx] = socio;
    }

    localStorage.setItem(STORAGE_KEYS.SOCIOS, JSON.stringify(socios));
    this.addAuditLog(
      isNew ? 'Alta de Nuevo Socio' : 'Actualización de Perfil de Socio',
      'Socio',
      socio.id,
      `Socio: ${socio.numeroSocio} - ${socio.nombre} ${socio.apellidos} (${socio.tipoSocio})`,
      'info'
    );
    this.notify();
  }

  public recordSocioPayment(
    socioId: string,
    mes: string,
    monto: number,
    metodo: 'Transferencia' | 'Efectivo' | 'Tarjeta' | 'Débito Automático'
  ) {
    const socios = this.getSocios();
    const idx = socios.findIndex((s) => s.id === socioId);
    if (idx === -1) return;

    const socio = socios[idx];
    const newPayment = {
      id: `pay-soc-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      mes,
      monto,
      metodo,
      comprobante: `REC-SOC-${Math.floor(1000 + Math.random() * 9000)}`,
      registradoPor: this.getActiveUserRole().name,
      concepto: `Cuota social ${mes}`
    };

    socio.historialAportaciones.unshift(newPayment);
    socio.estadoPago = 'al_dia';
    socio.ultimoMesPagado = mes;

    socios[idx] = socio;
    localStorage.setItem(STORAGE_KEYS.SOCIOS, JSON.stringify(socios));

    this.addAuditLog(
      'Cobro de Cuota Social',
      'Finanzas',
      socioId,
      `Aporte socio ${socio.numeroSocio} (Bs ${monto.toLocaleString()}) - Mes: ${mes}`,
      'info'
    );
    this.notify();
  }

  // Attendances
  public getAttendances(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCES);
    return raw ? JSON.parse(raw) : INITIAL_ATTENDANCES;
  }

  public saveAttendance(record: AttendanceRecord) {
    const list = this.getAttendances();
    const idx = list.findIndex((a) => a.id === record.id);
    if (idx === -1) {
      list.unshift(record);
    } else {
      list[idx] = record;
    }
    localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(list));

    // Update cumulative player attendance stats automatically!
    this.recomputePlayerAttendanceStats(record);

    this.addAuditLog(
      'Toma de Asistencia Registrada',
      'Asistencia',
      record.id,
      `Sesión ${record.tipo.toUpperCase()} (${record.equipoNombre}) - ${record.detalles.length} jugadores controlados`,
      'info'
    );
    this.notify();
  }

  private recomputePlayerAttendanceStats(latestSession: AttendanceRecord) {
    const players = this.getPlayers();
    let updated = false;

    for (const detail of latestSession.detalles) {
      const p = players.find((pl) => pl.id === detail.jugadorId);
      if (p) {
        p.totalSesiones += 1;
        if (detail.estado === 'presente') {
          p.asistencias += 1;
        } else if (detail.estado === 'tarde') {
          p.asistencias += 1;
          p.llegadasTarde += 1;
        } else if (detail.estado === 'justificado') {
          p.faltasJustificadas += 1;
        } else if (detail.estado === 'ausente') {
          p.faltasInjustificadas += 1;
        }

        p.porcentajeAsistencia = Number(((p.asistencias / p.totalSesiones) * 100).toFixed(1));
        const sesionesPresente = p.asistencias;
        p.porcentajePuntualidad = sesionesPresente > 0
          ? Number((((sesionesPresente - p.llegadasTarde) / sesionesPresente) * 100).toFixed(1))
          : 100;
        updated = true;
      }
    }

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    }
  }

  // Convocatorias / Rosters
  public getRosters(): MatchRoster[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROSTERS);
    return raw ? JSON.parse(raw) : INITIAL_ROSTERS;
  }

  public saveRoster(roster: MatchRoster) {
    const rosters = this.getRosters();
    const idx = rosters.findIndex((r) => r.id === roster.id);
    if (idx === -1) {
      rosters.unshift(roster);
    } else {
      rosters[idx] = roster;
    }
    localStorage.setItem(STORAGE_KEYS.ROSTERS, JSON.stringify(rosters));

    this.addAuditLog(
      'Convocatoria Oficial Guardada',
      'Convocatoria',
      roster.id,
      `Convocatoria para partido vs ${roster.rival} (${roster.equipoNombre}, ${roster.formacion}) - Estado: ${roster.estado}`,
      'info'
    );
    this.notify();
  }

  // Donations
  public getDonations(): Donation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DONATIONS);
    return raw ? JSON.parse(raw) : INITIAL_DONATIONS;
  }

  public addDonation(donation: Donation) {
    const list = this.getDonations();
    list.unshift(donation);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(list));

    this.addAuditLog(
      'Registro de Donación Recibida',
      'Finanzas',
      donation.id,
      `Donación de ${donation.donanteNombre} por $${donation.monto.toLocaleString()} para "${donation.destinoProyecto}"`,
      'info'
    );
    this.notify();
  }

  // Expenses & Purchases
  public getExpenses(): ClubExpense[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : INITIAL_EXPENSES;
  }

  public addExpense(expense: ClubExpense) {
    const list = this.getExpenses();
    list.unshift(expense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(list));

    this.addAuditLog(
      'Registro de Gasto / Compra Oficial',
      'Finanzas',
      expense.id,
      `Gasto $${expense.monto.toLocaleString()} en [${expense.categoria}]: ${expense.concepto} (${expense.proveedor})`,
      'info'
    );
    this.notify();
  }

  // Audit Logs (ISO 27001)
  public getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  }

  public addAuditLog(
    accion: string,
    entidad: 'Jugador' | 'Socio' | 'Finanzas' | 'Convocatoria' | 'Asistencia' | 'Médico' | 'Seguridad',
    entidadId: string,
    detalles: string,
    nivelRiesgo: 'info' | 'advertencia' | 'critico' = 'info'
  ) {
    const logs = this.getAuditLogs();
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const activeRole = this.getActiveUserRole();

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: formattedDate,
      usuarioNombre: activeRole.name,
      rol: activeRole.role,
      accion,
      entidad: entidad as any,
      entidadId,
      detalles,
      ip: '190.220.14.88',
      nivelRiesgo
    };

    logs.unshift(newLog);
    // Keep last 150 audit entries
    const trimmed = logs.slice(0, 150);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
  }

  // Financial Summary for Board of Directors (Junta Directiva)
  public getBoardFinancialSummary(): FinancialSummary {
    const players = this.getPlayers();
    const socios = this.getSocios();
    const donations = this.getDonations();
    const expenses = this.getExpenses();

    // Sum player fees collected
    const ingresosCuotasJugadores = players.reduce((acc, p) => {
      const sumPayments = p.historialPagos.reduce((s, pay) => s + pay.monto, 0);
      return acc + sumPayments;
    }, 0);

    // Sum socio fees collected
    const ingresosCuotasSocios = socios.reduce((acc, s) => {
      const sumPayments = s.historialAportaciones.reduce((s, pay) => s + pay.monto, 0);
      return acc + sumPayments;
    }, 0);

    // Sum donations
    const ingresosDonaciones = donations.reduce((acc, d) => acc + d.monto, 0);

    // Sum expenses
    const egresosTotales = expenses.reduce((acc, e) => acc + e.monto, 0);

    const ingresosTotales = ingresosCuotasJugadores + ingresosCuotasSocios + ingresosDonaciones;
    const superavitDeficit = ingresosTotales - egresosTotales;

    const sociosMorososCount = socios.filter((s) => s.estadoPago === 'moroso').length;
    const jugadoresMorososCount = players.filter((p) => p.estadoCuota === 'moroso').length;

    const totalMiembros = players.length + socios.length;
    const miembrosAlDia = (players.filter((p) => p.estadoCuota === 'al_dia').length) +
                          (socios.filter((s) => s.estadoPago === 'al_dia').length);
    const tasaCobranzaPorcentaje = totalMiembros > 0 ? Number(((miembrosAlDia / totalMiembros) * 100).toFixed(1)) : 100;

    return {
      periodoMes: 'Noviembre 2026',
      ingresosTotales,
      ingresosCuotasJugadores,
      ingresosCuotasSocios,
      ingresosDonaciones,
      egresosTotales,
      superavitDeficit,
      tasaCobranzaPorcentaje,
      sociosMorososCount,
      jugadoresMorososCount
    };
  }

  // Export functions (CSV / SQL)
  public exportPlayersCSV(): string {
    const players = this.getPlayers();
    const headers = [
      'Dorsal',
      'Nombre',
      'Apellidos',
      'DNI',
      'Posicion Futsal',
      'Categoria Principal',
      'Doble Ficha Primera C',
      'Rating General',
      '% Asistencia',
      '% Puntualidad',
      'Grupo Sanguineo',
      'Peso (kg)',
      'Estatura (cm)',
      'Cuota Mensual (Bs)',
      'Estado Cuota',
      'Tarjetas Amarillas',
      'Tarjetas Rojas',
      'Suspension Pendiente'
    ];

    const rows = players.map((p) => [
      p.dorsal,
      `"${p.nombre}"`,
      `"${p.apellidos}"`,
      p.dni,
      `"${p.posicion}"`,
      `"${p.equipoNombre}"`,
      p.dobleFichaPrimeraC ? 'SI (Habilitado)' : 'NO',
      p.stats.ratingGeneral,
      `${p.porcentajeAsistencia}%`,
      `${p.porcentajePuntualidad}%`,
      p.medico.grupoSanguineo,
      `${p.medico.pesoKg} kg`,
      `${p.medico.alturaCm} cm`,
      `Bs ${p.cuotaMensualMonto}`,
      p.estadoCuota.toUpperCase(),
      p.tarjetasAmarillas,
      p.tarjetasRojas,
      p.partidosSuspensionPendientes
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportSociosCSV(): string {
    const socios = this.getSocios();
    const headers = [
      'Numero Socio',
      'Nombre',
      'Apellidos',
      'DNI',
      'Email',
      'Telefono',
      'Tipo Socio',
      'Estado Membresia',
      'Cuota Mensual (Bs)',
      'Estado Pago',
      'Ultimo Mes Pagado',
      'Fecha Ingreso'
    ];

    const rows = socios.map((s) => [
      s.numeroSocio,
      `"${s.nombre}"`,
      `"${s.apellidos}"`,
      s.dni,
      s.email,
      s.telefono,
      s.tipoSocio,
      s.estadoMembresia,
      `Bs ${s.cuotaMensual}`,
      s.estadoPago.toUpperCase(),
      `"${s.ultimoMesPagado}"`,
      s.fechaIngreso
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportFinancialLedgerCSV(): string {
    const donations = this.getDonations();
    const expenses = this.getExpenses();

    const headers = ['Tipo', 'Fecha', 'Concepto / Destino', 'Entidad / Proveedor', 'Monto (Bs)', 'Comprobante', 'Aprobado Por'];

    const donationRows = donations.map((d) => [
      'INGRESO_DONACION',
      d.fecha,
      `"${d.destinoProyecto}"`,
      `"${d.donanteNombre}"`,
      `Bs ${d.monto}`,
      d.comprobante,
      `"${d.registradoPor}"`
    ]);

    const expenseRows = expenses.map((e) => [
      'EGRESO_GASTO',
      e.fecha,
      `"[${e.categoria}] ${e.concepto}"`,
      `"${e.proveedor}"`,
      `-Bs ${e.monto}`,
      e.facturaNumero,
      `"${e.aprobadoPor}"`
    ]);

    return [headers.join(','), ...donationRows.map((r) => r.join(',')), ...expenseRows.map((r) => r.join(','))].join('\n');
  }

  public getNeonPostgresSchema(): string {
    return NEON_TECH_POSTGRES_SCHEMA;
  }
}

export const clubStorage = new ClubStorageService();
