"use client";
import React, { useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slide } from "../types/slide";
import { useTemplateLayouts } from "../hooks/useTemplateLayouts";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";


interface PresentationModeProps {
  slides: Slide[];
  currentSlide: number;

  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  onExit: () => void;
  onSlideChange: (slideNumber: number) => void;
}

const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  currentSlide,
  isFullscreen,
  onFullscreenToggle,
  onExit,
  onSlideChange,
}) => {
  const [scale, setScale] = React.useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { presentationData } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  // Responsive scaling logic
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        
        // Calculate scale to fit both width and height while maintaining 16:9
        const scaleW = width / 1280;
        const scaleH = height / 720;
        setScale(Math.min(scaleW, scaleH) * 0.9); // 0.9 to add some margin
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  const { renderSlideContent } = useTemplateLayouts();
  // Modify the handleKeyPress to prevent default behavior
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault(); // Prevent default scroll behavior

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ": // Space key
          if (currentSlide < slides.length - 1) {
            onSlideChange(currentSlide + 1);
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
          if (currentSlide > 0) {
            onSlideChange(currentSlide - 1);
          }
          break;
        case "Escape":
          onExit();
          break;
        case "f":
        case "F":
          onFullscreenToggle();
          break;
      }
    },
    [currentSlide, slides.length, onSlideChange, onExit, onFullscreenToggle]
  );

  // Add both keydown and keyup listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys and space
      if (
        ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      handleKeyPress(e);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyPress]);

  // Add click handlers for the slide area
  const handleSlideClick = (e: React.MouseEvent) => {
    // Don't trigger navigation if clicking on controls
    if ((e.target as HTMLElement).closest(".presentation-controls")) {
      return;
    }

    const clickX = e.clientX;
    const windowWidth = window.innerWidth;

    if (clickX < windowWidth / 3) {
      if (currentSlide > 0) {
        onSlideChange(currentSlide - 1);
      }
    } else if (clickX > (windowWidth * 2) / 3) {
      if (currentSlide < slides.length - 1) {
        onSlideChange(currentSlide + 1);
      }
    }
  };

  // Handle Escape key separately
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        onFullscreenToggle(); // Just toggle fullscreen, don't exit presentation
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isFullscreen, onFullscreenToggle]);

  return (
    <div
      className="fixed inset-0 flex flex-col transition-colors duration-500"
      style={{ backgroundColor: '#000000' }} // Black background for presentation mode
      tabIndex={0}
      onClick={handleSlideClick}
    >
      {/* Controls - Only show when not in fullscreen */}
      {!isFullscreen && (
        <>
          <div className="presentation-controls absolute top-4 right-4 flex items-center gap-2 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onFullscreenToggle();
              }}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onExit();
              }}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="presentation-controls absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onSlideChange(currentSlide - 1);
              }}
              disabled={currentSlide === 0}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-white">
              {currentSlide + 1} / {slides.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onSlideChange(currentSlide + 1);
              }}
              disabled={currentSlide === slides.length - 1}
              className="text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}

      {/* Current Slide */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
      >
        <div
          className={`flex justify-center items-center slide-theme slide-container border rounded-sm font-inter shadow-lg transition-all duration-500 themed-slide-container`}
          style={{ 
            // Generic theme vars (used by general/standard/modern templates)
            '--theme-bg': presentationData?.theme?.backgroundColor || '#ffffff',
            '--theme-text': presentationData?.theme?.textColor || '#000000',
            '--theme-accent': presentationData?.theme?.accentColor || '#1e4cd9',
            '--theme-accent-rgb': presentationData?.theme?.accentColorRgb || '30, 76, 217',
            // Swift template CSS vars — map from theme data
            '--card-background-color': presentationData?.theme?.backgroundColor || '#ffffff',
            '--primary-accent-color': presentationData?.theme?.accentColor || '#BFF4FF',
            '--secondary-accent-color': presentationData?.theme?.cardBackgroundColor || '#ffffff',
            '--text-heading-color': presentationData?.theme?.textColor || '#111827',
            '--text-body-color': presentationData?.theme?.textColor ? `${presentationData.theme.textColor}99` : '#6B7280',
            // Force the background
            backgroundColor: presentationData?.theme?.backgroundColor || '#ffffff',
            color: presentationData?.theme?.textColor || '#000000',
            // Border
            borderColor: presentationData?.theme?.cardBorderColor || 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            width: '1280px',
            height: '720px',
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center',
            position: 'absolute',
            left: '50%',
            top: '50%',
          } as React.CSSProperties}
        >
          {slides[currentSlide] &&
            renderSlideContent(slides[currentSlide], false)}
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;

