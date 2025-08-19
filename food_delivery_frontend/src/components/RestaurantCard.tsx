"use client";

import Link from "next/link";
import type { Restaurant } from "@/lib/api";

export default function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <div className="card p-3 flex flex-col gap-2">
      <div className="aspect-[16/9] w-full rounded-lg bg-gray-100" />
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{r.name}</h3>
          <div className="text-sm text-muted">{r.cuisine} • {r.is_open ? "Open" : "Closed"}</div>
        </div>
        <div className="badge">{r.rating.toFixed(1)} ★</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {r.tags?.slice(0, 4).map(t => <span key={t} className="badge">{t}</span>)}
      </div>
      <div className="pt-1">
        <Link href={`/restaurant/${r.id}`} className="btn btn-secondary w-full">View menu</Link>
      </div>
    </div>
  );
}
