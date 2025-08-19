"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { createPaymentIntent, placeOrder } from "@/lib/api";

export default function CartSidebar() {
  const cart = useCart();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ id: string; status: string } | null>(null);
  const hasItems = cart.items.length > 0;

  async function onPlaceOrder() {
    if (!cart.restaurant_id || !hasItems || !address) return;
    setPlacing(true);
    try {
      const order = await placeOrder({
        restaurant_id: cart.restaurant_id,
        items: cart.items.map(i => ({ menu_item_id: i.menu_item.id, quantity: i.quantity })),
        delivery_address: address,
        notes: notes || undefined,
      });
      const payment = await createPaymentIntent({ order_id: order.id, method: "card_demo" });
      setPaymentInfo({ id: payment.id, status: payment.status });
      cart.clear();
    } catch (e) {
      console.error(e);
      alert("Failed to place order or create payment");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <aside className="card p-3 sticky top-24">
      <h3 className="font-semibold mb-2">Your cart</h3>
      <div className="space-y-2">
        {cart.items.length === 0 && <p className="text-sm text-muted">No items yet.</p>}
        {cart.items.map((i) => (
          <div key={i.menu_item.id} className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium">{i.menu_item.name}</div>
              <div className="text-sm text-muted">${i.menu_item.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost" onClick={() => cart.setQty(i.menu_item.id, i.quantity - 1)}>-</button>
              <span>{i.quantity}</span>
              <button className="btn btn-ghost" onClick={() => cart.setQty(i.menu_item.id, i.quantity + 1)}>+</button>
              <button className="btn btn-ghost" onClick={() => cart.remove(i.menu_item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Subtotal</span>
          <span className="font-semibold">${cart.total.toFixed(2)}</span>
        </div>
        <div>
          <label className="text-sm text-muted">Delivery address</label>
          <textarea className="textarea mt-1" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City" />
        </div>
        <div>
          <label className="text-sm text-muted">Notes (optional)</label>
          <input className="input mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Leave at the door…" />
        </div>
        <button disabled={!hasItems || !address || placing} onClick={onPlaceOrder} className="btn btn-primary w-full">
          {placing ? "Placing…" : "Place order"}
        </button>
        {paymentInfo && (
          <div className="card p-2">
            <div className="text-sm">Payment #{paymentInfo.id}</div>
            <div className="text-sm">Status: <span className="badge">{paymentInfo.status}</span></div>
          </div>
        )}
      </div>
    </aside>
  );
}
