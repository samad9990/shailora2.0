import React, { useState, useRef } from "react";

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export default function ComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "Realized",
  onHoverStart,
  onHoverEnd,
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] md:h-[600px] overflow-hidden select-none bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={() => setIsDragging(false)}
      onTouchEnd={() => setIsDragging(false)}
      onMouseLeave={() => {
        setIsDragging(false);
        if (onHoverEnd) onHoverEnd();
      }}
      onMouseEnter={onHoverStart}
    >
      {/* Before Image (Background) */}
      <img
        src={beforeImage}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 transition-all duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[9px] font-mono uppercase tracking-widest text-zinc-300 px-3 py-1.5 rounded">
        {beforeLabel}
      </div>

      {/* After Image (Clipped overlay) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[9px] font-mono uppercase tracking-widest text-white px-3 py-1.5 rounded">
          {afterLabel}
        </div>
      </div>

      {/* Slider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="w-10 h-10 rounded-full border border-white bg-black/40 backdrop-blur-md flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95 select-none">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* Informative Floating Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-black/40 backdrop-blur-md text-[10px] font-mono text-white/80 px-4 py-2 rounded-full tracking-wider uppercase text-center">
        Drag slider to compare spaces
      </div>
    </div>
  );
}
