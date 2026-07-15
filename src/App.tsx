import React, { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Layers, FolderHeart, CalendarDays, KeyRound, Sun, Moon, VolumeX, Sparkles, Plus, Bookmark, X, Eye, HelpCircle } from "lucide-react";
import { Project, SearchFilters } from "./types";
import MasonryGrid from "./components/MasonryGrid";
import ProjectDetail from "./components/ProjectDetail";
import AdminCMS from "./components/AdminCMS";
import Cursor from "./components/Cursor";
import AudioPlayer from "./components/AudioPlayer";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Layout View States
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'portfolio' | 'timeline' | 'collection' | 'cms'>('portfolio');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem("shailora-theme");
    return (stored === "light" || stored === "dark") ? stored : "dark";
  });

  // Interactive Cursor & Hover tracking
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);

  // Search & Filters State
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    status: "",
    year: "",
    location: "",
    material: "",
  });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Favorites & Custom Collections
  const [favorites, setFavorites] = useState<string[]>([]);
  const [customCollections, setCustomCollections] = useState<{ id: string; name: string; projectIds: string[] }[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Admin access validation
  const [showAdminPassModal, setShowAdminPassModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState("");

  // Fetch projects on boot
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Could not fetch exhibits from structural backend");
      }
      const data = await response.json();
      setProjects(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load exhibitions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Sync favorites from LocalStorage
    const storedFavs = localStorage.getItem("shailora-favs");
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }

    const storedColls = localStorage.getItem("shailora-colls");
    if (storedColls) {
      setCustomCollections(JSON.parse(storedColls));
    }
    
    // Check initial hash router for direct sharing link e.g. /#project-obsidian-pavilion
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#project-")) {
        const id = hash.replace("#project-", "");
        setSelectedProjectId(id);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update theme on document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("shailora-theme", theme);
  }, [theme]);

  const handleToggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("shailora-favs", JSON.stringify(updated));
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    const newColl = {
      id: `coll-${Date.now()}`,
      name: newCollectionName.trim(),
      projectIds: [],
    };
    const updated = [...customCollections, newColl];
    setCustomCollections(updated);
    localStorage.setItem("shailora-colls", JSON.stringify(updated));
    setNewCollectionName("");
  };

  const handleAddProjectToCollection = (collId: string, projectId: string) => {
    const updated = customCollections.map((coll) => {
      if (coll.id === collId) {
        const alreadyHas = coll.projectIds.includes(projectId);
        return {
          ...coll,
          projectIds: alreadyHas
            ? coll.projectIds.filter((id) => id !== projectId)
            : [...coll.projectIds, projectId],
        };
      }
      return coll;
    });
    setCustomCollections(updated);
    localStorage.setItem("shailora-colls", JSON.stringify(updated));
  };

  // Authenticate Admin panel using the backend passcode API
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAdminAuthenticated(true);
          setShowAdminPassModal(false);
          setAdminPassword("");
          setAdminAuthError("");
          setCurrentView("cms");
        } else {
          setAdminAuthError("Invalid curatorial passcode.");
        }
      } else {
        setAdminAuthError("Authentication server error. Try again later.");
      }
    } catch (err) {
      setAdminAuthError("Connection error. Try again.");
    }
  };

  // Filter projects based on user query
  const getFilteredProjects = () => {
    return projects.filter((p) => {
      // Direct text search
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesQuery =
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.architecturalStyle.toLowerCase().includes(q) ||
          p.materialPalette.some((m) => m.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Filter category
      if (filters.category && p.category !== filters.category) return false;

      // Filter status
      if (filters.status && p.status !== filters.status) return false;

      // Filter year
      if (filters.year && p.year !== filters.year) return false;

      // Filter location
      if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;

      // Filter material
      if (filters.material && !p.materialPalette.some((m) => m.toLowerCase().includes(filters.material.toLowerCase()))) return false;

      return true;
    });
  };

  const filteredProjects = getFilteredProjects();

  // Reset all search parameters
  const handleClearFilters = () => {
    setFilters({
      query: "",
      category: "",
      status: "",
      year: "",
      location: "",
      material: "",
    });
  };

  // Find currently active project detail
  const activeProject = projects.find((p) => p.id === selectedProjectId);

  // Hover handlers to pass action tags to the custom cursor
  const handleHoverStart = (label: string) => setCursorLabel(label);
  const handleHoverEnd = () => setCursorLabel(null);

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col font-sans relative`}>
      
      {/* Absolute Custom Cursor Follower */}
      <Cursor label={cursorLabel} />

      {/* Audio Ambient Controller */}
      <AudioPlayer />

      {/* Brand Header Navigation */}
      <header className="py-6 px-6 md:px-12 flex justify-between items-center border-b border-neutral-100/40 dark:border-neutral-900/40 sticky top-0 z-30 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-md select-none print:hidden">
        
        {/* Brand Logo & Name */}
        <div
          onClick={() => {
            setSelectedProjectId(null);
            setCurrentView("portfolio");
          }}
          onMouseEnter={() => handleHoverStart("SHAILORA")}
          onMouseLeave={handleHoverEnd}
          className="flex items-center gap-4 cursor-pointer"
        >
          {/* High-fidelity uploaded SHAILORA Brand Identity Logo */}
          <div className="flex items-center justify-center transition-colors">
            <svg
              viewBox="0 0 100 50"
              className="w-[60px] h-[50px] fill-neutral-900 dark:fill-zinc-100 transition-colors duration-300"
            >
              <defs>
                <mask id="header-logo-mask">
                  {/* Everything under white will be visible */}
                  <rect x="0" y="0" width="100" height="50" fill="white" />
                  {/* Everything under black will be cut out (the center rectangle) */}
                  <rect x="35" y="20" width="30" height="10" rx="1.5" ry="1.5" fill="black" />
                </mask>
              </defs>
              <g mask="url(#header-logo-mask)">
                {/* Overlapping rounded shapes forming the cohesive premium logo silhouette */}
                <rect x="5" y="22" width="12" height="6" rx="2" ry="2" />
                <rect x="83" y="22" width="12" height="6" rx="2" ry="2" />
                <rect x="14" y="14" width="14" height="22" rx="3.5" ry="3.5" />
                <rect x="72" y="14" width="14" height="22" rx="3.5" ry="3.5" />
                <rect x="25" y="10" width="50" height="30" rx="4.5" ry="4.5" />
                <rect x="35" y="2" width="30" height="12" rx="3.5" ry="3.5" />
                <rect x="35" y="36" width="30" height="12" rx="3.5" ry="3.5" />
              </g>
            </svg>
          </div>
          
          <span className="font-serif font-medium tracking-[0.25em] text-xs uppercase text-neutral-800 dark:text-zinc-100">
            SHAILORA
          </span>
        </div>

        {/* Dynamic Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-mono tracking-widest uppercase">
          <button
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentView("portfolio");
            }}
            onMouseEnter={() => handleHoverStart("ARCHIVE")}
            onMouseLeave={handleHoverEnd}
            className={`transition-colors py-1 ${currentView === 'portfolio' && !selectedProjectId ? 'text-neutral-900 dark:text-white border-b border-neutral-900 dark:border-white' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            Archive
          </button>

          <button
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentView("timeline");
            }}
            onMouseEnter={() => handleHoverStart("CHRONICLE")}
            onMouseLeave={handleHoverEnd}
            className={`transition-colors py-1 ${currentView === 'timeline' ? 'text-neutral-900 dark:text-white border-b border-neutral-900 dark:border-white' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            Timeline
          </button>

          <button
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentView("collection");
            }}
            onMouseEnter={() => handleHoverStart("COLLECTIONS")}
            onMouseLeave={handleHoverEnd}
            className={`transition-colors py-1 ${currentView === 'collection' ? 'text-neutral-900 dark:text-white border-b border-neutral-900 dark:border-white' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            My Collections ({favorites.length})
          </button>
        </nav>

        {/* Action Controls (Theme Toggle Only) */}
        <div className="flex items-center gap-4">
          
          {/* Light/Dark Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            onMouseEnter={() => handleHoverStart(theme === "light" ? "DARK MODE" : "LIGHT MODE")}
            onMouseLeave={handleHoverEnd}
            className="p-2 text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors border border-neutral-100 dark:border-neutral-900 rounded-full"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
          </button>
        </div>
      </header>

      {/* Exhibition Modal / Sliding room if project is selected */}
      {activeProject && (
        <div className="relative z-40 animate-fade-in">
          <ProjectDetail
            project={activeProject}
            allProjects={projects}
            onBack={() => {
              setSelectedProjectId(null);
              window.location.hash = "";
            }}
            onNavigateToProject={(id) => {
              setSelectedProjectId(id);
              window.location.hash = `#project-${id}`;
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
            onUpdateProject={(updatedProj) => {
              setProjects((prev) =>
                prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
              );
            }}
          />
        </div>
      )}

      {/* Main Container */}
      {!activeProject && (
        <main className="flex-1">
          
          {/* 1. PORTFOLIO EXHIBITIONS ROOM */}
          {currentView === "portfolio" && (
            <div className="py-12 px-8 md:px-12 w-full max-w-none mx-auto space-y-16">
              
              {/* Editorial Introductory Text */}
              <div className="max-w-4xl space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 block">SHAILORA DESIGN STUDY // EST. 2018</span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-sans font-light tracking-tight text-neutral-800 dark:text-neutral-200 leading-snug uppercase">
                  A quiet contemporary digital archive. Walk through unbuilt spaces, tactile concrete forms, and silent volumetric blueprints.
                </h2>
              </div>

              {/* Instant Search & Minimal Floating Filters row */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-t border-b border-neutral-100 dark:border-neutral-900 py-6 select-none">
                
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by project, material, style, city..."
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                  />
                  {filters.query && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, query: "" }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Filters Toggle & Active Tags indicators */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    onMouseEnter={() => handleHoverStart("FILTERS")}
                    onMouseLeave={handleHoverEnd}
                    className={`flex items-center gap-2 px-4 py-2.5 border text-xs font-mono uppercase tracking-widest transition-all rounded ${
                      showFiltersPanel || Object.values(filters).some(v => v !== "")
                        ? "border-neutral-800 bg-neutral-900 text-white dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-950"
                        : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                    }`}
                  >
                    <SlidersHorizontal size={12} /> Filters
                  </button>

                  {Object.values(filters).some(v => v !== "") && (
                    <button
                      onClick={handleClearFilters}
                      className="text-[10px] font-mono uppercase text-red-500 hover:text-red-600 tracking-wider"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Architectural Filter Panels */}
              {showFiltersPanel && (
                <div className="p-6 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900 rounded-lg grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 animate-fade-in select-none">
                  {/* Category Filter */}
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono rounded"
                    >
                      <option value="">All Categories</option>
                      {Array.from(new Set(projects.map(p => p.category))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">Build Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono rounded"
                    >
                      <option value="">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Construction">Construction</option>
                      <option value="Concept">Concept</option>
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">Chronology</label>
                    <select
                      value={filters.year}
                      onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono rounded"
                    >
                      <option value="">All Years</option>
                      {Array.from(new Set(projects.map(p => p.year))).sort().map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">Location Territory</label>
                    <input
                      type="text"
                      placeholder="e.g. Iceland, Japan"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono rounded focus:outline-none"
                    />
                  </div>

                  {/* Material Palette Filter */}
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">Core Material</label>
                    <input
                      type="text"
                      placeholder="e.g. Concrete, Wood"
                      value={filters.material}
                      onChange={(e) => setFilters(prev => ({ ...prev, material: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono rounded focus:outline-none"
                    />
                  </div>

                  {/* Info helper */}
                  <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 text-[10px] font-mono leading-relaxed pt-4 md:pt-0">
                    <HelpCircle size={14} />
                    <span>Instant filter computation active</span>
                  </div>
                </div>
              )}

              {/* Curated Pinterest-style Masonry Gallery */}
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-800 dark:border-neutral-700 dark:border-t-neutral-200 rounded-full animate-spin" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Restructuring architectural museum walls...</span>
                </div>
              ) : error ? (
                <div className="p-8 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-md text-center max-w-lg mx-auto">
                  <h4 className="font-mono text-xs text-red-600 dark:text-red-400 uppercase font-bold mb-2">Ledger Synchronization Error</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed uppercase">{error}</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="py-24 text-center space-y-3">
                  <Layers size={32} className="mx-auto text-neutral-300 dark:text-neutral-700" />
                  <h4 className="font-mono text-xs uppercase text-neutral-400">No matching exhibits found</h4>
                  <p className="text-[10px] font-mono uppercase text-neutral-300 cursor-pointer underline" onClick={handleClearFilters}>
                    Reset structural coordinates
                  </p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <MasonryGrid
                    projects={filteredProjects}
                    onProjectClick={(p) => {
                      // Navigate via hash router for perfect sharing experience
                      const id = (p as any).originalId || p.id;
                      setSelectedProjectId(id);
                      window.location.hash = `#project-${id}`;
                    }}
                    onHoverStart={handleHoverStart}
                    onHoverEnd={handleHoverEnd}
                    favorites={favorites}
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. CHRONICLE TIMELINE VIEW */}
          {currentView === "timeline" && (
            <div className="py-16 px-6 md:px-12 max-w-5xl mx-auto space-y-12">
              <div className="space-y-3 text-center mb-16 select-none">
                <CalendarDays size={28} className="mx-auto text-neutral-400" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 block">Atelier Chronicle ledger</span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans font-light uppercase tracking-tight">Timeline of Realized Tectonics</h2>
              </div>

              {/* Vertical Chronological ledger */}
              <div className="relative border-l border-neutral-200 dark:border-neutral-800 pl-8 space-y-16 py-4">
                {projects
                  .sort((a, b) => parseInt(b.year) - parseInt(a.year))
                  .map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        window.location.hash = `#project-${p.id}`;
                      }}
                      onMouseEnter={() => handleHoverStart("ENTER ROOM")}
                      onMouseLeave={handleHoverEnd}
                      className="relative group cursor-pointer"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:bg-neutral-900 dark:group-hover:bg-white">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-white dark:group-hover:bg-black" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-neutral-50/40 dark:bg-neutral-900/20 p-6 rounded border border-neutral-100/50 dark:border-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                        {/* Chrono details */}
                        <div className="md:col-span-3 text-left">
                          <span className="text-2xl md:text-3xl font-serif text-neutral-800 dark:text-neutral-100 font-medium leading-none">
                            {p.year}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-400 block uppercase mt-1">/ {p.category}</span>
                        </div>

                        {/* Project Details */}
                        <div className="md:col-span-6 space-y-2">
                          <h3 className="text-sm font-sans uppercase font-bold text-neutral-800 dark:text-zinc-100">{p.title}</h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">{p.description}</p>
                          <div className="flex gap-2 text-[9px] font-mono text-neutral-400 uppercase mt-2">
                            <span>Area: {p.area}</span>
                            <span>•</span>
                            <span>{p.location}</span>
                          </div>
                        </div>

                        {/* Right image banner preview */}
                        <div className="md:col-span-3 h-20 overflow-hidden bg-neutral-200 rounded relative shadow-sm border border-neutral-200/20">
                          <img
                            src={p.heroImage}
                            alt={p.title}
                            className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* 3. FAVORITES & MUSEUM LOG VIEW */}
          {currentView === "collection" && (
            <div className="py-16 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-100 dark:border-neutral-900 pb-8 gap-4 select-none animate-fade-in">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 block mb-2">PERSONAL SELECTION ROOM</span>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans font-light uppercase tracking-tight">Your Curated Collection</h2>
                </div>

                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-800 dark:border-neutral-200 text-xs font-mono uppercase tracking-widest text-neutral-800 dark:text-white hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition-all rounded"
                >
                  <Plus size={14} /> Group Collections
                </button>
              </div>

              {favorites.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <Bookmark size={36} className="mx-auto text-neutral-300 dark:text-neutral-700" />
                  <h4 className="font-mono text-xs uppercase text-neutral-400">Curator Folder is Empty</h4>
                  <p className="text-[10px] font-mono uppercase text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    Hover over projects on the masonry gallery wall and click the heart icon to organize your custom museum collections.
                  </p>
                  <button
                    onClick={() => setCurrentView("portfolio")}
                    className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-black text-xs font-mono uppercase tracking-widest rounded"
                  >
                    Examine Gallery
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  
                  {/* Default Favorites Wall */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">Core Bookmarked Exhibits ({favorites.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {projects
                        .filter((p) => favorites.includes(p.id))
                        .map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProjectId(p.id);
                              window.location.hash = `#project-${p.id}`;
                            }}
                            onMouseEnter={() => handleHoverStart("OPEN")}
                            onMouseLeave={handleHoverEnd}
                            className="group cursor-pointer space-y-4"
                          >
                            <div className="relative overflow-hidden h-[300px] bg-neutral-200 rounded-sm">
                              <img
                                src={p.heroImage}
                                alt={p.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-sans uppercase font-medium tracking-tight text-neutral-800 dark:text-zinc-200">
                                {p.title}
                              </h4>
                              <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase mt-1">
                                <span>{p.location}</span>
                                <span>{p.year}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Custom Folders Section */}
                  {customCollections.length > 0 && (
                    <div className="space-y-8 pt-12 border-t border-neutral-100 dark:border-neutral-900">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">Group Folders ({customCollections.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {customCollections.map((coll) => (
                          <div key={coll.id} className="border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/10 space-y-6">
                            <div className="flex justify-between items-baseline border-b border-neutral-100 dark:border-neutral-800 pb-3">
                              <h4 className="text-sm font-mono uppercase text-neutral-800 dark:text-zinc-200 font-bold">{coll.name}</h4>
                              <span className="text-[10px] font-mono text-neutral-400">{coll.projectIds.length} ITEMS</span>
                            </div>

                            {coll.projectIds.length === 0 ? (
                              <p className="text-[10px] font-mono text-neutral-400 uppercase italic">No projects assigned yet. Use custom collection settings below to append exhibits.</p>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                {projects
                                  .filter((p) => coll.projectIds.includes(p.id))
                                  .map((p) => (
                                    <div
                                      key={p.id}
                                      onClick={() => setSelectedProjectId(p.id)}
                                      className="h-14 bg-zinc-200 rounded overflow-hidden cursor-pointer"
                                    >
                                      <img src={p.heroImage} className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Dropdowns to toggle additions */}
                            <div className="space-y-2 pt-2 text-xs">
                              <span className="text-[9px] font-mono text-neutral-400 uppercase block">Assign bookmarked space:</span>
                              <div className="flex flex-wrap gap-2">
                                {projects
                                  .filter((p) => favorites.includes(p.id))
                                  .map((p) => {
                                    const isAssigned = coll.projectIds.includes(p.id);
                                    return (
                                      <button
                                        key={p.id}
                                        onClick={() => handleAddProjectToCollection(coll.id, p.id)}
                                        className={`px-2 py-1 text-[9px] font-mono uppercase border rounded transition-all ${
                                          isAssigned
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                            : "border-neutral-200 hover:border-neutral-800 text-neutral-500"
                                        }`}
                                      >
                                        {isAssigned ? "✓" : "+"} {p.title.split(" ")[0]}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* 4. FULL ADMIN CABINET AREA (Express driven CMS) */}
          {currentView === "cms" && (
            <div className="animate-fade-in relative z-40">
              <AdminCMS
                projects={projects}
                onBack={() => {
                  setCurrentView("portfolio");
                }}
                onRefreshProjects={fetchProjects}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            </div>
          )}

        </main>
      )}

      {/* Editorial Symmetrical Footer */}
      {!activeProject && currentView !== 'cms' && (
        <footer className="border-t border-neutral-100 dark:border-neutral-900 py-12 px-6 md:px-12 mt-16 select-none bg-neutral-50/50 dark:bg-neutral-950 print:hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            <div className="flex items-center gap-3">
              <button
                id="admin-cms-dot-trigger"
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setCurrentView("cms");
                  } else {
                    setShowAdminPassModal(true);
                  }
                }}
                onMouseEnter={() => handleHoverStart("CMS CABINET")}
                onMouseLeave={handleHoverEnd}
                className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-800 hover:bg-neutral-500 dark:hover:bg-neutral-500 transition-all cursor-pointer mr-1 shrink-0"
                aria-label="Admin CMS Cabinet"
              />
              <svg viewBox="0 0 100 60" fill="currentColor" className="w-6 h-4 opacity-40">
                <path d="M 0,30 L 12,30 L 12,24 L 28,24 L 28,18 L 44,18 L 44,12 L 56,12 L 56,18 L 72,18 L 72,24 L 88,24 L 88,30 L 100,30 L 100,36 L 88,36 L 88,42 L 72,42 L 72,48 L 56,48 L 56,54 L 44,54 L 44,48 L 28,48 L 28,42 L 12,42 L 12,36 L 0,36 Z" />
                <rect x="36" y="27" width="28" height="6" fill="white" />
              </svg>
              <span>© {new Date().getFullYear()} SHAILORA STUDIO. All Rights Reserved.</span>
            </div>
          </div>
        </footer>
      )}

      {/* Admin Passcode Modal Entry overlay */}
      <AnimatePresence>
        {showAdminPassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg max-w-sm w-full text-center space-y-6 text-zinc-100"
            >
              <div className="space-y-2">
                <KeyRound size={24} className="mx-auto text-zinc-400" />
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-zinc-200">EXHIBITION ROOM CMS AUTH</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">Enter curatorial key to access construction blueprint settings</p>
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter curatorial passcode"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded px-4 py-2.5 text-xs font-mono text-center text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                
                {adminAuthError && (
                  <p className="text-[9px] font-mono text-red-500 uppercase font-medium">{adminAuthError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminPassModal(false);
                      setAdminPassword("");
                      setAdminAuthError("");
                    }}
                    className="flex-1 py-2 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white text-[10px] font-mono uppercase tracking-widest rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-[10px] font-mono uppercase tracking-widest rounded"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Folders naming prompt modal overlay */}
      <AnimatePresence>
        {showCollectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-8 rounded-lg max-w-sm w-full space-y-6"
            >
              <div className="space-y-1">
                <Bookmark size={20} className="text-neutral-400" />
                <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Group Custom Collection</h3>
                <p className="text-[9px] font-mono text-neutral-400 uppercase">Organize bookmarked architectural designs into thematic spaces</p>
              </div>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="e.g. Nordic Brutalist Homes, Swiss Bathhouses"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-zinc-800 rounded px-4 py-2.5 text-xs font-mono text-neutral-800 dark:text-zinc-200 focus:outline-none"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCollectionModal(false);
                      setNewCollectionName("");
                    }}
                    className="flex-1 py-2 border border-neutral-200 dark:border-zinc-800 text-neutral-500 text-[10px] font-mono uppercase tracking-widest rounded"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-neutral-900 text-white dark:bg-zinc-100 dark:text-black font-bold text-[10px] font-mono uppercase tracking-widest rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
