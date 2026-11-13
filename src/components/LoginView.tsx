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
  ClipboardList,
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

  // Pick the 3 requested roles
  const dtRole = allRoles.find((r) => r.role === 'entrenador') || allRoles[0];
  const presiRole = allRoles.find((r) => r.role === 'presidente') || allRoles[1];
  const adminRole = allRoles.find((r) => r.role === 'administrador') || allRoles[2];

  // Open modal for a specific role to place user & password
  const handleOpenRoleLogin = (roleKey: 'entrenador' | 'presidente' | 'administrador') => {
    setActiveModalRole(roleKey);
    setUsernameInput('');
    setPasswordInput('');
    setShowPassword(false);
    setErrorMessage(null);
    setHasError(false);
  };

  const handleCloseModal = () => {
    setActiveModalRole(null);
    setShowPassword(false);
    setErrorMessage(null);
    setHasError(false);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Championship Gold Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10 space-y-6">
        {/* Brand & Official Crest Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#050507] border-2 border-amber-500/60 shadow-[0_0_40px_rgba(212,175,55,0.2)] mb-1">
            <img
              src={CLUB_INFO.crestUrl}
              alt="Escudo Oficial ACADEMIA F.S."
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {CLUB_INFO.nombre}
          </h1>
          <p className="text-sm font-semibold text-amber-400 tracking-wide">
            Fútbol de Salón Bolivia · Sistema de Control y Gestión Deportiva
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Haga clic en cualquiera de los tres perfiles oficiales para <strong className="text-slate-200">colocar su usuario y contraseña</strong>.
          </p>
        </div>

        {/* 3 Interactive Role Selection Cards (Obsidian, Gold & Crisp White Palette) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Director Técnico (DT) Card */}
          <div
            onClick={() => handleOpenRoleLogin('entrenador')}
            className="p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between bg-slate-900/90 border-slate-700 hover:border-amber-500 hover:bg-slate-900 hover:shadow-xl hover:shadow-amber-500/10 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Cuerpo Técnico
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Director Técnico
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{dtRole.name}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Acceso exclusivo:
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-amber-300">
                    Tablero
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-amber-300">
                    Jugadores
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-amber-300">
                    Mensualidades
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-amber-300">
                    Asistencias
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-amber-300">
                    Convocatorias
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:shadow-amber-500/20"
              >
                Colocar Usuario y Clave DT
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Presidente del Club Card */}
          <div
            onClick={() => handleOpenRoleLogin('presidente')}
            className="p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between bg-slate-900/90 border-slate-700 hover:border-amber-300 hover:bg-slate-900 hover:shadow-xl hover:shadow-amber-500/10 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-white/10 border border-amber-400/40 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <Building className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-amber-400/40">
                  Junta Directiva
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  Presidente
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{presiRole.name}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Acceso exclusivo:
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-100">
                    Tablero (Alertas)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-100">
                    Jugadores
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-100">
                    Mensualidades
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-100">
                    Socios
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-100">
                    Tesorería (Bs)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-100">
                    Reportes
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-white hover:bg-amber-100 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                Colocar Usuario y Clave Presi
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Administrador General Card */}
          <div
            onClick={() => handleOpenRoleLogin('administrador')}
            className="p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between bg-slate-900/90 border-slate-700 hover:border-amber-500 hover:bg-slate-900 hover:shadow-xl hover:shadow-amber-500/10 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 border border-amber-300">
                  Control Total
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Administrador
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{adminRole.name}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Acceso exclusivo:
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-amber-500/30 text-[10px] text-amber-300 font-semibold">
                    Todos los módulos (8)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-slate-950 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/60 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                Colocar Usuario y Clave Admin
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Alternative direct login box below */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 shadow-xl text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-200 font-semibold text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(212,175,55,0.18)] text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#050507] border border-amber-500/50 p-0.5 flex items-center justify-center shrink-0">
                  <img
                    src={CLUB_INFO.crestUrl}
                    alt="Escudo ACADEMIA F.S."
                    className="w-full h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Ingresar como {getRoleDisplayName(activeModalRole)}
                  </h3>
                  <p className="text-[11px] text-amber-400/90">
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
                      placeholder="Ingrese su nombre de usuario"
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
