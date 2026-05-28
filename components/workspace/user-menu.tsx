"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type UserInfo = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

export function UserMenu() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((body) => {
        if (body.data) setUser(body.data);
      })
      .catch(() => {});
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // Clear all browser storage
    localStorage.clear();
    sessionStorage.clear();
    // Clear non-httpOnly cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "/login";
  }, []);

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-teal-200/60 bg-card px-2.5 py-1.5 text-sm transition-colors hover:border-teal-300 hover:bg-accent/10"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white shadow-sm">
            {initial}
          </span>
          <span className="hidden sm:inline text-foreground">{user.name}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-[0_16px_42px_rgba(15,118,110,0.12)]"
              >
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-white shadow-sm">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                {!user.emailVerified && (
                  <div className="mx-3 my-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-600">
                    邮箱未验证
                  </div>
                )}

                <div className="my-1.5 h-px bg-border" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-3.5" />
                  退出登录
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}