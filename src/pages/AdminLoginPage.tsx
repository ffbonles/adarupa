import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Mail,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { api } from '../services/apiClient';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBackToHome }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [mailboxItems, setMailboxItems] = useState<any[]>([]);

  useEffect(() => {
    setMailboxItems(api.getTestMailbox());
  }, [step]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleRequestOtp = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Masukkan format alamat surel yang valid.');
      return;
    }

    setEmail(normalizedEmail);
    setIsLoading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const res: any = await api.requestAdminOtp(normalizedEmail);
      const responseData = res?.data?.data ?? res?.data ?? {};
      const responseMessage =
        responseData?.message ||
        res?.message ||
        'Jika alamat surel terdaftar, kode OTP telah dikirim. Periksa kotak masuk dan folder spam.';

      // API dapat mengembalikan success=true tanpa objek data. Selama backend
      // mengonfirmasi sukses, jangan menahan pengguna di formulir email.
      if (res?.success === true) {
        setStep('otp');
        setOtp('');
        setMessage(responseMessage);
        setCooldown(60);
        setSimulatedOtp(
          typeof responseData?.simulated_otp === 'string'
            ? responseData.simulated_otp
            : null
        );
        setMailboxItems(api.getTestMailbox());
        return;
      }

      const backendMessage = String(
        res?.error?.message || responseData?.message || res?.message || ''
      );
      const normalizedMessage = backendMessage.toLowerCase();

      // Jika pengguna mengirim permintaan ulang saat cooldown aktif, OTP dari
      // permintaan sebelumnya mungkin sudah terkirim. Tetap tampilkan form OTP.
      const isCooldownResponse =
        /cooldown|rate.?limit|tunggu|detik sebelum|too many requests|coba lagi dalam/.test(
          normalizedMessage
        );

      if (isCooldownResponse) {
        setStep('otp');
        setOtp('');
        setMessage(
          'Kode OTP mungkin sudah dikirim dari permintaan sebelumnya. Periksa email dan masukkan kode yang masih berlaku.'
        );
        const secondsMatch = backendMessage.match(/(\\d+)\\s*(?:detik|seconds|s)\\b/i);
        setCooldown(secondsMatch ? Math.max(1, Number(secondsMatch[1])) : 60);
        setSimulatedOtp(null);
        setMailboxItems(api.getTestMailbox());
      } else {
        setErrorMessage(
          backendMessage || 'Permintaan kode OTP gagal. Periksa email administrator dan konfigurasi GAS.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Koneksi ke backend gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMessage('Kode OTP harus terdiri dari 6 digit angka.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const res = await api.verifyAdminOtp(email, otp);
      if (res.success && res.data) {
        setMessage('Verifikasi berhasil! Mengalihkan ke dasbor...');
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        setErrorMessage(res.error?.message || 'Kode OTP tidak cocok.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verifikasi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs text-[#6D675F] hover:text-[#800020] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda Publik</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5DED2] shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-2">
              <BrandLogo size="md" showDescriptor={false} />
            </div>
            <h1 className="font-serif font-bold text-xl text-[#292522]">
              Portal Masuk Administrator
            </h1>
            <p className="text-xs text-[#6D675F] max-w-xs mx-auto">
              Akses kurasi konten dan metadata kebudayaan dilindungi oleh autentikasi sandi sekali pakai (OTP).
            </p>
          </div>

          {/* Feedback Alerts */}
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292522] block">
                  Alamat Surel Administrator
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E867B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@adarupa.id"
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8F3E9] border border-[#E5DED2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                </div>
                <p className="text-[11px] text-[#8E867B]">
                  Hanya surel yang terdaftar pada tabel ADMINS yang dapat menerima kode OTP.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#800020] hover:bg-[#590018] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Kirim Kode OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#292522]">
                    Kode OTP 6-Digit
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-[11px] text-[#800020] hover:underline"
                  >
                    Ubah Surel
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8E867B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-9 pr-4 py-2.5 text-center tracking-[0.3em] font-mono text-base font-bold bg-[#F8F3E9] border border-[#E5DED2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6D675F] pt-1">
                  <span>Masa berlaku: 10 menit</span>
                  {cooldown > 0 ? (
                    <span className="font-mono text-[#8E867B]">Kirim ulang ({cooldown}s)</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-[#800020] font-semibold hover:underline"
                    >
                      Kirim Ulang OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-2.5 px-4 rounded-xl bg-[#800020] hover:bg-[#590018] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Verifikasi & Masuk</span>
                )}
              </button>
            </form>
          )}

          {/* Dev/Preview Mode Quick OTP Helper */}
          {simulatedOtp && (
            <div className="p-3 bg-[#F1ECE0] rounded-xl border border-[#D4A373]/50 text-xs space-y-1">
              <div className="flex items-center justify-between text-[#800020] font-semibold">
                <span className="flex items-center gap-1">
                  <Inbox className="w-3.5 h-3.5" /> Pratinjau Pengiriman Surel:
                </span>
                <button
                  onClick={() => setOtp(simulatedOtp)}
                  className="text-[11px] underline hover:text-[#590018]"
                >
                  Gunakan Kode Ini
                </button>
              </div>
              <p className="text-[11px] text-[#6D675F]">
                Kode OTP yang dikirim ke <strong className="text-[#292522]">{email}</strong>:
              </p>
              <div className="p-2 bg-white rounded border border-[#E5DED2] font-mono font-bold text-center text-sm text-[#800020] tracking-widest">
                {simulatedOtp}
              </div>
            </div>
          )}
        </div>

        {/* Security Policy Notice */}
        <div className="text-center text-[11px] text-[#8E867B] space-y-1">
          <p>Sesi login berlaku selama 8 jam setelah verifikasi berhasil.</p>
          <p>Seluruh aktivitas kurator dicatat pada tabel AUDIT_LOG.</p>
        </div>
      </div>
    </div>
  );
};