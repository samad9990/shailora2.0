import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, BookOpen, Heart, Share2, Printer, ChevronLeft, ChevronRight, X, Play, VolumeX, Volume2, ArrowUpRight, Globe, Upload, Link, Trash2, ExternalLink, FileVideo, Image, Plus, Video, Instagram, Facebook } from "lucide-react";
import { Project, AICritique } from "../types";
import { motion, AnimatePresence } from "motion/react";
import ComparisonSlider from "./ComparisonSlider";
import ImmersiveStorytelling from "./ImmersiveStorytelling";

interface ProjectDetailProps {
  project: Project;
  allProjects: Project[];
  onBack: () => void;
  onNavigateToProject: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onHoverStart?: (label: string) => void;
  onHoverEnd?: () => void;
  onUpdateProject?: (updatedProject: Project) => void;
}

export default function ProjectDetail({
  project,
  allProjects,
  onBack,
  onNavigateToProject,
  favorites,
  onToggleFavorite,
  onHoverStart,
  onHoverEnd,
  onUpdateProject,
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'exhibition' | 'technical' | 'materials'>('exhibition');
  const [aiCritique, setAiCritique] = useState<AICritique | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Exhibition Media Management
  const [localMedia, setLocalMedia] = useState<any[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [columns, setColumns] = useState<any[][]>([]);

  // Distribute localMedia across columns based on viewport size for responsive masonry
  useEffect(() => {
    const distributeMedia = () => {
      const width = window.innerWidth;
      let numCols = 3;
      if (width < 640) numCols = 1;
      else if (width < 1024) numCols = 2;

      const distributed: any[][] = Array.from({ length: numCols }, () => []);
      localMedia.forEach((item, idx) => {
        distributed[idx % numCols].push(item);
      });
      setColumns(distributed);
    };

    distributeMedia();
    window.addEventListener("resize", distributeMedia);
    return () => window.removeEventListener("resize", distributeMedia);
  }, [localMedia]);

  // Sync localMedia when project changes
  useEffect(() => {
    if ((project as any).exhibitionMedia && (project as any).exhibitionMedia.length > 0) {
      setLocalMedia((project as any).exhibitionMedia);
    } else {
      const list: any[] = [];
      if (project.videoUrl) {
        list.push({
          id: "video-main",
          type: "video",
          url: project.videoUrl,
          title: "Cinematic Video Tour",
          platform: "local"
        });
      }
      project.images.forEach((img, i) => {
        list.push({
          id: `image-${i}`,
          type: "image",
          url: img,
          title: `${project.title} Gallery #${i + 1}`,
          platform: "local"
        });
      });
      setLocalMedia(list);
    }
    setActivePlayerId(null);
  }, [project]);

  const getEmbedUrl = (url: string) => {
    if (!url) return { type: 'direct' as const, embedUrl: '' };

    const urlLower = url.toLowerCase();

    // YouTube Patterns
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return { type: 'youtube' as const, embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0&rel=0` };
    }

    // Vimeo Patterns
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return { type: 'vimeo' as const, embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
    }

    // Instagram Patterns
    if (urlLower.includes("instagram.com")) {
      const baseUrl = url.split('?')[0].replace(/\/$/, "");
      return { type: 'instagram' as const, embedUrl: `${baseUrl}/embed/` };
    }

    // Facebook Patterns
    if (urlLower.includes("facebook.com")) {
      const isVideo = urlLower.includes("/videos/") || urlLower.includes("/watch") || urlLower.includes("fb.watch");
      const plugin = isVideo ? "video.php" : "post.php";
      return {
        type: 'facebook' as const,
        embedUrl: `https://www.facebook.com/plugins/${plugin}?href=${encodeURIComponent(url)}&show_text=0&show_captions=true`
      };
    }

    // TikTok Patterns
    if (urlLower.includes("tiktok.com")) {
      const ttMatch = url.match(/video\/(\d+)/i);
      if (ttMatch && ttMatch[1]) {
        return { type: 'tiktok' as const, embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` };
      }
    }

    // Pinterest Patterns
    if (urlLower.includes("pinterest.com")) {
      const pinMatch = url.match(/pin\/(\d+)/i);
      if (pinMatch && pinMatch[1]) {
        return { type: 'pinterest' as const, embedUrl: `https://assets.pinterest.com/ext/embed.html?id=${pinMatch[1]}` };
      }
    }

    return { type: 'direct' as const, embedUrl: url };
  };

  // Scroll to top on mount or project change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAiCritique(null);
    setAiError(null);
    setIsPlayingVideo(false);
  }, [project.id]);

  // Handle keyboard navigation for fullscreen gallery
  useEffect(() => {
    if (!showSlideshow) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "Escape") {
        setShowSlideshow(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSlideshow, slideshowIndex, project.images]);

  const handleNextSlide = () => {
    setSlideshowIndex((prev) => (prev + 1) % project.images.length);
  };

  const handlePrevSlide = () => {
    setSlideshowIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  // Trigger server-side Gemini critique
  const handleGenerateCritique = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch(`/api/projects/${project.id}/ai-critique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to reach Gemini analytical server");
      }
      const data = await response.json();
      setAiCritique(data);
    } catch (err: any) {
      setAiError(err.message || "An unexpected error occurred during AI analysis.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#project-${project.id}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isFavorited = favorites.includes(project.id);

  // Recommendation logic: Pinterest-style recommendations
  // Matches based on category, material overlap, architectural style, and tags
  const getRecommendations = () => {
    const scores = allProjects
      .filter((p) => p.id !== project.id)
      .map((p) => {
        let score = 0;
        // Category weight
        if (p.category === project.category) score += 5;
        // Style weight
        if (p.architecturalStyle === project.architecturalStyle) score += 4;
        // Materials overlap weight
        const materialsOverlap = p.materialPalette.filter((m) => project.materialPalette.includes(m)).length;
        score += materialsOverlap * 3;
        // Tags overlap weight
        const tagsOverlap = p.tags.filter((t) => project.tags.includes(t)).length;
        score += tagsOverlap * 2;
        // Location weight
        if (p.location.split(",").pop()?.trim() === project.location.split(",").pop()?.trim()) {
          score += 2;
        }
        return { project: p, score };
      });

    // Sort descending by score, take top 4
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.project);
  };

  const recommendedProjects = getRecommendations();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-neutral-900 dark:text-neutral-100 print:bg-white print:text-black transition-colors duration-500">
      {/* Editorial Header Controls */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-neutral-100/50 dark:border-neutral-800/50 py-4 px-6 md:px-12 flex justify-between items-center print:hidden">
        <button
          onClick={onBack}
          onMouseEnter={() => onHoverStart && onHoverStart("BACK")}
          onMouseLeave={onHoverEnd}
          className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors uppercase font-semibold"
        >
          <ArrowLeft size={14} /> Close Exhibit
        </button>

        <div className="flex items-center gap-4">
          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(project.id)}
            onMouseEnter={() => onHoverStart && onHoverStart(isFavorited ? "REMOVE" : "COLLECT")}
            onMouseLeave={onHoverEnd}
            className={`p-2 rounded-full border transition-all duration-300 ${
              isFavorited
                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-500"
                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-800 dark:hover:border-neutral-200 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            <Heart size={15} fill={isFavorited ? "currentColor" : "none"} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            onMouseEnter={() => onHoverStart && onHoverStart(copiedShare ? "COPIED" : "SHARE")}
            onMouseLeave={onHoverEnd}
            className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-neutral-800 dark:hover:border-neutral-200 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-300"
          >
            <Share2 size={15} />
          </button>

          {/* Print / PDF Download */}
          <button
            onClick={handlePrint}
            onMouseEnter={() => onHoverStart && onHoverStart("PRINT PDF")}
            onMouseLeave={onHoverEnd}
            className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-neutral-800 dark:hover:border-neutral-200 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-300"
            title="Download PDF Dossier"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Cinematic Hero Section */}
      <div className="relative w-full h-[85vh] overflow-hidden bg-neutral-900 flex items-center justify-center print:h-[500px]">
        {project.videoUrl && isPlayingVideo ? (
          <div className="absolute inset-0 w-full h-full bg-black">
            {(() => {
              const videoInfo = getEmbedUrl(project.videoUrl);
              if (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') {
                return (
                  <iframe
                    src={videoInfo.embedUrl}
                    title="Project Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full object-cover"
                  />
                );
              } else {
                return (
                  <video
                    src={project.videoUrl}
                    autoPlay
                    controls
                    loop
                    className="w-full h-full object-cover"
                  />
                );
              }
            })()}
            <button
              onClick={() => setIsPlayingVideo(false)}
              className="absolute top-24 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-mono px-4 py-2 rounded uppercase tracking-wider transition-colors z-50"
            >
              Exited Video
            </button>
          </div>
        ) : (
          <>
            <img
              src={project.heroImage}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover opacity-90 scale-100 transition-transform duration-[10000ms] ease-out select-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />

            {project.videoUrl && (
              <button
                onClick={() => setIsPlayingVideo(true)}
                onMouseEnter={() => onHoverStart && onHoverStart("PLAY")}
                onMouseLeave={onHoverEnd}
                className="absolute z-10 w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 backdrop-blur-lg flex items-center justify-center text-white transition-all duration-500 hover:scale-110"
              >
                <Play fill="currentColor" size={24} className="ml-1" />
              </button>
            )}

            {/* Floating Title / Meta */}
            <div className="absolute bottom-12 left-6 md:left-16 right-6 text-white max-w-4xl z-20">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-80 block mb-3">
                {project.category} // {project.architecturalStyle}
              </span>
              <h1 className="text-5xl md:text-8xl font-sans font-medium tracking-tight leading-none uppercase select-text mb-4">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-mono opacity-80 uppercase tracking-widest">
                <span>Location: {project.location}</span>
                <span>Year: {project.year}</span>
                <span>Area: {project.area}</span>
                <span>Status: {project.status}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Exhibition Room / Editorial Split Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
        
        {/* Left Column: Philosophical Manifestos */}
        <div className="lg:col-span-7 space-y-12">
          {/* Core Description */}
          <section className="space-y-6">
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-bold">01 / Curatorial Synopsis</h2>
            <p className="text-xl md:text-2xl font-light text-neutral-800 leading-relaxed font-sans tracking-wide text-justify text-neutral-800 dark:text-neutral-200">
              {project.description}
            </p>
          </section>

          {/* Before / After comparison if present */}
          {project.comparisonBeforeImage && project.comparisonAfterImage && (
            <section className="space-y-6 pt-10">
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-bold">03 / Space Comparison</h2>
              <div className="rounded-lg overflow-hidden">
                <ComparisonSlider
                  beforeImage={project.comparisonBeforeImage}
                  afterImage={project.comparisonAfterImage}
                  beforeLabel={project.comparisonLabelBefore || "Before"}
                  afterLabel={project.comparisonLabelAfter || "Realized"}
                  onHoverStart={() => onHoverStart && onHoverStart("SLIDE")}
                  onHoverEnd={onHoverEnd}
                />
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Rigid Specifications */}
        <div className="lg:col-span-5 space-y-12">
          
          {/* Spatial Specs Card */}
          <div className="border border-neutral-200/60 dark:border-neutral-800 p-8 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 space-y-8">
            <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-bold border-b border-neutral-100 dark:border-neutral-800 pb-3">Tectonic Specifications</h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-xs">
              <div>
                <span className="text-neutral-400 block mb-1 font-mono uppercase text-[9px]">Client</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{project.client}</span>
              </div>
              
              <div>
                <span className="text-neutral-400 block mb-1 font-mono uppercase text-[9px]">Location</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{project.location}</span>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1 font-mono uppercase text-[9px]">Building Scale</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{project.area}</span>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1 font-mono uppercase text-[9px]">Completion Year</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{project.year}</span>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1 font-mono uppercase text-[9px]">Tectonic Style</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{project.architecturalStyle}</span>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1 font-mono uppercase text-[9px]">Project Status</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{project.status}</span>
              </div>
            </div>

            {/* Material Chips */}
            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 block font-mono uppercase text-[9px]">Material Palette</span>
              <div className="flex flex-wrap gap-2">
                {project.materialPalette.map((mat) => (
                  <span
                    key={mat}
                    className="px-2.5 py-1 text-[10px] font-mono tracking-wide bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 uppercase"
                  >
                    {mat}
                  </span>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <span className="text-neutral-400 block font-mono uppercase text-[9px]">Atelier Team</span>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                {project.team.join(", ")}
              </p>
            </div>

            {/* Awards */}
            {project.awards && project.awards.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="text-neutral-400 block font-mono uppercase text-[9px]">Accolades & Distinctions</span>
                <ul className="space-y-1.5">
                  {project.awards.map((award, i) => (
                    <li key={i} className="text-neutral-700 dark:text-neutral-300 font-sans italic flex items-start gap-2">
                      <span className="text-neutral-300 font-mono">•</span> {award}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 02 / Site, Logic and Concept Section (Cinematic vertical scroll drives horizontal presentation) */}
      <ImmersiveStorytelling
        project={project}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      />

      {/* Expanded Project Exhibition Tabs Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-neutral-100 dark:border-neutral-800 print:hidden">
        {/* Tabs Navigation Header */}
        <div className="flex border-b border-neutral-150 dark:border-neutral-800 pb-3 mb-10 gap-8 justify-start items-center">
          <button
            onClick={() => setActiveTab('exhibition')}
            className={`text-[11px] font-mono uppercase tracking-[0.25em] pb-3 transition-all duration-300 relative ${
              activeTab === 'exhibition' ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            PROJECT ARCHIVE ({localMedia.length})
            {activeTab === 'exhibition' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900 dark:bg-white" />}
          </button>
          
          {project.drawings && project.drawings.length > 0 && (
            <button
              onClick={() => setActiveTab('technical')}
              className={`text-[11px] font-mono uppercase tracking-[0.25em] pb-3 transition-all duration-300 relative ${
                activeTab === 'technical' ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Technical Blueprints ({project.drawings.length})
              {activeTab === 'technical' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900 dark:bg-white" />}
            </button>
          )}

          {project.constructionPhotos && project.constructionPhotos.length > 0 && (
            <button
              onClick={() => setActiveTab('materials')}
              className={`text-[11px] font-mono uppercase tracking-[0.25em] pb-3 transition-all duration-300 relative ${
                activeTab === 'materials' ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              In-Progress Archive ({project.constructionPhotos.length})
              {activeTab === 'materials' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900 dark:bg-white" />}
            </button>
          )}
        </div>

        {/* Exhibition Tab (Curated Gallery) */}
        {activeTab === 'exhibition' && (
          <div className="space-y-8">
            {localMedia.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-neutral-200 rounded-2xl space-y-3 bg-neutral-50/30">
                <Image size={32} className="mx-auto text-neutral-300" />
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Project Archive is Empty</p>
                <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">Curated media will appear here as soon as they are uploaded in the Admin CMS.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {columns.map((col, colIdx) => (
                  <div key={`col-${colIdx}`} className="flex flex-col gap-8">
                    {col.map((item, itemIdx) => {
                      const embedInfo = item.url ? getEmbedUrl(item.url) : { type: 'direct' as const, embedUrl: '' };
                      const isPlayingInline = activePlayerId === item.id;

                      return (
                        <div
                          key={`item-${item.id || itemIdx}-${colIdx}-${itemIdx}`}
                          className="bg-white dark:bg-zinc-950 border border-neutral-200/60 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col relative group hover:-translate-y-1"
                        >
                          {/* Media Visual Stage */}
                          <div className="relative overflow-hidden w-full h-auto bg-neutral-50 dark:bg-zinc-900/10">
                            {item.type === 'video' && item.platform === 'local' ? (
                              <video
                                src={item.url}
                                controls
                                className="w-full h-auto block rounded-t-2xl"
                              />
                            ) : item.type === 'embed' && isPlayingInline ? (
                              <div className="relative w-full aspect-video">
                                <iframe
                                  src={embedInfo.embedUrl}
                                  className="absolute inset-0 w-full h-full border-0 rounded-t-2xl"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <div className="relative cursor-pointer">
                                {item.coverImage ? (
                                  <img
                                    src={item.coverImage}
                                    alt={item.title || "Archive Media"}
                                    className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02]"
                                    referrerPolicy="no-referrer"
                                    onClick={() => {
                                      if (item.type === 'embed') {
                                        setActivePlayerId(item.id);
                                      } else {
                                        const imgIdxInList = project.images.indexOf(item.url);
                                        if (imgIdxInList !== -1) {
                                          setSlideshowIndex(imgIdxInList);
                                          setShowSlideshow(true);
                                        } else {
                                          setSlideshowIndex(0);
                                          setShowSlideshow(true);
                                        }
                                      }
                                    }}
                                  />
                                ) : item.type === 'embed' ? (
                                  <div 
                                    className="w-full aspect-video flex flex-col items-center justify-center p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-zinc-900/60 dark:to-zinc-950 text-center select-none min-h-[220px]"
                                    onClick={() => setActivePlayerId(item.id)}
                                  >
                                    <div className="p-4 rounded-full bg-neutral-200/50 dark:bg-zinc-800/50 mb-3 text-neutral-600 dark:text-neutral-400">
                                      {item.platform === 'instagram' && <Instagram size={24} className="text-pink-500" />}
                                      {item.platform === 'facebook' && <Facebook size={24} className="text-blue-500" />}
                                      {item.platform === 'youtube' && <Play size={24} className="text-red-500 animate-pulse" />}
                                      {(!item.platform || (item.platform !== 'instagram' && item.platform !== 'facebook' && item.platform !== 'youtube')) && <Link size={24} />}
                                    </div>
                                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 font-bold">
                                      {item.platform || 'External'} Embed Stage
                                    </span>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 max-w-[80%] font-sans">
                                      Click to load interactive view
                                    </p>
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.title || "Archive Media"}
                                    className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02]"
                                    referrerPolicy="no-referrer"
                                    onClick={() => {
                                      const imgIdxInList = project.images.indexOf(item.url);
                                      if (imgIdxInList !== -1) {
                                        setSlideshowIndex(imgIdxInList);
                                        setShowSlideshow(true);
                                      } else {
                                        setSlideshowIndex(0);
                                        setShowSlideshow(true);
                                      }
                                    }}
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />

                                {/* Play overlay indicator */}
                                {(item.type === 'video' || item.type === 'embed') && !isPlayingInline && (
                                  <button
                                    onClick={() => {
                                      if (item.type === 'embed') {
                                        setActivePlayerId(item.id);
                                      }
                                    }}
                                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/70 hover:bg-black/85 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 shadow-lg backdrop-blur-sm"
                                  >
                                    <Play size={20} fill="currentColor" className="ml-1" />
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Floating Platform Badge */}
                            {item.platform && item.platform !== 'local' && (
                              <div className="absolute top-3 right-3 px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider font-bold bg-white/95 dark:bg-zinc-900/95 shadow-sm text-neutral-800 dark:text-neutral-200 z-10 flex items-center gap-1.5 border border-neutral-100 dark:border-zinc-800">
                                {item.platform === 'youtube' && <Play size={10} className="text-red-500 shrink-0" />}
                                {item.platform === 'instagram' && <Instagram size={10} className="text-pink-500 shrink-0" />}
                                {item.platform === 'facebook' && <Facebook size={10} className="text-blue-500 shrink-0" />}
                                <span>{item.platform}</span>
                              </div>
                            )}
                          </div>

                          {/* Media Card Details */}
                          <div className="p-5 bg-neutral-50/40 dark:bg-zinc-900/10 border-t border-neutral-150/50 dark:border-zinc-850 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs md:text-sm font-sans font-medium text-neutral-800 dark:text-zinc-200 truncate uppercase tracking-tight group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                {item.title || "Untitled Archive Asset"}
                              </h5>
                              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">
                                {item.type === 'image' ? 'Photograph' : 'Video/Media'} // {item.platform === 'local' ? 'STUDIO' : 'PLATFORM'}
                              </p>
                            </div>

                            {item.originalUrl && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                  href={item.originalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3.5 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-neutral-900 hover:bg-neutral-850 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black rounded-lg transition-all duration-300 shadow-sm"
                                >
                                  Visit Site <ArrowUpRight size={10} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Technical Tab (Blueprint Vector Graphics & Uploaded Images) */}
        {activeTab === 'technical' && (
          <div className="space-y-8 bg-neutral-50 dark:bg-zinc-900/10 p-8 rounded-2xl border border-neutral-150/50 dark:border-neutral-800/80">
            <div className="border-b border-neutral-150 dark:border-neutral-800 pb-4">
              <h4 className="text-sm font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">Technical Drawings & Spatial Blueprints</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {project.drawings.map((drawing, idx) => {
                const isSvg = drawing.trim().startsWith("<");
                return (
                  <div
                    key={idx}
                    className="border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-zinc-950/40 rounded-2xl shadow-sm overflow-hidden flex items-center justify-center transition-all duration-300 hover:shadow-md"
                  >
                    {isSvg ? (
                      <div
                        className="w-full h-auto min-h-[300px] flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: drawing }}
                      />
                    ) : (
                      <img
                        src={drawing}
                        alt={`${project.title} Technical Drawing ${idx + 1}`}
                        className="w-full h-auto max-w-full object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* In-Progress Tab (Construction Photos) */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {project.constructionPhotos.map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden h-[300px] bg-neutral-100 border border-neutral-200/40 rounded-2xl group hover:shadow-md transition-all duration-500"
              >
                <img
                  src={img}
                  alt={`${project.title} construction ${idx}`}
                  className="w-full h-full object-cover grayscale opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-[9px] font-mono text-white uppercase tracking-widest">Construction Log #{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Projects Exhibit */}
      <div className="bg-neutral-50 dark:bg-zinc-900/30 border-t border-neutral-100 dark:border-neutral-800/40 py-16 md:py-24 print:hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-sans tracking-tight uppercase font-light text-neutral-900 dark:text-white">
                Exhibits You May Also Like
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
              Matching Tectonics & Materiality
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigateToProject(p.id)}
                onMouseEnter={() => onHoverStart && onHoverStart("OPEN")}
                onMouseLeave={onHoverEnd}
                className="group cursor-pointer space-y-4"
              >
                <div className="relative overflow-hidden h-[300px] bg-neutral-200 dark:bg-zinc-900 rounded-sm">
                  <img
                    src={p.heroImage}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 text-[8px] font-mono uppercase tracking-widest px-2 py-1 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-100/50 dark:border-white/5">
                    {p.category}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-sans uppercase font-medium tracking-tight text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    {p.title}
                  </h4>
                  <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase mt-1">
                    <span>{p.location}</span>
                    <span>{p.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen slideshow view */}
      <AnimatePresence>
        {showSlideshow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 select-none"
          >
            {/* Gallery Header */}
            <div className="flex justify-between items-center text-white">
              <span className="text-xs font-mono tracking-widest uppercase">
                {project.title} — Slide {slideshowIndex + 1} / {project.images.length}
              </span>
              <button
                onClick={() => setShowSlideshow(false)}
                className="p-2 text-white hover:text-neutral-400 transition-colors"
                aria-label="Close Gallery"
              >
                <X size={20} />
              </button>
            </div>

            {/* Gallery Content */}
            <div className="relative flex-1 flex items-center justify-center px-12">
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 p-3 text-white/50 hover:text-white transition-colors"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={32} />
              </button>

              <motion.img
                key={slideshowIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                src={project.images[slideshowIndex]}
                alt={`${project.title} slideshow slide ${slideshowIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
                referrerPolicy="no-referrer"
              />

              <button
                onClick={handleNextSlide}
                className="absolute right-4 p-3 text-white/50 hover:text-white transition-colors"
                aria-label="Next Slide"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Gallery Footer instructions */}
            <div className="text-center text-white/40 text-[10px] font-mono uppercase tracking-widest">
              Use Left & Right Arrow keys to navigate. Escape to Exit.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
