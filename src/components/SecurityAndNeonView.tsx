/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLog, UserRole } from '../types';
import { clubStorage } from '../services/clubStorage';
import {
  ShieldCheck,
  Database,
  Lock,
  FileCode,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Cpu
} from 'lucide-react';

interface SecurityAndNeonViewProps {
  auditLogs: AuditLog[];
  activeRole: UserRole;
  allRoles: UserRole[];
}

export const SecurityAndNeonView: React.FC<SecurityAndNeonViewProps> = ({
  auditLogs,
  activeRole,
  allRoles
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'neon' | 'standards'>('audit');
  const [copied, setCopied] = useState(false);

  const neonSchema = clubStorage.getNeonPostgresSchema();

  const handleCopySchema = () => {
    navigator.clipboard.writeText(neonSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([neonSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neon_clubpro360_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Seguridad &amp; Base de Datos · ACADEMIA F.S.
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">ISO 27001 · OWASP · Futsal Bolivia · Neon Tech</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Auditoría de Seguridad &amp; Integración Neon Tech (PostgreSQL)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySchema}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar DDL SQL'}
          </button>
          <button
            onClick={handleDownloadSQL}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar neon_schema.sql
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Pista de Auditoría ISO 27001 ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('neon')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'neon'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Esquema Neon Tech Postgres &amp; Vercel
        </button>
        <button
          onClick={() => setActiveTab('standards')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'standards'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Arquitectura SOLID, OWASP &amp; ISO 42010
        </button>
      </div>

      {/* 1. AUDIT TRAIL ISO 27001 */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Cumplimiento con control A.12.4 de ISO 27001: Registro inmutable de eventos, modificaciones médicas, cobros de cuotas y aprobaciones financieras.
            </span>
            <span className="text-emerald-400 font-mono font-semibold">
              Trazabilidad 100% activa
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fecha &amp; Hora</th>
                    <th className="py-3 px-4">Usuario Operador</th>
                    <th className="py-3 px-4">Rol / Nivel</th>
                    <th className="py-3 px-4">Acción Auditada</th>
                    <th className="py-3 px-4">Entidad Afectada</th>
                    <th className="py-3 px-4">Detalles del Evento</th>
                    <th className="py-3 px-4 text-center">Nivel de Riesgo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-white">
                        {log.usuarioNombre}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-amber-400 uppercase font-mono">
                          {log.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-200">
                        {log.accion}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        {log.entidad}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-sm text-[11px]">
                        {log.detalles}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          log.nivelRiesgo === 'critico'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : log.nivelRiesgo === 'advertencia'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {log.nivelRiesgo}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. NEON TECH POSTGRESQL & VERCEL */}
      {activeTab === 'neon' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Arquitectura de Datos Serverless en Neon Tech (PostgreSQL)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esquema relacional normalizado (3NF) listo para conectar con Vercel Functions y Prisma / Drizzle ORM.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
                  @neondatabase/serverless ready
                </span>
              </div>
            </div>

            {/* Quick config instructions for Vercel */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Server className="w-4 h-4 text-amber-400" />
                Guía de Conexión en Vercel Dashboard
              </span>
              <p className="text-slate-400">
                1. Cree un proyecto en <code className="text-amber-400">console.neon.tech</code> y copie su Connection String.
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                DATABASE_URL="postgresql://user:secret@ep-proud-flower-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"
              </div>
              <p className="text-slate-400">
                2. Ejecute el siguiente script DDL en la consola SQL de Neon para aprovisionar las 10 tablas del club:
              </p>
            </div>

            {/* DDL SQL Code Viewer */}
            <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-xs text-slate-400">
                <span className="font-mono">neon_clubpro360_schema.sql</span>
                <button
                  onClick={handleCopySchema}
                  className="text-amber-400 hover:text-amber-300 font-mono"
                >
                  {copied ? 'Copiado en Portapapeles' : 'Copiar Código'}
                </button>
              </div>
              <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                {neonSchema}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARDS: SOLID, OWASP, ISO 42010, CX/UX */}
      {activeTab === 'standards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* SOLID */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Principios SOLID en la Arquitectura
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Single Responsibility (SRP):</strong> Servicios desacoplados: <code className="text-amber-400">ConvocatoriaEngine</code> solo calcula convocatorias y elegibilidad; <code className="text-amber-400">ClubStorageService</code> gestiona persistencia y auditoría.
              </li>
              <li>
                <strong className="text-white">Open/Closed (OCP):</strong> El motor de convocatorias permite inyectar nuevas ponderaciones y esquemas tácticos sin modificar su lógica base.
              </li>
              <li>
                <strong className="text-white">Liskov Substitution (LSP):</strong> Modelos tipados con contratos polimórficos de roles y eventos auditables.
              </li>
              <li>
                <strong className="text-white">Interface Segregation (ISP):</strong> Interfaces segregadas en <code className="text-amber-400">MedicalHistory</code>, <code className="text-amber-400">PlayerStats</code>, y <code className="text-amber-400">PaymentRecord</code>.
              </li>
            </ul>
          </div>

          {/* OWASP & ISO 27001 */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              OWASP Top 10 &amp; Seguridad ISO 27001
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Control de Acceso Basado en Roles (RBAC):</strong> Separación de privilegios entre Presidente (aprobaciones), Entrenador (asistencia y alineación), Tesorero (cobros) y Médico (certificaciones).
              </li>
              <li>
                <strong className="text-white">Protección de Datos Médicos (PII):</strong> Historial médico y certificados protegidos con trazabilidad de accesos.
              </li>
              <li>
                <strong className="text-white">Saneamiento contra Injection:</strong> Preparado con consultas parametrizadas para Postgres/Neon.
              </li>
              <li>
                <strong className="text-white">Trazabilidad Integral:</strong> Registro con timestamp, IP y severidad ante cada mutación del sistema.
              </li>
            </ul>
          </div>

          {/* ISO 42010 Quality */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Calidad de Software ISO/IEC/IEEE 42010
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Vistas de Arquitectura:</strong> Vista lógica (dominio deportivo), vista de procesos (toma de asistencia &amp; convocatoria), y vista de datos (Neon DDL).
              </li>
              <li>
                <strong className="text-white">Stakeholders atendidos:</strong> Junta Directiva, Entrenador Principal, Preparador Físico, Socios y Tesorería.
              </li>
            </ul>
          </div>

          {/* CX, UX & UI */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Principios CX, UX &amp; UI Deportivos
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Cero Fricción en Cancha:</strong> El entrenador toma la asistencia del equipo completo en menos de 20 segundos con feedback visual inmediato.
              </li>
              <li>
                <strong className="text-white">Transparencia para Socios:</strong> Recibos y estados de cuenta claros con desglose de donaciones y proyectos.
              </li>
              <li>
                <strong className="text-white">Tabular Discipline:</strong> Todas las métricas y cifras financieras usan números tabulares (<code className="text-amber-400">tabular-nums</code>).
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
