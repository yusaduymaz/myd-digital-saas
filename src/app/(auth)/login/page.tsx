"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const redirectTo = "/dashboard";
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(redirectTo);
  };

  return (
    <div className="bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen overflow-hidden flex flex-col items-center justify-center relative">
      {/* Background grid & glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,215,0,0.03) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,215,0,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-container/10 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-container flex items-center justify-center rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.2)]">
              <span className="material-symbols-outlined text-on-primary-container font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                dataset
              </span>
            </div>
            <h1 className="font-headline font-extrabold text-2xl tracking-tighter text-primary-container">
              MYD Digital
            </h1>
          </div>
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-outline opacity-80">
            Kinetic Architect Framework
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-10 rounded-xl shadow-[0_40px_60px_rgba(0,0,0,0.3)] border border-outline-variant/10 bg-surface-container/70 backdrop-blur-2xl">
          <div className="mb-8">
            <h2 className="font-headline text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-sm text-outline">Access your growth laboratory.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="font-label text-[11px] uppercase tracking-widest text-outline ml-1">
                Identity Protocol (Email)
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary-container transition-colors text-[20px]">
                  alternate_email
                </span>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@myddigital.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none pl-11 pr-4 py-3.5 text-sm text-white focus:ring-1 focus:ring-primary-container/30 rounded-md transition-all placeholder:text-surface-variant"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end px-1">
                <label className="font-label text-[11px] uppercase tracking-widest text-outline">
                  Access Cipher
                </label>
                <span className="text-[11px] font-label text-primary-container">
                  Forgot?
                </span>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary-container transition-colors text-[20px]">
                  lock_open
                </span>
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none pl-11 pr-4 py-3.5 text-sm text-white focus:ring-1 focus:ring-primary-container/30 rounded-md transition-all placeholder:text-surface-variant"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 px-1">{error}</p>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-primary-container hover:bg-primary-fixed py-4 rounded-md text-on-primary-container font-headline font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_10px_25px_rgba(255,215,0,0.15)]"
            >
              Authenticate Securely
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Button>

            <p className="text-xs text-outline text-center pt-2">
              New to MYD Digital?{" "}
              <Link
                href="/signup"
                className="text-primary-container hover:text-primary-fixed font-medium"
              >
                Create access
              </Link>
            </p>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-xs text-outline leading-relaxed">
              Protected by end-to-end encryption.
              <br />
              Unauthorized access attempts are logged.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
