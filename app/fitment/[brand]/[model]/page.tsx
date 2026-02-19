import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getVehicleBySlug } from '@/lib/sanity';
import { LUXURY_BRANDS, VehicleData } from '@/lib/mock-db';
import { getBrandSVG } from '@/lib/brand-assets';

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
    };
  }

  // 2. Fall back to mock-db
  const brandData = LUXURY_BRANDS[brand.toLowerCase()];
  if (!brandData) return null;

  const modelData = brandData[model.toLowerCase()];
  if (modelData) return modelData;

  // 3. Brand exists but unknown model — generic fallback
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1).replace(/-/g, ' ');
  const modelName = model.charAt(0).toUpperCase() + model.slice(1).replace(/-/g, ' ');
  return {
    make: brandName,
    model: modelName,
    year: '2024',
    interior_type: 'Leather',
    scent_pairing: 'Signature Autivora Blend',
    description: `A bespoke scent profile designed for the ${brandName} experience.`,
  };
}

type Props = {
  params: Promise<{ brand: string; model: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, model } = await params;
  const vehicle = await getVehicleData(brand, model);

  if (!vehicle) {
    return { title: 'Luxury Car Fragrance | Autivora' };
  }

  return {
    title: `The Definitive Scent for your ${vehicle.make} ${vehicle.model} | Autivora`,
    description: `Enhance your ${vehicle.make} ${vehicle.model} with Autivora's premium electronic car diffuser. Perfectly paired for ${vehicle.interior_type} interiors.`,
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: Props) {
  const { brand, model } = await params;
  const vehicle = await getVehicleData(brand, model);

  if (!vehicle) notFound();

  const vehicleImage = getBrandSVG(brand, vehicle.model);

  return (
    <div className="bg-white min-h-screen">
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
            Automotive Olfactory Design
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter mb-8 leading-tight">
            The Definitive Scent <br /> for your {vehicle.make} {vehicle.model}.
          </h1>
          <p className="text-xl text-white/90 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Engineered to harmonize with {vehicle.make}&apos;s {vehicle.interior_type}{' '}
            craftsmanship. Experience the precision of cold-air nebulization.
          </p>
          <Link
            href="/product/autivora-one"
            className="inline-block bg-white text-black px-12 py-5 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500 rounded-sm shadow-xl"
          >
            Experience Autivora
          </Link>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="space-y-12">
          <div className="inline-block px-4 py-1 border border-gray-200 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
            Curation Note
          </div>
          <h2 className="text-3xl font-display font-medium tracking-tight">
            Paired for {vehicle.interior_type}
          </h2>
          <div className="w-12 h-[1px] bg-black mx-auto"></div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto font-light italic">
            &ldquo;{vehicle.description}&rdquo;
          </p>
          <p className="text-gray-500 text-sm tracking-wide">
            Recommended Pairing:{' '}
            <span className="text-black font-medium">{vehicle.scent_pairing}</span>
          </p>
        </div>
      </section>

      {/* Recommended Device Section */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-square bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex items-center justify-center group overflow-hidden">
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
              Experience your {vehicle.make} with the ultimate olfactory companion. The Autivora One
              uses cold-air nebulization to maintain the integrity of your signature scent, ensuring
              every mile is as refined as the last.
            </p>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                Aerospace-Grade Aluminum Construction
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                48-Hour Battery Life
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                Adjustable Scent Intensity
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

      {/* SEO Keywords Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-[10px] text-gray-300 uppercase tracking-widest flex flex-wrap justify-center gap-x-8 gap-y-4">
          <span>{vehicle.make} Fragrance</span>
          <span>{vehicle.model} Air Freshener</span>
          <span>Luxury Car Diffuser {vehicle.year}</span>
          <span>Premium {vehicle.make} Accessory</span>
          <span>Electronic Diffuser for {vehicle.model}</span>
        </div>
      </footer>
    </div>
  );
}
