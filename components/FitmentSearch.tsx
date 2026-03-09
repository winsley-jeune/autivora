"use client";

import { useState } from "react";
import Link from "next/link";

export type FitmentVehicle = {
  brand: string;
  model: string;
  year: string;
  make: string;
  displayModel: string;
  href: string;
};

export default function FitmentSearch({
  vehicles,
}: {
  vehicles: FitmentVehicle[];
}) {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();
  const filtered = q
    ? vehicles.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.displayModel.toLowerCase().includes(q) ||
          v.year.includes(q) ||
          `${v.make} ${v.displayModel}`.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="relative max-w-xl mx-auto mb-16">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your vehicle\u2026"
        className="w-full px-6 py-4 border border-gray-200 rounded-sm text-sm tracking-wide focus:outline-none focus:border-black transition-colors bg-white"
      />
      {q && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-72 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className="block px-6 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <span className="text-gray-400 mr-2">{v.year}</span>
                <span className="font-medium">{v.make}</span>{" "}
                <span className="text-gray-600">{v.displayModel}</span>
              </Link>
            ))
          ) : (
            <div className="px-6 py-4 text-sm text-gray-400">
              No matching vehicles found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
