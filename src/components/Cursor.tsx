import { useEffect, useState, useRef } from "react";

interface CursorProps {
  label: string | null;
}

export default function Cursor({ label }: CursorProps) {
  const [hidden, setHidden] = useState(true);
  
  // DOM references for GPU-accelerated direct styling without React re-render lags
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  
  // Physics tracking refs
  const mousePosition = useRef({ x: 0, y: 0 });
  const cursorPosition = useRef({ x: 0, y: 0 });
  const currentRotation = useRef(0);
  const currentScale = useRef(1);
  const animationFrameId = useRef<number | null>(null);
  
  // Interactive hover tracking states
  const [isHovered, setIsHovered] = useState(false);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [isDarkArea, setIsDarkArea] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    // Only proceed on desktop / non-touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    setHidden(false);

    // Track real mouse coordinate target
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };

    // Detect click events to trigger premium scale-down & ripple spring
    const handleMouseDown = () => {
      setClicked(true);
      
      // Trigger ripple element animation resetting
      const ripple = rippleRef.current;
      if (ripple) {
        ripple.classList.remove("cursor-ripple-active");
        // Force layout reflow to restart animation
        void ripple.offsetWidth;
        ripple.classList.add("cursor-ripple-active");
      }
    };
    
    const handleMouseUp = () => {
      setClicked(false);
    };

    const handleMouseLeave = () => setHidden(true);
    const handleMouseEnter = () => setHidden(false);

    // Event delegation to catch interactive elements with extreme efficiency
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const interactiveEl = target.closest('a, button, select, input, textarea, [role="button"], .group, [data-interactive="true"]');
      if (interactiveEl) {
        setIsHovered(true);
        // Read custom hover accent if defined, otherwise let the cursor use its clean translucent default glow
        const customAccent = interactiveEl.getAttribute('data-cursor-accent') || null;
        setAccentColor(customAccent);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const interactiveEl = target.closest('a, button, select, input, textarea, [role="button"], .group, [data-interactive="true"]');
      if (interactiveEl) {
        setIsHovered(false);
        setAccentColor(null);
      }
    };

    // Fast robust local luminance checker for true real-time adaptive dark/light matching
    const checkIsDarkBackground = (el: HTMLElement): boolean => {
      let current: HTMLElement | null = el;
      while (current) {
        if (current.classList.contains('dark') || current.getAttribute('data-theme') === 'dark') {
          return true;
        }
        const bg = window.getComputedStyle(current).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          const rgb = bg.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const r = parseInt(rgb[0]);
            const g = parseInt(rgb[1]);
            const b = parseInt(rgb[2]);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5; // Dark background if luminance is under 50%
          }
        }
        current = current.parentElement;
      }
      return document.documentElement.classList.contains('dark');
    };

    // Core high-frequency lerp rendering loop
    let tickCount = 0;
    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

    const renderLoop = () => {
      const cursor = cursorRef.current;
      if (!cursor) {
        animationFrameId.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Check motion preferences
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lerpFactor = prefersReduced ? 1.0 : 0.22; // buttery inertia trail vs instant

      const prevX = cursorPosition.current.x;
      const prevY = cursorPosition.current.y;
      
      // Interpolate current position to target mouse position
      cursorPosition.current.x = lerp(prevX, mousePosition.current.x, lerpFactor);
      cursorPosition.current.y = lerp(prevY, mousePosition.current.y, lerpFactor);

      // Throttled background element sampling for high efficiency (once every 5 frames / ~80ms)
      tickCount++;
      if (tickCount % 5 === 0) {
        const hoveredElement = document.elementFromPoint(mousePosition.current.x, mousePosition.current.y);
        if (hoveredElement) {
          setIsDarkArea(checkIsDarkBackground(hoveredElement as HTMLElement));
        }
      }

      // Calculate translation velocity for elite organic cursor tilt rotation
      const dx = mousePosition.current.x - cursorPosition.current.x;
      const dy = mousePosition.current.y - cursorPosition.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      const targetRotation = !prefersReduced && speed > 2 
        ? Math.max(-12, Math.min(12, dx * 0.35)) 
        : 0;

      currentRotation.current = lerp(currentRotation.current, targetRotation, 0.15);

      // Calculate springy scaling
      const targetScale = clicked ? 0.85 : isHovered ? 1.15 : 1.0;
      currentScale.current = lerp(currentScale.current, targetScale, prefersReduced ? 1.0 : 0.18);

      // Apply highly performance-optimized GPU-accelerated CSS matrices & custom properties
      cursor.style.transform = `translate3d(${cursorPosition.current.x}px, ${cursorPosition.current.y}px, 0px) scale(${currentScale.current}) rotate(${currentRotation.current}deg)`;
      
      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    // Attach core listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter, { passive: true });

    // Hide native cursor dynamically with strict !important priority
    const hideCursorStyle = document.createElement("style");
    hideCursorStyle.id = "shailora-cursor-suppression";
    hideCursorStyle.innerHTML = `
      *, *:hover, a, button, select, input, textarea, [role="button"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(hideCursorStyle);

    // Boot render loop
    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      const styleTag = document.getElementById("shailora-cursor-suppression");
      if (styleTag) styleTag.remove();
    };
  }, [clicked, isHovered]);

  if (hidden) return null;

  // Adaptive inversion based on background luminance state
  const isDarkCursor = !isDarkArea;

  return (
    <>
      {/* Injected animations for fluid physics spring dynamics */}
      <style>{`
        @keyframes customRipple {
          0% {
            transform: scale(0.6);
            opacity: 0.85;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .cursor-ripple-active {
          animation: customRipple 240ms cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>

      <div
        ref={cursorRef}
        id="shailora-premium-cursor"
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform mix-blend-normal select-none"
      >
        <div className="relative flex flex-col items-center justify-center">
          {/* Spring-back Click Ripple Circle */}
          <div
            ref={rippleRef}
            className="absolute w-12 h-12 rounded-full border border-neutral-400/30 dark:border-white/30 pointer-events-none opacity-0"
            style={{
              borderColor: accentColor ? `${accentColor}40` : undefined,
            }}
          />

          {/* Luxury backdrop translucent glow */}
          {isHovered && (
            <div 
              className="absolute w-14 h-14 rounded-full blur-md -z-10 opacity-30 animate-pulse transition-all duration-500" 
              style={{
                backgroundColor: accentColor || (isDarkArea ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.22)')
              }}
            />
          )}

          {/* High-fidelity Brand Logo Shape Cursor */}
          <svg
            viewBox="0 0 100 50"
            className="w-[44px] h-[22px] transition-all duration-300"
            style={{
              fill: isDarkCursor 
                ? (accentColor || '#000000') 
                : (accentColor || '#ffffff'),
              filter: accentColor ? `drop-shadow(0 0 4px ${accentColor}80)` : 'none'
            }}
          >
            <defs>
              <mask id="cursor-logo-mask">
                {/* Everything under white will be visible */}
                <rect x="0" y="0" width="100" height="50" fill="white" />
                {/* Everything under black will be cut out (the center rectangle) */}
                <rect x="35" y="20" width="30" height="10" rx="1.5" ry="1.5" fill="black" />
              </mask>
            </defs>
            <g mask="url(#cursor-logo-mask)">
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

          {/* Dynamic Editorial Label Badge */}
          {label && (
            <span 
              className="absolute top-7 bg-neutral-900/90 dark:bg-white/95 text-white dark:text-neutral-900 text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded-sm shadow-md border border-neutral-800/10 dark:border-neutral-200/10 animate-fade-in whitespace-nowrap"
              style={{
                borderColor: accentColor ? `${accentColor}30` : undefined,
              }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
