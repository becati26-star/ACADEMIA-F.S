/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-fidelity initial seed data for ACADEMIA F.S. (Futsal Bolivia)
 * Categories: Sub-18, Sub-20, Primera C (with cross-category double registration)
 * Currency: Bolivianos (Bs)
 */

import { Category, Player, Socio, AttendanceRecord, MatchRoster, Donation, ClubExpense, AuditLog, UserRole } from '../types';

export const CLUB_INFO = {
  nombre: "ACADEMIA F.S.",
  subtitulo: "Club Deportivo de Futsal",
  lema: "Técnica, Dinámica y Pasión por el Fútbol de Salón",
  fundacion: "2018",
  sede: "Coliseo Polideportivo Central, Cancha Principal de Futsal",
  cuit: "NIT 4819203018",
  afiliacion: "Asociación Departamental de Fútbol de Salón (ADFS)",
  moneda: "Bs",
  monedaNombre: "Bolivianos",
  presidente: "Lic. Carlos Mendoza Rivas",
  directoraFinanciera: "Lic. Valeria Santillán",
  directorTecnicoPrincipal: "Prof. Diego Alejandro Vera",
  crestUrl: "/assets/aistudio/WhatsApp_Image_2026-11-13_at_09.06.09_02786f7e.jpeg",
  pitchUrl: "/assets/aistudio/WhatsApp_Image_2026-11-13_at_09.06.09_02786f7e.jpeg"
};

export const INITIAL_ROLES: UserRole[] = [
  {
    id: 'user-dt',
    name: 'Diego Alejandro Vera',
    username: 'Director técnico',
    role: 'entrenador',
    title: 'Director Técnico (DT)',
    email: 'dt@academiafs.bo',
    password: 'tecnico2026.',
    permissions: ['attendance:write', 'roster:write', 'players:stats:write', 'tactics:manage'],
    allowedTabs: ['dashboard', 'players', 'mensualidades', 'attendance', 'convocatorias']
  },
  {
    id: 'user-presi',
    name: 'Carlos Mendoza Rivas',
    username: 'Presidente',
    role: 'presidente',
    title: 'Presidente del Club',
    email: 'presidente@academiafs.bo',
    password: 'Presidencia2026$',
    permissions: ['members:write', 'finance:write', 'audit:read', 'reports:executive'],
    allowedTabs: ['dashboard', 'players', 'mensualidades', 'socios', 'treasury', 'reports']
  },
  {
    id: 'user-admin',
    name: 'Ing. Roberto Arce',
    username: 'administrador',
    role: 'administrador',
    title: 'Administrador del Sistema',
    email: 'admin@academiafs.bo',
    password: 'admin1399..',
    permissions: ['all'],
    allowedTabs: ['dashboard', 'players', 'mensualidades', 'socios', 'attendance', 'convocatorias', 'treasury', 'reports', 'neon']
  },
  {
    id: 'user-tesorero',
    name: 'Valeria Santillán',
    role: 'tesorero',
    title: 'Tesorera del Club',
    email: 'tesoreria@academiafs.bo',
    password: 'teso2026',
    permissions: ['finance:read', 'finance:write', 'donations:manage', 'dues:audit'],
    allowedTabs: ['treasury', 'reports', 'socios', 'players']
  },
  {
    id: 'user-medico',
    name: 'Dr. Fernando Morales',
    role: 'medico',
    title: 'Médico Deportólogo',
    email: 'medico@academiafs.bo',
    password: 'med2026',
    permissions: ['medical:write', 'fitness:certify'],
    allowedTabs: ['players', 'dashboard']
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'sub-18',
    name: 'Sub-18 Futsal',
    ageRange: '16 a 18 años',
    coachName: 'Prof. Diego Vera',
    trainingDays: 'Lunes, Miércoles y Viernes 17:30',
    pitch: 'Coliseo Municipal - Cancha Parquet 1'
  },
  {
    id: 'sub-20',
    name: 'Sub-20 Futsal',
    ageRange: '18 a 20 años',
    coachName: 'Prof. Diego Vera',
    trainingDays: 'Martes, Jueves y Sábados 19:00',
    pitch: 'Coliseo Municipal - Cancha Parquet 1'
  },
  {
    id: 'primera-c',
    name: 'Primera C Futsal',
    ageRange: 'División de Ascenso Oficial',
    coachName: 'DT Diego Vera & Asist. Marcelo Rossi',
    trainingDays: 'Lunes a Jueves 20:30',
    pitch: 'Coliseo Principal de Futsal'
  }
];

export const INITIAL_PLAYERS: Player[] = [
  // SUB-18 PLAYERS (some play up in Primera C)
  {
    id: 'ply-01',
    dorsal: 10,
    nombre: 'Mateo',
    apellidos: 'García Silva',
    dni: '8912834 LP',
    fechaNacimiento: '2008-04-12',
    telefono: '+591 765-89100',
    email: 'mateo.garcia@email.com',
    foto: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=300&auto=format&fit=crop&q=80',
    posicion: 'Ala Izquierda',
    posicionSecundaria: 'Universal',
    piernaHabil: 'Izquierda',
    categoriaId: 'sub-18',
    equipoNombre: 'Sub-18 Futsal',
    categoriasSecundarias: ['primera-c'],
    dobleFichaPrimeraC: true,
    tutorLegal: {
      nombre: 'Ricardo García',
      telefono: '+591 765-89000',
      dni: '4112560 LP',
      relacion: 'Padre'
    },
    medico: {
      grupoSanguineo: 'O+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-02-15',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 64.0,
      alturaCm: 172,
      imc: 21.6,
      contactoEmergencia: {
        nombre: 'Ricardo García',
        parentesco: 'Padre',
        telefono: '+591 765-89000'
      },
      observacionesClinicas: 'Excelente resistencia en transición rápida de futsal. Apto clase A.'
    },
    stats: {
      velocidad: 92,
      resistencia: 88,
      fuerza: 76,
      agilidad: 94,
      controlBalon: 95,
      precisionPase: 91,
      potenciaTiro: 89,
      regate: 96,
      visionJuego: 91,
      posicionamiento: 89,
      tomaDecisiones: 90,
      disciplinaTactica: 92,
      ratingGeneral: 92
    },
    cuotaMensualMonto: 150,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p01-1',
        fecha: '2026-11-03',
        mes: 'Noviembre 2026',
        monto: 150,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-99120',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Sub-18 Nov-2026'
      }
    ],
    totalSesiones: 28,
    asistencias: 28,
    llegadasTarde: 0,
    faltasJustificadas: 0,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 100,
    porcentajePuntualidad: 100,
    tarjetasAmarillas: 1,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: [
      {
        id: 'card-1',
        fecha: '2026-10-18',
        partido: 'vs Deportivo Futsal El Alto (5-3)',
        tipo: 'amarilla',
        minuto: 32,
        motivo: 'Falta táctica en contragolpe'
      }
    ]
  },
  {
    id: 'ply-02',
    dorsal: 1,
    nombre: 'Jhoel',
    apellidos: 'Mendoza Claros',
    dni: '9120441 CB',
    fechaNacimiento: '2008-09-14',
    telefono: '+591 712-33440',
    email: 'jhoel.mendoza@email.com',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    posicion: 'Arquero',
    piernaHabil: 'Derecha',
    categoriaId: 'sub-18',
    equipoNombre: 'Sub-18 Futsal',
    categoriasSecundarias: ['primera-c'],
    dobleFichaPrimeraC: true,
    medico: {
      grupoSanguineo: 'A+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-04-10',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 72.0,
      alturaCm: 181,
      imc: 22.0,
      contactoEmergencia: {
        nombre: 'Sonia Claros',
        parentesco: 'Madre',
        telefono: '+591 712-33400'
      },
      observacionesClinicas: 'Grandes reflejos bajo los 3 palos y buen juego con los pies (arquero-jugador).'
    },
    stats: {
      velocidad: 78,
      resistencia: 84,
      fuerza: 86,
      agilidad: 91,
      controlBalon: 82,
      precisionPase: 87,
      potenciaTiro: 81,
      regate: 65,
      visionJuego: 89,
      posicionamiento: 93,
      tomaDecisiones: 90,
      disciplinaTactica: 94,
      ratingGeneral: 89
    },
    cuotaMensualMonto: 150,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p02-1',
        fecha: '2026-11-02',
        mes: 'Noviembre 2026',
        monto: 150,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-11029',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Sub-18 Nov-2026'
      }
    ],
    totalSesiones: 28,
    asistencias: 27,
    llegadasTarde: 1,
    faltasJustificadas: 0,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 96.4,
    porcentajePuntualidad: 96.3,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },
  {
    id: 'ply-03',
    dorsal: 5,
    nombre: 'Rodrigo',
    apellidos: 'Mamani Quispe',
    dni: '8841029 LP',
    fechaNacimiento: '2008-02-05',
    telefono: '+591 799-88120',
    email: 'rodrigo.mamani@email.com',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    posicion: 'Cierre',
    piernaHabil: 'Derecha',
    categoriaId: 'sub-18',
    equipoNombre: 'Sub-18 Futsal',
    medico: {
      grupoSanguineo: 'O+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-03-30',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 68.0,
      alturaCm: 177,
      imc: 21.7,
      contactoEmergencia: {
        nombre: 'César Mamani',
        parentesco: 'Padre',
        telefono: '+591 799-88100'
      },
      observacionesClinicas: 'Excelente quite y temporización defensiva.'
    },
    stats: {
      velocidad: 84,
      resistencia: 90,
      fuerza: 85,
      agilidad: 82,
      controlBalon: 84,
      precisionPase: 88,
      potenciaTiro: 82,
      regate: 74,
      visionJuego: 89,
      posicionamiento: 94,
      tomaDecisiones: 91,
      disciplinaTactica: 95,
      ratingGeneral: 87
    },
    cuotaMensualMonto: 150,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p03-1',
        fecha: '2026-11-04',
        mes: 'Noviembre 2026',
        monto: 150,
        metodo: 'Efectivo',
        comprobante: 'REC-BS-8812',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Sub-18 Nov-2026'
      }
    ],
    totalSesiones: 28,
    asistencias: 26,
    llegadasTarde: 2,
    faltasJustificadas: 0,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 92.9,
    porcentajePuntualidad: 92.3,
    tarjetasAmarillas: 2,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },
  {
    id: 'ply-04',
    dorsal: 9,
    nombre: 'Kevin',
    apellidos: 'Vargas Zeballos',
    dni: '9340112 SC',
    fechaNacimiento: '2008-07-22',
    telefono: '+591 770-44910',
    email: 'kevin.vargas@email.com',
    posicion: 'Pívot',
    posicionSecundaria: 'Ala Derecha',
    piernaHabil: 'Derecha',
    categoriaId: 'sub-18',
    equipoNombre: 'Sub-18 Futsal',
    categoriasSecundarias: ['sub-20'],
    medico: {
      grupoSanguineo: 'B+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-05-18',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 71.0,
      alturaCm: 179,
      imc: 22.2,
      contactoEmergencia: {
        nombre: 'Elva Zeballos',
        parentesco: 'Madre',
        telefono: '+591 770-44900'
      },
      observacionesClinicas: 'Gran giro con pelota y juego de espaldas al arco.'
    },
    stats: {
      velocidad: 88,
      resistencia: 83,
      fuerza: 87,
      agilidad: 86,
      controlBalon: 89,
      precisionPase: 82,
      potenciaTiro: 93,
      regate: 87,
      visionJuego: 84,
      posicionamiento: 92,
      tomaDecisiones: 88,
      disciplinaTactica: 89,
      ratingGeneral: 88
    },
    cuotaMensualMonto: 150,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p04-1',
        fecha: '2026-11-01',
        mes: 'Noviembre 2026',
        monto: 150,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-4491',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Sub-18 Nov-2026'
      }
    ],
    totalSesiones: 28,
    asistencias: 27,
    llegadasTarde: 0,
    faltasJustificadas: 1,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 96.4,
    porcentajePuntualidad: 100,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },
  {
    id: 'ply-05',
    dorsal: 7,
    nombre: 'Ariel',
    apellidos: 'Condori Ramos',
    dni: '9211048 LP',
    fechaNacimiento: '2008-11-19',
    telefono: '+591 720-11880',
    email: 'ariel.condori@email.com',
    posicion: 'Ala Derecha',
    piernaHabil: 'Derecha',
    categoriaId: 'sub-18',
    equipoNombre: 'Sub-18 Futsal',
    medico: {
      grupoSanguineo: 'O+',
      aptoMedicoVigente: false, // Medical expired test case!
      fechaVencimientoApto: '2026-10-31',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [
        {
          id: 'inj-1',
          fecha: '2026-10-20',
          lesion: 'Contractura en gemelo derecho',
          tiempoBajaDias: 14,
          estado: 'en_tratamiento'
        }
      ],
      pesoKg: 62.0,
      alturaCm: 169,
      imc: 21.7,
      contactoEmergencia: {
        nombre: 'Mario Condori',
        parentesco: 'Padre',
        telefono: '+591 720-11800'
      },
      observacionesClinicas: 'Apto médico vencido el 31/10/2026. En reposo por contractura muscular.'
    },
    stats: {
      velocidad: 89,
      resistencia: 76,
      fuerza: 72,
      agilidad: 90,
      controlBalon: 86,
      precisionPase: 80,
      potenciaTiro: 81,
      regate: 88,
      visionJuego: 80,
      posicionamiento: 83,
      tomaDecisiones: 81,
      disciplinaTactica: 82,
      ratingGeneral: 82
    },
    cuotaMensualMonto: 150,
    estadoCuota: 'pendiente',
    ultimoMesPagado: 'Octubre 2026',
    historialPagos: [],
    totalSesiones: 28,
    asistencias: 20,
    llegadasTarde: 3,
    faltasJustificadas: 3,
    faltasInjustificadas: 2,
    porcentajeAsistencia: 71.4,
    porcentajePuntualidad: 85.0,
    tarjetasAmarillas: 1,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },

  // SUB-20 PLAYERS (some play in Primera C and vice versa)
  {
    id: 'ply-06',
    dorsal: 8,
    nombre: 'Christian',
    apellidos: 'Torrico Balderrama',
    dni: '7829104 CB',
    fechaNacimiento: '2006-05-14',
    telefono: '+591 707-11223',
    email: 'christian.torrico@email.com',
    posicion: 'Universal',
    posicionSecundaria: 'Cierre',
    piernaHabil: 'Ambidiestro',
    categoriaId: 'sub-20',
    equipoNombre: 'Sub-20 Futsal',
    categoriasSecundarias: ['primera-c'],
    dobleFichaPrimeraC: true,
    medico: {
      grupoSanguineo: 'A+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-06-15',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 69.0,
      alturaCm: 176,
      imc: 22.3,
      contactoEmergencia: {
        nombre: 'Ruth Balderrama',
        parentesco: 'Madre',
        telefono: '+591 707-11200'
      },
      observacionesClinicas: 'Capitán de Sub-20 y titular habitual en Primera C. Excelente condición física.'
    },
    stats: {
      velocidad: 90,
      resistencia: 93,
      fuerza: 86,
      agilidad: 91,
      controlBalon: 93,
      precisionPase: 94,
      potenciaTiro: 88,
      regate: 90,
      visionJuego: 95,
      posicionamiento: 94,
      tomaDecisiones: 93,
      disciplinaTactica: 96,
      ratingGeneral: 93
    },
    cuotaMensualMonto: 180,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p06-1',
        fecha: '2026-11-02',
        mes: 'Noviembre 2026',
        monto: 180,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-7718',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Sub-20 Nov-2026'
      }
    ],
    totalSesiones: 32,
    asistencias: 32,
    llegadasTarde: 0,
    faltasJustificadas: 0,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 100,
    porcentajePuntualidad: 100,
    tarjetasAmarillas: 1,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },
  {
    id: 'ply-07',
    dorsal: 11,
    nombre: 'Mauricio',
    apellidos: 'Guzmán Loza',
    dni: '8102934 LP',
    fechaNacimiento: '2006-08-30',
    telefono: '+591 762-99001',
    email: 'mauricio.guzman@email.com',
    posicion: 'Ala Izquierda',
    piernaHabil: 'Izquierda',
    categoriaId: 'sub-20',
    equipoNombre: 'Sub-20 Futsal',
    categoriasSecundarias: ['primera-c'],
    dobleFichaPrimeraC: true,
    medico: {
      grupoSanguineo: 'O+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-03-25',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 66.0,
      alturaCm: 174,
      imc: 21.8,
      contactoEmergencia: {
        nombre: 'René Guzmán',
        parentesco: 'Padre',
        telefono: '+591 762-99000'
      },
      observacionesClinicas: 'Extrema rapidez en el 1 contra 1 por banda izquierda.'
    },
    stats: {
      velocidad: 95,
      resistencia: 87,
      fuerza: 79,
      agilidad: 96,
      controlBalon: 91,
      precisionPase: 86,
      potenciaTiro: 87,
      regate: 95,
      visionJuego: 87,
      posicionamiento: 88,
      tomaDecisiones: 86,
      disciplinaTactica: 89,
      ratingGeneral: 90
    },
    cuotaMensualMonto: 180,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p07-1',
        fecha: '2026-11-04',
        mes: 'Noviembre 2026',
        monto: 180,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-9902',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Sub-20 Nov-2026'
      }
    ],
    totalSesiones: 32,
    asistencias: 31,
    llegadasTarde: 1,
    faltasJustificadas: 0,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 96.9,
    porcentajePuntualidad: 96.8,
    tarjetasAmarillas: 2,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },
  {
    id: 'ply-08',
    dorsal: 3,
    nombre: 'Fabricio',
    apellidos: 'Pinto Villarroel',
    dni: '8294101 SC',
    fechaNacimiento: '2006-03-12',
    telefono: '+591 784-22331',
    email: 'fabricio.pinto@email.com',
    posicion: 'Cierre',
    piernaHabil: 'Derecha',
    categoriaId: 'sub-20',
    equipoNombre: 'Sub-20 Futsal',
    medico: {
      grupoSanguineo: 'B+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-01-20',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 74.0,
      alturaCm: 180,
      imc: 22.8,
      contactoEmergencia: {
        nombre: 'Lorena Villarroel',
        parentesco: 'Madre',
        telefono: '+591 784-22300'
      },
      observacionesClinicas: 'Gran capacidad de anticipación y choque en primera línea.'
    },
    stats: {
      velocidad: 83,
      resistencia: 89,
      fuerza: 90,
      agilidad: 81,
      controlBalon: 82,
      precisionPase: 85,
      potenciaTiro: 86,
      regate: 72,
      visionJuego: 88,
      posicionamiento: 93,
      tomaDecisiones: 88,
      disciplinaTactica: 94,
      ratingGeneral: 87
    },
    cuotaMensualMonto: 180,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p08-1',
        fecha: '2026-11-05',
        mes: 'Noviembre 2026',
        monto: 180,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-3312',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Sub-20 Nov-2026'
      }
    ],
    totalSesiones: 32,
    asistencias: 30,
    llegadasTarde: 0,
    faltasJustificadas: 2,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 93.8,
    porcentajePuntualidad: 100,
    tarjetasAmarillas: 1,
    tarjetasRojas: 1, // Red card suspension case!
    partidosSuspensionPendientes: 1,
    estadoDisciplinario: 'suspendido',
    historialTarjetas: [
      {
        id: 'card-2',
        fecha: '2026-10-25',
        partido: 'vs Futsal Wolf Sport',
        tipo: 'roja',
        minuto: 37,
        motivo: 'Último hombre, corte deliberado de gol con mano'
      }
    ]
  },
  {
    id: 'ply-09',
    dorsal: 12,
    nombre: 'Esteban',
    apellidos: 'Flores Morales',
    dni: '8119024 LP',
    fechaNacimiento: '2006-11-04',
    telefono: '+591 730-88112',
    email: 'esteban.flores@email.com',
    posicion: 'Arquero',
    piernaHabil: 'Derecha',
    categoriaId: 'sub-20',
    equipoNombre: 'Sub-20 Futsal',
    medico: {
      grupoSanguineo: 'O+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-04-18',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 75.0,
      alturaCm: 183,
      imc: 22.4,
      contactoEmergencia: {
        nombre: 'Jaime Flores',
        parentesco: 'Padre',
        telefono: '+591 730-88100'
      },
      observacionesClinicas: 'Excelente cobertura del primer palo y achiques en 1vs1.'
    },
    stats: {
      velocidad: 76,
      resistencia: 82,
      fuerza: 84,
      agilidad: 88,
      controlBalon: 79,
      precisionPase: 83,
      potenciaTiro: 78,
      regate: 62,
      visionJuego: 85,
      posicionamiento: 91,
      tomaDecisiones: 87,
      disciplinaTactica: 92,
      ratingGeneral: 85
    },
    cuotaMensualMonto: 180,
    estadoCuota: 'pendiente',
    ultimoMesPagado: 'Octubre 2026',
    historialPagos: [
      {
        id: 'pay-p09-1',
        fecha: '2026-11-03',
        mes: 'Noviembre 2026',
        monto: 180,
        metodo: 'Efectivo',
        comprobante: 'REC-BS-1190',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Sub-20 Nov-2026'
      }
    ],
    totalSesiones: 32,
    asistencias: 31,
    llegadasTarde: 1,
    faltasJustificadas: 0,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 96.9,
    porcentajePuntualidad: 96.8,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },

  // PRIMERA C PLAYERS (Senior Futsal - can also be reinforced by or reinforce Sub-20)
  {
    id: 'ply-10',
    dorsal: 10,
    nombre: 'Ronald',
    apellidos: 'Justiniano Arteaga',
    dni: '6491024 SC',
    fechaNacimiento: '2001-02-18',
    telefono: '+591 773-10924',
    email: 'ronald.justiniano@email.com',
    posicion: 'Pívot',
    posicionSecundaria: 'Universal',
    piernaHabil: 'Derecha',
    categoriaId: 'primera-c',
    equipoNombre: 'Primera C Futsal',
    medico: {
      grupoSanguineo: 'A+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-05-10',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 76.0,
      alturaCm: 180,
      imc: 23.5,
      contactoEmergencia: {
        nombre: 'Gisela Arteaga',
        parentesco: 'Hermana',
        telefono: '+591 773-10900'
      },
      observacionesClinicas: 'Capitán de Primera C. Goleador del torneo de ascenso con 24 goles.'
    },
    stats: {
      velocidad: 88,
      resistencia: 92,
      fuerza: 92,
      agilidad: 88,
      controlBalon: 94,
      precisionPase: 90,
      potenciaTiro: 96,
      regate: 91,
      visionJuego: 93,
      posicionamiento: 96,
      tomaDecisiones: 94,
      disciplinaTactica: 97,
      ratingGeneral: 94
    },
    cuotaMensualMonto: 220,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p10-1',
        fecha: '2026-11-01',
        mes: 'Noviembre 2026',
        monto: 220,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-6491',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Primera C Nov-2026'
      }
    ],
    totalSesiones: 36,
    asistencias: 36,
    llegadasTarde: 0,
    faltasJustificadas: 0,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 100,
    porcentajePuntualidad: 100,
    tarjetasAmarillas: 1,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },
  {
    id: 'ply-11',
    dorsal: 4,
    nombre: 'Javier',
    apellidos: 'Choque Saldaña',
    dni: '6812039 OR',
    fechaNacimiento: '2000-09-10',
    telefono: '+591 718-44221',
    email: 'javier.choque@email.com',
    posicion: 'Cierre',
    piernaHabil: 'Derecha',
    categoriaId: 'primera-c',
    equipoNombre: 'Primera C Futsal',
    medico: {
      grupoSanguineo: 'O+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-03-14',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 73.0,
      alturaCm: 178,
      imc: 23.0,
      contactoEmergencia: {
        nombre: 'Julia Saldaña',
        parentesco: 'Madre',
        telefono: '+591 718-44200'
      },
      observacionesClinicas: 'Eje defensivo del equipo de Primera C. Excelente marcación zonal.'
    },
    stats: {
      velocidad: 85,
      resistencia: 94,
      fuerza: 89,
      agilidad: 84,
      controlBalon: 88,
      precisionPase: 92,
      potenciaTiro: 86,
      regate: 80,
      visionJuego: 94,
      posicionamiento: 96,
      tomaDecisiones: 93,
      disciplinaTactica: 97,
      ratingGeneral: 91
    },
    cuotaMensualMonto: 220,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p11-1',
        fecha: '2026-11-02',
        mes: 'Noviembre 2026',
        monto: 220,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-6812',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Primera C Nov-2026'
      }
    ],
    totalSesiones: 36,
    asistencias: 35,
    llegadasTarde: 1,
    faltasJustificadas: 0,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 97.2,
    porcentajePuntualidad: 97.1,
    tarjetasAmarillas: 2,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  },
  {
    id: 'ply-12',
    dorsal: 6,
    nombre: 'Wilmer',
    apellidos: 'Villagómez Rojas',
    dni: '6940192 SC',
    fechaNacimiento: '2002-12-04',
    telefono: '+591 776-90812',
    email: 'wilmer.villagomez@email.com',
    posicion: 'Ala Derecha',
    posicionSecundaria: 'Universal',
    piernaHabil: 'Derecha',
    categoriaId: 'primera-c',
    equipoNombre: 'Primera C Futsal',
    categoriasSecundarias: ['sub-20'], // Cross-category player!
    dobleFichaPrimeraC: true,
    medico: {
      grupoSanguineo: 'A+',
      aptoMedicoVigente: true,
      fechaVencimientoApto: '2027-04-01',
      alergias: [],
      condicionesCronicas: [],
      lesionesPrevias: [],
      pesoKg: 67.0,
      alturaCm: 173,
      imc: 22.4,
      contactoEmergencia: {
        nombre: 'Carla Rojas',
        parentesco: 'Madre',
        telefono: '+591 776-90800'
      },
      observacionesClinicas: 'Gran despliegue físico por banda derecha, velocidad y pegada exterior.'
    },
    stats: {
      velocidad: 93,
      resistencia: 90,
      fuerza: 82,
      agilidad: 92,
      controlBalon: 91,
      precisionPase: 89,
      potenciaTiro: 91,
      regate: 92,
      visionJuego: 89,
      posicionamiento: 90,
      tomaDecisiones: 88,
      disciplinaTactica: 91,
      ratingGeneral: 91
    },
    cuotaMensualMonto: 220,
    estadoCuota: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    historialPagos: [
      {
        id: 'pay-p12-1',
        fecha: '2026-11-03',
        mes: 'Noviembre 2026',
        monto: 220,
        metodo: 'Transferencia',
        comprobante: 'QR-BS-6940',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota deportiva Futsal Primera C Nov-2026'
      }
    ],
    totalSesiones: 36,
    asistencias: 35,
    llegadasTarde: 0,
    faltasJustificadas: 1,
    faltasInjustificadas: 0,
    porcentajeAsistencia: 97.2,
    porcentajePuntualidad: 100,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0,
    partidosSuspensionPendientes: 0,
    estadoDisciplinario: 'habilitado',
    historialTarjetas: []
  }
];

export const INITIAL_SOCIOS: Socio[] = [
  {
    id: 'soc-01',
    numeroSocio: 'SOC-00042',
    nombre: 'Guillermo',
    apellidos: 'Bustamante Rivas',
    dni: '3819201 LP',
    email: 'gbustamante@constructora.bo',
    telefono: '+591 765-11000',
    direccion: 'Calacoto Calle 15, Edif. Torre Sur',
    tipoSocio: 'Fundador',
    estadoMembresia: 'activo',
    cuotaMensual: 300,
    estadoPago: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    fechaIngreso: '2018-03-10',
    beneficios: [
      'Acceso VIP a partidos de local en el Coliseo',
      'Voz y voto pleno en Asamblea General de ACADEMIA F.S.',
      'Descuento 30% en indumentaria oficial de futsal',
      'Reserva preferente de turnos de cancha de parquet'
    ],
    historialAportaciones: [
      {
        id: 'pay-s01-1',
        fecha: '2026-11-01',
        mes: 'Noviembre 2026',
        monto: 300,
        metodo: 'Transferencia',
        comprobante: 'QR-SOC-042',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota Socio Fundador Nov-2026'
      }
    ]
  },
  {
    id: 'soc-02',
    numeroSocio: 'SOC-00180',
    nombre: 'Luciana',
    apellidos: 'Díaz Colman',
    dni: '4819022 CB',
    email: 'luciana.diaz@futsal.bo',
    telefono: '+591 712-44090',
    direccion: 'Av. América 450',
    tipoSocio: 'Pleno',
    estadoMembresia: 'activo',
    cuotaMensual: 150,
    estadoPago: 'pendiente',
    ultimoMesPagado: 'Octubre 2026',
    fechaIngreso: '2020-05-15',
    beneficios: [
      'Entrada libre a todos los partidos de Sub-18, Sub-20 y Primera C',
      'Descuento 15% en tienda del club',
      'Participación en clínicas de futsal formativo'
    ],
    historialAportaciones: [
      {
        id: 'pay-s02-1',
        fecha: '2026-11-03',
        mes: 'Noviembre 2026',
        monto: 150,
        metodo: 'Transferencia',
        comprobante: 'QR-SOC-180',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota Socio Pleno Nov-2026'
      }
    ]
  },
  {
    id: 'soc-03',
    numeroSocio: 'SOC-00215',
    nombre: 'Familia',
    apellidos: 'Gómez Quisbert',
    dni: '4190821 LP',
    email: 'familia.gomez@email.com',
    telefono: '+591 799-33201',
    direccion: 'Miraflores Calle Díaz Romero 210',
    tipoSocio: 'Familiar',
    estadoMembresia: 'activo',
    cuotaMensual: 250,
    estadoPago: 'al_dia',
    ultimoMesPagado: 'Noviembre 2026',
    fechaIngreso: '2022-02-01',
    beneficios: [
      'Pase familiar hasta 4 personas',
      'Descuento en escuela formativa de futsal para menores'
    ],
    historialAportaciones: [
      {
        id: 'pay-s03-1',
        fecha: '2026-11-04',
        mes: 'Noviembre 2026',
        monto: 250,
        metodo: 'Efectivo',
        comprobante: 'REC-SOC-215',
        registradoPor: 'Valeria Santillán',
        concepto: 'Cuota Grupo Familiar Nov-2026'
      }
    ]
  },
  {
    id: 'soc-04',
    numeroSocio: 'SOC-00340',
    nombre: 'Mariano',
    apellidos: 'Ferreira Santos',
    dni: '5920192 SC',
    email: 'mferreira@transporte.bo',
    telefono: '+591 770-88192',
    direccion: 'Equipetrol Calle 8',
    tipoSocio: 'Pleno',
    estadoMembresia: 'activo',
    cuotaMensual: 150,
    estadoPago: 'moroso',
    ultimoMesPagado: 'Septiembre 2026',
    fechaIngreso: '2021-08-10',
    beneficios: ['Entrada libre a partidos de local'],
    historialAportaciones: []
  }
];

export const INITIAL_ATTENDANCES: AttendanceRecord[] = [
  {
    id: 'att-futsal-01',
    fecha: '2026-11-09',
    hora: '19:00',
    tipo: 'entrenamiento',
    categoriaId: 'sub-20',
    equipoNombre: 'Sub-20 Futsal',
    lugar: 'Coliseo Municipal - Cancha Parquet 1',
    entrenadorNombre: 'Prof. Diego Vera',
    detalles: [
      { jugadorId: 'ply-06', estado: 'presente', observacion: 'Excelente intensidad en salida 3-1 y repliegue' },
      { jugadorId: 'ply-07', estado: 'presente', observacion: 'Velocidad en banda y definición al segundo palo' },
      { jugadorId: 'ply-08', estado: 'presente', observacion: 'Trabajó táctica defensiva' },
      { jugadorId: 'ply-09', estado: 'presente', observacion: 'Achiques en 1vs1 de futsal' },
      // Sub-18 players training with Sub-20 / Primera C (cross-category)
      { jugadorId: 'ply-01', estado: 'presente', observacion: 'Sub-18 sumado a práctica de Sub-20/Primera C' },
      { jugadorId: 'ply-02', estado: 'tarde', minutosTarde: 10, observacion: 'Demora escolar con aviso' }
    ]
  },
  {
    id: 'att-futsal-02',
    fecha: '2026-11-07',
    hora: '20:30',
    tipo: 'entrenamiento',
    categoriaId: 'primera-c',
    equipoNombre: 'Primera C Futsal',
    lugar: 'Coliseo Principal de Futsal',
    entrenadorNombre: 'DT Diego Vera',
    detalles: [
      { jugadorId: 'ply-10', estado: 'presente', observacion: 'Eje ofensivo en el pívot' },
      { jugadorId: 'ply-11', estado: 'presente', observacion: 'Cierre impecable' },
      { jugadorId: 'ply-12', estado: 'presente', observacion: 'Ala rápido' },
      // Cross-category call-ups from Sub-18 and Sub-20
      { jugadorId: 'ply-01', estado: 'presente', observacion: 'Sub-18 convocado a Primera C: ritmo extraordinario' },
      { jugadorId: 'ply-06', estado: 'presente', observacion: 'Sub-20 titular en Primera C' }
    ]
  }
];

export const INITIAL_ROSTERS: MatchRoster[] = [
  {
    id: 'rst-primera-c-final',
    rival: 'Club Deportivo CRE Futsal (Filial)',
    fecha: '2026-11-14',
    hora: '20:45',
    lugar: 'Coliseo Julio Borelli Viteritto (Cancha Central)',
    categoriaId: 'primera-c',
    equipoNombre: 'Primera C Futsal',
    formacion: '1-2-1 (Rombo)',
    estado: 'publicada',
    titulares: [
      { jugadorId: 'ply-02', posicionCancha: 'GK' }, // Arquero Sub-18 con doble ficha en Primera C
      { jugadorId: 'ply-11', posicionCancha: 'CIERRE' }, // Cierre Javier Choque
      { jugadorId: 'ply-01', posicionCancha: 'ALA-I' }, // Ala Izq Mateo García (Sub-18 jugando en Primera C)
      { jugadorId: 'ply-12', posicionCancha: 'ALA-D' }, // Ala Der Wilmer Villagómez
      { jugadorId: 'ply-10', posicionCancha: 'PIVOT' }  // Pívot Ronald Justiniano
    ],
    suplentes: ['ply-06', 'ply-07', 'ply-03', 'ply-09'],
    noConvocados: [
      {
        jugadorId: 'ply-05',
        motivo: 'Médico: Apto médico vencido y contractura en gemelo'
      },
      {
        jugadorId: 'ply-08',
        motivo: 'Tribunal Disciplinario: Suspensión por tarjeta roja directa'
      }
    ],
    puntuacionPonderadaConfig: {
      pesoRendimiento: 0.45,
      pesoAsistencia: 0.35,
      pesoPuntualidad: 0.20
    },
    notasTacticas: 'Esquema Rombo 1-2-1. Salida con pases tensos al ras de piso. Explotar giro de Justiniano en el pívot con desdoble veloz de Mateo García por banda izquierda. Presión en zona 2 tras pérdida.',
    creadoPor: 'Prof. Diego Vera (DT ACADEMIA F.S.)'
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don-01',
    fecha: '2026-11-02',
    donanteNombre: 'Comercializadora Deportiva Altiplano',
    dniDonante: 'NIT 2940192011',
    monto: 6500, // Bs
    destinoProyecto: 'Lote de 20 balones oficiales Penalty Max 1000 Futsal y pecheras de entrenamiento',
    metodoPago: 'Transferencia Bancaria QR',
    comprobante: 'QR-DON-6500',
    notas: 'Aporte altruista para canteras Sub-18 y Sub-20',
    registradoPor: 'Carlos Mendoza Rivas'
  },
  {
    id: 'don-02',
    fecha: '2026-10-20',
    donanteNombre: 'Ing. Guillermo Bustamante (Socio Fundador)',
    dniDonante: '3819201 LP',
    monto: 4000, // Bs
    destinoProyecto: 'Adecuación de arcos reglamentarios de futsal y redes de nylon trenzado',
    metodoPago: 'Cheque',
    comprobante: 'CHQ-DON-4000',
    notas: 'Donación para la sede de entrenamiento',
    registradoPor: 'Valeria Santillán'
  }
];

export const INITIAL_EXPENSES: ClubExpense[] = [
  {
    id: 'exp-01',
    fecha: '2026-11-04',
    concepto: 'Compra de 15 balones oficiales Penalty Futsal Pro y conos demarcadores',
    categoria: 'Material Deportivo',
    monto: 2450, // Bs
    proveedor: 'Deportes Futsal Bolivia S.R.L.',
    facturaNumero: 'FAC-001289',
    aprobadoPor: 'Carlos Mendoza Rivas',
    comprobante: 'COMP-MAT-01'
  },
  {
    id: 'exp-02',
    fecha: '2026-11-03',
    concepto: 'Planilla arbitral oficial ADFS Fecha 12 Primera C',
    categoria: 'Arbitraje & Jueces',
    monto: 420, // Bs
    proveedor: 'Colegio Departamental de Árbitros de Futsal',
    facturaNumero: 'FAC-004412',
    aprobadoPor: 'Diego Vera',
    comprobante: 'COMP-ARB-02'
  },
  {
    id: 'exp-03',
    fecha: '2026-10-29',
    concepto: 'Juegos de indumentaria de competencia oficial ACADEMIA F.S. (camiseta y short futsal)',
    categoria: 'Indumentaria Oficial',
    monto: 3800, // Bs
    proveedor: 'Confecciones Deportivas Andinas',
    facturaNumero: 'FAC-009941',
    aprobadoPor: 'Carlos Mendoza Rivas',
    comprobante: 'COMP-IND-03'
  },
  {
    id: 'exp-04',
    fecha: '2026-10-25',
    concepto: 'Alquiler mensual de turnos nocturnos Cancha Parquet Coliseo',
    categoria: 'Mantenimiento Canchas',
    monto: 2200, // Bs
    proveedor: 'Administración del Coliseo Polideportivo',
    facturaNumero: 'FAC-000311',
    aprobadoPor: 'Valeria Santillán',
    comprobante: 'COMP-COL-04'
  },
  {
    id: 'exp-05',
    fecha: '2026-10-18',
    concepto: 'Insumos de botiquín: criogel, vendas neuromusculares, gasas y suero',
    categoria: 'Servicio Médico & Kine',
    monto: 650, // Bs
    proveedor: 'Farmacia Deportiva Central',
    facturaNumero: 'FAC-005891',
    aprobadoPor: 'Dr. Fernando Morales',
    comprobante: 'COMP-MED-05'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-11-09 21:10:15',
    usuarioNombre: 'Prof. Diego Vera',
    rol: 'entrenador',
    accion: 'Registro de Asistencia Futsal',
    entidad: 'Asistencia',
    entidadId: 'att-futsal-01',
    detalles: 'Asistencia Sub-20 y jugadores con doble ficha de Sub-18',
    ip: '190.181.42.10',
    nivelRiesgo: 'info'
  },
  {
    id: 'log-02',
    timestamp: '2026-11-06 10:30:00',
    usuarioNombre: 'Carlos Mendoza Rivas',
    rol: 'presidente',
    accion: 'Aprobación de Compra de Balones Penalty',
    entidad: 'Finanzas',
    entidadId: 'exp-01',
    detalles: 'Autorización pago Bs 2,450 para balones oficiales Penalty Futsal Pro',
    ip: '181.115.22.90',
    nivelRiesgo: 'info'
  },
  {
    id: 'log-03',
    timestamp: '2026-11-04 15:45:22',
    usuarioNombre: 'Valeria Santillán',
    rol: 'tesorero',
    accion: 'Cobro de Cuota Social en Bolivianos',
    entidad: 'Socio',
    entidadId: 'soc-01',
    detalles: 'Cobro cuota socio fundador Bs 300 comprobante QR-SOC-042',
    ip: '190.181.42.10',
    nivelRiesgo: 'info'
  },
  {
    id: 'log-04',
    timestamp: '2026-10-31 09:10:00',
    usuarioNombre: 'Dr. Fernando Morales',
    rol: 'medico',
    accion: 'Alerta Médica - Apto Físico Vencido',
    entidad: 'Médico',
    entidadId: 'ply-05',
    detalles: 'Expiración certificado apto médico Ariel Condori (ply-05)',
    ip: '190.181.42.12',
    nivelRiesgo: 'advertencia'
  },
  {
    id: 'log-05',
    timestamp: '2026-10-25 21:40:12',
    usuarioNombre: 'Prof. Diego Vera',
    rol: 'entrenador',
    accion: 'Sanción Disciplinaria Futsal',
    entidad: 'Jugador',
    entidadId: 'ply-08',
    detalles: 'Tarjeta Roja aplicada a Fabricio Pinto (ply-08), 1 partido de suspensión',
    ip: '190.181.42.10',
    nivelRiesgo: 'critico'
  }
];

export const NEON_TECH_POSTGRES_SCHEMA = `-- =====================================================================
-- ACADEMIA F.S. - Database DDL Schema for Neon Tech PostgreSQL
-- Tailored for Futsal (Sub-18, Sub-20, Primera C) with Cross-Category Eligibility
-- Payments recorded in Bolivianos (Bs)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles y Permisos (RBAC)
CREATE TYPE user_role AS ENUM ('presidente', 'entrenador', 'tesorero', 'medico', 'coordinador');
CREATE TYPE fee_status AS ENUM ('al_dia', 'pendiente', 'moroso');
CREATE TYPE disciplinary_status AS ENUM ('habilitado', 'advertencia', 'suspendido');
CREATE TYPE attendance_state AS ENUM ('presente', 'tarde', 'justificado', 'ausente');
CREATE TYPE futsal_position AS ENUM ('Arquero', 'Cierre', 'Ala Izquierda', 'Ala Derecha', 'Pívot', 'Universal');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categorías de Futsal (Sub-18, Sub-20, Primera C)
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY, -- 'sub-18', 'sub-20', 'primera-c'
    name VARCHAR(100) NOT NULL,
    age_range VARCHAR(50) NOT NULL,
    coach_name VARCHAR(100) NOT NULL,
    training_days VARCHAR(150),
    pitch VARCHAR(100)
);

-- 3. Jugadores de Futsal con Doble Ficha / Multi-categoría
CREATE TABLE players (
    id VARCHAR(50) PRIMARY KEY,
    dorsal INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(50) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(100),
    posicion futsal_position NOT NULL,
    posicion_secundaria futsal_position,
    pierna_habil VARCHAR(20) NOT NULL,
    categoria_id VARCHAR(50) REFERENCES categories(id),
    
    -- Multi-categoría: sub-18 o sub-20 habilitados para jugar en Primera C o viceversa
    categorias_secundarias TEXT[], -- Array e.g. ['primera-c']
    doble_ficha_primera_c BOOLEAN DEFAULT false,
    
    -- Cuotas en Bolivianos (Bs)
    cuota_mensual NUMERIC(10, 2) DEFAULT 150.00,
    moneda VARCHAR(10) DEFAULT 'Bs',
    estado_cuota fee_status DEFAULT 'al_dia',
    ultimo_mes_pagado VARCHAR(50),
    
    -- Disciplina Futsal
    tarjetas_amarillas INT DEFAULT 0,
    tarjetas_rojas INT DEFAULT 0,
    partidos_suspension INT DEFAULT 0,
    estado_disciplinario disciplinary_status DEFAULT 'habilitado',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Historial Médico (ISO 27001 - PII Data Protection)
CREATE TABLE player_medical_records (
    player_id VARCHAR(50) PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    grupo_sanguineo VARCHAR(5) NOT NULL,
    apto_medico_vigente BOOLEAN DEFAULT false,
    fecha_vencimiento_apto DATE NOT NULL,
    peso_kg NUMERIC(5,2),
    altura_cm NUMERIC(5,2),
    imc NUMERIC(4,2),
    contacto_emergencia_nombre VARCHAR(150),
    contacto_emergencia_telefono VARCHAR(50),
    observaciones_clinicas TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Estadísticas de Futsal (0-100)
CREATE TABLE player_performance_stats (
    player_id VARCHAR(50) PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    velocidad INT CHECK (velocidad BETWEEN 0 AND 100),
    resistencia INT CHECK (resistencia BETWEEN 0 AND 100),
    fuerza INT CHECK (fuerza BETWEEN 0 AND 100),
    agilidad INT CHECK (agilidad BETWEEN 0 AND 100),
    control_balon INT CHECK (control_balon BETWEEN 0 AND 100),
    precision_pase INT CHECK (precision_pase BETWEEN 0 AND 100),
    potencia_tiro INT CHECK (potencia_tiro BETWEEN 0 AND 100),
    regate INT CHECK (regate BETWEEN 0 AND 100),
    vision_juego INT CHECK (vision_juego BETWEEN 0 AND 100),
    posicionamiento INT CHECK (posicionamiento BETWEEN 0 AND 100),
    toma_decisiones INT CHECK (toma_decisiones BETWEEN 0 AND 100),
    disciplina_tactica INT CHECK (disciplina_tactica BETWEEN 0 AND 100),
    rating_general INT CHECK (rating_general BETWEEN 0 AND 100)
);

-- 6. Padrón de Socios de ACADEMIA F.S.
CREATE TABLE socios (
    id VARCHAR(50) PRIMARY KEY,
    numero_socio VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(50),
    direccion TEXT,
    tipo_socio VARCHAR(50) NOT NULL,
    estado_membresia VARCHAR(50) DEFAULT 'activo',
    cuota_mensual_bs NUMERIC(10, 2) NOT NULL,
    estado_pago fee_status DEFAULT 'al_dia',
    ultimo_mes_pagado VARCHAR(50),
    fecha_ingreso DATE NOT NULL
);

-- 7. Sesiones de Asistencia de Futsal
CREATE TABLE attendances (
    id VARCHAR(50) PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    categoria_id VARCHAR(50) REFERENCES categories(id),
    lugar VARCHAR(150),
    entrenador_nombre VARCHAR(100)
);

CREATE TABLE attendance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id VARCHAR(50) REFERENCES attendances(id) ON DELETE CASCADE,
    jugador_id VARCHAR(50) REFERENCES players(id),
    estado attendance_state NOT NULL,
    minutos_tarde INT DEFAULT 0,
    observacion TEXT
);

-- 8. Convocatorias de Futsal (Quinteto Inicial + Suplentes)
CREATE TABLE match_rosters (
    id VARCHAR(50) PRIMARY KEY,
    rival VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar VARCHAR(150) NOT NULL,
    categoria_id VARCHAR(50) REFERENCES categories(id),
    formacion VARCHAR(50) DEFAULT '1-2-1 (Rombo)',
    estado VARCHAR(20) DEFAULT 'publicada',
    notas_tacticas TEXT,
    creado_por VARCHAR(100)
);

-- 9. Tesorería ACADEMIA F.S. en Bolivianos (Bs)
CREATE TABLE donations (
    id VARCHAR(50) PRIMARY KEY,
    fecha DATE NOT NULL,
    donante_nombre VARCHAR(150) NOT NULL,
    dni_donante VARCHAR(50),
    monto_bs NUMERIC(10, 2) NOT NULL,
    destino_proyecto TEXT NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    comprobante VARCHAR(100) NOT NULL,
    registrado_por VARCHAR(100)
);

CREATE TABLE club_expenses (
    id VARCHAR(50) PRIMARY KEY,
    fecha DATE NOT NULL,
    concepto TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    monto_bs NUMERIC(10, 2) NOT NULL,
    proveedor VARCHAR(150) NOT NULL,
    factura_numero VARCHAR(100) NOT NULL,
    aprobado_por VARCHAR(100) NOT NULL,
    comprobante VARCHAR(100)
);

-- 10. Auditoría de Seguridad ISO 27001
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario_nombre VARCHAR(100) NOT NULL,
    rol user_role NOT NULL,
    accion VARCHAR(150) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(50) NOT NULL,
    detalles TEXT,
    ip_origen VARCHAR(45),
    nivel_riesgo VARCHAR(20) DEFAULT 'info'
);
`;
