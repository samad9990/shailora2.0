import { Project } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "obsidian-pavilion",
    title: "The Obsidian Pavilion",
    location: "Snaefellsnes, Iceland",
    year: "2024",
    category: "Residential",
    status: "Completed",
    area: "380 m²",
    materialPalette: ["Raw Carbon Concrete", "Black Anodized Aluminum", "Siberian Larch", "Satin Glass"],
    architecturalStyle: "Nordic Brutalism",
    client: "Kristjánsson Family Trust",
    team: ["Lara Shailora (Principal)", "Sveinn Gunnarsson", "Elena Rostova"],
    awards: ["Nordic Design Award 2024 - Gold", "Mies van der Rohe Nominee"],
    description: "Nestled into the volcanic shoreline of Iceland's western peninsula, the Obsidian Pavilion is a study in architectural weight and silent integration. It mimics the basalt formations surrounding it, emerging from the volcanic landscape as a fractured monolith.",
    conceptText: "The primary design vector focuses on wind deflection and solar capture. By fracturing the solid concrete volume into three staggered quadrants, we create a protected central courtyard while framing specific celestial views of the Snaefellsjökull glacier.",
    heroImage: "/uploads/regenerated_image_1784111618009.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-interior-design-of-a-luxury-living-room-with-swimming-pool-43037-large.mp4",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80"
    ],
    drawings: [
      `<svg viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full text-zinc-400"><path d="M 50,150 L 350,150" stroke-dasharray="4" /><rect x="80" y="100" width="100" height="50" fill="none" /><rect x="180" y="80" width="120" height="70" fill="none" /><line x1="80" y1="100" x2="180" y2="80" /><circle cx="240" cy="110" r="15" stroke-dasharray="2" /><path d="M 50,150 Q 150,130 250,150" stroke-dasharray="2" /><text x="90" y="130" font-family="monospace" font-size="8" fill="currentColor">ZONE_01_LIVING</text><text x="190" y="110" font-family="monospace" font-size="8" fill="currentColor">ZONE_02_STUDIO</text></svg>`,
      `<svg viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full text-zinc-400"><path d="M 100,50 L 100,150 M 300,50 L 300,150" stroke-dasharray="4" /><rect x="120" y="60" width="160" height="80" rx="4" /><line x1="120" y1="100" x2="280" y2="100" stroke-dasharray="1 3" /><text x="130" y="85" font-family="monospace" font-size="8" fill="currentColor">SECTION A-A_SCALE 1:50</text></svg>`
    ],
    featured: true,
    homepageOrder: 1,
    tags: ["Concrete", "Basalt", "Minimal", "Glacier", "Cold", "Atmospheric"],
    comparisonBeforeImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    comparisonAfterImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    comparisonLabelBefore: "Unbuilt Glacial Shoreline",
    comparisonLabelAfter: "Completed Pavilion"
  },
  {
    id: "monolith-gallery",
    title: "Nordic Monolith Gallery",
    location: "Oslo, Norway",
    year: "2023",
    category: "Hospitality",
    status: "Completed",
    area: "1,200 m²",
    materialPalette: ["Acid-Washed Concrete", "White Terrazzo", "Brushed Stainless Steel", "Extra-Clear Glass"],
    architecturalStyle: "Minimalist Monumentalism",
    client: "Oslo Contemporary Arts Society",
    team: ["Lara Shailora (Principal)", "Marcus Vance"],
    awards: ["Architectural Review Award 2023 - Winner"],
    description: "An exhibition center designed as a silent backdrop for contemporary sculpture. The design features cast-in-place white concrete walls that capture the subtle shift of northern light, making the building itself an atmospheric light-clock.",
    conceptText: "By filtering natural light through massive high-altitude skylights, the exhibition chambers maintain a constant, shadowless glow that flatters marble and metal sculptures without requiring electrical fixtures during daylight hours.",
    heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-concrete-building-facade-with-lines-41792-large.mp4",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80"
    ],
    drawings: [
      `<svg viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full text-zinc-400"><rect x="50" y="30" width="300" height="140" stroke-dasharray="2" /><path d="M 100,30 L 100,170 M 200,30 L 200,170 M 300,30 L 300,170" /><circle cx="200" cy="100" r="40" /><text x="160" y="105" font-family="monospace" font-size="8" fill="currentColor">ROTUNDA GALLERY</text></svg>`
    ],
    featured: true,
    homepageOrder: 2,
    tags: ["Museum", "Oslo", "Light", "White Concrete", "Terrazzo", "Silent"]
  },
  {
    id: "tectonic-headquarters",
    title: "The Tectonic Grid",
    location: "Frankfurt, Germany",
    year: "2025",
    category: "Commercial",
    status: "Construction",
    area: "14,500 m²",
    materialPalette: ["Precast Structural Concrete", "Low-Iron Triple Glazing", "Recycled Matte Aluminum"],
    architecturalStyle: "Structural Expressionism",
    client: "Vertex GmbH",
    team: ["Lara Shailora (Principal)", "Dieter Kraus", "Sven Ohmer"],
    awards: ["DGNB Platinum Pre-Certificate"],
    description: "A commercial high-rise representing carbon-neutral, self-shading structural engineering. The grid is not merely decorative; it carries the gravity loads of the floors, eliminating internal columns to guarantee maximum spatial fluidity.",
    conceptText: "The external precast grid is angled dynamically based on solar coordinates. This self-shades the glass facade during intense summer heat, while allowing low-angle winter sun to deeply penetrate and heat the concrete floor plates.",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-architecture-building-with-glass-facade-41793-large.mp4",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80"
    ],
    drawings: [
      `<svg viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full text-zinc-400"><line x1="50" y1="20" x2="50" y2="180" /><line x1="350" y1="20" x2="350" y2="180" /><path d="M 50,40 L 350,40 M 50,80 L 350,80 M 50,120 L 350,120 M 50,160 L 350,160" /><line x1="150" y1="20" x2="150" y2="180" stroke-dasharray="1 2" /><line x1="250" y1="20" x2="250" y2="180" stroke-dasharray="1 2" /><text x="60" y="35" font-family="monospace" font-size="8" fill="currentColor">LEVEL_04_PLATE</text></svg>`
    ],
    featured: false,
    homepageOrder: 3,
    tags: ["Tower", "Frankfurt", "Grid", "Glass", "Structural", "Sustainability"]
  },
  {
    id: "water-spa-pavilion",
    title: "Thermae Bath & Spa",
    location: "Vals, Switzerland",
    year: "2024",
    category: "Hospitality",
    status: "Completed",
    area: "850 m²",
    materialPalette: ["Local Vals Gneiss Stone", "Exposed Cast Concrete", "Raw Brass", "Thermal Water"],
    architecturalStyle: "Subterranean Organic",
    client: "Vals Thermal Resort",
    team: ["Lara Shailora (Principal)", "Amelie Dupont"],
    awards: ["Swiss Spatial Masterpiece 2024"],
    description: "An immersive spa where steam, shadow, and stone form a tactile choreography. Carved deep into the mountain, the hot mineral baths are flanked by heavy slab walls that create a quiet sense of safety and eternity.",
    conceptText: "The project acts as a sensorium. Lighting is purely atmospheric, delivered through underwater slots and slender ceiling cracks, casting caustic light ripples across the raw, dark slate finishes.",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [],
    drawings: [],
    featured: true,
    homepageOrder: 4,
    tags: ["Spa", "Switzerland", "Stone", "Water", "Light Reflection", "Tactile"]
  },
  {
    id: "sand-dunes-eco",
    title: "Elysian Dunes Reserve",
    location: "Al Ain, UAE",
    year: "2026",
    category: "Landscape",
    status: "Concept",
    area: "420,000 m²",
    materialPalette: ["Local Rammed Earth", "Salt-Crusted Limestone", "Desert Scrub", "Low-Water Eco-Concrete"],
    architecturalStyle: "Arid Vernacular Integration",
    client: "Environment Agency Abu Dhabi",
    team: ["Lara Shailora (Principal)", "Zari Al-Sabah", "Yuki Tanaka"],
    awards: ["World Architecture Festival - Future Landscape Project Award"],
    description: "A conservation and eco-education park that seamlessly dissolves into the wind-swept ripples of the Arabian desert. Rammed earth walkways wind through native dunes, guiding visitors through oasis rehabilitation sanctuaries.",
    conceptText: "The buildings utilize passive cooling wind-towers (Barjeels) updated with automated damper controls, maintaining temperature comfort zones 10°C cooler than the ambient desert using zero electricity.",
    heroImage: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [],
    drawings: [],
    featured: false,
    homepageOrder: 5,
    tags: ["Desert", "Earth", "Landscape", "Conservation", "UAE", "Thermal Mass"]
  },
  {
    id: "brutalist-sanctuary",
    title: "Brutalist Sanctuary",
    location: "Shizuoka, Japan",
    year: "2023",
    category: "Interior",
    status: "Completed",
    area: "210 m²",
    materialPalette: ["Formwork-Patterned Concrete", "Burnt Cedar (Shou Sugi Ban)", "Raw Aluminum Sheet", "Washi Paper"],
    architecturalStyle: "Zen Brutalism",
    client: "Nakamura Art Foundation",
    team: ["Lara Shailora (Principal)", "Takahiro Sato"],
    awards: ["Japan Interior Design Gold Prize"],
    description: "An interior intervention in a historical coastal concrete frame. The design strips back secondary drywall partitions to expose the magnificent 1970s structural concrete, introducing raw metal and charred wood partitions.",
    conceptText: "By inserting floating geometric planes of brushed aluminum and textured paper sliding screens, we divide the home into flexible zones that shift from an open creative studio to a silent meditative retreat.",
    heroImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
    ],
    drawings: [],
    featured: true,
    homepageOrder: 6,
    tags: ["Japan", "Concrete", "Burnt Wood", "Interior", "Zen", "Exposed Beam"]
  },
  {
    id: "aura-chair",
    title: "Aura Lounger Element",
    location: "SHAILORA Atelier",
    year: "2024",
    category: "Furniture",
    status: "Completed",
    area: "0.8 m²",
    materialPalette: ["Cast Solid Aluminum", "Polished Stainless Steel Slab", "Merino Felt Anchor"],
    architecturalStyle: "Architectonic Ergonomics",
    client: "Limited Production (Editions SHAILORA)",
    team: ["Lara Shailora (Principal)"],
    awards: ["Salone del Mobile - Innovation Award"],
    description: "A solid cast aluminum lounger that translates the cantilevered structural principles of civil bridges into a domestic body support. Extremely heavy, reflective, and completely seamless.",
    conceptText: "The surface is milled by a 5-axis CNC robot from a single billet of aeronautical alloy, then hand-polished over 80 hours to achieve an undulating specular finish that reflects surrounding floor textures.",
    heroImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [],
    drawings: [],
    featured: false,
    homepageOrder: 7,
    tags: ["Furniture", "Aluminum", "Cantilever", "Atelier", "Reflective", "Sculpture"]
  },
  {
    id: "megalith-pavilion",
    title: "The Megalithic Study",
    location: "Patagonia, Argentina",
    year: "2025",
    category: "Concepts",
    status: "Concept",
    area: "90 m²",
    materialPalette: ["Quarried Granite Block", "Tempered Structural Glass", "Satin Brass Finishes"],
    architecturalStyle: "Neo-Lithic Minimalism",
    client: "Self-Initiated Research",
    team: ["Lara Shailora (Principal)"],
    awards: [],
    description: "An architectural concept exploring the primitive act of placing a heavy lintel over vertical stones. Situated in the windswept grasslands of Patagonia, it acts as an absolute shelter and camera obscura for sky watching.",
    conceptText: "Three giant 40-ton slabs of raw, unpolished mountain granite are placed in a simple triangular formation. A single sheet of thick structural glass acts as the ceiling, protected from the gale-force winds by the height of the stone monoliths.",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [],
    drawings: [],
    featured: false,
    homepageOrder: 8,
    tags: ["Monolith", "Stone", "Patagonia", "Glass Ceiling", "Research", "Primitive"]
  },
  {
    id: "berlin-hybrid-hub",
    title: "Spree Canal Master Plan",
    location: "Berlin, Germany",
    year: "2026",
    category: "Master Planning",
    status: "Concept",
    area: "65,000 m²",
    materialPalette: ["Permeable Gravel", "Local Willow Plantations", "Bio-Cement Basins", "Solar Glass Roofs"],
    architecturalStyle: "Socio-Ecological Urbanism",
    client: "Senate Department for Urban Development",
    team: ["Lara Shailora (Principal)", "Lukas Fischer", "Clara Hoffmann"],
    awards: ["Urban Design Excellence Prize - Finalist"],
    description: "A regenerative master plan transforming an under-utilized Spree canal basin into a high-density communal garden and flood-resilient cultural district. The plan coordinates water storage, wetland filtration, and wooden co-housing units.",
    conceptText: "By stepping the public boardwalk into natural terraces, we absorb seasonal flood heights while purifying urban storm run-off through bio-engineered reed beds before the water flows back into the city's river system.",
    heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [],
    drawings: [],
    featured: false,
    homepageOrder: 9,
    tags: ["Berlin", "Masterplan", "Canal", "Timber", "Ecological", "Hydrology"]
  },
  {
    id: "minimalist-atrium-house",
    title: "Atrium of Light & Air",
    location: "Kyoto, Japan",
    year: "2024",
    category: "Residential",
    status: "Completed",
    area: "310 m²",
    materialPalette: ["Raw Concrete", "Light Cedar Wood", "Polished Screed", "Gravel Bedding"],
    architecturalStyle: "Sartorial Minimal",
    client: "The Horikawa Family",
    team: ["Lara Shailora (Principal)", "Takahiro Sato"],
    awards: ["Kyoto Eco-Residential Silver Award"],
    description: "A multi-generational home built around an internal courtyard that regulates climate and brings a slice of private nature into the dense urban context of Horikawa.",
    conceptText: "Sliding structural panels allow the home to completely open to the atrium in spring and autumn, expanding the living space outwards and integrating shadows of maple leaves into daily domestic activities.",
    heroImage: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    constructionPhotos: [
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80"
    ],
    drawings: [],
    featured: false,
    homepageOrder: 10,
    tags: ["Atrium", "Kyoto", "Residential", "Shadow", "Cedar", "Fluid Space"]
  }
];
