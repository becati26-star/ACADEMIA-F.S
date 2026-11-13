/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Domain models and interfaces for ClubPro 360
 * Built adhering to SOLID and ISO 42010 architectural patterns
 */

export type RoleType = 'presidente' | 'entrenador' | 'tesorero' | 'medico' | 'coordinador' | 'administrador';

export interface UserRole {
  id: string;
  name: string;
  username?: string;
  role: RoleType;
  title: string;
  email?: string;
  password?: string;
  avatar?: string;
  permissions: string[];
  allowedTabs: string[];
}

export type CategoryId = 'sub-18' | 'sub-20' | 'primera-c';

export interface Category {
  id: CategoryId;
  name: string;
  ageRange: string;
  coachName: string;
  trainingDays: string;
  pitch: string;
  activePlayersCount?: number;
}

export type PlayerPosition = 
  | 'Arquero'
  | 'Cierre'
  | 'Ala Izquierda'
  | 'Ala Derecha'
  | 'Pívot'
  | 'Universal';

export interface InjuryRecord {
  id: string;
  fecha: string;
  lesion: string;
  tiempoBajaDias: number;
  estado: 'recuperado' | 'en_tratamiento' | 'recaida';
  altaMedicaFecha?: string;
}

export interface MedicalHistory {
  grupoSanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | string;
  pesoKg: number;
  alturaCm: number;
  aptoMedicoVigente?: boolean;
  fechaVencimientoApto?: string;
  lesionesPrevias?: InjuryRecord[];
  imc?: number;
  alergias?: string[];
  condicionesCronicas?: string[];
  contactoEmergencia?: any;
  observacionesClinicas?: string;
}

export interface PlayerStats {
  // Físico (0-100)
  velocidad: number;
  resistencia: number;
  fuerza: number;
  agilidad: number;

  // Técnico (0-100)
  controlBalon: number;
  precisionPase: number;
  potenciaTiro: number;
  regate: number;

  // Táctico (0-100)
  visionJuego: number;
  posicionamiento: number;
  tomaDecisiones: number;
  disciplinaTactica: number;

  // Global ponderado
  ratingGeneral: number;
}

export interface PaymentRecord {
  id: string;
  fecha: string;
  mes: string;
  monto: number;
  metodo: 'Transferencia' | 'Efectivo' | 'Tarjeta' | 'Débito Automático';
  comprobante: string;
  registradoPor: string;
  concepto: string;
}

export interface CardRecord {
  id: string;
  fecha: string;
  partido: string;
  tipo: 'amarilla' | 'roja';
  minuto: number;
  motivo: string;
  arbitro?: string;
}

export interface Player {
  id: string;
  dorsal: number;
  nombre: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  foto?: string;
  posicion: PlayerPosition;
  posicionSecundaria?: PlayerPosition;
  piernaHabil: 'Derecha' | 'Izquierda' | 'Ambidiestro';
  categoriaId: CategoryId;
  equipoNombre: string;
  // Multi-categoría: jugadores de Sub-18 / Sub-20 que juegan en Primera C o viceversa
  categoriasSecundarias?: CategoryId[];
  dobleFichaPrimeraC?: boolean;
  tutorLegal?: {
    nombre: string;
    telefono: string;
    dni: string;
    relacion: string;
  };

  // Historial Médico
  medico: MedicalHistory;

  // Estadísticas
  stats: PlayerStats;

  // Cuotas y pagos
  cuotaMensualMonto: number;
  estadoCuota: 'al_dia' | 'pendiente' | 'moroso';
  ultimoMesPagado: string;
  historialPagos: PaymentRecord[];

  // Asistencia acumulada
  totalSesiones: number;
  asistencias: number;
  llegadasTarde: number;
  faltasJustificadas: number;
  faltasInjustificadas: number;
  porcentajeAsistencia: number; // 0-100
  porcentajePuntualidad: number; // 0-100

  // Disciplina
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  partidosSuspensionPendientes: number;
  estadoDisciplinario: 'habilitado' | 'advertencia' | 'suspendido';
  historialTarjetas: CardRecord[];
}

export type SocioCategory = 'Fundador' | 'Pleno' | 'Cadete' | 'Honorario' | 'Familiar';

export interface Socio {
  id: string;
  numeroSocio: string;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoSocio: SocioCategory;
  estadoMembresia: 'activo' | 'inactivo' | 'suspendido';
  cuotaMensual: number;
  estadoPago: 'al_dia' | 'pendiente' | 'moroso';
  ultimoMesPagado: string;
  fechaIngreso: string;
  beneficios: string[];
  historialAportaciones: PaymentRecord[];
}

export interface AttendanceRecord {
  id: string;
  fecha: string;
  hora: string;
  tipo: 'entrenamiento' | 'partido';
  categoriaId: CategoryId;
  equipoNombre: string;
  rival?: string;
  lugar: string;
  entrenadorNombre: string;
  detalles: {
    jugadorId: string;
    estado: 'presente' | 'tarde' | 'justificado' | 'ausente';
    minutosTarde?: number;
    observacion?: string;
  }[];
}

export interface MatchRoster {
  id: string;
  rival: string;
  fecha: string;
  hora: string;
  lugar: string;
  categoriaId: CategoryId;
  equipoNombre: string;
  formacion: '1-2-1 (Rombo)' | '2-2 (Cuadrado)' | '1-3-0 (Sin Pívot)' | '1-1-2 (Ofensivo)';
  estado: 'borrador' | 'publicada' | 'finalizada';
  titulares: {
    jugadorId: string;
    posicionCancha: string; // e.g. "GK", "CIERRE", "ALA-I", "ALA-D", "PIVOT"
  }[];
  suplentes: string[]; // jugadorId[]
  noConvocados: {
    jugadorId: string;
    motivo: string;
  }[];
  puntuacionPonderadaConfig: {
    pesoRendimiento: number; // e.g. 0.40
    pesoAsistencia: number;   // e.g. 0.40
    pesoPuntualidad: number;  // e.g. 0.20
  };
  notasTacticas: string;
  creadoPor: string;
}

export interface Donation {
  id: string;
  fecha: string;
  donanteNombre: string;
  dniDonante?: string;
  monto: number;
  destinoProyecto: string;
  metodoPago: string;
  comprobante: string;
  notas?: string;
  registradoPor: string;
}

export interface ClubExpense {
  id: string;
  fecha: string;
  concepto: string;
  categoria: 
    | 'Material Deportivo'
    | 'Arbitraje & Jueces'
    | 'Indumentaria Oficial'
    | 'Transporte & Viajes'
    | 'Mantenimiento Canchas'
    | 'Servicio Médico & Kine'
    | 'Administración & Sede';
  monto: number;
  proveedor: string;
  facturaNumero: string;
  aprobadoPor: string;
  comprobante: string;
}

export interface FinancialSummary {
  periodoMes: string;
  ingresosTotales: number;
  ingresosCuotasJugadores: number;
  ingresosCuotasSocios: number;
  ingresosDonaciones: number;
  egresosTotales: number;
  superavitDeficit: number;
  tasaCobranzaPorcentaje: number;
  sociosMorososCount: number;
  jugadoresMorososCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  usuarioNombre: string;
  rol: RoleType;
  accion: string;
  entidad: 'Jugador' | 'Socio' | 'Finanzas' | 'Convocatoria' | 'Asistencia' | 'Médico';
  entidadId: string;
  detalles: string;
  ip: string;
  nivelRiesgo: 'info' | 'advertencia' | 'critico';
}

export interface FounderMember {
  id: string;
  nombre: string;
  cargoFundador: string;
  anioIngreso: string;
  aporte: string;
}

export interface HistoryMilestone {
  id: string;
  anio: string;
  titulo: string;
  descripcion: string;
}

export interface TeamHistory {
  nombreClub: string;
  fechaFundacion: string;
  ciudadOrigen: string;
  lemaFundacional: string;
  comoSeCreo: string;
  misionInstitucional: string;
  fundadores: FounderMember[];
  hitos: HistoryMilestone[];
  ultimaEdicionFecha: string;
  ultimaEdicionPor: string;
}
