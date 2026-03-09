import Link from 'next/link';
import { getAllVehicles } from '@/lib/sanity';
import { LUXURY_BRANDS } from '@/lib/mock-db';
import FitmentSearch, { type FitmentVehicle } from '@/components/FitmentSearch';

// Group an array of Sanity vehicles into { brand: { modelSlug: vehicle } }
function groupVehicles(vehicles: Awaited<ReturnType<typeof getAllVehicles>>) {
  const grouped: Record<string, typeof vehicles> = {};
  for (const v of vehicles) {
    const brandSlug = v.make.toLowerCase().replace(/\s+/g, '-');
    if (!grouped[brandSlug]) grouped[brandSlug] = [];
    grouped[brandSlug].push(v);
  }
  return grouped;
}

// Build flat vehicle list for search from mock-db
function getMockVehicleList(): FitmentVehicle[] {
  const list: FitmentVehicle[] = [];
  for (const brand of Object.keys(LUXURY_BRANDS)) {
    for (const model of Object.keys(LUXURY_BRANDS[brand])) {
      const v = LUXURY_BRANDS[brand][model];
      list.push({
        brand,
        model,
        year: v.year,
        make: v.make,
        displayModel: v.model,
        href: `/fitment/${brand}/${model}`,
      });
    }
  }
  return list;
}

export default async function FitmentIndex() {
  // Try Sanity first, fall back to mock-db if not configured
  const sanityVehicles = await getAllVehicles();
  const useSanity = sanityVehicles.length > 0;

  if (useSanity) {
    const grouped = groupVehicles(sanityVehicles);
    const brands = Object.keys(grouped).sort();

    const searchVehicles: FitmentVehicle[] = sanityVehicles.map((v) => {
      const brandSlug = v.make.toLowerCase().replace(/\s+/g, '-');
      const modelSlug =
        v.slug?.current?.split('/')[1] ??
        v.model.toLowerCase().replace(/\s+/g, '-');
      return {
        brand: brandSlug,
        model: modelSlug,
        year: v.year ?? '2024',
        make: v.make,
        displayModel: v.model,
        href: `/fitment/${brandSlug}/${modelSlug}`,
      };
    });

    return (
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="relative h-64 w-full mb-16 rounded-sm overflow-hidden grayscale">
          <img
            src="/image/71aaruoc5QL._AC_SX679_.jpg"
            alt="Luxury Automotive Interiors"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
              Vehicle Compatibility
            </h1>
          </div>
        </div>

        <FitmentSearch vehicles={searchVehicles} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {brands.map((brand) => (
            <div key={brand} className="space-y-4">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-2">
                {brand.replace(/-/g, ' ')}
              </h2>
              <ul className="space-y-2">
                {grouped[brand].map((v) => {
                  const modelSlug = v.slug?.current?.split('/')[1] ??
                    v.model.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <li key={v._id}>
                      <Link
                        href={`/fitment/${brand}/${modelSlug}`}
                        className="text-gray-500 hover:text-black transition-colors text-sm"
                      >
                        {v.year} {v.make} {v.model}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback: static mock-db data
  const brands = Object.keys(LUXURY_BRANDS).sort();
  const searchVehicles = getMockVehicleList();

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="relative h-64 w-full mb-16 rounded-sm overflow-hidden grayscale">
        <img
          src="/image/71aaruoc5QL._AC_SX679_.jpg"
          alt="Luxury Automotive Interiors"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
            Vehicle Compatibility
          </h1>
        </div>
      </div>

      <FitmentSearch vehicles={searchVehicles} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {brands.map((brand) => (
          <div key={brand} className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-2">
              {brand.replace(/-/g, ' ')}
            </h2>
            <ul className="space-y-2">
              {Object.keys(LUXURY_BRANDS[brand])
                .sort()
                .map((model) => (
                  <li key={model}>
                    <Link
                      href={`/fitment/${brand}/${model}`}
                      className="text-gray-500 hover:text-black transition-colors text-sm"
                    >
                      {LUXURY_BRANDS[brand][model].year} {LUXURY_BRANDS[brand][model].make}{' '}
                      {LUXURY_BRANDS[brand][model].model}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
