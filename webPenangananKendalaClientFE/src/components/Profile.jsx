import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Save,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Profile Info Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Change Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Auto-dismiss profile form alerts after 4 seconds
  useEffect(() => {
    if (profileSuccess || profileError) {
      const timer = setTimeout(() => {
        setProfileSuccess('');
        setProfileError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess, profileError]);

  // Auto-dismiss password form alerts after 4 seconds
  useEffect(() => {
    if (passwordSuccess || passwordError) {
      const timer = setTimeout(() => {
        setPasswordSuccess('');
        setPasswordError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess, passwordError]);

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'service_desk':    return 'Service Desk';
      case 'project_manager': return 'Project Manager';
      case 'programmer':      return 'Programmer';
      case 'owner':           return 'Company Owner';
      case 'client':          return 'Client / Reporter';
      default:                return role;
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'service_desk':    return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'project_manager': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'programmer':      return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'owner':           return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'client':          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:                return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Handle Submit Profile Info (Name & Email)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileCurrentPassword.trim()) {
      setProfileError('Masukkan password saat ini untuk mengonfirmasi perubahan profil.');
      return;
    }

    setProfileSubmitting(true);
    try {
      const response = await axios.put('/profile', {
        name,
        email,
        current_password: profileCurrentPassword,
      });

      updateUser(response.data.user);
      setProfileSuccess(response.data.message || 'Profil berhasil diperbarui.');
      setProfileCurrentPassword('');
    } catch (err) {
      const msg = err.response?.data?.message;
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setProfileError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setProfileError(msg || 'Gagal memperbarui profil. Silakan coba lagi.');
      }
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Handle Submit Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal harus 8 karakter.');
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const response = await axios.put('/profile/password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      setPasswordSuccess(response.data.message || 'Password berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err) {
      const msg = err.response?.data?.message;
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setPasswordError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setPasswordError(msg || 'Gagal mengubah password. Silakan coba lagi.');
      }
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-4xl mx-auto">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1.5 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Profil & Keamanan</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola informasi data diri, alamat email, dan kata sandi akun Anda.
          </p>
        </div>
      </div>

      {/* User Header Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-extrabold text-xl font-display shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getRoleBadgeStyle(user?.role)}`}>
                {getRoleDisplay(user?.role)}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Sesi Terautentikasi (Sanctum)</span>
        </div>
      </div>

      {/* Grid Forms Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Informasi Profil & Email */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Informasi Profil & Email</h3>
          </div>

          {/* Feedback messages */}
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{profileError}</span>
            </div>
          )}
          {profileSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-profile-name" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="input-profile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-profile-email" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <input
                id="input-profile-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
              <label htmlFor="input-profile-current-password" className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Password Saat Ini <span className="text-red-500">*</span>
              </label>
              <input
                id="input-profile-current-password"
                type="password"
                required
                placeholder="Masukkan password saat ini untuk konfirmasi"
                value={profileCurrentPassword}
                onChange={(e) => setProfileCurrentPassword(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Diperlukan konfirmasi password untuk menyimpan perubahan nama/email.
              </p>
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              disabled={profileSubmitting}
              className="mt-2 w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{profileSubmitting ? 'Memproses...' : 'Simpan Perubahan Profil'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Keamanan & Ubah Password */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Ubah Kata Sandi (Password)</h3>
          </div>

          {/* Feedback messages */}
          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-current-password" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Password Saat Ini <span className="text-red-500">*</span>
              </label>
              <input
                id="input-current-password"
                type="password"
                required
                placeholder="Masukkan password saat ini"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-new-password" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Password Baru <span className="text-red-500">*</span>
              </label>
              <input
                id="input-new-password"
                type="password"
                required
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-new-password-confirmation" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Konfirmasi Password Baru <span className="text-red-500">*</span>
              </label>
              <input
                id="input-new-password-confirmation"
                type="password"
                required
                placeholder="Ketik ulang password baru"
                value={newPasswordConfirmation}
                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              id="btn-update-password"
              type="submit"
              disabled={passwordSubmitting}
              className="mt-2 w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{passwordSubmitting ? 'Memproses...' : 'Ubah Password'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
