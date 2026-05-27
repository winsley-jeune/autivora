'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const specs = [
  {
    id: 'battery',
    title: 'Power & Battery',
    content: 'Internal lithium-ion battery providing up to 48 hours of active diffusion. USB-C fast charging (full charge in 2 hours).',
  },
  {
    id: 'noise',
    title: 'Acoustics',
    content: 'Operating noise level remains below 40dB, ensuring near-silent integration into the cabin environment.',
  },
  {
    id: 'coverage',
    title: 'Diffusion Coverage',
    content: 'Optimized for volumes up to 600 sq ft, covering any luxury sedan, SUV, or grand tourer interior.',
  },
  {
    id: 'bottles',
    title: 'Fragrance Compatibility',
    content: 'Accepts standard 5mL, 10mL, 15mL, and 20mL essential oil or fragrance oil bottles.',
  },
];

export default function SpecsAccordion() {
  const [openSpec, setOpenSpec] = useState<string | null>(null);

  return (
    <div className="border-t border-neutral-100">
      {specs.map((item) => (
        <div key={item.id} className="border-b border-neutral-100">
          <button
            onClick={() => setOpenSpec(openSpec === item.id ? null : item.id)}
            className="w-full py-6 flex justify-between items-center text-left hover:text-neutral-500 transition-colors"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{item.title}</span>
            {openSpec === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {openSpec === item.id && (
            <div className="pb-8 text-sm text-neutral-400 font-light leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
