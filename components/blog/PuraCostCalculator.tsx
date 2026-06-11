'use client';

import { useState } from 'react';

/**
 * Interactive subscription-math calculator embedded in the
 * "Is Pura Worth It?" article via the [[calculator]] content block.
 * Pricing constants are verified against public pricing pages —
 * update PRICING when competitor prices change.
 */
const PRICING = {
  pura: {
    label: 'Pura 4 + subscription',
    device: 49.99,
    refill: 15.99, // per vial, list price (subscription ~20% less)
    refillMl: 10,
  },
  autivora: {
    label: 'Autivora à la carte',
    device: 109, // Autivora Home Room
    oil: 39, // 200ml bottle
    oilMl: 200,
  },
};

const PACE_PRESETS = [
  { key: 'light', label: 'Light', desc: 'A few hours a day', vialDays: 30 },
  { key: 'moderate', label: 'Moderate', desc: "Pura's claimed pace", vialDays: 22 },
  { key: 'heavy', label: 'Heavy', desc: 'All day, higher intensity', vialDays: 12 },
] as const;

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function PuraCostCalculator() {
  const [pace, setPace] = useState<(typeof PACE_PRESETS)[number]>(PACE_PRESETS[1]);
  const [devices, setDevices] = useState(1);

  // Fragrance consumed scales with pace; one Pura vial = PRICING.pura.refillMl at the chosen pace.
  const vialsPerYear = Math.ceil(365 / pace.vialDays) * devices;
  const mlPerYear = vialsPerYear * PRICING.pura.refillMl;

  const puraYear1 = PRICING.pura.device * devices + vialsPerYear * PRICING.pura.refill;
  const puraYearN = vialsPerYear * PRICING.pura.refill;

  const bottlesPerYear = Math.ceil(mlPerYear / PRICING.autivora.oilMl);
  const autivoraYear1 = PRICING.autivora.device * devices + bottlesPerYear * PRICING.autivora.oil;
  const autivoraYearN = bottlesPerYear * PRICING.autivora.oil;

  const pura3yr = puraYear1 + puraYearN * 2;
  const autivora3yr = autivoraYear1 + autivoraYearN * 2;

  return (
    <div className="my-10 border border-neutral-200 rounded-sm p-6 sm:p-8 bg-neutral-50">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-6">
        Cost Calculator — Subscription vs À La Carte
      </p>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-black mb-3">How heavily will you run it?</p>
          <div className="grid grid-cols-3 gap-2">
            {PACE_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPace(p)}
                className={`px-3 py-3 text-left border rounded-sm transition-colors ${
                  pace.key === p.key
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
                }`}
              >
                <span className="block text-xs font-bold">{p.label}</span>
                <span className={`block text-[10px] mt-1 ${pace.key === p.key ? 'text-neutral-300' : 'text-neutral-400'}`}>
                  {p.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-black mb-3">Devices</p>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setDevices(n)}
                className={`w-12 h-12 border rounded-sm text-sm font-bold transition-colors ${
                  devices === n
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border border-neutral-200">
            <thead>
              <tr className="bg-white border-b border-neutral-200">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400"></th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  {PRICING.pura.label}
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  {PRICING.autivora.label}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-100">
                <td className="px-4 py-3 text-neutral-500">Year 1 (device + fragrance)</td>
                <td className="px-4 py-3 font-medium text-black">{money(puraYear1)}</td>
                <td className="px-4 py-3 font-medium text-black">{money(autivoraYear1)}</td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="px-4 py-3 text-neutral-500">Each year after</td>
                <td className="px-4 py-3 text-neutral-700">{money(puraYearN)}</td>
                <td className="px-4 py-3 text-neutral-700">{money(autivoraYearN)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-neutral-500 font-medium">3-year total</td>
                <td className="px-4 py-3 font-bold text-black">{money(pura3yr)}</td>
                <td className="px-4 py-3 font-bold text-black">{money(autivora3yr)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Assumes one Pura vial ({PRICING.pura.refillMl}ml at {money(PRICING.pura.refill)} on subscription) lasts{' '}
          {pace.vialDays} days at this pace, and the same fragrance volume purchased as {PRICING.autivora.oilMl}ml
          bottles at {money(PRICING.autivora.oil)}. Device prices: Pura 4 {money(PRICING.pura.device)}, Autivora Home
          Room {money(PRICING.autivora.device)}. Prices as of June 2026 — check brand sites for current pricing.
        </p>
      </div>
    </div>
  );
}
