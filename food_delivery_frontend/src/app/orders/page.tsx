"use client";

import { useEffect, useState } from "react";
import { listOrders, type Order } from "@/lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrders(await listOrders());
      } catch {
        setError("Failed to load orders. Sign in first.");
      }
    })();
  }, []);

  return (
    <main className="container-page py-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {error && <p className="text-red-600">{error}</p>}
      {!orders && !error && <p className="text-muted">Loading…</p>}
      {orders && orders.length === 0 && <p className="text-muted">No orders yet.</p>}
      <div className="grid-auto-fit">
        {orders?.map((o) => (
          <div key={o.id} className="card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Order #{o.id.slice(0, 6)}</div>
                <div className="text-sm text-muted">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="badge">{o.status}</div>
                <div className="font-semibold">${o.total_amount?.toFixed?.(2) ?? o.total_amount}</div>
              </div>
            </div>
            <div className="text-sm text-muted">Deliver to: {o.delivery_address}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
