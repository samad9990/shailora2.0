export interface ExternalLink {
  label: string;
  url: string;
  type: 'video' | 'article' | 'social' | 'other';
}

export interface Project {
  id: string;
  title: string;
  location: string;
  year: string;
  category: string; // Residential, Commercial, Hospitality, Landscape, Interior, Master Planning, Competition, Research, Furniture, Concepts
  status: 'Completed' | 'Construction' | 'Concept';
  area: string; // e.g., "450 m²"
  materialPalette: string[]; // e.g., ["Raw Concrete", "Anodized Aluminum", "Timber", "Glass"]
  architecturalStyle: string; // e.g., "Brutalist Minimalism", "Tectonic", "Organic Modernism"
  client: string;
  team: string[];
  awards: string[];
  description: string;
  conceptText: string;
  heroImage: string;
  videoUrl?: string; // Optional video URL for autoplay masonry card
  images: string[]; // Gallery images
  constructionPhotos: string[]; // Construction phase images
  drawings: string[]; // Blueprint/section SVG representations or vector drawing URLs
  featured: boolean;
  homepageOrder: number;
  tags: string[];
  // Before & after image comparison
  comparisonBeforeImage?: string;
  comparisonAfterImage?: string;
  comparisonLabelBefore?: string;
  comparisonLabelAfter?: string;
  externalLinks?: ExternalLink[];
  exhibitionMedia?: any[];
  conceptBgColor?: string;
  conceptSocialLinks?: { url: string; title: string; type: 'instagram' | 'youtube' | 'video' | 'tiktok' | 'gallery' }[];
  conceptExtraMedia?: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  projectIds: string[];
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  status: string;
  year: string;
  location: string;
  material: string;
}

export interface AICritique {
  philosophy: string;
  spatialExperience: string;
  materialTectonics: string;
  environmentalIntegration: string;
  curatedRecommendations: string[];
}
