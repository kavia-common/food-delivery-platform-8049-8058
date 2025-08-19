"use client";

import { useEffect, useState } from "react";
import { getMenu, getRestaurant, type MenuItem, type Restaurant } from "@/lib/api";
import { useCart } from "@/lib/cart";
import Link from "next/link";

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cart = useCart();

  useEffect(() => {
    (async () => {
      try {
        const [r, m] = await Promise.all([getRestaurant(params.id), getMenu(params.id)]);
        setRestaurant(r);
        setMenu(m);
      } catch {
        setError("Failed to load restaurant");
      }
    })();
  }, [params.id]);

  if (error) return <div className="container-page py-6"><p className="text-red-600">{error}</p></div>;
  if (!restaurant || !menu) return <div className="container-page py-6"><p className="text-muted">Loading…</p></div>;

  return (
    <main className="container-page py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Link href="/" className="text-sm text-muted">&larr; Back to restaurants</Link>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <div className="text-sm text-muted">{restaurant.cuisine} • {restaurant.is_open ? "Open" : "Closed"} • {restaurant.rating.toFixed(1)} ★</div>
            </div>
            <div className="flex flex-wrap gap-1">
              {restaurant.tags?.slice(0, 6).map(t => <span key={t} className="badge">{t}</span>)}
            </div>
          </div>
        </div>

        <div className="grid-auto-fit">
          {menu.map(mi => (
            <div className="card p-3 flex flex-col" key={mi.id}>
              <div className="aspect-[16/9] bg-gray-100 rounded-lg mb-2" />
              <div className="flex-1">
                <div className="font-semibold">{mi.name}</div>
                {mi.description && <div className="text-sm text-muted">{mi.description}</div>}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="font-semibold">${mi.price.toFixed(2)}</div>
                <button className="btn btn-secondary" onClick={() => cart.add(restaurant.id, mi)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="hidden lg:block">
          {/* Dedicated cart sidebar on large screens */}
          {/* Reuse the sidebar component in home, but inline here to avoid double import complexity */}
          <InlineCart />
        </div>
        <div className="lg:hidden card p-3">
          <p className="text-sm text-muted">Cart available at bottom of home and restaurant pages on mobile.</p>
          <InlineCart />
        </div>
      </div>
    </main>
  );
}

function InlineCart() {
  const cart = useCart();
  return (
    <div className="space-y-2">
      <div className="card p-3">
        <h3 className="font-semibold">Cart</h3>
        {cart.items.length === 0 ? (
          <p className="text-sm text-muted mt-2">No items yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {cart.items.map(i => (
              <div key={i.menu_item.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{i.menu_item.name}</div>
                  <div className="text-sm text-muted">${i.menu_item.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost" onClick={() => cart.setQty(i.menu_item.id, i.quantity - 1)}>-</button>
                  <span>{i.quantity}</span>
                  <button className="btn btn-ghost" onClick={() => cart.setQty(i.menu_item.id, i.quantity + 1)}>+</button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2">
              <span>Total</span>
              <span className="font-semibold">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
