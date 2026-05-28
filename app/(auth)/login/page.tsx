"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, GitBranch } from "lucide-react";
import { toast } from "sonner";

const riseIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
} as const;

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay: 0.15 }
} as const;

export default function LoginPage() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error?.message ?? "登录失败");
        return;
      }

      toast.success(`欢迎回来，${body.data.name}`);
      window.location.href = "/";
      
    } catch {
      toast.error("网络错误，请稍后重试。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_26%)]">
      <motion.div
        {...riseIn}
        className="relative w-full max-w-sm"
      >
        {/* Logo mark */}
        <motion.div
          {...fadeIn}
          className="mb-10 flex flex-col items-center gap-4"
        >
          <div className="flex size-14 items-center justify-center rounded-lg border border-emerald-300/60 bg-[linear-gradient(135deg,#10b981,#0ea5e9)] text-white shadow-sm">
            <GitBranch className="size-6" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              AI 工作项看板
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              登录以继续
            </p>
          </div>
        </motion.div>

        {/* Login card */}
        <motion.form
          onSubmit={handleSubmit}
          {...fadeIn}
          className="rounded-xl border border-teal-200/60 bg-card/95 p-6 shadow-[0_8px_32px_rgba(15,118,110,0.06)]"
        >
          <div className="grid gap-5">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                邮箱
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-border bg-background/60 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                密码
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="您的密码"
                  className="h-11 w-full rounded-lg border border-border bg-background/60 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#10b981,#0ea5e9)] text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-105 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  登录
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            还没有账号？{" "}
            <Link
              href="/register"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              立即注册
            </Link>
          </p>
        </motion.form>

        <p className="mt-8 text-center text-[11px] text-muted-foreground/50">
          FDE Assessment · AI-Powered Work Item Kanban
        </p>
      </motion.div>
    </div>
  );
}
