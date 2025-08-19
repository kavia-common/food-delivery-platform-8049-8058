"use client";

import { useEffect, useState } from "react";
import { getDeliveryStatus, trackingWebSocketUrl, type DeliveryStatus } from "@/lib/api";

export default function TrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<DeliveryStatus | null>(null);
  const [log, setLog] = useState<string[]>([]);

  async function loadStatus() {
    if (!orderId) return;
    try {
      const s = await getDeliveryStatus(orderId);
      setStatus(s);
    } catch {
      setStatus(null);
      addLog("Failed to fetch status");
    }
  }

  function addLog(line: string) {
    setLog((prev) => [line, ...prev].slice(0, 50));
  }

  useEffect(() => {
    if (!orderId) return;
    // Attempt websocket connection for live updates
    try {
      const ws = new WebSocket(trackingWebSocketUrl(orderId));
      ws.onopen = () => addLog("WebSocket connected");
      ws.onmessage = (evt) => {
        addLog(`WS: ${evt.data}`);
        try {
          const parsed = JSON.parse(evt.data);
          setStatus(parsed);
        } catch {
          // ignore non-JSON
        }
      };
      ws.onerror = () => addLog("WebSocket error");
      ws.onclose = () => addLog("WebSocket closed");
      return () => ws.close();
    } catch {
      addLog("WebSocket not available");
    }
  }, [orderId]);

  return (
    <main className="container-page py-6 space-y-4">
      <h1 className="text-2xl font-bold">Delivery tracking</h1>
      <div className="card p-3">
        <label className="text-sm text-muted">Order ID</label>
        <div className="flex gap-2 mt-1">
          <input className="input flex-1" placeholder="Enter order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          <button className="btn btn-primary" onClick={loadStatus}>Fetch</button>
        </div>
        {status && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card p-3">
              <div className="text-sm text-muted">Status</div>
              <div className="font-semibold">{status.status}</div>
            </div>
            <div className="card p-3">
              <div className="text-sm text-muted">ETA (min)</div>
              <div className="font-semibold">{status.eta_minutes ?? "—"}</div>
            </div>
            <div className="card p-3">
              <div className="text-sm text-muted">Courier location</div>
              <div className="font-semibold">
                {status.courier_location ? `${status.courier_location.lat}, ${status.courier_location.lng}` : "—"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Live updates</h2>
          <div className="text-sm text-muted">WS URL: <code>{orderId ? trackingWebSocketUrl(orderId) : "—"}</code></div>
        </div>
        <div className="mt-2 space-y-1 text-sm max-h-56 overflow-auto">
          {log.map((l, idx) => <div key={idx} className="text-muted">{l}</div>)}
        </div>
      </div>
    </main>
  );
}
