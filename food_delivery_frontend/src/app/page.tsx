"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import RestaurantCard from "@/components/RestaurantCard";
import CartSidebar from "@/components/CartSidebar";
import { searchRestaurants, type Restaurant } from "@/lib/api";
import { CartProvider } from "@/lib/cart";

export default function Home() {
  return (
    <CartProvider>
      <HomeInner />
    </CartProvider>
  );
}

function HomeInner() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doSearch(params?: { query?: string; cuisine?: string; is_open?: boolean; min_rating?: number; tags?: string[] }) {
    setError(null);
    try {
      const r = await searchRestaurants(params || {});
      setRestaurants(r);
    } catch {
      setError("Failed to load restaurants");
      setRestaurants([]);
    }
  }

  useEffect(() => { doSearch(); }, []);

  return (
    <main className="container-page py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">Discover restaurants</h1>
            <SearchBar onSearch={doSearch} />
          </div>

          {error && <p className="text-red-600">{error}</p>}
          {!restaurants && !error && <p className="text-muted">Loading…</p>}
          <div className="grid-auto-fit">
            {restaurants?.map((r) => <RestaurantCard key={r.id} r={r} />)}
          </div>
        </div>

        <div className="lg:col-span-1">
          <CartSidebar />
        </div>
      </div>
    </main>
  );
}
