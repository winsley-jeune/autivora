import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Editorial Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <img 
            src="/image/61YkBrJrPhL._AC_SL1500_.jpg" 
            alt="Autivora Hero" 
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="relative z-20 text-center max-w-5xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/90 mb-8 block">
            The New Olfactory Standard
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-8 leading-[0.9] text-white">
            Scent <br /> Beyond <br /> Motion.
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-xl mx-auto font-light mb-12 leading-relaxed">
            Autivora redefines the automotive atmosphere through precision-engineered nebulization technology.
          </p>
          
          <div className="flex flex-col items-center gap-8 max-w-xs mx-auto">
            <Link 
              href="/product/puredrive-pro" 
              className="w-full bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all duration-300 rounded-sm shadow-sm"
            >
              Shop The One
            </Link>
            <Link 
              href="/fitment" 
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors duration-300 border-b border-transparent hover:border-white pb-1"
            >
              Select Your Vehicle
            </Link>
          </div>
        </div>
      </section>

      {/* Silent Credibility Strip */}
      <section className="border-y border-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="flex-1 px-8 border-r-0 md:border-r border-gray-100 last:border-r-0 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              Engineered in Europe
            </span>
          </div>
          <div className="flex-1 px-8 border-r-0 md:border-r border-gray-100 last:border-r-0 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              Aerospace-Grade Aluminum
            </span>
          </div>
          <div className="flex-1 px-8 border-r-0 md:border-r border-gray-100 last:border-r-0 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              Precision Nebulization
            </span>
          </div>
        </div>
      </section>

      {/* Technology Preview Section */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative aspect-square flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden">
            <img 
              src="/image/61T6CC0ta-L._AC_SL1500_.jpg" 
              alt="Nebulization Technology" 
              className="w-full h-full object-contain p-12"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/20"></div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-display font-medium tracking-tight">
              Engineered for the Invisible.
            </h2>
            <p className="text-gray-500 text-lg font-light leading-relaxed">
              Our cold-air nebulization technology transforms fragrance oils into a dry, ultra-fine mist. This process maintains the chemical integrity of the scent without the use of heat or water, ensuring a consistent and sophisticated olfactory experience.
            </p>
            <div className="pt-4">
              <Link href="/product/puredrive-pro" className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
                View Technical Specs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Ethos Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 block">Our Story</span>
          <h2 className="text-4xl font-display font-medium tracking-tight mb-8 leading-tight">
            Crafted for the discerning driver who values the invisible.
          </h2>
          <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
            We believe that every journey deserves a signature. Not a masking scent, but a curated olfactory layer that enhances the materials of your cabin—whether it's the warmth of open-pore oak or the technical precision of Alcantara.
          </p>
          <Link href="/collection" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-black pb-1">
            Shop the Collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="aspect-[4/5] bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-1000 overflow-hidden shadow-2xl rounded-sm">
            <img 
              src="/image/71+vAlNiJKL._AC_SX679_.jpg" 
              alt="Luxury Interior Detail" 
              className="w-full h-full object-cover"
            />
        </div>
      </section>

      {/* Product Highlight */}
      <section className="bg-gray-50 py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 block">The Device</span>
            <h2 className="text-5xl font-display font-bold mb-16 tracking-tight">The Autivora One.</h2>
            
            <div className="relative max-w-3xl mx-auto aspect-square mb-16 flex items-center justify-center">
                 <div className="absolute inset-0 bg-white shadow-inner rounded-full opacity-50 scale-95"></div>
                 <img 
                   src="/image/81dWe9a1a2L._AC_SY879_.jpg" 
                   alt="Autivora One Device" 
                   className="w-full h-full object-contain z-10 drop-shadow-2xl"
                 />
            </div>

            <p className="text-gray-600 text-xl font-light max-w-2xl mx-auto leading-relaxed mb-12">
                A seamless blend of high-performance engineering and haute-perfumery. No water. No heat. Just pure scent.
            </p>
            
            <Link 
              href="/product/puredrive-pro" 
              className="bg-black text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all"
            >
              Shop the One
            </Link>
        </div>
      </section>

      {/* Visual Gallery */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square bg-gray-50 overflow-hidden rounded-sm">
              <img src="/image/61Il7eszZRL._AC_SY879_.jpg" alt="Autivora Detail" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="aspect-square bg-gray-50 overflow-hidden rounded-sm">
              <img src="/image/61xGUIBZw8L._AC_SY879_.jpg" alt="Autivora Detail" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="aspect-square bg-gray-50 overflow-hidden rounded-sm">
              <img src="/image/714NkT3KSzL._AC_SX679_.jpg" alt="Autivora Detail" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="aspect-square bg-gray-50 overflow-hidden rounded-sm">
              <img src="/image/71f22Sj2VML._AC_SX679_.jpg" alt="Autivora Detail" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
