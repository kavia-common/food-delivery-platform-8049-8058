"use client";

import { useState } from "react";

type Props = {
  onSearch: (q: { query?: string; cuisine?: string; is_open?: boolean; min_rating?: number; tags?: string[] }) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      query: query || undefined,
      cuisine: cuisine || undefined,
      is_open: isOpen || undefined,
      min_rating: typeof minRating === "number" ? minRating : undefined,
    });
  }

  return (
    <form onSubmit={submit} className="card p-3 flex flex-col md:flex-row md:items-end gap-3">
      <div className="flex-1">
        <label className="text-sm text-muted">Search</label>
        <input className="input mt-1" placeholder="Pizza, sushi, burgers…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="w-full md:w-48">
        <label className="text-sm text-muted">Cuisine</label>
        <input className="input mt-1" placeholder="e.g. Italian" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
      </div>
      <div className="w-full md:w-40">
        <label className="text-sm text-muted">Min rating</label>
        <input className="input mt-1" type="number" min={0} max={5} step={0.5}
               value={minRating ?? ""} onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)} />
      </div>
      <div className="w-full md:w-40">
        <label className="text-sm text-muted">Open now</label>
        <div className="flex items-center gap-2 mt-2">
          <input id="isopen" type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
          <label htmlFor="isopen" className="text-sm">Only show open</label>
        </div>
      </div>
      <div className="w-full md:w-auto">
        <button className="btn btn-primary w-full md:w-auto" type="submit">Search</button>
      </div>
    </form>
  );
}
