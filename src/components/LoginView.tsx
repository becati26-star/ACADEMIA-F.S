/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole } from '../types';
import { CLUB_INFO } from '../data/mockData';
import { clubStorage } from '../services/clubStorage';
import {
  ShieldCheck,
  Building,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Copy,
  Info,
  X
} from 'lucide-react';

interface LoginViewProps {
  allRoles: UserRole[];
  onLogin: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ allRoles, onLogin }) => {
  // Modal state when a user clicks one of the 3 role cards
  const [activeModalRole, setActiveModalRole] = useState<'entrenador' | 'presidente' | 'administrador' | null>(null);

  // Form input states
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pick the 3 requested roles
  const dtRole = allRoles.find((r) => r.role === 'entrenador') || allRoles[0];
  const presiRole = allRoles.find((r) => r.role === 'presidente') || allRoles[1];
  const adminRole = allRoles.find((r) => r.role === 'administrador') || allRoles[2];

  // Open modal for a specific role to place user & password
  const handleOpenRoleLogin = (roleKey: 'entrenador' | 'presidente' | 'administrador') => {
    setActiveModalRole(roleKey);
    setUsernameInput('');
    setPasswordInput('');
    setErrorMessage(null);
    setHasError(false);
  };

  const handleCloseModal = () => {
    setActiveModalRole(null);
    setErrorMessage(null);
    setHasError(false);
  };

  // Pre-fill helper inside modal
  const handleAutofillForRole = (roleKey: 'entrenador' | 'presidente' | 'administrador') => {
    if (roleKey === 'entrenador') {
      setUsernameInput('Director técnico');
      setPasswordInput('tecnico2026.');
    } else if (roleKey === 'presidente') {
      setUsernameInput('Presidente');
      setPasswordInput('Presidencia2026$');
    } else {
      setUsernameInput('administrador');
      setPasswordInput('admin1399..');
    }
    setErrorMessage(null);
    setHasError(false);
    setCopiedKey(roleKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasError(false);

    // Call authentication service
    const result = clubStorage.authenticate(usernameInput, passwordInput);

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Usuario o contraseña incorrectas');
      setHasError(true);
      return;
    }

    onLogin(result.user);
  };

  const getRoleDisplayName = (roleKey: 'entrenador' | 'presidente' | 'administrador') => {
    if (roleKey === 'entrenador') return 'Director Técnico';
    if (roleKey === 'presidente') return 'Presidente del Club';
    return 'Administrador del Sistema';
  };

  const getRoleOfficialCredentials = (roleKey: 'entrenador' | 'presidente' | 'administrador') => {
    if (roleKey === 'entrenador') {
      return { user: 'Director técnico', pass: 'tecnico2026.' };
    }
    if (roleKey === 'presidente') {
      return { user: 'Presidente', pass: 'Presidencia2026$' };
    }
    return { user: 'administrador', pass: 'admin1399..' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Futsal Court Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10 space-y-6">
        {/* Brand & Crest Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-1">
            <img
              src={CLUB_INFO.crestUrl}
              alt="Escudo Oficial ACADEMIA F.S."
              className="w-16 h-16 rounded-full border-2 border-amber-500 object-cover shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {CLUB_INFO.nombre}
          </h1>
          <p className="text-sm font-semibold text-amber-400">
            Fútbol de Salón Bolivia · Sistema de Control y Gestión Deportiva
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Haga clic en cualquiera de los tres perfiles oficiales para <strong>colocar su usuario y contraseña</strong>.
          </p>
        </div>

        {/* 3 Interactive Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Director Técnico (DT) Card */}
          <div
            onClick={() => handleOpenRoleLogin('entrenador')}
            className="p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between bg-slate-900/60 border-slate-800 hover:border-amber-500/70 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-amber-500/10 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cuerpo Técnico
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Director Técnico
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{dtRole.name}</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Usuario:</span>
                  <strong className="text-white font-mono">Director técnico</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Contraseña:</span>
                  <strong className="text-amber-400 font-mono">tecnico2026.</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Acceso exclusivo:
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-amber-300">
                    Tablero
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-amber-300">
                    Jugadores
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-amber-300">
                    Mensualidades
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-amber-300">
                    Asistencias
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-amber-300">
                    Convocatorias
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:shadow-amber-500/20"
              >
                Colocar Usuario y Clave DT
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Presidente del Club Card */}
          <div
            onClick={() => handleOpenRoleLogin('presidente')}
            className="p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between bg-slate-900/60 border-slate-800 hover:border-emerald-500/70 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-500/10 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Building className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Junta Directiva
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Presidente
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{presiRole.name}</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Usuario:</span>
                  <strong className="text-white font-mono">Presidente</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Contraseña:</span>
                  <strong className="text-emerald-400 font-mono">Presidencia2026$</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Acceso exclusivo:
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-emerald-300">
                    Jugadores
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-emerald-300">
                    Mensualidades
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-emerald-300">
                    Socios
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-emerald-300">
                    Tesorería (Bs)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-emerald-300">
                    Reportes
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:shadow-emerald-500/20"
              >
                Colocar Usuario y Clave Presi
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Administrador General Card */}
          <div
            onClick={() => handleOpenRoleLogin('administrador')}
            className="p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between bg-slate-900/60 border-slate-800 hover:border-sky-500/70 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-sky-500/10 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Control Total
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                  Administrador
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{adminRole.name}</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Usuario:</span>
                  <strong className="text-white font-mono">administrador</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Contraseña:</span>
                  <strong className="text-sky-400 font-mono">admin1399..</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Acceso exclusivo:
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-sky-300">
                    Todos los módulos (8)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:shadow-sky-500/20"
              >
                Colocar Usuario y Clave Admin
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Alternative direct login box below */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-300 font-semibold text-xs">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Selección rápida: haga clic en cualquiera de las 3 tarjetas superiores para abrir la ventana de usuario y contraseña.</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Cada perfil validará que el usuario y la contraseña ingresados coincidan exactamente con la base de datos institucional.
          </p>
        </div>

        {/* Footer info strip */}
        <div className="text-center text-[11px] text-slate-500">
          ACADEMIA F.S. · Temporada 2026 · Asociación Departamental de Fútbol de Salón · La Paz, Bolivia
        </div>
      </div>

      {/* MODAL PRINCIPAL: COLOCAR USUARIO Y CONTRASEÑA */}
      {activeModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-md shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-xl border ${
                  activeModalRole === 'entrenador'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : activeModalRole === 'presidente'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                }`}>
                  {activeModalRole === 'entrenador' ? (
                    <ClipboardList className="w-5 h-5" />
                  ) : activeModalRole === 'presidente' ? (
                    <Building className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Ingresar como {getRoleDisplayName(activeModalRole)}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Coloque su nombre de usuario y su contraseña
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* HIGH VISIBILITY RED ALERT ON INCORRECT CREDENTIALS AS REQUESTED */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-rose-950/90 border-2 border-rose-600 text-rose-100 text-xs shadow-xl flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-sm text-white">
                      ⚠️ Usuario o contraseña incorrectas
                    </p>
                    <p className="text-rose-200 text-xs">
                      El nombre de usuario o la contraseña ingresada no son correctos. Verifique sus credenciales e intente nuevamente.
                    </p>
                  </div>
                </div>
              )}

              {/* Reference credentials helper box inside modal */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Credencial oficial requerida:
                  </span>
                  <div className="text-xs">
                    Usuario: <strong className="text-white font-mono">{getRoleOfficialCredentials(activeModalRole).user}</strong>
                  </div>
                  <div className="text-xs">
                    Clave: <strong className="text-amber-400 font-mono">{getRoleOfficialCredentials(activeModalRole).pass}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAutofillForRole(activeModalRole)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3 text-amber-400" />
                  {copiedKey === activeModalRole ? '¡Pegado!' : 'Pegar'}
                </button>
              </div>

              {/* Form to enter username and password */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre de Usuario:
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 absolute left-3 top-3 transition-colors ${
                      hasError ? 'text-rose-400' : 'text-slate-400'
                    }`} />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value);
                        if (hasError) {
                          setErrorMessage(null);
                          setHasError(false);
                        }
                      }}
                      placeholder={`Ej: ${getRoleOfficialCredentials(activeModalRole).user}`}
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-950 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                        hasError
                          ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                          : 'border border-slate-800 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña:
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3 top-3 transition-colors ${
                      hasError ? 'text-rose-400' : 'text-slate-400'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        if (hasError) {
                          setErrorMessage(null);
                          setHasError(false);
                        }
                      }}
                      placeholder="Ingrese su contraseña"
                      className={`w-full pl-9 pr-10 py-2.5 bg-slate-950 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono transition-all ${
                        hasError
                          ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                          : 'border border-slate-800 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Iniciar Sesión
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
