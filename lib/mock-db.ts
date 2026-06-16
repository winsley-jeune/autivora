export type VehicleFAQ = {
  question: string;
  answer: string;
};

export type VehicleData = {
  make: string;
  model: string;
  year: string;
  interior_type: "Leather" | "Alcantara" | "Wood Trim" | "Carbon Fiber" | "Piano Black";
  scent_pairing: string;
  description: string;
  placement: string;
  cabin_size: "small" | "medium" | "large";
  intensity_rec: number;
  interior_notes: string;
  faq: VehicleFAQ[];
  hero_image: string;
};

export const LUXURY_BRANDS: Record<string, Record<string, VehicleData>> = {
  porsche: {
    "911": {
      make: "Porsche",
      model: "911",
      year: "2024",
      interior_type: "Alcantara",
      scent_pairing: "Smoked Sandalwood & Amber",
      description:
        "The 911 cockpit is tight, driver-focused, and wrapped in Race-Tex microfiber. Scent fills the space fast \u2014 a low intensity setting lets the fragrance layer subtly over the signature Porsche smell of warm brakes and leather.",
      placement:
        "The front cup holder cradle is the ideal spot. The 911\u2019s compact cabin means the Autivara Drive sits within arm\u2019s reach and diffuses evenly across the dashboard.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "Race-Tex (Alcantara) does not absorb fragrance oils the way natural leather does, so scent stays in the air rather than settling into surfaces. No residue on your GT3 steering wheel.",
      faq: [
        {
          question: "Will it fit in the 911 cup holder?",
          answer:
            "Yes. The Autivara Drive is compact and sits securely in the 911\u2019s cup holder \u2014 the silicone base ring keeps it snug without rattling, even on track days.",
        },
        {
          question: "Will the scent overpower the small cabin?",
          answer:
            "The 911 cabin is roughly 2.4 cubic meters. We recommend intensity level 2 out of 5. At this setting, scent is present but never competes with the driving experience.",
        },
        {
          question: "Is it safe to leave in a hot car?",
          answer:
            "The Autivara Drive operates entirely without heat \u2014 cold-air nebulization means no heating element and no flame. It handles normal cabin temperatures comfortably, even on a sun-soaked track day.",
        },
      ],
      hero_image: "/image/placeholder-porsche-911.jpg",
    },
    cayenne: {
      make: "Porsche",
      model: "Cayenne",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "White Tea & Thyme",
      description:
        "The Cayenne\u2019s expansive SUV cabin benefits from a slightly higher intensity. Its premium leather interior responds beautifully to lighter, cleaner scent profiles that don\u2019t compete with the natural hide.",
      placement:
        "Center console cup holder, behind the gear selector. The Cayenne\u2019s elevated console keeps the unit upright and allows scent to rise naturally into the cabin.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "Porsche\u2019s semi-aniline leather in the Cayenne has a natural scent of its own. We pair with lighter botanicals that complement rather than mask the hide.",
      faq: [
        {
          question: "Will it scent the rear seats too?",
          answer:
            "At intensity level 3-4, the nano-mist reaches second-row passengers within about 3 minutes. For third-row coverage in the Cayenne long-wheelbase, set it to 4-5.",
        },
        {
          question: "Does the cold-air mist affect the leather?",
          answer:
            "No. Unlike water-based diffusers, the Autivara Drive produces a dry nano-vapor. It will not stain, spot, or degrade your leather surfaces.",
        },
        {
          question: "How long does a scent refill last in a larger cabin?",
          answer:
            "At the recommended intensity 4, a 10ml Autivara oil refill lasts approximately 3 weeks of daily 45-minute commutes.",
        },
      ],
      hero_image: "/image/placeholder-porsche-cayenne.jpg",
    },
    macan: {
      make: "Porsche",
      model: "Macan",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Vetiver & Grapefruit",
      description:
        "The Macan is the daily driver Porsche \u2014 school runs, commutes, weekend escapes. Its mid-size cabin is the sweet spot for the Autivara Drive: big enough that scent doesn\u2019t overwhelm, small enough for full coverage.",
      placement:
        "Front cup holder. The Macan\u2019s center console is lower than the Cayenne, placing the Autivara Drive at the perfect height for natural scent diffusion across the dashboard.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Macan interior often features smooth-finish leather with brushed aluminum trim. Vetiver pairs naturally with metallic textures \u2014 clean, modern, and never sweet.",
      faq: [
        {
          question: "Will it slide around during spirited driving?",
          answer:
            "The Autivara Drive is lightweight with a low, stable profile. In the Macan\u2019s cup holder it stays planted through corners, and the silicone base ring keeps it from shifting.",
        },
        {
          question: "My Macan has the Bose system \u2014 will I hear the diffuser?",
          answer:
            "At 40dB, the Autivara Drive is quieter than the Macan\u2019s cabin at idle (approximately 42dB). With any music playing, it is completely inaudible.",
        },
      ],
      hero_image: "/image/placeholder-porsche-macan.jpg",
    },
    taycan: {
      make: "Porsche",
      model: "Taycan",
      year: "2024",
      interior_type: "Alcantara",
      scent_pairing: "Ozone & White Musk",
      description:
        "The Taycan is silent. No engine rumble, no exhaust note \u2014 just the whisper of electric torque. In this environment, every sensory detail matters more. Scent becomes the cabin\u2019s defining character.",
      placement:
        "Center console cup holder or the wireless charging tray shelf. The Taycan\u2019s minimalist interior makes the Autivara Drive\u2019s clean cylindrical form feel like it belongs.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Taycan\u2019s Race-Tex and recycled microfiber interior has almost no natural scent. The cabin is a blank canvas \u2014 the Autivara Drive defines the space entirely.",
      faq: [
        {
          question: "Can I charge the Autivara Drive with the Taycan\u2019s USB-C?",
          answer:
            "Yes. The Autivara Drive charges via USB-C and runs up to 24 hours of intermittent use per charge. You can also run it while it\u2019s plugged in.",
        },
        {
          question: "Will it be audible in the silent EV cabin?",
          answer:
            "The Taycan\u2019s cabin at highway speed measures about 38dB \u2014 remarkably quiet. The Autivara Drive at 40dB produces a faint hum that is masked by road noise above 30 km/h.",
        },
        {
          question: "Does it work with Porsche\u2019s built-in ionizer?",
          answer:
            "Yes. The Autivara Drive outputs fragrance as a dry nano-mist. It works independently of the air ionization system and does not interfere with Porsche\u2019s cabin air filtration.",
        },
      ],
      hero_image: "/image/placeholder-porsche-taycan.jpg",
    },
    panamera: {
      make: "Porsche",
      model: "Panamera",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Bergamot & Cashmere Wood",
      description:
        "The Panamera is Porsche\u2019s grand tourer \u2014 long-haul comfort in a luxury sedan body. Its spacious cabin rewards complex, evolving scent profiles that unfold over hours of driving.",
      placement:
        "Rear center armrest cup holder for rear-seat passengers, or front console cup holder for the driver. The Panamera\u2019s dual-zone layout benefits from a centrally placed unit.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The Panamera\u2019s two-tone leather interiors often pair dark hides with lighter headliners. Bergamot\u2019s brightness plays beautifully against the warm base of cashmere wood in this environment.",
      faq: [
        {
          question: "I have the Executive long-wheelbase \u2014 will one unit be enough?",
          answer:
            "For the long-wheelbase Panamera Executive, one unit at intensity 4-5 covers the full cabin. For dedicated rear-seat fragrance, consider a second unit in the rear armrest.",
        },
        {
          question: "How does the battery handle long road trips?",
          answer:
            "At a moderate intensity the battery comfortably covers a week of typical drives on a single charge. USB-C charging means you can top up from the Panamera\u2019s console ports.",
        },
      ],
      hero_image: "/image/placeholder-porsche-panamera.jpg",
    },
  },

  "mercedes-benz": {
    "s-class": {
      make: "Mercedes-Benz",
      model: "S-Class",
      year: "2024",
      interior_type: "Wood Trim",
      scent_pairing: "Bergamot & Oud",
      description:
        "The S-Class already has an optional fragrance system (Air Balance). But it\u2019s limited to Mercedes\u2019s own cartridges. The Autivara Drive gives you complete control \u2014 any scent, any intensity, with superior nebulization technology.",
      placement:
        "Rear center armrest for the executive rear-seat experience, or the front console wireless charging area. The S-Class cabin is designed around rear-seat luxury.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The W223 S-Class features open-pore wood trim and Nappa leather. Open-pore wood can absorb airborne oils over time \u2014 the Autivara Drive\u2019s dry nebulization minimizes this, unlike wet diffusers.",
      faq: [
        {
          question: "How does this compare to Mercedes Air Balance?",
          answer:
            "Air Balance uses heated wax cartridges with limited scent options. The Autivara Drive uses cold-air nebulization with any essential oil \u2014 no heat degradation, no wax residue, and unlimited scent choices.",
        },
        {
          question: "Can I use both at the same time?",
          answer:
            "We recommend using one or the other. Running both creates competing scent profiles. Most S-Class owners who switch to Autivara disable Air Balance entirely.",
        },
        {
          question: "Will the device scratch the S-Class interior?",
          answer:
            "The Autivara Drive has a silicone base ring that prevents metal-to-surface contact. Safe for piano lacquer, open-pore wood, and high-gloss trim.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-s-class.jpg",
    },
    "g-wagon": {
      make: "Mercedes-Benz",
      model: "G-Class",
      year: "2024",
      interior_type: "Carbon Fiber",
      scent_pairing: "Leather & Tobacco",
      description:
        "The G-Wagon is part luxury cruiser, part statement piece. Its boxy cabin has unique acoustics \u2014 sound (and scent) bounces off flat surfaces. A bold fragrance profile cuts through the G\u2019s commanding presence.",
      placement:
        "The front cup holders sit deep in the center console tunnel, which actually helps \u2014 the enclosed space concentrates the initial burst of scent before it rises into the cabin.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The AMG G63\u2019s designo leather and carbon fiber accents create a masculine, dark environment. Tobacco and leather notes amplify this character rather than fighting it.",
      faq: [
        {
          question: "The G-Wagon is loud on the highway \u2014 does road noise affect diffusion?",
          answer:
            "Noise doesn\u2019t affect scent diffusion. The nebulization works independently of cabin acoustics. At highway speed, the G\u2019s HVAC will actually help circulate the nano-mist.",
        },
        {
          question: "I take my G off-road \u2014 will vibration damage the unit?",
          answer:
            "The Autivara Drive has no moving parts except the piezoelectric nebulizer element. It\u2019s rated for continuous vibration and has been tested in motorsport environments. Off-road use is well within tolerance.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-g-class.jpg",
    },
    gle: {
      make: "Mercedes-Benz",
      model: "GLE",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Cedarwood & Black Pepper",
      description:
        "The GLE is the volume luxury SUV \u2014 the car most likely sitting in the driveway. It\u2019s the school run, the weekend trip, the daily commute. Scent transforms this familiar space into something intentional.",
      placement:
        "Front center console cup holder. The GLE\u2019s slightly recessed holders cradle the Autivara Drive at the perfect height \u2014 below the dashboard air vents, which help circulate scent.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The GLE\u2019s MB-Tex or Nappa leather comes in lighter color options (Macchiato, Silk Beige) that show water spots from traditional diffusers. The Autivara Drive\u2019s dry mist leaves zero residue on light-colored hides.",
      faq: [
        {
          question: "I have kids \u2014 is the Autivara Drive safe around children?",
          answer:
            "The Autivara Drive has no hot surfaces, no open liquid, and no small removable parts. The oil reservoir is sealed. It\u2019s safe in a family vehicle. Fragrance oils are dermatologist-tested and non-toxic.",
        },
        {
          question: "Will food smells from the kids overpower the scent?",
          answer:
            "Nebulized fragrance molecules are smaller and more persistent than food odors. At intensity 3-4, the Autivara Drive maintains a consistent base note even when the cabin has been through the drive-through.",
        },
        {
          question: "Can I turn it off quickly for sensitive passengers?",
          answer:
            "One-touch power off. The scent dissipates within 2-3 minutes in the GLE\u2019s cabin with HVAC running. No lingering oil residue to air out.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-gle.jpg",
    },
    "amg-gt": {
      make: "Mercedes-Benz",
      model: "AMG GT",
      year: "2024",
      interior_type: "Alcantara",
      scent_pairing: "Saffron & Dark Vetiver",
      description:
        "The AMG GT is a front-engine grand tourer with a long hood and an intimate cockpit. Its Alcantara-heavy interior is pure performance. Scent should be aggressive enough to match the car\u2019s character \u2014 not a spa, a weapon.",
      placement:
        "The AMG GT\u2019s cup holders are tucked behind the console bridge. The compact cockpit means even at low intensity, scent fills the space completely within 60 seconds.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "AMG Performance seats with Alcantara inserts and DINAMICA microfiber don\u2019t retain scent molecules the way leather does. Fragrance stays airborne longer in this cabin.",
      faq: [
        {
          question: "Will the vibration from the V8 affect the nebulizer?",
          answer:
            "No. The piezoelectric element operates at ultrasonic frequencies far above any engine vibration. AMG GT owners report zero interference, even in Sport+ exhaust mode.",
        },
        {
          question: "The AMG GT cabin gets hot in the sun \u2014 any concerns?",
          answer:
            "The Autivara Drive runs heat-free, so there\u2019s nothing to dissipate. The sealed oil reservoir prevents evaporation and leaks \u2014 no warping, no degradation, even in a warm cabin.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-amg-gt.jpg",
    },
    eqs: {
      make: "Mercedes-Benz",
      model: "EQS",
      year: "2024",
      interior_type: "Piano Black",
      scent_pairing: "Iris & White Cedar",
      description:
        "The EQS is the quietest production car ever made. At 36dB highway cruise, you can hear your own heartbeat. In this hyper-silent environment, scent becomes the dominant sensory layer \u2014 choose it deliberately.",
      placement:
        "The EQS center console has integrated wireless charging and deep cup holders forward of the armrest. Placing the Autivara Drive here keeps it hidden below the Hyperscreen sightline.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The EQS Hyperscreen stretches across the entire dashboard \u2014 all glass and piano black. Zero-residue dry mist is critical here. Any wet diffuser would leave spots on these surfaces within a week.",
      faq: [
        {
          question: "The EQS has Energizing Comfort fragrances built in \u2014 why switch?",
          answer:
            "Mercedes offers 4 scent cartridges at roughly \u20AC45 each with limited availability. The Autivara Drive works with any essential oil, giving you unlimited scent options at a fraction of the ongoing cost.",
        },
        {
          question: "Will I hear the Autivara Drive in the silent EQS cabin?",
          answer:
            "At 40dB, the Autivara Drive is slightly above the EQS highway cabin noise (36dB). At low speed in a parking garage, you may hear a faint hum. Above 50 km/h, it\u2019s inaudible.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-eqs.jpg",
    },
    "c-class": {
      make: "Mercedes-Benz",
      model: "C-Class",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Lemon Verbena & White Musk",
      description:
        "The C-Class is Mercedes\u2019s best-selling sedan globally \u2014 the car that introduces millions to the three-pointed star. Its W206 interior borrows heavily from the S-Class, punching well above its price. A bright, clean scent reinforces the premium feel.",
      placement:
        "Center console cup holder between the touchpad and armrest. The C-Class console is compact but well-designed \u2014 the Autivara Drive sits at the ideal height for natural diffusion.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The W206 C-Class\u2019s portrait-oriented central screen and ambient lighting create a cabin that photographs like an S-Class. Lemon Verbena brightens the experience, especially in the popular Black/Grey interior combination.",
      faq: [
        {
          question: "The C-Class has MB-Tex standard \u2014 does synthetic leather affect scent?",
          answer:
            "MB-Tex is actually ideal for fragrance. Unlike natural leather, it has no competing scent and doesn\u2019t absorb fragrance molecules. Your cabin stays scented longer with MB-Tex than with Nappa leather.",
        },
        {
          question: "I leased my C-Class \u2014 will the Autivara Drive leave any marks?",
          answer:
            "Zero marks. The silicone base ring prevents the device from contacting hard surfaces. The dry nano-mist leaves no residue, stains, or scent absorption. Your lease return inspection won\u2019t notice a thing.",
        },
        {
          question: "Does the C300\u2019s 2.0L turbo bring any engine smell into the cabin?",
          answer:
            "The W206\u2019s cabin sealing is excellent. No engine odor enters the cabin under normal driving. The Autivara Drive operates in a completely neutral environment.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-c-class.jpg",
    },
    "e-class": {
      make: "Mercedes-Benz",
      model: "E-Class",
      year: "2024",
      interior_type: "Wood Trim",
      scent_pairing: "Neroli & Sandalwood",
      description:
        "The E-Class is the executive sedan \u2014 the car that built Mercedes\u2019s reputation. The W214 generation brings a Superscreen option and a cabin that rivals the S-Class. Neroli and Sandalwood create the olfactory equivalent of a corner office.",
      placement:
        "Center console cup holder or the rear armrest in executive-chauffeured configurations. The E-Class\u2019s console is generous and accommodating.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The E-Class\u2019s open-pore walnut trim and Nappa leather in Macchiato Beige create a warm, boardroom-like atmosphere. Neroli\u2019s citrus-floral brightness prevents the cabin from feeling stuffy during long executive commutes.",
      faq: [
        {
          question: "I\u2019m driven in my E-Class \u2014 where should the unit go for rear passengers?",
          answer:
            "Place the Autivara Drive in the rear center armrest cup holder. At intensity 3, scent reaches both rear passengers within 2 minutes. The E-Class\u2019s rear HVAC helps circulate the nano-mist.",
        },
        {
          question: "The E-Class has the Energizing Comfort system \u2014 does it conflict?",
          answer:
            "Mercedes\u2019s Energizing Comfort adjusts climate, lighting, massage, and music \u2014 but not scent (that\u2019s Air Balance, a separate option). The Autivara Drive fills the fragrance gap whether or not you have Air Balance.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-e-class.jpg",
    },
    glc: {
      make: "Mercedes-Benz",
      model: "GLC",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Rosemary & Driftwood",
      description:
        "The GLC is Mercedes\u2019s best-selling vehicle globally \u2014 more popular than the C-Class, the E-Class, or any SUV competitor. It\u2019s the default luxury crossover. The Autivara Drive turns the default into the deliberate.",
      placement:
        "Front center console cup holder. The GLC\u2019s console sits at a comfortable height, and the cup holders have rubberized inserts that grip the Autivara Drive securely.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The GLC\u2019s cabin shares its architecture with the C-Class but adds 8cm of height, creating a more airy feel. Rosemary and Driftwood add an organic, Mediterranean quality that plays well with both dark and light leather options.",
      faq: [
        {
          question: "I carry sports equipment in the GLC \u2014 will scent overcome gym bag odor?",
          answer:
            "The Autivara Drive layers fragrance over ambient odors rather than eliminating them. At intensity 3-4, Rosemary\u2019s sharp herbal note is effective at masking mild odors. For heavy gym bags, crack a window for 2 minutes first.",
        },
        {
          question: "GLC vs X3 \u2014 does the Autivara Drive work differently?",
          answer:
            "Nearly identical cabin volumes and cup holder dimensions. The GLC\u2019s slightly better sound insulation means you\u2019re less likely to hear the Autivara Drive at any speed. Same intensity recommendations.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-glc.jpg",
    },
    gls: {
      make: "Mercedes-Benz",
      model: "GLS",
      year: "2024",
      interior_type: "Wood Trim",
      scent_pairing: "Cardamom & Warm Amber",
      description:
        "The GLS is the S-Class of SUVs \u2014 Mercedes\u2019s own description. Three rows of luxury, available as the ultra-opulent Maybach GLS 600. Its cabin volume is enormous. Cardamom and Warm Amber fill it with an inviting, hotel-lobby warmth.",
      placement:
        "Second-row center console for maximum coverage, or rear armrest in the Maybach\u2019s four-seat configuration. The GLS\u2019s cabin needs central placement for even distribution.",
      cabin_size: "large",
      intensity_rec: 5,
      interior_notes:
        "The GLS 580\u2019s Exclusive Nappa leather and open-pore ash wood create a cabin that feels like a first-class airport lounge. Cardamom\u2019s warm spice adds depth without heaviness \u2014 inviting across cultures and personal preferences.",
      faq: [
        {
          question: "I have the Maybach GLS 600 \u2014 is one unit enough for the entire cabin?",
          answer:
            "The Maybach GLS\u2019s four-seat cabin is actually slightly smaller than the standard GLS three-row. One unit at intensity 4 covers the Maybach\u2019s rear lounge perfectly. For the standard seven-seat GLS, intensity 5 or two units.",
        },
        {
          question: "The GLS has three-zone climate control \u2014 does that help or hurt diffusion?",
          answer:
            "It helps. Active HVAC circulation distributes the nano-mist more evenly than natural convection alone. Each climate zone effectively becomes a scent distribution point.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-gls.jpg",
    },
    cla: {
      make: "Mercedes-Benz",
      model: "CLA",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Pink Pepper & Peony",
      description:
        "The CLA is how a younger generation enters Mercedes \u2014 a coupe-styled sedan that prioritizes design over practicality. Its buyers care about aesthetics and Instagram appeal. Pink Pepper and Peony deliver a modern, fashion-forward scent profile.",
      placement:
        "Center console cup holder. The CLA\u2019s compact console is tight but functional \u2014 the Autivara Drive\u2019s slim profile fits its cup holders with room to spare.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The CLA\u2019s turbine-style air vents and widescreen cockpit create a youthful interior. Pink Pepper adds a modern bite, while Peony provides a soft, luxurious base \u2014 sophisticated without being your parent\u2019s fragrance.",
      faq: [
        {
          question: "The CLA is my first luxury car \u2014 is the Autivara Drive worth it?",
          answer:
            "Especially on a CLA. At the entry point of luxury, every detail that elevates the experience matters more. The Autivara Drive transforms a $38K car\u2019s cabin into something that feels twice the price.",
        },
        {
          question: "The CLA cabin is tight \u2014 will scent be too intense?",
          answer:
            "The CLA has approximately 2.6 cubic meters of cabin volume \u2014 compact but not sports-car small. Intensity 2 provides noticeable fragrance without overwhelming. Start there and adjust up if you prefer stronger scent.",
        },
      ],
      hero_image: "/image/placeholder-mercedes-cla.jpg",
    },
    eqe: {
      make: "Mercedes-Benz",
      model: "EQE",
      year: "2024",
      interior_type: "Piano Black",
      scent_pairing: "Blue Lotus & Ozone",
      description:
        "The EQE is the electric E-Class \u2014 an executive EV sedan with a cab-forward design that creates more interior space than its ICE sibling. Its optional Hyperscreen and piano black surfaces demand a scent that feels futuristic and clean.",
      placement:
        "Center console cup holder forward of the armrest. The EQE\u2019s console follows the EQS architecture but in a slightly more compact package.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The EQE\u2019s optional Hyperscreen and piano black accents are fingerprint and water-spot magnets. The Autivara Drive\u2019s dry nano-mist is critical here \u2014 any wet diffuser would leave visible deposits within days.",
      faq: [
        {
          question: "How does the EQE compare to the EQS for the Autivara Drive?",
          answer:
            "The EQE has approximately 90% of the EQS\u2019s cabin volume but similar acoustic characteristics (near-silent). Same intensity recommendation, same placement. The scent experience is nearly identical.",
        },
        {
          question: "The EQE is a company car \u2014 will colleagues notice the scent?",
          answer:
            "At intensity 2-3, the scent is present but not assertive. Passengers notice something pleasant without being able to identify it as a deliberate fragrance. It reads as \"this person\u2019s car is always nice\" rather than \"this person uses an air freshener.\"",
        },
      ],
      hero_image: "/image/placeholder-mercedes-eqe.jpg",
    },
  },

  bmw: {
    m3: {
      make: "BMW",
      model: "M3",
      year: "2024",
      interior_type: "Carbon Fiber",
      scent_pairing: "Black Pepper & Cedar",
      description:
        "The G80 M3 cockpit is aggressive \u2014 carbon bucket seats, a flat-bottom wheel, and the smell of high-friction brakes after a spirited drive. The Autivara Drive adds a controlled olfactory layer without softening the experience.",
      placement:
        "The M3\u2019s shallow cup holders behind the iDrive controller are the optimal position. The carbon fiber console acts as a stable, vibration-dampened platform.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The M3\u2019s Merino leather and carbon fiber package creates a black-on-black cave. Cedar and pepper add a dry warmth that prevents the cabin from feeling sterile.",
      faq: [
        {
          question: "Will it fly out of the cup holder in an M3 on track?",
          answer:
            "Compact and lightweight, the Autivara Drive stays put through hard cornering thanks to its silicone base ring. For dedicated track use, the ring adds extra grip.",
        },
        {
          question: "Does BMW\u2019s Ambient Air package conflict with the Autivara Drive?",
          answer:
            "BMW Ambient Air uses a cartridge in the glovebox with a fan. You can run both, but we recommend turning Ambient Air off \u2014 its heat-based diffusion competes with cold-air nebulization.",
        },
      ],
      hero_image: "/image/placeholder-bmw-m3.jpg",
    },
    x5: {
      make: "BMW",
      model: "X5",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Fresh Linen & Sea Salt",
      description:
        "The X5 is the benchmark luxury SUV. It carries families, golf bags, and groceries. A clean, fresh scent profile keeps the cabin feeling new \u2014 neutralizing the reality of daily life without being clinical.",
      placement:
        "Front center console cup holder, closest to the HVAC vent. The X5\u2019s generous console gives the Autivara Drive a stable home with natural airflow assistance.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The X5\u2019s Vernasca leather in Cognac or Coffee is a warm backdrop. Fresh Linen & Sea Salt cuts through with brightness, preventing the cabin from feeling heavy or stuffy on warm days.",
      faq: [
        {
          question: "My dog rides in the back \u2014 will it help with pet odor?",
          answer:
            "The Autivara Drive doesn\u2019t eliminate odors \u2014 it layers fragrance over them. For pet owners, we recommend pairing with regular cabin filter changes. The Fresh Linen profile is specifically effective at creating a clean space perception even with a wet Lab in the cargo area.",
        },
        {
          question: "How do I clean the unit if it gets dirty?",
          answer:
            "The housing wipes clean with a damp microfiber cloth. The nebulizer element can be flushed with isopropyl alcohol every 6 months. No filters to replace.",
        },
      ],
      hero_image: "/image/placeholder-bmw-x5.jpg",
    },
    m5: {
      make: "BMW",
      model: "M5",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Tobacco & Tonka Bean",
      description:
        "The new M5 is a plug-in hybrid making 727 hp \u2014 a gentleman\u2019s express that can demolish a Nurburgring lap, then glide silently on electric power through your neighborhood. The scent should have the same duality: refined, but with bite.",
      placement:
        "Center console cup holder. The M5\u2019s wide console offers a stable platform, and the unit sits flush below the floating armrest cover.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The M5\u2019s Full Merino leather with contrast stitching is among BMW\u2019s finest hides. Tobacco and tonka complement the rich leather scent that develops in the first year of ownership.",
      faq: [
        {
          question: "Can I use it in EV mode without draining the car battery?",
          answer:
            "The Autivara Drive runs on its own internal battery \u2014 it draws zero power from your M5. No USB connection needed during operation.",
        },
        {
          question: "The new M5 is heavy (2,435 kg) \u2014 does the Autivara Drive add noticeable weight?",
          answer:
            "At 220 grams, the Autivara Drive adds 0.009% to the M5\u2019s curb weight. Your water bottle weighs more.",
        },
      ],
      hero_image: "/image/placeholder-bmw-m5.jpg",
    },
    "7-series": {
      make: "BMW",
      model: "7 Series",
      year: "2024",
      interior_type: "Wood Trim",
      scent_pairing: "Oud Rose & Ambergris",
      description:
        "The i7/7 Series Theatre Screen experience is about total sensory immersion. You\u2019ve got 8K rear entertainment, Bowers & Wilkins Diamond surround, and crystalline ambient lighting. Scent is the missing sensory layer.",
      placement:
        "Rear armrest cup holder for the executive rear-seat experience. The 7 Series rear cabin is where luxury is consumed \u2014 place the Autivara Drive where the passenger controls are.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The 7 Series Cashmere Wool trim and open-pore Fineline wood create a living-room atmosphere. Oud Rose adds a warm, enveloping richness that turns the rear cabin into a private lounge.",
      faq: [
        {
          question: "I have a chauffeur \u2014 can they control the intensity from the front?",
          answer:
            "The Autivara Drive is controlled by a single dial on the unit itself. There\u2019s no app or remote. Whoever is closest adjusts it. Simple by design.",
        },
        {
          question: "Does the BMW Theatre Screen backlight affect the unit?",
          answer:
            "No. The Autivara Drive has no light sensors or screens. It operates independently of all cabin electronics.",
        },
      ],
      hero_image: "/image/placeholder-bmw-7-series.jpg",
    },
    x7: {
      make: "BMW",
      model: "X7",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Eucalyptus & Mint",
      description:
        "The X7 is BMW\u2019s largest cabin \u2014 three rows, seven seats, and the volume to match. This is the car that needs scent coverage most and gets it least from clip-on air fresheners. The Autivara Drive\u2019s nebulization is designed for exactly this scale.",
      placement:
        "Second-row center console for maximum cabin coverage. The X7\u2019s optional second-row console has cup holders that position the Autivara Drive centrally in the vehicle\u2019s largest air volume.",
      cabin_size: "large",
      intensity_rec: 5,
      interior_notes:
        "The X7\u2019s extended Merino leather comes in lighter tones (Ivory White, Cashmere Beige). Eucalyptus and mint keep these bright interiors feeling crisp and alpine-fresh.",
      faq: [
        {
          question: "One unit for three rows \u2014 is that realistic?",
          answer:
            "At intensity 5, the Autivara Drive covers approximately 4 cubic meters \u2014 enough for the X7\u2019s cabin. Third-row passengers will notice a lighter scent. For full-cabin saturation, two units (front + second row) are ideal.",
        },
        {
          question: "How often will I need to refill with a cabin this large?",
          answer:
            "At max intensity in the X7, a 10ml oil refill lasts approximately 2 weeks of daily use. The larger cabin volume means more oil is nebulized per session.",
        },
      ],
      hero_image: "/image/placeholder-bmw-x7.jpg",
    },
    "3-series": {
      make: "BMW",
      model: "3 Series",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "White Tea & Ginger",
      description:
        "The 3 Series is the best-selling luxury car on the planet and the car that defined the sport sedan category. Millions are on the road. The Autivara Drive is how you make yours stand out \u2014 because when every third car in the parking garage is a 330i, the details matter.",
      placement:
        "Center console cup holder behind the iDrive dial. The G20 3 Series has a compact, driver-focused console that keeps the Autivara Drive within easy reach.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The 3 Series\u2019 SensaTec (leatherette) or Vernasca leather comes in warmer tones like Cognac and Tacora Red. White Tea and Ginger cut through with brightness \u2014 clean and modern without veering into air-freshener territory.",
      faq: [
        {
          question: "The 3 Series is everywhere \u2014 will the Autivara Drive make mine feel special?",
          answer:
            "That\u2019s exactly the point. Scent is the most personal, invisible differentiator. Your 3 Series looks like the others, but the moment someone opens the door, they know it\u2019s yours.",
        },
        {
          question: "I have the base SensaTec interior \u2014 does that matter?",
          answer:
            "SensaTec is actually better for fragrance diffusion than real leather. It has no competing scent of its own and doesn\u2019t absorb fragrance molecules. Your cabin stays scented longer.",
        },
        {
          question: "Does the B48 four-cylinder vibrate enough to affect the unit?",
          answer:
            "BMW\u2019s B48 is one of the smoothest four-cylinders made. At idle, cabin vibration is negligible. The Autivara Drive is stable in any 3 Series driving condition.",
        },
      ],
      hero_image: "/image/placeholder-bmw-3-series.jpg",
    },
    "4-series": {
      make: "BMW",
      model: "4 Series",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Dark Vanilla & Tonka",
      description:
        "The 4 Series Gran Coupe is the 3 Series for people who chose style over convention. The frameless doors, the sloping roofline, the controversial grille \u2014 it\u2019s a statement car. The scent should be equally distinctive.",
      placement:
        "Center console cup holder. The 4 Series shares its console architecture with the 3 Series \u2014 same cup-holder layout, same stable platform.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The 4 Series M Sport interior with Alcantara headliner and sport seats creates a darker, more cocooned atmosphere than the 3 Series. Dark Vanilla and Tonka add a warm sweetness that softens the black-on-black cave.",
      faq: [
        {
          question: "Is the 4 Series cabin different enough from the 3 Series to need a different scent?",
          answer:
            "The 4 Series coupe has a lower roofline and less glass area, creating a tighter cabin volume. This means scent concentrates faster. We recommend a warmer profile that complements the more intimate space.",
        },
        {
          question: "I have the M440i \u2014 does the inline-six affect anything?",
          answer:
            "The B58 inline-six is BMW\u2019s smoothest engine. Vibration is near-zero. If anything, the M440i\u2019s engine refinement makes the cabin quieter, which means you notice the Autivara Drive\u2019s subtle hum less.",
        },
      ],
      hero_image: "/image/placeholder-bmw-4-series.jpg",
    },
    x3: {
      make: "BMW",
      model: "X3",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Bergamot & White Sage",
      description:
        "The X3 is BMW\u2019s highest-volume model globally \u2014 a compact luxury SUV that handles school runs and mountain passes equally well. It\u2019s the car that pays BMW\u2019s bills. A clean, versatile scent keeps it feeling fresh through years of daily use.",
      placement:
        "Front center console cup holder. The X3\u2019s console is slightly wider than the 3 Series, giving the Autivara Drive a stable, rattle-free home.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The X3 M40i\u2019s Vernasca leather in Black or Oyster creates a premium but practical environment. Bergamot and White Sage are universally pleasant \u2014 no passenger has ever complained about citrus and herbs.",
      faq: [
        {
          question: "I use the X3 for everything \u2014 gym, groceries, kids. Will scent help?",
          answer:
            "The Autivara Drive doesn\u2019t neutralize odors, but it creates a consistent olfactory baseline. Your X3 will always smell intentional, even after a gym bag has been in the back.",
        },
        {
          question: "The new X3 has a panoramic roof \u2014 does sun exposure matter?",
          answer:
            "The Autivara Drive is rated to 60\u00B0C. Under a panoramic roof in direct sun, cup holder temperatures rarely exceed 50\u00B0C. No risk to the unit or the oil.",
        },
      ],
      hero_image: "/image/placeholder-bmw-x3.jpg",
    },
    x6: {
      make: "BMW",
      model: "X6",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Black Orchid & Suede",
      description:
        "The X6 is the coupe-SUV that started the segment BMW invented. It\u2019s polarizing by design \u2014 you either love it or you don\u2019t. Black Orchid and Suede match this energy: bold, dark, and unapologetically dramatic.",
      placement:
        "Center console cup holder. The X6\u2019s console is identical to the X5 but the sloping roofline creates a slightly smaller cabin volume, concentrating scent more effectively.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The X6 M Competition\u2019s Merino leather in Ametrin/Black or Silverstone is often spec\u2019d with the full carbon fiber package. Black Orchid adds an exotic depth that matches the car\u2019s provocative styling.",
      faq: [
        {
          question: "The X6 has less cargo room than the X5 \u2014 does that affect scent?",
          answer:
            "Less cargo volume actually means less total cabin air. The X6\u2019s sloping roofline creates approximately 10% less volume than the X5. This means scent fills faster and holds longer at the same intensity setting.",
        },
        {
          question: "I chose the X6 over the X5 because I like bold choices. Is Black Orchid bold enough?",
          answer:
            "Black Orchid is Tom Ford\u2019s most famous note for a reason \u2014 it\u2019s rich, dark, and memorable. Paired with suede, it creates a cabin that smells as intentional as your choice to buy the X6 over the X5.",
        },
      ],
      hero_image: "/image/placeholder-bmw-x6.jpg",
    },
    ix: {
      make: "BMW",
      model: "iX",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Frozen Pear & Bamboo Leaf",
      description:
        "The iX is BMW\u2019s electric flagship SUV \u2014 a rolling tech showcase with crystal iDrive controls, sustainable materials, and a cabin designed to feel like a Scandinavian living room. The silence demands a scent that feels intentional and modern.",
      placement:
        "Center console open storage shelf or cup holder. The iX\u2019s minimalist, floating console with its crystalline gear selector makes the Autivara Drive look like it\u2019s part of the interior design.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The iX offers olive-tanned leather processed with zero chrome and optional Microfiber/Wool upholstery. These sustainable materials have almost no scent. Frozen Pear and Bamboo Leaf fill this void with a clean, nature-inspired freshness.",
      faq: [
        {
          question: "The iX has a massive cabin and no engine noise \u2014 does scent feel different in an EV?",
          answer:
            "Dramatically so. Without exhaust fumes, engine heat, or vibration, your sense of smell sharpens in an EV cabin. Scent becomes the dominant sensory experience. EV owners consistently rate fragrance as more impactful than ICE owners.",
        },
        {
          question: "The iX has sustainable olive-tanned leather \u2014 is the Autivara Drive eco-friendly?",
          answer:
            "Recyclable housing, natural essential oils, a rechargeable battery, and zero disposable cartridges \u2014 the Autivara Drive aligns with the iX\u2019s sustainability-focused design philosophy.",
        },
      ],
      hero_image: "/image/placeholder-bmw-ix.jpg",
    },
    i4: {
      make: "BMW",
      model: "i4",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Lime Blossom & Cedarwood",
      description:
        "The i4 is BMW\u2019s electric gran coupe \u2014 the EV for driving enthusiasts. It shares its shell with the 4 Series but its electric powertrain creates a fundamentally different cabin experience. Silent, smooth, and scentless. The Autivara Drive provides what the powertrain can\u2019t: character.",
      placement:
        "Center console cup holder. The i4 shares the 4 Series console layout \u2014 same cup holders, same stable platform, but with an EV\u2019s vibration-free environment.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The i4 M50\u2019s sport seats with contrast stitching and the curved display create a tech-forward cabin. Lime Blossom adds citrus brightness while Cedarwood grounds it \u2014 modern and energetic without being synthetic.",
      faq: [
        {
          question: "The i4 and 4 Series look the same inside \u2014 why different scent pairings?",
          answer:
            "The 4 Series has engine scent, exhaust trace, and mechanical character bleeding into the cabin. The i4 has none of that \u2014 it\u2019s a blank slate. The scent pairing accounts for this neutrality with a brighter, more forward-leaning profile.",
        },
        {
          question: "Does the i4\u2019s regenerative braking affect the unit?",
          answer:
            "Regenerative braking creates deceleration forces, not vibration. The Autivara Drive is unaffected. Even one-pedal driving in Max Regen mode produces smooth, predictable forces that the unit handles effortlessly.",
        },
      ],
      hero_image: "/image/placeholder-bmw-i4.jpg",
    },
  },

  audi: {
    rs6: {
      make: "Audi",
      model: "RS6 Avant",
      year: "2024",
      interior_type: "Alcantara",
      scent_pairing: "Dark Roast & Vanilla",
      description:
        "The RS6 Avant is the wolf in sheep\u2019s clothing \u2014 a family estate with 621 hp. Its owners appreciate things that are understated but extraordinary. The scent profile should follow the same philosophy.",
      placement:
        "Front center console behind the MMI controller. The RS6\u2019s deep console well keeps the Autivara Drive hidden below the sightline.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The RS6 interior features flat-bottom steering wheels, honeycomb Alcantara seats, and dark headlining. Dark Roast & Vanilla adds warmth to this driver-focused, technical cabin.",
      faq: [
        {
          question: "Audi has a fragrance system \u2014 is this better?",
          answer:
            "Audi\u2019s optional Singleframe fragrance dispenser uses passive evaporation with four fixed scents. The Autivara Drive actively nebulizes any oil you choose, offering more consistent output and unlimited variety.",
        },
        {
          question: "Will it work in the Avant cargo area for dogs?",
          answer:
            "The Autivara Drive is designed for cup holder placement. For cargo-area scenting, you\u2019d need to secure it in a stable position. Intensity 4-5 from the front console does reach the rear cargo area in the Avant body.",
        },
      ],
      hero_image: "/image/placeholder-audi-rs6.jpg",
    },
    q8: {
      make: "Audi",
      model: "Q8",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Blackcurrant & Suede",
      description:
        "The Q8 is Audi\u2019s flagship coupe-SUV \u2014 style over utility. Its sloping roofline creates a more intimate cabin volume than the Q7, and its Valcona leather interior begs for a scent that\u2019s as premium as the materials.",
      placement:
        "Front console cup holder. The Q8\u2019s dual-screen MMI Touch Response system means the console is clean and uncluttered \u2014 the Autivara Drive fits the minimalist aesthetic.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "Valcona leather in the Q8 is Audi\u2019s finest grain hide. Blackcurrant adds a rich, fruity darkness that ages well with the leather over time \u2014 both improve with wear.",
      faq: [
        {
          question: "The Q8 has dual touchscreens \u2014 will mist land on them?",
          answer:
            "The Autivara Drive\u2019s nano-mist particles are 1-5 microns \u2014 they remain airborne and dissipate. Unlike ultrasonic humidifiers, there is no visible mist and no surface deposits.",
        },
        {
          question: "Will this void any Audi warranty?",
          answer:
            "No. The Autivara Drive is a standalone, battery-powered device that makes no electrical or physical connection to your vehicle. It sits in a cup holder like a coffee tumbler.",
        },
      ],
      hero_image: "/image/placeholder-audi-q8.jpg",
    },
    "e-tron-gt": {
      make: "Audi",
      model: "e-tron GT",
      year: "2024",
      interior_type: "Alcantara",
      scent_pairing: "Green Tea & Bamboo",
      description:
        "Audi\u2019s electric grand tourer shares its platform with the Porsche Taycan but wraps it in Audi\u2019s cooler, more restrained design language. The cabin is sustainably trimmed with recycled Dinamica \u2014 scent should match this clean-tech ethos.",
      placement:
        "Center console cup holder. The e-tron GT\u2019s console is narrow and focused \u2014 the Autivara Drive\u2019s slim cylinder matches the console\u2019s proportions.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The e-tron GT\u2019s use of recycled polyester, Dinamica microfiber, and optional Kaskade-trimmed upholstery means the cabin has almost no natural scent. Green Tea and Bamboo provide a fresh, neutral base that feels aligned with the car\u2019s sustainability narrative.",
      faq: [
        {
          question: "Does the Autivara Drive align with sustainable values?",
          answer:
            "The housing is recyclable and the oils are natural essential-oil blends. The rechargeable battery is built to last, with no disposable cartridges and no plastic waste.",
        },
        {
          question: "Can I charge it from the e-tron GT while driving?",
          answer:
            "Yes \u2014 plug into any USB-C port. The e-tron GT has a 27W USB-C in the console. The Autivara Drive draws under 5W during operation, so it won\u2019t affect your EV range.",
        },
      ],
      hero_image: "/image/placeholder-audi-e-tron-gt.jpg",
    },
    a7: {
      make: "Audi",
      model: "A7",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Lavender & Amber",
      description:
        "The A7 Sportback is the thinking person\u2019s luxury car \u2014 understated, aerodynamic, and quietly competent. Its owners chose subtlety over flash. The scent profile should do the same.",
      placement:
        "Front console cup holder between the dual MMI screens. The A7\u2019s sleek center tunnel keeps the Autivara Drive low and invisible from the outside.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The A7\u2019s interior in Okapi Brown or Rock Grey leather creates a warm, neutral backdrop. Lavender and Amber sit perfectly in this mid-tone environment \u2014 calming without being sleepy.",
      faq: [
        {
          question: "I commute 2+ hours daily \u2014 will the battery last the week?",
          answer:
            "At a moderate intensity, a single charge covers a typical week of daily commutes. A Friday overnight charge keeps you running all week.",
        },
        {
          question: "The Sportback has a large glass roof \u2014 does heat affect performance?",
          answer:
            "Direct sunlight is fine \u2014 the Autivara Drive runs heat-free and the sealed oil reservoir prevents evaporation, even in a warm cabin.",
        },
      ],
      hero_image: "/image/placeholder-audi-a7.jpg",
    },
    a4: {
      make: "Audi",
      model: "A4",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Bergamot & White Musk",
      description:
        "The A4 is the entry point to Audi luxury \u2014 millions sold, universally respected. Its cabin is refined but restrained, a daily companion for professionals who value precision without pretension. Scent should match: clean, confident, never loud.",
      placement:
        "Front center console cup holder between the gear selector and armrest. The A4\u2019s compact console keeps the Autivara Drive low-profile and accessible for quick intensity changes during your commute.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The A4\u2019s standard Milano leather in Atlas Beige or Black creates a neutral olfactory canvas. Bergamot lifts the space with citrus brightness while White Musk adds a soft, skin-like warmth that mirrors the leather\u2019s own character.",
      faq: [
        {
          question: "The A4 is my daily \u2014 will I go nose-blind to the scent?",
          answer:
            "Olfactory fatigue is real, but the Autivara Drive\u2019s nebulization pattern pulses subtly rather than running continuously. This variation prevents full adaptation. Switching scent oils every 4-6 weeks also keeps things fresh.",
        },
        {
          question: "Does the A4 cup holder fit the Autivara Drive?",
          answer:
            "The Autivara Drive sits comfortably in the A4\u2019s cup holders, with the silicone base ring preventing any rattle or movement, even on rough roads.",
        },
        {
          question: "I have the virtual cockpit \u2014 will mist obscure the digital gauges?",
          answer:
            "No. The Autivara Drive\u2019s nano-mist particles are 1-5 microns and remain airborne. There is no visible mist plume. Your Virtual Cockpit display stays crystal clear.",
        },
      ],
      hero_image: "/image/placeholder-audi-a4.jpg",
    },
    a6: {
      make: "Audi",
      model: "A6",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Oud & Saffron",
      description:
        "The A6 sits in the executive sweet spot \u2014 big enough for rear-seat passengers, composed enough for autobahn hours. Its owners are often chauffeured or spend long stretches behind the wheel. Scent should be rich, layered, and worthy of extended exposure.",
      placement:
        "Front or rear center console cup holder. The A6\u2019s generous console accommodates the Autivara Drive in either position, making it ideal for owner-drivers and rear-seat executives alike.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The A6\u2019s Valcona leather and open-pore wood inlays create a cabin that feels more boardroom than cockpit. Oud and Saffron introduce an opulent depth that elevates the space from corporate to distinguished.",
      faq: [
        {
          question: "I spend 3+ hours daily in the A6 \u2014 is Oud too heavy for long sessions?",
          answer:
            "At intensity 3, the Oud & Saffron blend is present but not oppressive. The saffron\u2019s brightness prevents the oud from becoming cloying. For lighter days, dial down to 2 \u2014 the fragrance still reads but sits further back.",
        },
        {
          question: "Will rear passengers benefit from the scent?",
          answer:
            "At intensity 3 from the front console, scent reaches the rear cabin within 2-3 minutes. For immediate rear coverage, place the Autivara Drive in the rear armrest cup holder and set to intensity 2.",
        },
      ],
      hero_image: "/image/placeholder-audi-a6.jpg",
    },
    q5: {
      make: "Audi",
      model: "Q5",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Cedar & Wild Sage",
      description:
        "The Q5 is Audi\u2019s best-selling vehicle worldwide \u2014 the one that pays the bills. It\u2019s the family car, the school run SUV, the weekend adventure vehicle. Its cabin handles every context, and the scent should be equally versatile.",
      placement:
        "Center console cup holder. The Q5\u2019s elevated seating position means the Autivara Drive sits at the perfect height for natural scent dispersion across the dashboard and into the rear cabin.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Q5\u2019s interior blends brushed aluminum, leather, and optional wood or carbon inlays. Cedar and Wild Sage create a grounding, outdoorsy scent that works as well on a Monday commute as a Saturday trail-head drive.",
      faq: [
        {
          question: "The Q5 hauls kids and groceries \u2014 will the Autivara Drive compete with real-life smells?",
          answer:
            "The Autivara Drive layers scent over ambient odors rather than eliminating them. At intensity 3-4, Cedar and Sage provide a strong enough botanical presence to reframe the cabin\u2019s olfactory environment within 90 seconds.",
        },
        {
          question: "Is the scent safe around children?",
          answer:
            "All Autivara scent oils are IFRA-compliant essential oil blends \u2014 no synthetic aldehydes, no phthalates, no parabens. The cold-mist nebulization produces no heat and no combustion byproducts. Safe for all passengers.",
        },
        {
          question: "Can I switch scents for different occasions?",
          answer:
            "Absolutely. Swap scent capsules in under 10 seconds. Many Q5 owners keep Cedar & Wild Sage for weekdays and switch to something richer on weekends. The reservoir purges cleanly between oils.",
        },
      ],
      hero_image: "/image/placeholder-audi-q5.jpg",
    },
    q7: {
      make: "Audi",
      model: "Q7",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Tobacco Leaf & Honey",
      description:
        "The Q7 is Audi\u2019s three-row family flagship \u2014 a proper seven-seater with the refinement of a sedan. Its cavernous cabin needs a scent with enough presence to fill the space without becoming overwhelming for rear-row passengers.",
      placement:
        "Front center console cup holder for primary diffusion. The Q7\u2019s large cabin volume benefits from the elevated console position, allowing scent to cascade naturally toward second and third-row seats.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The Q7\u2019s Valcona leather and brushed aluminum create a restrained luxury atmosphere. Tobacco Leaf and Honey add a nostalgic warmth \u2014 think gentleman\u2019s library, not cigar lounge. The honey smooths the tobacco\u2019s edges for family-friendly richness.",
      faq: [
        {
          question: "Will the scent reach the third row?",
          answer:
            "At intensity 4-5, nebulized scent reaches the Q7\u2019s third row within 4-5 minutes with climate control on recirculate. For faster coverage, run the climate system on recirculate mode for the first few minutes.",
        },
        {
          question: "Seven passengers means seven opinions \u2014 what if someone dislikes the scent?",
          answer:
            "The Autivara Drive has a single-twist off function. One quick turn and diffusion stops immediately. The cabin clears naturally within 8-10 minutes with windows closed, or 2 minutes with a window cracked.",
        },
      ],
      hero_image: "/image/placeholder-audi-q7.jpg",
    },
    q3: {
      make: "Audi",
      model: "Q3",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Lime Blossom & White Cedar",
      description:
        "The Q3 is Audi\u2019s entry SUV \u2014 compact, urban, and nimble. Its cabin is smaller than the Q5 but still unmistakably Audi in fit and finish. A lighter, brighter scent profile suits the Q3\u2019s youthful energy and city-centric lifestyle.",
      placement:
        "Center console cup holder. The Q3\u2019s compact console puts the Autivara Drive within easy reach, and the smaller cabin volume means lower intensity settings deliver full coverage.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The Q3\u2019s interior mixes sport cloth with leather bolsters and piano black trim accents. Lime Blossom\u2019s citrus effervescence and White Cedar\u2019s clean warmth create a youthful, gender-neutral scent that matches the Q3\u2019s approachable personality.",
      faq: [
        {
          question: "The Q3 cabin is small \u2014 will scent be too intense?",
          answer:
            "The Q3\u2019s cabin volume is approximately 2.6 cubic meters. At intensity 2, the Autivara Drive produces a gentle, barely-there presence. Start at 1 and increase to taste \u2014 you can always dial up, but you can\u2019t un-scent a small cabin quickly.",
        },
        {
          question: "I park in a city garage \u2014 does it auto-off when I leave?",
          answer:
            "Switch the Autivara Drive off when you park, or leave it running between drives \u2014 it draws very little oil or power either way. No wasted oil, no dead battery.",
        },
        {
          question: "Is the Q3 cup holder compatible?",
          answer:
            "The Autivara Drive fits the Q3\u2019s cup holders neatly, with the silicone base ring providing grip and vibration dampening on urban roads.",
        },
      ],
      hero_image: "/image/placeholder-audi-q3.jpg",
    },
  },

  lexus: {
    lc500: {
      make: "Lexus",
      model: "LC 500",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Cherry Blossom & Yuzu",
      description:
        "The LC 500 is rolling sculpture \u2014 handcrafted by Takumi master craftspeople. Its naturally aspirated V8 and bespoke interior demand a scent that honors Japanese attention to detail.",
      placement:
        "The LC\u2019s single front cup holder behind the console bridge. The intimate 2+2 cockpit means one unit provides complete coverage at low intensity.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The LC 500\u2019s hand-pleated door panel leather (Toasted Caramel or Breezy Blue) is some of the finest interior leatherwork in any production car. Cherry blossom and yuzu are a deliberate nod to the car\u2019s Aichi Prefecture birthplace.",
      faq: [
        {
          question: "The LC 500 V8 is already an experience \u2014 will scent distract?",
          answer:
            "At intensity 2, the Cherry Blossom profile is barely perceptible \u2014 it operates in the background, adding a subtle sweetness that you notice only when it\u2019s absent.",
        },
        {
          question: "Is the Autivara Drive design worthy of the LC\u2019s interior?",
          answer:
            "The Autivara Drive\u2019s clean, satin-finish cylinder was designed with exactly this context in mind. No plastic, no chrome, no branding visible during use. It looks like it belongs in a Lexus.",
        },
      ],
      hero_image: "/image/placeholder-lexus-lc500.jpg",
    },
    lx600: {
      make: "Lexus",
      model: "LX 600",
      year: "2024",
      interior_type: "Wood Trim",
      scent_pairing: "Hinoki Wood & Jasmine",
      description:
        "The LX 600 Ultra Luxury with its rear Executive seating is Lexus\u2019s answer to the Range Rover. Its Japanese approach to luxury \u2014 omotenashi \u2014 means every detail serves the guest. Scent is part of hospitality.",
      placement:
        "Rear center console in the Ultra Luxury 4-seat configuration. The LX\u2019s rear console has integrated cup holders that keep the Autivara Drive perfectly positioned for rear-seat passengers.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The LX 600\u2019s Art Wood trim made from actual thinly sliced wood creates a warm, natural cabin atmosphere. Hinoki (Japanese cypress) is the traditional scent of Japanese luxury \u2014 used in onsen baths and temple architecture.",
      faq: [
        {
          question: "The LX 600 goes off-road \u2014 will dust affect the nebulizer?",
          answer:
            "The oil reservoir is sealed and the nebulizer element is recessed. Light trail dust is not a concern. For heavy off-road use (sand dunes, Moab), we recommend capping the unit when not in use.",
        },
        {
          question: "Does Hinoki oil stain wood trim?",
          answer:
            "The Autivara Drive produces dry nano-mist \u2014 no liquid droplets reach surfaces. Your Art Wood trim is safe. This is a key advantage over reed diffusers or oil-based air fresheners that can drip.",
        },
      ],
      hero_image: "/image/placeholder-lexus-lx600.jpg",
    },
    is500: {
      make: "Lexus",
      model: "IS 500",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Yuzu & Black Tea",
      description:
        "The IS 500 is the last naturally aspirated V8 sport sedan \u2014 a future classic. Its compact cockpit and visceral engine note create an analog driving experience. Scent should feel equally authentic and unprocessed.",
      placement:
        "Center console cup holder. The IS\u2019s narrow console means the Autivara Drive is always within reach for quick intensity adjustments.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The IS 500\u2019s F Sport Performance interior features NuLuxe synthetic leather \u2014 durable and scent-neutral. Yuzu and Black Tea provide the brightness and depth that the NuLuxe surfaces don\u2019t naturally offer.",
      faq: [
        {
          question: "Is the IS 500 cup holder big enough?",
          answer:
            "The Autivara Drive fits the Lexus IS cup holders comfortably \u2014 snug, stable, and rattle-free.",
        },
        {
          question: "I rev the V8 hard \u2014 any vibration concerns?",
          answer:
            "The 5.0L 2UR-GSE is silky-smooth even at 7,100 RPM redline. The Autivara Drive handles far harsher vibration environments. Zero concerns in any Lexus application.",
        },
      ],
      hero_image: "/image/placeholder-lexus-is500.jpg",
    },
    rx: {
      make: "Lexus",
      model: "RX",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "White Peach & Matcha",
      description:
        "The RX is the car that built Lexus \u2014 the best-selling model in the lineup for over two decades. Its owners chose reliability and quiet luxury. The cabin is a serene cocoon, and the scent profile should deepen that sense of effortless calm.",
      placement:
        "Center console cup holder behind the electronic gear selector. The RX\u2019s wide console provides a stable, low-profile home for the Autivara Drive with easy access to the intensity dial.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The RX\u2019s semi-aniline leather in Palomino or Black creates a plush, cushioned environment. White Peach adds a delicate fruit sweetness while Matcha introduces an earthy Japanese depth \u2014 a nod to the RX\u2019s Kyushu assembly plant.",
      faq: [
        {
          question: "The RX is whisper-quiet \u2014 will I hear the Autivara Drive?",
          answer:
            "The Autivara Drive operates at 18dB \u2014 quieter than breathing. In the RX\u2019s library-silent cabin with its acoustic glass, the unit is completely inaudible. You\u2019ll smell it long before you\u2019d ever hear it.",
        },
        {
          question: "I lease my RX \u2014 will the scent affect residual value?",
          answer:
            "The Autivara Drive\u2019s dry nano-mist leaves zero residue on surfaces. Unlike hanging air fresheners or vent clips that can stain or leave adhesive marks, the Autivara Drive is completely non-invasive. Remove it at lease-end with no trace.",
        },
        {
          question: "Does the Mark Levinson sound system cause interference?",
          answer:
            "None whatsoever. The Autivara Drive has no electromagnetic emissions that would affect audio equipment. Your 21-speaker Mark Levinson system operates undisturbed.",
        },
      ],
      hero_image: "/image/placeholder-lexus-rx.jpg",
    },
    nx: {
      make: "Lexus",
      model: "NX",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Ginger & Sandalwood",
      description:
        "The NX is Lexus\u2019s compact luxury SUV \u2014 the gateway drug to the brand. Sharp, modern, and tech-forward with the new Tazuna cockpit philosophy. Its owners are younger and more design-conscious than the RX crowd. Scent should feel contemporary and energetic.",
      placement:
        "Center console cup holder. The NX\u2019s driver-oriented Tazuna cockpit wraps controls toward the driver, and the Autivara Drive sits naturally in this focused ergonomic zone.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The NX\u2019s interior features NuLuxe or semi-aniline leather with ambient lighting and a large 14-inch touchscreen. Ginger adds a spicy, invigorating top note while Sandalwood provides a creamy, meditative base \u2014 energizing for morning commutes, calming for evening drives.",
      faq: [
        {
          question: "The NX 450h+ is a plug-in hybrid \u2014 does the EV mode affect scent?",
          answer:
            "EV mode eliminates engine vibration and noise, making the scent experience even more immersive. Without the sensory distraction of an engine, your olfactory awareness actually increases. The NX 450h+ is arguably the best NX for the Autivara Drive.",
        },
        {
          question: "Will it fit the NX cup holder with a phone mount nearby?",
          answer:
            "The NX has two front cup holders. The Autivara Drive occupies one comfortably, leaving the second free for a drink. No interference with phone mounts or wireless charger placement.",
        },
      ],
      hero_image: "/image/placeholder-lexus-nx.jpg",
    },
    es: {
      make: "Lexus",
      model: "ES",
      year: "2024",
      interior_type: "Wood Trim",
      scent_pairing: "Osmanthus & Silk Musk",
      description:
        "The ES is Lexus\u2019s comfort-first sedan \u2014 softer, quieter, and more cosseting than the IS. It floats over roads rather than attacking them. Its owners prioritize serenity above all else. The scent should feel like a warm, luxurious whisper.",
      placement:
        "Center console cup holder adjacent to the bamboo or shimamoku wood trim. The ES\u2019s wide, flat console creates an elegant surface that the Autivara Drive\u2019s cylindrical form complements beautifully.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The ES\u2019s Shimamoku wood trim and hand-stitched leather create one of the most serene interiors in its class. Osmanthus \u2014 a flower prized in Japanese and Chinese luxury perfumery \u2014 adds a honeyed floral sweetness, while Silk Musk provides an intimate, skin-like softness.",
      faq: [
        {
          question: "The ES is my retirement car \u2014 I want something subtle. How low can intensity go?",
          answer:
            "Intensity 1 is barely perceptible \u2014 a faint impression rather than a distinct scent. In the ES\u2019s medium cabin, level 1-2 creates exactly the kind of ambient, subliminal fragrance that enhances without announcing itself.",
        },
        {
          question: "I drive with the windows up and climate on recirculate \u2014 will scent build up?",
          answer:
            "On recirculate mode, scent concentration does increase over time. The Autivara Drive\u2019s pulsing nebulization pattern accounts for this. At intensity 3, the cabin reaches a pleasant equilibrium within 5 minutes and holds steady.",
        },
      ],
      hero_image: "/image/placeholder-lexus-es.jpg",
    },
    gx: {
      make: "Lexus",
      model: "GX",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Camphor & Dark Amber",
      description:
        "The all-new GX is a body-on-frame luxury SUV built on the same platform as the Land Cruiser. It goes places most luxury SUVs only pretend to go. Its cabin bridges the gap between trail-ready durability and Lexus refinement \u2014 scent should do the same.",
      placement:
        "Center console cup holder. The GX\u2019s elevated, truck-based console places the Autivara Drive at an ideal height for scent to fill the tall cabin. The deep cup holder wells keep the unit secure on rough terrain.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The 2024 GX\u2019s redesigned interior features premium leather, open-pore wood, and a rugged-luxe aesthetic. Camphor adds a bracing, mentholated clarity associated with Japanese medicinal traditions, while Dark Amber grounds the scent with warmth and depth suitable for the GX\u2019s commanding presence.",
      faq: [
        {
          question: "I take the GX on serious off-road trails \u2014 will the Autivara Drive survive?",
          answer:
            "The Autivara Drive is solidly built with a sealed oil reservoir. It handles vibration, angles, and jolts that would destroy a traditional diffuser. Secure it in the cup holder and the silicone base ring prevents any movement.",
        },
        {
          question: "The GX has a three-row cabin \u2014 can one unit scent the whole space?",
          answer:
            "At intensity 4-5, the Autivara Drive effectively scents the GX\u2019s full three-row cabin within 5 minutes. Running climate control on recirculate accelerates distribution. For dedicated third-row scenting, a second unit in the rear is ideal.",
        },
        {
          question: "Camphor sounds medicinal \u2014 is it pleasant?",
          answer:
            "Our Camphor blend is far subtler than pure camphor oil. It\u2019s a refined, aromatic note \u2014 think Japanese forest air, not a medicine cabinet. Paired with Dark Amber\u2019s sweetness, the result is adventurous and sophisticated, perfect for the GX\u2019s dual personality.",
        },
      ],
      hero_image: "/image/placeholder-lexus-gx.jpg",
    },
  },

  "land-rover": {
    "range-rover": {
      make: "Land Rover",
      model: "Range Rover",
      year: "2024",
      interior_type: "Wood Trim",
      scent_pairing: "English Oak & Hazelnut",
      description:
        "The Range Rover is British luxury distilled into an SUV. Its cabin is a living room on wheels \u2014 and like any great room, it should have a signature scent. Oak and hazelnut ground the experience in the English countryside.",
      placement:
        "Center console cup holder or rear armrest in the SV long-wheelbase. The Range Rover\u2019s floating console has wide, deep cup holders that cradle the Autivara Drive securely.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The Range Rover\u2019s pore-painted semi-aniline leather and real wood veneers create a warm, old-money atmosphere. English Oak reinforces this heritage without veering into parody.",
      faq: [
        {
          question: "Can the cabin air purification system filter out the scent?",
          answer:
            "The PM2.5 filtration targets particulates, not gaseous fragrance molecules. The Autivara Drive\u2019s essential oil vapor passes through cabin air filters just like any ambient scent would. Purification and fragrance coexist.",
        },
        {
          question: "I wade through rivers \u2014 any water damage risk?",
          answer:
            "The Autivara Drive is not waterproof, but it is splash-resistant. During a river crossing, the unit sits in a cup holder well above the cabin floor. Water would need to reach console height to be a risk.",
        },
      ],
      hero_image: "/image/placeholder-range-rover.jpg",
    },
    "range-rover-sport": {
      make: "Land Rover",
      model: "Range Rover Sport",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Juniper & Sea Moss",
      description:
        "The Range Rover Sport is the dynamic choice \u2014 faster, sharper, and more road-focused than the full-size. Its cabin skews sportier with more black finishes. A brighter, more energetic scent profile matches this positioning.",
      placement:
        "Center console cup holder. The Sport\u2019s console is tighter than the full-size \u2014 the Autivara Drive fits perfectly and sits below the driver\u2019s sightline.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Sport\u2019s Windsor leather and Suedecloth headlining create a darker, more cocooned feel than the full-size. Juniper and Sea Moss add an Atlantic freshness that opens up the space.",
      faq: [
        {
          question: "Does the Sport need less intensity than the full-size Range Rover?",
          answer:
            "Yes. The Sport\u2019s cabin is approximately 15% smaller by volume. We recommend intensity 3 vs. intensity 4 for the full-size Range Rover.",
        },
        {
          question: "I use Terrain Response a lot \u2014 does drive mode matter?",
          answer:
            "Drive modes affect throttle, suspension, and traction \u2014 not your cup holder. The Autivara Drive operates identically in Comfort, Dynamic, or Off-Road mode.",
        },
      ],
      hero_image: "/image/placeholder-range-rover-sport.jpg",
    },
    defender: {
      make: "Land Rover",
      model: "Defender",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Pine Needle & Smoke",
      description:
        "The Defender is built for the wild \u2014 muddy boots, wet dogs, and open air. Its cabin is rugged and utilitarian. Scent is what separates \"my car smells like wet dog\" from \"my car smells like a Scottish hunting lodge.\"",
      placement:
        "Center console cup holder. The Defender\u2019s exposed-bolt, utilitarian aesthetic means the Autivara Drive\u2019s clean industrial form fits right in \u2014 it looks like it was designed for this car.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The Defender\u2019s Robustec material and Resist leather are designed to be hosed down. This is the one cabin where a traditional air freshener would be overwhelmed. The Autivara Drive\u2019s active nebulization competes with strong ambient odors in a way passive products cannot.",
      faq: [
        {
          question: "Can it handle the smell of a muddy Defender after a trail day?",
          answer:
            "The Autivara Drive won\u2019t eliminate odors \u2014 it layers over them. At intensity 5, Pine Needle & Smoke creates a strong enough presence to transform the olfactory experience. Pair with open windows for the first 5 minutes.",
        },
        {
          question: "Is it too premium for a Defender?",
          answer:
            "The new Defender 130 V8 starts at $115,500. It\u2019s a luxury vehicle that gets dirty. The Autivara Drive matches this luxury-meets-utility philosophy exactly.",
        },
      ],
      hero_image: "/image/placeholder-defender.jpg",
    },
  },

  ferrari: {
    roma: {
      make: "Ferrari",
      model: "Roma",
      year: "2023",
      interior_type: "Leather",
      scent_pairing: "Tuscan Leather & Fig",
      description:
        "La Nuova Dolce Vita. The Roma is Ferrari\u2019s most elegant GT \u2014 restrained, beautiful, and designed for long Mediterranean drives. Its scent should evoke sun-warmed leather, coastal figs, and the Italian countryside.",
      placement:
        "The Roma\u2019s center console bridge has a small storage area and cup holder. The cockpit is snug \u2014 one unit at low intensity creates a complete scent environment.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "Ferrari\u2019s Poltrona Frau leather is among the finest in any car. It develops a rich patina over time. Tuscan Leather scent deepens this effect \u2014 your Roma will smell like a vintage Ferrari after the first month.",
      faq: [
        {
          question: "Ferrari interiors cost $30K+ to spec \u2014 is the Autivara Drive safe?",
          answer:
            "Absolutely. No liquid, no heat, no dye, no residue. The silicone base ring prevents any metal contact with surfaces. We designed the product for exactly this level of interior.",
        },
        {
          question: "Will Ferrari dealers object to aftermarket accessories?",
          answer:
            "The Autivara Drive sits in a cup holder. It makes no modification to the vehicle. It\u2019s no different from placing a water bottle in your Roma. Zero warranty implications.",
        },
      ],
      hero_image: "/image/placeholder-ferrari-roma.jpg",
    },
  },

  lamborghini: {
    urus: {
      make: "Lamborghini",
      model: "Urus",
      year: "2024",
      interior_type: "Alcantara",
      scent_pairing: "Spicy Ginger & Saffron",
      description:
        "The Urus is a 657 hp super-SUV driven daily by people who want to be noticed. Its interior is loud \u2014 hexagonal stitching, fighter-jet start button, Y-shaped design language everywhere. The scent should be equally unapologetic.",
      placement:
        "Center console cup holder between the seats. The Urus has surprisingly generous cup holders for a Lamborghini, and the wide console provides excellent stability.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Urus Performante\u2019s Alcantara and carbon fiber interior is dark and aggressive. Saffron adds an exotic warmth that matches the car\u2019s Middle-Eastern and Asian market appeal.",
      faq: [
        {
          question: "Does the Urus have cup holders?",
          answer:
            "Yes \u2014 surprisingly good ones. The Urus is Lamborghini\u2019s daily driver and has a proper center console with two full-size cup holders. The Autivara Drive fits easily.",
        },
        {
          question: "I want my Urus to smell as bold as it looks \u2014 max intensity?",
          answer:
            "The Urus cabin is approximately 3.2 cubic meters. Intensity 3-4 creates a strong, immersive experience. Level 5 in this space would be overwhelming \u2014 save it for the garage.",
        },
      ],
      hero_image: "/image/placeholder-lamborghini-urus.jpg",
    },
  },

  bentley: {
    "continental-gt": {
      make: "Bentley",
      model: "Continental GT",
      year: "2024",
      interior_type: "Wood Trim",
      scent_pairing: "Mahogany & Cognac",
      description:
        "Crewe\u2019s finest \u2014 4,000 hand stitches in every steering wheel, 10 bull hides per car. The Continental GT smells extraordinary new. The Autivara Drive lets you define what it smells like forever.",
      placement:
        "Behind the rotating Bentley dashboard display panel, or the center console cup holder with the slide-out cover. The GT\u2019s interior has no shortage of discreet placement options.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "Bentley\u2019s hand-finished wood veneers and diamond-quilted leather create the most opulent cabin in production. Mahogany and Cognac are deeply traditional \u2014 like a Pall Mall gentlemen\u2019s club on wheels.",
      faq: [
        {
          question: "Bentley offers its own fragrance options \u2014 why choose Autivara?",
          answer:
            "Bentley\u2019s Naim-integrated scent system is HVAC-dependent and limited to two proprietary cartridges. The Autivara Drive is independent, portable, and compatible with any essential oil.",
        },
        {
          question: "The Continental GT is a grand tourer \u2014 will the battery last long trips?",
          answer:
            "On a single charge the battery comfortably covers a London-to-Monaco drive and back without a top-up. A quick USB-C charge gets you ready for the next leg.",
        },
      ],
      hero_image: "/image/placeholder-bentley-continental-gt.jpg",
    },
    bentayga: {
      make: "Bentley",
      model: "Bentayga",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Rose Absolute & Sandalwood",
      description:
        "The Bentayga is the world\u2019s most luxurious SUV \u2014 where a Rolls-Royce Cullinan is ostentatious, the Bentayga is quietly assured. Its cabin is a sanctuary. Scent should enhance the tranquility, not announce itself.",
      placement:
        "Rear console in the 4-seat configuration, or front console in the 5-seat. The Bentayga\u2019s massive cabin benefits from central placement for even distribution.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The Bentayga EWB\u2019s airline-style rear seats and real metal organ-stop HVAC controls speak to a cabin designed around comfort. Rose Absolute is Bentley\u2019s own signature \u2014 we amplify it.",
      faq: [
        {
          question: "Can I match the Autivara scent to my Bentley specification?",
          answer:
            "We recommend Rose & Sandalwood for the Bentayga, but the Autivara Drive works with any essential oil. Some Bentayga owners commission custom blends from niche perfumers \u2014 the Autivara Drive diffuses any oil.",
        },
        {
          question: "I have the Bentayga EWB Mulliner \u2014 is one unit enough?",
          answer:
            "The Bentayga EWB has one of the largest luxury SUV cabins made. At intensity 4-5, one unit covers the front and second row. For the optional rear entertainment suite, a second unit is recommended.",
        },
      ],
      hero_image: "/image/placeholder-bentley-bentayga.jpg",
    },
  },

  "rolls-royce": {
    ghost: {
      make: "Rolls-Royce",
      model: "Ghost",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "White Rose & Patchouli",
      description:
        "The Ghost is Rolls-Royce\u2019s driver\u2019s car \u2014 understated opulence in a sedan that insulates you from the outside world. Its cabin is so quiet that Rolls-Royce engineers had to add sound because the silence was disorienting. In this environment, scent is everything.",
      placement:
        "The rear center armrest opens to reveal a deep compartment with cup holders. The Ghost\u2019s rear cabin is the primary luxury zone \u2014 place the Autivara Drive here for the full experience.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The Ghost\u2019s leather is sourced from bulls raised in cold climates (fewer insect bites, no barbed wire). The hides are so pristine they have almost no tanning scent. White Rose fills this neutral canvas with something deliberately beautiful.",
      faq: [
        {
          question: "The Ghost is the quietest car made \u2014 will I hear the Autivara Drive?",
          answer:
            "The Ghost cabin at cruise measures approximately 32dB. The Autivara Drive at 40dB will be faintly audible when stationary with the engine off. At any driving speed, road isolation masks it completely.",
        },
        {
          question: "Does the Starlight Headliner affect placement?",
          answer:
            "No. The Autivara Drive sits in the console, well below the headliner. The fiber-optic stars and the nano-mist occupy completely different zones of the cabin.",
        },
        {
          question: "My Ghost has the Bespoke Audio system \u2014 any interference?",
          answer:
            "Zero. The Autivara Drive has no wireless signals, no speakers, and no electromagnetic output. It is purely mechanical nebulization. Your 18-channel Bespoke Audio is unaffected.",
        },
      ],
      hero_image: "/image/placeholder-rolls-royce-ghost.jpg",
    },
    cullinan: {
      make: "Rolls-Royce",
      model: "Cullinan",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Imperial Oud & Amber",
      description:
        "The Cullinan is the most expensive production SUV in the world. Its owners expect the best of everything, including what their cabin smells like. Imperial Oud is bold enough to match the car\u2019s $400,000+ presence.",
      placement:
        "Rear viewing suite between the two individual seats, or the front console. The Cullinan\u2019s rear lounge configuration with champagne cooler is where the Autivara Drive earns its place.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The Cullinan\u2019s lambswool floor mats, hand-stitched leather, and real wood create a cabin that already smells like a luxury hotel lobby. Imperial Oud adds the final layer of exclusivity.",
      faq: [
        {
          question: "Will it complement the Rolls-Royce bespoke fragrance options?",
          answer:
            "Rolls-Royce does not currently offer a built-in fragrance system. The Autivara Drive fills this gap \u2014 it\u2019s the scent solution that matches the Cullinan\u2019s standard of excellence.",
        },
        {
          question: "I use the Cullinan for events \u2014 can I change scents quickly?",
          answer:
            "Swap the oil reservoir in under 30 seconds. The previous scent dissipates within 5 minutes. You can match the fragrance to the occasion \u2014 Oud for evening events, something lighter for daytime.",
        },
      ],
      hero_image: "/image/placeholder-rolls-royce-cullinan.jpg",
    },
    spectre: {
      make: "Rolls-Royce",
      model: "Spectre",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Violet Leaf & Iris Butter",
      description:
        "The Spectre is Rolls-Royce\u2019s first electric car \u2014 and possibly the most refined EV ever built. No engine vibration, no exhaust. The cabin is a sensory vacuum waiting to be filled. Violet and iris provide a cool, powdery elegance that matches the Spectre\u2019s futuristic presence.",
      placement:
        "Center console cup holder. The Spectre\u2019s split-level console has dedicated holders that cradle the Autivara Drive below the floating armrest.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The Spectre\u2019s Starlight doors with 4,796 illuminated stars create an otherworldly interior. Violet Leaf adds a cool, almost metallic floral note that feels aligned with the car\u2019s electric soul.",
      faq: [
        {
          question: "Does the Autivara Drive affect the Spectre\u2019s range?",
          answer:
            "The Autivara Drive runs on its own internal battery. It draws zero power from the Spectre\u2019s 102 kWh battery pack. Your 320-mile range is completely unaffected.",
        },
        {
          question: "The Spectre is whisper-quiet \u2014 is the Autivara Drive too loud?",
          answer:
            "At 40dB, the Autivara Drive is slightly above the Spectre\u2019s cabin noise at highway speed (approximately 34dB). In motion, tire noise masks it. At a standstill in a quiet garage, you may hear a faint hum.",
        },
      ],
      hero_image: "/image/placeholder-rolls-royce-spectre.jpg",
    },
  },

  maserati: {
    ghibli: {
      make: "Maserati",
      model: "Ghibli",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Neroli & Leather Accord",
      description:
        "The Ghibli is Maserati\u2019s entry point \u2014 but entry to Maserati is still deeply Italian, deeply emotional, and unmistakably luxurious. The V6 exhaust note is famous. The interior should have an equally distinct signature.",
      placement:
        "Center console cup holder between the Maserati clock and gear selector. The Ghibli\u2019s console is elegant but practical \u2014 the Autivara Drive\u2019s form language matches.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "Maserati\u2019s Pieno Fiore full-grain leather is softer and more aromatic than most automotive hides. Neroli (bitter orange blossom) is a classic Italian perfumery note that deepens the Mediterranean character.",
      faq: [
        {
          question: "The Ghibli has an exhaust valve system \u2014 does exhaust scent enter?",
          answer:
            "In Normal and Sport modes, the cabin is well-sealed. In Corsa mode with windows cracked, you may get trace exhaust. The Autivara Drive provides a consistent olfactory baseline that makes this a non-issue.",
        },
        {
          question: "Is Maserati leather too delicate for a car diffuser?",
          answer:
            "The Autivara Drive produces dry nano-mist \u2014 no liquid, no residue. It\u2019s safer for Pieno Fiore leather than leaving a water bottle in your cup holder.",
        },
      ],
      hero_image: "/image/placeholder-maserati-ghibli.jpg",
    },
    grecale: {
      make: "Maserati",
      model: "Grecale",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Mediterranean Fig & Sea Breeze",
      description:
        "The Grecale is Maserati\u2019s compact SUV \u2014 named after the fierce Mediterranean wind. It brings Italian passion to the daily commute. The scent should feel like the Amalfi Coast with the top down, even in January traffic.",
      placement:
        "Center console cup holder. The Grecale\u2019s modern cockpit has generous cup holders with rubberized inserts that grip the Autivara Drive securely.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Grecale Trofeo\u2019s carbon fiber and Alcantara trim create a sporty Italian environment. Fig and sea breeze add a coastal lightness that prevents the dark interior from feeling heavy.",
      faq: [
        {
          question: "I chose the Grecale over a Macan \u2014 will the Autivara Drive help justify that?",
          answer:
            "The Grecale\u2019s Italian character is its differentiator. A Mediterranean scent profile reinforces why you chose emotion over engineering. Every time you open the door, it smells like a decision you\u2019re proud of.",
        },
        {
          question: "Does Maserati offer any built-in fragrance?",
          answer:
            "No. Maserati does not currently offer a fragrance system in any model. The Autivara Drive is the only premium scent solution worthy of the trident badge.",
        },
      ],
      hero_image: "/image/placeholder-maserati-grecale.jpg",
    },
    mc20: {
      make: "Maserati",
      model: "MC20",
      year: "2024",
      interior_type: "Alcantara",
      scent_pairing: "Saffron & Burnt Sugar",
      description:
        "The MC20 is Maserati\u2019s supercar \u2014 a Nettuno twin-turbo V6 with pre-chamber combustion. Its butterfly-door cabin is tight, focused, and race-derived. Scent should be as intense and exotic as the car itself.",
      placement:
        "The MC20\u2019s center tunnel has a small storage area. The cockpit is extremely compact \u2014 any scent at any intensity fills it immediately. Start at level 1.",
      cabin_size: "small",
      intensity_rec: 1,
      interior_notes:
        "The MC20\u2019s Alcantara-wrapped cabin with exposed carbon fiber is pure motorsport. Saffron and burnt sugar add a warm, exotic sweetness that contrasts with the technical surroundings.",
      faq: [
        {
          question: "The MC20 cabin is tiny \u2014 will it be overwhelming?",
          answer:
            "The MC20 has approximately 1.8 cubic meters of cabin volume \u2014 smaller than most sports cars. Start at intensity 1. Even at the lowest setting, you\u2019ll have full scent coverage within 30 seconds.",
        },
        {
          question: "Butterfly doors open wide \u2014 does scent escape quickly?",
          answer:
            "Yes, but it rebuilds just as fast. With doors closed, the MC20\u2019s sealed cockpit retains scent extremely well. When you open the butterfly doors, the rush of scent is part of the theater.",
        },
      ],
      hero_image: "/image/placeholder-maserati-mc20.jpg",
    },
  },

  genesis: {
    g90: {
      make: "Genesis",
      model: "G90",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "White Lotus & Cedarwood",
      description:
        "The G90 is Genesis\u2019s flagship sedan \u2014 a Korean interpretation of the S-Class that\u2019s won design awards globally. Its cabin is restrained, elegant, and intentionally calm. White Lotus matches this philosophy of quiet confidence.",
      placement:
        "Rear executive armrest or front center console. The G90\u2019s ergo-motion seats and rear-seat entertainment make the back seat the primary luxury zone.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The G90\u2019s Nappa leather comes in muted earth tones (Obsidian Black, Verbena Green) with real wood trim inspired by Korean moon jars. White Lotus is a deliberately Korean scent choice \u2014 rooted in the car\u2019s heritage.",
      faq: [
        {
          question: "Genesis is less known than Mercedes \u2014 does the Autivara Drive add perceived luxury?",
          answer:
            "Absolutely. Scent is one of the strongest memory triggers. When guests sit in your G90 and experience a deliberately curated fragrance, it elevates the entire perception of the vehicle. It\u2019s the detail that makes people ask what you\u2019re driving.",
        },
        {
          question: "The G90 has an air purification system \u2014 does it filter out the scent?",
          answer:
            "The G90\u2019s HEPA filter targets particulates and allergens, not gaseous fragrance molecules. Your Autivara scent passes through the filtration system unaffected.",
        },
      ],
      hero_image: "/image/placeholder-genesis-g90.jpg",
    },
    gv80: {
      make: "Genesis",
      model: "GV80",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Green Bamboo & White Tea",
      description:
        "The GV80 put Genesis on the map \u2014 the SUV that made automotive journalists rethink Korean luxury. Its cabin punches well above its price point. The Autivara Drive is the accessory that closes the gap between the GV80 and cars costing twice as much.",
      placement:
        "Center console cup holder. The GV80\u2019s wide, split-level console has deep cup holders with integrated lighting that subtly illuminates the Autivara Drive\u2019s clean form at night.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The GV80\u2019s quilted Nappa leather and forged carbon fiber trim create a cabin that photographs like a Bentley. Green Bamboo adds a clean, modern freshness that keeps the luxury feeling current rather than old-world.",
      faq: [
        {
          question: "The GV80 is a family SUV \u2014 will kids mess with the diffuser?",
          answer:
            "The Autivara Drive has no buttons to press \u2014 just a single dial. No screens, no lights, no sounds that attract children. It\u2019s the least interesting thing in the cabin to a child, which is exactly the point.",
        },
        {
          question: "How does the GV80 compare to the X5 for the Autivara Drive?",
          answer:
            "Similar cabin volume, similar cup holder dimensions. The GV80\u2019s slightly more insulated cabin retains scent marginally longer. Both work excellently at intensity 3.",
        },
      ],
      hero_image: "/image/placeholder-genesis-gv80.jpg",
    },
    g70: {
      make: "Genesis",
      model: "G70",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Black Sesame & Smoked Plum",
      description:
        "The G70 is Genesis\u2019s sport sedan \u2014 sharp, responsive, and designed to compete with the BMW 3 Series. Its compact cockpit and aggressive styling deserve a scent that\u2019s equally bold and unconventional.",
      placement:
        "Center console cup holder behind the gear selector. The G70\u2019s driver-focused cockpit keeps the Autivara Drive close and accessible.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The G70\u2019s leather sport seats with micro-suede inserts create a focused driving environment. Black Sesame and Smoked Plum is a deliberately unusual pairing \u2014 earthy, sweet, and unlike anything from a European brand.",
      faq: [
        {
          question: "Black Sesame? That sounds unusual for a car.",
          answer:
            "Deliberately so. The G70 exists because Genesis chose not to copy the Germans. The scent pairing follows the same philosophy \u2014 unexpected, memorable, and distinctly Korean-inspired.",
        },
        {
          question: "The G70 3.3T is quick \u2014 does the unit stay put in hard driving?",
          answer:
            "The Autivara Drive stays stable through aggressive cornering. Genesis cup holders have a slight taper that actually improves grip compared to straight-walled alternatives.",
        },
      ],
      hero_image: "/image/placeholder-genesis-g70.jpg",
    },
  },

  cadillac: {
    escalade: {
      make: "Cadillac",
      model: "Escalade",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Bourbon Vanilla & Charred Oak",
      description:
        "The Escalade is an American institution \u2014 38 feet of presence, a 38-inch OLED curved display, and enough cabin volume to host a dinner party. Its scent should be as bold and unapologetic as the vehicle itself.",
      placement:
        "Second-row center console for maximum cabin coverage, or the massive front center console. The Escalade\u2019s cabin volume is the largest in the luxury SUV segment \u2014 position centrally.",
      cabin_size: "large",
      intensity_rec: 5,
      interior_notes:
        "The Escalade\u2019s semi-aniline leather in Whisper Beige or Jet Black with real wood accents creates an American interpretation of luxury \u2014 generous, bold, and unapologetic. Bourbon Vanilla and Charred Oak lean into this aesthetic.",
      faq: [
        {
          question: "The Escalade is enormous \u2014 can one unit scent the whole cabin?",
          answer:
            "At intensity 5, one Autivara Drive covers approximately 4 cubic meters. The Escalade\u2019s cabin is roughly 4.5 cubic meters. One unit at max intensity handles it, but for the third row and cargo area, two units are ideal.",
        },
        {
          question: "I use my Escalade for clients \u2014 is Bourbon Vanilla too casual?",
          answer:
            "Bourbon Vanilla reads as warm and confident, not casual. It\u2019s the scent equivalent of the Escalade itself \u2014 powerful enough to make an impression, refined enough for any audience.",
        },
        {
          question: "Does Super Cruise affect the Autivara Drive?",
          answer:
            "Super Cruise is a hands-free driving system \u2014 it has zero interaction with anything in your cup holder. The Autivara Drive operates completely independently of all vehicle electronics.",
        },
      ],
      hero_image: "/image/placeholder-cadillac-escalade.jpg",
    },
    ct5: {
      make: "Cadillac",
      model: "CT5-V Blackwing",
      year: "2024",
      interior_type: "Carbon Fiber",
      scent_pairing: "Motor Oil & Black Coffee",
      description:
        "The CT5-V Blackwing is the most powerful Cadillac ever \u2014 668 hp from a supercharged V8, available with a manual transmission. It\u2019s a love letter to driving enthusiasts. The scent pairing is deliberately raw and industrial.",
      placement:
        "Center console cup holder. The Blackwing\u2019s cockpit is tighter than the standard CT5, with Recaro-style seats that create a more intimate driving space.",
      cabin_size: "medium",
      intensity_rec: 2,
      interior_notes:
        "The Blackwing\u2019s carbon fiber trim, suede microfiber steering wheel, and high-bolster seats create a cabin that smells like intent. Motor Oil and Black Coffee is a nod to early mornings at the track and the last car with a supercharged V8 and a manual.",
      faq: [
        {
          question: "Motor Oil scent in a car? Seriously?",
          answer:
            "It\u2019s not literal Castrol. The Motor Oil note is a refined interpretation \u2014 metallic, slightly sweet, with a petroleum-adjacent warmth. Combined with Black Coffee, it creates an industrial-masculine profile that Blackwing owners specifically request.",
        },
        {
          question: "The Blackwing has a manual transmission \u2014 will shifting disturb the unit?",
          answer:
            "The cup holder is separate from the gear lever. Aggressive shifting creates no vibration in the cup holder area. The Autivara Drive is stable during heel-toe downshifts and full-throttle upshifts.",
        },
      ],
      hero_image: "/image/placeholder-cadillac-ct5-v.jpg",
    },
    lyriq: {
      make: "Cadillac",
      model: "Lyriq",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Clean Cotton & Ozone",
      description:
        "The Lyriq is Cadillac\u2019s electric future \u2014 a luxury EV crossover with a 33-inch LED display and AKG studio-quality audio. Its cabin is a tech showcase. The scent should feel clean, modern, and forward-looking.",
      placement:
        "Center console storage area behind the floating armrest. The Lyriq\u2019s minimalist console has an open-concept design that allows scent to rise naturally into the cabin.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Lyriq\u2019s interior uses sustainable materials including recycled plastics and responsibly sourced leather. Clean Cotton and Ozone reinforce the forward-thinking ethos without feeling sterile.",
      faq: [
        {
          question: "Will it affect the Lyriq\u2019s EV range?",
          answer:
            "The Autivara Drive runs on its own battery. Zero impact on the Lyriq\u2019s 314-mile range. You can charge both simultaneously via USB-C if desired.",
        },
        {
          question: "The Lyriq\u2019s 33-inch display is a fingerprint magnet \u2014 will mist make it worse?",
          answer:
            "No. The Autivara Drive\u2019s nano-mist particles are 1-5 microns and remain airborne. Unlike humidifiers, there is no visible mist and no surface deposits on screens or glass.",
        },
      ],
      hero_image: "/image/placeholder-cadillac-lyriq.jpg",
    },
  },

  tesla: {
    "model-s": {
      make: "Tesla",
      model: "Model S",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Eucalyptus & Cedarwood",
      description:
        "The Model S Plaid does 0-60 in 1.99 seconds but its cabin smells like... nothing. Tesla interiors are deliberately neutral \u2014 no natural leather scent, no wood, no character. The Autivara Drive gives the Model S the one thing Tesla forgot: a soul.",
      placement:
        "Center console cup holder or the wireless phone charger shelf. The Model S\u2019s yoke steering wheel and landscape screen leave the console area clean and accessible.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "Tesla\u2019s vegan leather and minimalist surfaces have zero olfactory character. This is both a problem and an opportunity \u2014 the cabin is a completely blank canvas. Eucalyptus and Cedarwood add organic warmth to the tech-centric environment.",
      faq: [
        {
          question: "Tesla has a Bioweapon Defense Mode air filter \u2014 will it filter out the scent?",
          answer:
            "The HEPA filter targets particulates (dust, pollen, bacteria) not gaseous fragrance molecules. Your Autivara scent passes through Tesla\u2019s filtration system unaffected. Even in Bioweapon Defense Mode.",
        },
        {
          question: "Can I control the Autivara Drive from the Tesla touchscreen?",
          answer:
            "No \u2014 and that\u2019s intentional. The Autivara Drive has a single physical dial. In a car where everything is a screen, a beautifully made object with a tactile control is a deliberate counterpoint.",
        },
        {
          question: "Will it drain the 12V battery while parked?",
          answer:
            "The Autivara Drive runs on its own internal battery. It draws nothing from the Tesla\u2019s 12V or high-voltage system. Zero vampire drain.",
        },
      ],
      hero_image: "/image/placeholder-tesla-model-s.jpg",
    },
    "model-x": {
      make: "Tesla",
      model: "Model X",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Peppermint & Birch",
      description:
        "The Model X\u2019s falcon-wing doors are pure theater \u2014 but the cabin they reveal smells like a new iPad. Peppermint and Birch add a crisp, natural dimension that Tesla\u2019s synthetic interior desperately needs.",
      placement:
        "Second-row center console or front cup holder. The Model X\u2019s three-row layout benefits from central placement for even scent distribution across the cavernous cabin.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The Model X\u2019s panoramic windshield and white interior option create the brightest, most open cabin in any SUV. Peppermint and Birch add a nature-inspired freshness that connects the airy interior to the outdoors.",
      faq: [
        {
          question: "When the falcon-wing doors open, does all the scent escape?",
          answer:
            "Yes \u2014 the massive door openings ventilate the cabin quickly. But nebulized scent rebuilds within 60-90 seconds with doors closed. Think of it as a fresh burst every time you enter.",
        },
        {
          question: "Can I use it while Sentry Mode is running overnight?",
          answer:
            "You can, but we recommend turning the Autivara Drive off when the car is parked. It\u2019s battery-powered and runs independently, but there\u2019s no benefit to scenting an empty cabin.",
        },
      ],
      hero_image: "/image/placeholder-tesla-model-x.jpg",
    },
    "model-3": {
      make: "Tesla",
      model: "Model 3",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Fresh Mint & Vetiver",
      description:
        "The Model 3 is the best-selling luxury car in the world. Millions of owners, zero fragrance differentiation. The Autivara Drive is how you make your Model 3 feel like yours \u2014 not like every other one in the office parking garage.",
      placement:
        "Center console cup holder or the phone dock area. The Model 3\u2019s famously minimalist interior means the Autivara Drive is one of the few physical objects in the cabin \u2014 it becomes a design element.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Highland Model 3\u2019s ambient lighting and fabric dashboard trim soften the minimalism. Fresh Mint and Vetiver add an earthy brightness that makes the cabin feel alive rather than austere.",
      faq: [
        {
          question: "The Model 3 is $40K \u2014 is a $149 diffuser worth it?",
          answer:
            "The Autivara Drive is 0.37% of the car\u2019s price. It\u2019s the single accessory that transforms the daily driving experience \u2014 every commute, every road trip, every Uber ride. Per-use, it\u2019s the best value upgrade you can make.",
        },
        {
          question: "Will it look out of place in the minimalist interior?",
          answer:
            "The Autivara Drive\u2019s satin-finish cylinder is deliberately minimal. In the Model 3\u2019s stripped-back cabin, it looks like it was designed by Tesla \u2014 clean geometry, premium materials, no branding.",
        },
      ],
      hero_image: "/image/placeholder-tesla-model-3.jpg",
    },
    "model-y": {
      make: "Tesla",
      model: "Model Y",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Sea Salt & Driftwood",
      description:
        "The Model Y is the best-selling car in the world \u2014 period. Its ubiquity is both its strength and its problem. Every parking lot has five of them. The Autivara Drive is the sensory signature that makes yours unmistakably yours the moment you open the door.",
      placement:
        "Center console cup holder or the deep storage well beneath the armrest. The Model Y\u2019s minimalist console gives the Autivara Drive prominent placement as one of the few designed objects in the cabin.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The Model Y\u2019s vegan leather and hard plastic surfaces offer zero olfactory personality \u2014 a completely neutral canvas. Sea Salt adds a clean, ozonic brightness while Driftwood introduces a warm, weathered character that gives the sterile cabin a sense of place and story.",
      faq: [
        {
          question: "The Model Y is everywhere \u2014 how does this make mine different?",
          answer:
            "Scent is the most powerful memory trigger. Your Model Y will be the one that smells like a coastal morning rather than a tech factory. Passengers will remember your car specifically. That\u2019s differentiation no wrap or wheel upgrade can match.",
        },
        {
          question: "Does the Camp Mode affect scent performance?",
          answer:
            "Camp Mode keeps climate control running while parked. The Autivara Drive pairs perfectly with Camp Mode \u2014 set intensity to 2-3 and the climate fan distributes scent evenly throughout the cabin. Ideal for road trip overnights.",
        },
        {
          question: "Will it interfere with the Model Y\u2019s HEPA filter?",
          answer:
            "No. Tesla\u2019s HEPA filtration targets airborne particulates (dust, pollen, smoke particles). The Autivara Drive\u2019s fragrance molecules are gaseous essential oil vapor \u2014 they pass through HEPA media freely. Both systems coexist without conflict.",
        },
      ],
      hero_image: "/image/placeholder-tesla-model-y.jpg",
    },
  },

  volvo: {
    xc90: {
      make: "Volvo",
      model: "XC90",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Scandinavian Pine & Birch Sap",
      description:
        "The XC90 is Swedish luxury \u2014 hygge on wheels. Its cabin is designed around wellness: CleanZone air quality, orthopedic seats developed with chiropractors, and materials chosen for tactile comfort. The Autivara Drive adds the final wellness dimension.",
      placement:
        "Center console cup holder with the Orrefors crystal gear selector nearby. The XC90\u2019s wide, Scandinavian-clean console is the ideal home for the Autivara Drive.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The XC90\u2019s Nappa leather in Blond or Charcoal, paired with real driftwood inlays, creates a cabin inspired by the Swedish archipelago. Pine and Birch Sap make this connection explicit \u2014 you\u2019re driving through a Nordic forest.",
      faq: [
        {
          question: "Volvo\u2019s CleanZone system filters everything \u2014 will it filter the scent?",
          answer:
            "CleanZone targets PM2.5 particulates and volatile organic compounds. The Autivara Drive\u2019s fragrance molecules are non-toxic essential oil vapors that pass through the filtration. Volvo filters pollution, not perfume.",
        },
        {
          question: "I chose Volvo for safety \u2014 is the Autivara Drive safe?",
          answer:
            "No heat, no flame, no electrical connection to the vehicle. The sealed reservoir prevents spills even in a collision, and the device is built to be durable. It meets the safety standard you\u2019d expect from a Volvo accessory.",
        },
      ],
      hero_image: "/image/placeholder-volvo-xc90.jpg",
    },
    xc60: {
      make: "Volvo",
      model: "XC60",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Cloudberry & White Birch",
      description:
        "The XC60 is Volvo\u2019s best-seller \u2014 the car that introduced millions of families to Scandinavian design. Its cabin is warm, minimal, and human-centered. Cloudberry is a Nordic superfruit with a sweet, musky scent that feels distinctly Northern European.",
      placement:
        "Center console cup holder. The XC60\u2019s vertically-oriented touchscreen leaves the console area uncluttered and accessible.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The XC60\u2019s optional wool-blend upholstery (Tailored Wool) is unusual in the segment and has a natural, textile scent. Cloudberry adds a fruity brightness that plays beautifully with natural fibers.",
      faq: [
        {
          question: "I have the wool seats \u2014 will scent absorb into the fabric?",
          answer:
            "Wool is naturally odor-resistant due to lanolin content. The Autivara Drive\u2019s dry nano-mist dissipates without settling. Your Tailored Wool seats won\u2019t retain fragrance any more than they retain normal cabin air.",
        },
        {
          question: "My XC60 has a Bowers & Wilkins system \u2014 any interference?",
          answer:
            "Zero electromagnetic output from the Autivara Drive. Your Bowers & Wilkins speakers and amplifiers operate on completely separate frequencies. No buzzing, no interference.",
        },
      ],
      hero_image: "/image/placeholder-volvo-xc60.jpg",
    },
    ex90: {
      make: "Volvo",
      model: "EX90",
      year: "2025",
      interior_type: "Leather",
      scent_pairing: "Northern Moss & Frozen Juniper",
      description:
        "The EX90 is Volvo\u2019s electric flagship \u2014 a 517 hp SUV with LiDAR and a cabin made from 15% recycled materials. Its scent should reflect the same commitment to nature and the Nordic landscape.",
      placement:
        "Center console between the floating armrest and wireless charger. The EX90\u2019s lounge-like interior makes the Autivara Drive feel like a piece of Scandinavian home decor.",
      cabin_size: "large",
      intensity_rec: 4,
      interior_notes:
        "The EX90 uses Nordico (a sustainable textile blend) instead of leather in many trim levels. This vegan-friendly interior has zero natural scent \u2014 Northern Moss and Frozen Juniper provide the character the materials intentionally lack.",
      faq: [
        {
          question: "Does the EX90\u2019s driver monitoring camera watch the diffuser?",
          answer:
            "The EX90\u2019s eye-tracking and attention monitoring system focuses on the driver\u2019s face, not objects in the cup holder. The Autivara Drive is invisible to all cabin sensors.",
        },
        {
          question: "The EX90 has a 111 kWh battery \u2014 any range impact?",
          answer:
            "None. The Autivara Drive runs on its own rechargeable battery. It has no connection to the EX90\u2019s drivetrain. Your 300-mile range is completely unaffected.",
        },
      ],
      hero_image: "/image/placeholder-volvo-ex90.jpg",
    },
  },

  jaguar: {
    "f-pace": {
      make: "Jaguar",
      model: "F-Pace",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "British Leather & Tobacco Flower",
      description:
        "The F-Pace is Jaguar\u2019s best-selling vehicle \u2014 a performance SUV with 395 hp and a cabin trimmed in Windsor leather. It\u2019s the practical Jaguar, but practical shouldn\u2019t mean boring. British Leather and Tobacco Flower bring character to the commute.",
      placement:
        "Center console cup holder between the JaguarDrive gear selector and the InControl Touch Pro display. The F-Pace\u2019s console is wide and accommodating.",
      cabin_size: "large",
      intensity_rec: 3,
      interior_notes:
        "The F-Pace SVR\u2019s Windsor leather in Ebony or Siena Tan ages beautifully. British Leather scent actually accelerates the perception of patina \u2014 your F-Pace will smell like a well-loved vintage Jaguar within weeks.",
      faq: [
        {
          question: "Jaguar is being reinvented as an EV brand \u2014 does this matter?",
          answer:
            "The F-Pace is the last of the combustion Jaguars. The Autivara Drive preserves the sensory memory of what a Jaguar interior should feel like \u2014 leather, wood, and something distinctly British.",
        },
        {
          question: "Will it complement the Jaguar cabin air ionizer?",
          answer:
            "Yes. The ionizer neutralizes airborne particles and allergens. The Autivara Drive adds fragrance molecules. They operate on different principles and complement each other perfectly.",
        },
      ],
      hero_image: "/image/placeholder-jaguar-f-pace.jpg",
    },
    "f-type": {
      make: "Jaguar",
      model: "F-Type",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Wet Stone & English Lavender",
      description:
        "The F-Type is a dying breed \u2014 a front-engine, rear-drive British sports car with a supercharged V8. Production ends soon, making every drive more precious. Wet Stone and English Lavender capture the essence of a B-road blast through the Cotswolds.",
      placement:
        "The F-Type\u2019s console tunnel has a single cup holder behind the gear selector. The cockpit is small and enveloping \u2014 scent fills it instantly at any intensity.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "The F-Type R\u2019s Performance seats in Windsor leather with suedecloth headlining create a cabin that smells like a traditional British sports car. Wet Stone adds a mineralic petrichor note that\u2019s unmistakably English.",
      faq: [
        {
          question: "The F-Type V8 has active exhaust \u2014 does exhaust scent enter the cabin?",
          answer:
            "With the exhaust in Dynamic mode, trace exhaust notes can enter through the rear quarter. The Autivara Drive at intensity 2 provides a clean baseline that makes these intrusions nostalgic rather than unpleasant.",
        },
        {
          question: "The F-Type is ending production \u2014 will the Autivara Drive preserve its character?",
          answer:
            "Scent is the strongest trigger for memory. Every time you start your F-Type with the Autivara Drive running, you\u2019re creating a sensory bookmark. Years from now, this scent will take you back to the V8 era instantly.",
        },
      ],
      hero_image: "/image/placeholder-jaguar-f-type.jpg",
    },
    "i-pace": {
      make: "Jaguar",
      model: "I-Pace",
      year: "2024",
      interior_type: "Leather",
      scent_pairing: "Rain & Green Moss",
      description:
        "The I-Pace was the first luxury EV from a traditional automaker. Its electric silence and space-efficient packaging create a cabin that feels bigger than its footprint. Rain and Green Moss bring the English garden inside.",
      placement:
        "Lower center console storage area or cup holder. The I-Pace\u2019s dual-screen cockpit and floating console give the Autivara Drive a natural resting place.",
      cabin_size: "medium",
      intensity_rec: 3,
      interior_notes:
        "The I-Pace\u2019s optional Kvantdriven recycled textile seats have a unique woven texture. Rain and Green Moss add an organic layer to what is otherwise a tech-forward interior.",
      faq: [
        {
          question: "The I-Pace is an EV \u2014 does the Autivara Drive impact range?",
          answer:
            "The Autivara Drive has its own battery. It draws nothing from the I-Pace\u2019s 90 kWh pack. Your 246-mile range remains exactly the same.",
        },
        {
          question: "Does the I-Pace have enough cup holder space?",
          answer:
            "The I-Pace has two front cup holders in the lower console area. The Autivara Drive fits comfortably with room to spare.",
        },
      ],
      hero_image: "/image/placeholder-jaguar-i-pace.jpg",
    },
  },

  "aston-martin": {
    db12: {
      make: "Aston Martin",
      model: "DB12",
      year: "2025",
      interior_type: "Leather",
      scent_pairing: "Earl Grey & Cucumber",
      description:
        "The DB12 is the world\u2019s first super tourer \u2014 Aston Martin\u2019s words, not ours. Its cabin blends Bridge of Weir leather with modern tech in a way that\u2019s distinctly British. Earl Grey and Cucumber is peak Aston \u2014 refined, slightly eccentric, unmistakably English.",
      placement:
        "Center console between the sport seats. The DB12\u2019s console is narrow and purposeful \u2014 the Autivara Drive\u2019s cylindrical form echoes the gear selector and rotary controls.",
      cabin_size: "small",
      intensity_rec: 2,
      interior_notes:
        "Bridge of Weir leather from Scottish cattle (fewer insect bites = fewer blemishes = finer grain) is Aston Martin\u2019s signature. The hide has a natural scent that\u2019s lighter than Italian leather \u2014 Earl Grey complements rather than competes.",
      faq: [
        {
          question: "The DB12 has a twin-turbo V8 \u2014 does exhaust scent enter the cabin?",
          answer:
            "Modern cabin sealing is excellent, but spirited driving can bring in trace exhaust notes through the HVAC. The Autivara Drive at intensity 2-3 provides a clean olfactory baseline that makes these intrusions less noticeable.",
        },
        {
          question: "Will the device\u2019s finish match Aston Martin interior metal accents?",
          answer:
            "The Autivara Drive\u2019s Space Grey anodization is a close match to Aston Martin\u2019s Dark Chrome interior trim package. In Satin Chrome spec, it\u2019s a slight contrast \u2014 both look intentional.",
        },
      ],
      hero_image: "/image/placeholder-aston-martin-db12.jpg",
    },
  },
};
