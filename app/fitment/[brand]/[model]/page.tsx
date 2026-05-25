import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getVehicleBySlug } from '@/lib/sanity';
import { LUXURY_BRANDS, VehicleData } from '@/lib/mock-db';
import { getBrandSVG } from '@/lib/brand-assets';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import FaqJsonLd from '@/components/FaqJsonLd';

// Resolve vehicle data: Sanity first, then mock-db fallback
async function getVehicleData(brand: string, model: string): Promise<VehicleData | null> {
  // 1. Try Sanity
  const sanityVehicle = await getVehicleBySlug(brand, model);
  if (sanityVehicle) {
    return {
      make: sanityVehicle.make,
      model: sanityVehicle.model,
      year: sanityVehicle.year ?? '2024',
      interior_type: (sanityVehicle.interior_type as VehicleData['interior_type']) ?? 'Leather',
      scent_pairing: sanityVehicle.scent_pairing ?? 'Signature Autivora Blend',
      description:
        sanityVehicle.description ??
        `A bespoke scent profile designed for the ${sanityVehicle.make} experience.`,
      placement: '',
      cabin_size: 'medium',
      intensity_rec: 3,
      interior_notes: '',
      faq: [],
      hero_image: '',
    };
  }

  // 2. Fall back to mock-db
  const brandData = LUXURY_BRANDS[brand.toLowerCase()];
  if (!brandData) return null;

  const modelData = brandData[model.toLowerCase()];
  if (modelData) return modelData;

  return null;
}

type Props = {
  params: Promise<{ brand: string; model: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, model } = await params;
  const vehicle = await getVehicleData(brand, model);

  if (!vehicle) {
    return { title: 'Luxury Car Fragrance' };
  }

  const title = `${vehicle.make} ${vehicle.model} Car Diffuser — Scent Pairing & Fit Guide`;
  const description = `Will the Autivora One fit your ${vehicle.year} ${vehicle.make} ${vehicle.model}? Placement guide, intensity recommendations for ${vehicle.interior_type} interiors, and the perfect scent pairing.`;
  const canonical = `/fitment/${brand}/${model}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: Props) {
  const { brand, model } = await params;
  const vehicle = await getVehicleData(brand, model);

  if (!vehicle) notFound();

  const vehicleImage = getBrandSVG(brand, vehicle.model);

  const brandDisplay = brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="bg-white min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Vehicle Compatibility', url: '/fitment' },
          { name: brandDisplay, url: `/fitment/${brand}` },
          { name: `${vehicle.make} ${vehicle.model}`, url: `/fitment/${brand}/${model}` },
        ]}
      />
      {vehicle.faq?.length > 0 && <FaqJsonLd items={vehicle.faq} />}
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-100">
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          {vehicleImage ? (
            <img
              src={vehicleImage}
              alt={`${vehicle.make} ${vehicle.model} Interior`}
              className="w-full h-full object-cover grayscale opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-400"></div>
          )}
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/80 mb-6 block">
            {vehicle.year} {vehicle.make}
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter mb-8 leading-tight">
            The Definitive Scent <br /> for your {vehicle.model}.
          </h1>
          <p className="text-xl text-white/90 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            {vehicle.description}
          </p>
          <Link
            href="/product/autivora-one"
            className="inline-block bg-white text-black px-12 py-5 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500 rounded-sm shadow-xl"
          >
            Experience Autivora
          </Link>
        </div>
      </section>

      {/* Scent Pairing & Interior Section */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Scent Pairing Card */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 border border-gray-200 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
              Recommended Scent Pairing
            </div>
            <h2 className="text-3xl font-display font-medium tracking-tight">
              {vehicle.scent_pairing}
            </h2>
            <div className="w-12 h-[1px] bg-black"></div>
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              Paired for{' '}
              <span className="text-black font-medium">{vehicle.interior_type}</span> interiors.
            </p>
            {vehicle.interior_notes && (
              <p className="text-gray-500 text-sm leading-relaxed italic">
                &ldquo;{vehicle.interior_notes}&rdquo;
              </p>
            )}
          </div>

          {/* Placement & Intensity Card */}
          <div className="space-y-8 bg-gray-50 p-8 rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Fit & Placement Guide
            </h3>
            {vehicle.placement && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest">Where to Place It</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{vehicle.placement}</p>
              </div>
            )}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-widest">
                Recommended Intensity
              </h4>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      level <= vehicle.intensity_rec
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {level}
                  </div>
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  {vehicle.cabin_size === 'small'
                    ? 'Compact cabin — less is more'
                    : vehicle.cabin_size === 'medium'
                      ? 'Mid-size cabin — balanced coverage'
                      : 'Large cabin — full projection'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-widest">Cabin Size</h4>
              <p className="text-gray-600 text-sm">
                {vehicle.cabin_size === 'small'
                  ? 'Compact / sports car cockpit. Scent fills the space quickly — start low.'
                  : vehicle.cabin_size === 'medium'
                    ? 'Mid-size sedan or coupé. The sweet spot for the Autivora One — even coverage without adjustments.'
                    : 'Full-size SUV or luxury sedan. Use higher intensity for rear-seat coverage. Consider a second unit for three-row vehicles.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {vehicle.faq.length > 0 && (
        <section className="bg-gray-50 py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-medium tracking-tight text-center mb-16">
              {vehicle.make} {vehicle.model} — Common Questions
            </h2>
            <div className="space-y-8">
              {vehicle.faq.map((item, i) => (
                <div key={i} className="border-b border-gray-200 pb-8 last:border-0">
                  <h3 className="text-base font-bold mb-3">{item.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Device Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-square bg-gray-50 rounded-sm shadow-xl border border-gray-100 p-8 flex items-center justify-center group overflow-hidden">
            <img
              src="/image/616Bu0HYtsL._AC_SL1500_.jpg"
              alt="Autivora One"
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000"
            />
          </div>
          <div className="space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              The Recommended Device
            </span>
            <h2 className="text-4xl font-display font-medium tracking-tight">The Autivora One.</h2>
            <p className="text-gray-500 text-lg font-light leading-relaxed">
              Precision cold-air nebulization. No water, no heat, no dilution. Machined from a
              single block of aerospace-grade aluminum. 48-hour battery. USB-C charging. Whisper-quiet at 40dB.
            </p>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                65mm diameter — fits all standard cup holders
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                220g — lighter than a can of soda
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                Dry nano-mist — zero residue on leather, wood, or Alcantara
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                Silicone base ring — no scratches on interior surfaces
              </li>
            </ul>
            <Link
              href="/product/autivora-one"
              className="inline-block bg-black text-white px-12 py-5 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Cross-link to other vehicles */}
      <section className="py-16 px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">
            Not your vehicle?
          </p>
          <Link
            href="/fitment"
            className="inline-block text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors"
          >
            Browse All Compatible Vehicles
          </Link>
        </div>
      </section>

      {/* SEO Keywords Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-[10px] text-gray-300 uppercase tracking-widest flex flex-wrap justify-center gap-x-8 gap-y-4">
          <span>{vehicle.make} car diffuser</span>
          <span>{vehicle.model} air freshener</span>
          <span>luxury car scent {vehicle.year}</span>
          <span>best diffuser for {vehicle.make}</span>
          <span>{vehicle.model} cup holder diffuser</span>
          <span>{vehicle.interior_type} safe car fragrance</span>
        </div>
      </footer>
    </div>
  );
}
