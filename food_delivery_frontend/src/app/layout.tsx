"use client";

import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Food Delivery",
  description: "Browse restaurants, order food, and track delivery",
};

function Header({ onOpenAuth, onOpenOrders }: { onOpenAuth: (mode: "login" | "register") => void; onOpenOrders: () => void }) {
  return (
    <header className="sticky top-0 z-40 header-blur">
      <div className="container-page flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[var(--color-primary)]" />
          <Link href="/" className="font-bold text-lg">QuickBite</Link>
          <nav className="hidden md:flex items-center gap-4 ml-6">
            <Link href="/" className="text-sm text-muted hover:text-black">Discover</Link>
            <Link href="/tracking" className="text-sm text-muted hover:text-black">Tracking</Link>
            <Link href="/orders" className="text-sm text-muted hover:text-black">Orders</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost" onClick={() => onOpenAuth("login")}>Sign in</button>
          <button className="btn btn-primary" onClick={() => onOpenAuth("register")}>Create account</button>
          <button className="btn btn-ghost hidden sm:inline-flex" onClick={onOpenOrders}>My Orders</button>
        </div>
      </div>
    </header>
  );
}

import { CartProvider } from "@/lib/cart";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [showOrders, setShowOrders] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CartProvider>
          <Header
            onOpenAuth={(mode) => setAuthMode(mode)}
            onOpenOrders={() => setShowOrders(true)}
          />
          <div id="modal-root" />
          <div id="drawer-root" />
          {children}
          {/* lightweight modal placeholders */}
          {authMode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="card max-w-md w-full p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">{authMode === "login" ? "Sign in" : "Create account"}</h2>
                  <button className="btn btn-ghost" onClick={() => setAuthMode(null)}>Close</button>
                </div>
                <AuthForm mode={authMode} onDone={() => setAuthMode(null)} />
              </div>
            </div>
          )}

          {showOrders && (
            <div className="fixed inset-0 z-40" onClick={() => setShowOrders(false)}>
              <aside className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl border-l border-[var(--color-border)] p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">My Orders</h2>
                  <button className="btn btn-ghost" onClick={() => setShowOrders(false)}>Close</button>
                </div>
                <OrdersPanel />
              </aside>
            </div>
          )}
        </CartProvider>
      </body>
    </html>
  );
}

// Minimal in-file components to keep single entry integration.
// More structured components exist under src/components for actual use.
function AuthForm({ mode, onDone }: { mode: "login" | "register"; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName }),
        }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)));
      }
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", password);
      const token = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)));

      localStorage.setItem("access_token", token.access_token);
      onDone();
    } catch (e: unknown) {
      if (typeof e === "object" && e && "detail" in e) {
        // best-effort extraction
        // @ts-expect-error dynamic detail from API error payload
        setErr(JSON.stringify(e.detail));
      } else if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {mode === "register" && (
        <div>
          <label className="text-sm text-muted">Full name</label>
          <input className="input mt-1" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe"/>
        </div>
      )}
      <div>
        <label className="text-sm text-muted">Email</label>
        <input className="input mt-1" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/>
      </div>
      <div>
        <label className="text-sm text-muted">Password</label>
        <input className="input mt-1" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button disabled={loading} onClick={submit} className="btn btn-primary w-full">{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState<Array<{ id: string; created_at: string; status: string; total_amount: number }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to load orders");
      }
    }
  }

  if (orders === null && !error) {
    load();
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (orders === null) return <p className="text-sm text-muted">Loading orders…</p>;

  return (
    <div className="space-y-3">
      {orders.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} className="card p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Order #{o.id.slice(0,6)}</div>
              <div className="text-sm text-muted">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="badge">{o.status}</div>
              <div className="font-semibold">${o.total_amount?.toFixed?.(2) ?? o.total_amount}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
