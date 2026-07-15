import { useState, useEffect, useRef } from "react";
import { Project } from "../types";
import { motion } from "motion/react";
import { MapPin, ArrowRight, Play } from "lucide-react";

const getInitialNumCols = () => {
  if (typeof window === "undefined") return 5;
  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 3;
  return 5;
};

const getAspectClass = (id: string) => {
  const aspectClasses = [
    "aspect-[3/4]",
    "aspect-[2/3]",
    "aspect-[1/1]",
    "aspect-[4/5]",
    "aspect-[9/13]",
    "aspect-[10/12]"
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % aspectClasses.length;
  return aspectClasses[index];
};

interface MasonryGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onHoverStart: (label: string) => void;
  onHoverEnd: () => void;
  favorites: string[];
}

export default function MasonryGrid({
  projects,
  onProjectClick,
  onHoverStart,
  onHoverEnd,
  favorites,
}: MasonryGridProps) {
  const [columns, setColumns] = useState<Project[][]>(() =>
    Array.from({ length: getInitialNumCols() }, () => [])
  );

  // Re-distribute projects across columns based on viewport size
  useEffect(() => {
    const distributeProjects = () => {
      const width = window.innerWidth;
      let numCols = 5;
      if (width < 640) numCols = 2;
      else if (width < 1024) numCols = 3;

      const distributed: Project[][] = Array.from({ length: numCols }, () => []);
      
      projects.forEach((proj, idx) => {
        distributed[idx % numCols].push(proj);
      });

      setColumns(distributed);
    };

    distributeProjects();
    window.addEventListener("resize", distributeProjects);
    return () => window.removeEventListener("resize", distributeProjects);
  }, [projects]);

  return (
    <div className="space-y-12">
      {/* Editorial Columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4 md:gap-5">
            {col.map((p, pIdx) => {
              const isFavorited = favorites.includes(p.id) || ( (p as any).originalId && favorites.includes((p as any).originalId) );
              
              const isPlayableVideo = (url: string | undefined): boolean => {
                if (!url) return false;
                const urlLower = url.toLowerCase();
                return (
                  urlLower.endsWith(".mp4") ||
                  urlLower.endsWith(".webm") ||
                  urlLower.endsWith(".mov") ||
                  urlLower.endsWith(".ogg") ||
                  urlLower.includes(".mp4?") ||
                  urlLower.includes(".webm?") ||
                  urlLower.includes(".mov?") ||
                  urlLower.includes("mixkit.co/videos/preview")
                );
              };
              
              const hasVideo = isPlayableVideo(p.videoUrl);

              return (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: pIdx * 0.05 }}
                  onClick={() => onProjectClick(p)}
                  onMouseEnter={() => onHoverStart(hasVideo ? "PLAY" : "VIEW")}
                  onMouseLeave={onHoverEnd}
                  className="group relative cursor-pointer overflow-hidden rounded-[1.25rem]"
                >
                  {/* Card Image Stage */}
                  <div className={`relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 border border-neutral-100/10 dark:border-neutral-800/20 select-none w-full ${getAspectClass(p.id)}`}>
                    {/* Autoplay Video Loop Interspersed Naturally */}
                    {hasVideo ? (
                      <video
                        src={p.videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out"
                      />
                    ) : (
                      <img
                        src={p.heroImage}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover scale-100 group-hover:scale-[1.03] transition-transform duration-[1200ms] ease-out"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Gradient shadows overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                    {/* Left/Right Floating tags (Only visible on hover) */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <span className="bg-white/90 backdrop-blur-md text-neutral-800 text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                        {p.category}
                      </span>
                      {p.status === "Construction" && (
                        <span className="bg-zinc-900/90 backdrop-blur-md text-white text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                          {p.status}
                        </span>
                      )}
                    </div>

                    {/* Favorite status indicator */}
                    {isFavorited && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-neutral-200/50 shadow-sm z-20">
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                    )}

                    {/* Translucent Text Details Box on Hover */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
                      <div className="bg-white/70 dark:bg-zinc-950/75 backdrop-blur-md border border-neutral-200/40 dark:border-zinc-800/60 p-3.5 rounded-xl shadow-xl text-neutral-900 dark:text-zinc-100 flex flex-col space-y-1.5">
                        <div className="flex justify-between items-baseline gap-2">
                          <h3 className="text-xs font-sans font-bold tracking-tight uppercase truncate max-w-[80%]">
                            {p.title}
                          </h3>
                          <span className="text-[9px] font-mono opacity-70 shrink-0">{p.year}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[9px] font-mono opacity-80 uppercase tracking-widest gap-2">
                          <span className="flex items-center gap-1 truncate max-w-[65%]">
                            <MapPin size={8} className="opacity-70" /> {p.location}
                          </span>
                          <span className="text-[7.5px] bg-neutral-900/10 dark:bg-white/10 px-2 py-0.5 rounded font-bold shrink-0">
                            {p.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Soft ambient spatial hover glow */}
                    <div className="absolute -inset-10 bg-radial from-neutral-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none z-0" />

                    {/* Custom play icon indicator overlay if video */}
                    {hasVideo && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white pointer-events-none z-20 transition-opacity duration-300 group-hover:opacity-0">
                        <Play size={8} fill="currentColor" />
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        ))}
      </div>

      {/* Curated Exhibits Footer */}
      <div className="py-16 flex flex-col justify-center items-center border-t border-neutral-100/30 dark:border-neutral-900/40 mt-12">
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-neutral-400 dark:text-zinc-500">
          Curated Exhibition Rooms // {projects.length} Total Exhibits
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white mt-4 opacity-30" />
      </div>
    </div>
  );
}
