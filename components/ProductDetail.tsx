"use client";

import React, { useState } from 'react';
import { Minus, Plus, Battery, Zap, Wind } from 'lucide-react';
import Image from 'next/image';

interface ProductDetailProps {
  vehicle?: {
    make: string;
    model: string;
    year: string;
  };
  vehicleImage?: string;
}

export default function ProductDetail({ vehicle, vehicleImage }: ProductDetailProps) {
  const [intensity, setIntensity] = useState(1);
  const [timer, setTimer] = useState(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Product Image Section */}
        <div className="relative aspect-square bg-white rounded-sm overflow-hidden group shadow-2xl border border-gray-100 flex items-center justify-center p-8">
             {/* Background Vehicle Context */}
             {vehicleImage && (
               <div className="absolute inset-0 opacity-10 grayscale group-hover:opacity-20 group-hover:grayscale-0 transition-all duration-700">
                 <img src={vehicleImage} alt="Vehicle Context" className="w-full h-full object-cover" />
               </div>
             )}
             
             {/* High Quality Product Image */}
            <img 
              src="/image/616Bu0HYtsL._AC_SL1500_.jpg" 
              alt="Autivora One" 
              className="w-full h-full object-contain z-10 relative drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
            />
             
             {/* Overlay for vehicle context */}
            {vehicle && (
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-medium tracking-widest uppercase border border-gray-200 shadow-sm">
                Compatible with {vehicle.year} {vehicle.make} {vehicle.model}
              </div>
            )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col space-y-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-gray-900 mb-2">
              The Autivora One.
            </h1>
            <p className="text-lg text-gray-500 font-light tracking-wide">
              Precision-milled aluminum. Cold-air nebulization.
            </p>
          </div>

          <div className="border-t border-b border-gray-100 py-8 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Technical Specifications</h3>
            
            <div className="grid grid-cols-2 gap-6">
               {/* Battery Spec */}
              <div className="flex items-start space-x-4">
                <Battery className="w-5 h-5 text-gray-900 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">50-Hour Battery</p>
                  <p className="text-xs text-gray-500 mt-1">Long-lasting lithium-ion cell for extended journeys.</p>
                </div>
              </div>

               {/* Nebulization Spec */}
              <div className="flex items-start space-x-4">
                <Wind className="w-5 h-5 text-gray-900 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cold-Air Nebulization</p>
                  <p className="text-xs text-gray-500 mt-1">Waterless diffusion preserves the integrity of the fragrance oil.</p>
                </div>
              </div>

               {/* Smart Mode Spec */}
              <div className="flex items-start space-x-4">
                <Zap className="w-5 h-5 text-gray-900 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Smart Vibration Sensor</p>
                  <p className="text-xs text-gray-500 mt-1">Auto-activation when vehicle motion is detected.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Controls Simulation */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Intensity Level</span>
              <div className="flex space-x-2">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setIntensity(level)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm transition-all ${
                      intensity === level
                        ? 'bg-black text-white border-black'
                        : 'bg-transparent text-gray-400 border-gray-200 hover:border-gray-900'
                    }`}
                  >
                    H{level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Timer Duration</span>
               <div className="flex space-x-2">
                {[1, 2, 3].map((time) => (
                  <button
                    key={time}
                    onClick={() => setTimer(time)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm transition-all ${
                      timer === time
                        ? 'bg-black text-white border-black'
                        : 'bg-transparent text-gray-400 border-gray-200 hover:border-gray-900'
                    }`}
                  >
                    {time}H
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="w-full bg-black text-white py-4 text-sm font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Add to Cart — $125.00
          </button>
        </div>
      </div>
    </div>
  );
}
