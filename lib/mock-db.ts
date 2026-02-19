export type VehicleData = {
  make: string;
  model: string;
  year: string;
  interior_type: 'Leather' | 'Alcantara' | 'Wood Trim' | 'Carbon Fiber' | 'Piano Black';
  scent_pairing: string;
  description: string;
};

export const LUXURY_BRANDS: Record<string, Record<string, VehicleData>> = {
  porsche: {
    '911': {
      make: 'Porsche',
      model: '911',
      year: '2024',
      interior_type: 'Alcantara',
      scent_pairing: 'Smoked Sandalwood & Amber',
      description: 'Engineered for the driver-centric cockpit, contrasting with the race-tex surfaces.',
    },
    'cayenne': {
      make: 'Porsche',
      model: 'Cayenne',
      year: '2024',
      interior_type: 'Leather',
      scent_pairing: 'White Tea & Thyme',
      description: 'A refined accompaniment to the spacious, leather-wrapped grand tourer interior.',
    },
  },
  'mercedes-benz': {
    's-class': {
      make: 'Mercedes-Benz',
      model: 'S-Class',
      year: '2024',
      interior_type: 'Wood Trim',
      scent_pairing: 'Bergamot & Oud',
      description: 'Enhances the serene, lounge-like atmosphere of the S-Class cabin.',
    },
    'g-wagon': {
      make: 'Mercedes-Benz',
      model: 'G-Class',
      year: '2024',
      interior_type: 'Carbon Fiber',
      scent_pairing: 'Leather & Tobacco',
      description: 'Bold and commanding, matching the rugged yet luxurious utility of the G-Wagon.',
    },
  },
  bmw: {
    'm3': {
      make: 'BMW',
      model: 'M3',
      year: '2024',
      interior_type: 'Carbon Fiber',
      scent_pairing: 'Black Pepper & Cedar',
      description: 'A sharp, energizing scent that matches the aggressive sportiness of the M-division.',
    },
    'x5': {
      make: 'BMW',
      model: 'X5',
      year: '2024',
      interior_type: 'Leather',
      scent_pairing: 'Fresh Linen & Sea Salt',
      description: 'Clean and airy, perfect for the modern executive SUV experience.',
    },
  },
  audi: {
    'rs6': {
      make: 'Audi',
      model: 'RS6 Avant',
      year: '2024',
      interior_type: 'Alcantara',
      scent_pairing: 'Dark Roast & Vanilla',
      description: 'Sophisticated warmth to complement the tech-forward, dark aesthetic of the RS cabin.',
    },
  },
  lexus: {
    'lc500': {
      make: 'Lexus',
      model: 'LC 500',
      year: '2024',
      interior_type: 'Leather',
      scent_pairing: 'Cherry Blossom & Yuzu',
      description: 'An elegant floral note that honors the Takumi craftsmanship of the interior.',
    },
  },
  'land-rover': {
    'range-rover': {
      make: 'Land Rover',
      model: 'Range Rover',
      year: '2024',
      interior_type: 'Wood Trim',
      scent_pairing: 'English Oak & Hazelnut',
      description: 'Earthy and regal, grounding the floating sensation of the Range Rover ride.',
    },
  },
  ferrari: {
    'roma': {
      make: 'Ferrari',
      model: 'Roma',
      year: '2023',
      interior_type: 'Leather',
      scent_pairing: 'Tuscan Leather & Fig',
      description: 'La Nuova Dolce Vita—a scent as timeless and passionate as the car itself.',
    },
  },
  lamborghini: {
    'urus': {
      make: 'Lamborghini',
      model: 'Urus',
      year: '2024',
      interior_type: 'Alcantara',
      scent_pairing: 'Spicy Ginger & Saffron',
      description: 'Exotic and intense, keeping pace with the Super SUV\'s adrenaline.',
    },
  },
  bentley: {
    'continental-gt': {
      make: 'Bentley',
      model: 'Continental GT',
      year: '2024',
      interior_type: 'Wood Trim',
      scent_pairing: 'Mahogany & Cognac',
      description: 'Rich and heady, mirroring the handcrafted opulence of the Mulliner specifications.',
    },
  },
  'aston-martin': {
    'db12': {
      make: 'Aston Martin',
      model: 'DB12',
      year: '2025',
      interior_type: 'Leather',
      scent_pairing: 'Earl Grey & Cucumber',
      description: 'Quintessentially British refinement with a crisp, modern edge.',
    },
  },
};
