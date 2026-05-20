"use client";

import React from "react";
import { X, ChevronRight, Loader2, Fullscreen } from "lucide-react";
import { useTemplateLayouts } from "../../hooks/useTemplateLayouts";
import { Theme } from "../constants/themes";

interface SlidePreviewOverlayProps {
  slides: any[];
  theme: Theme | null;
  onClose: () => void;
  onGoToEditor: () => void;
}

export const SlidePreviewOverlay = ({
  slides = [],
  theme,
  onClose,
  onGoToEditor,
}: SlidePreviewOverlayProps) => {
  const { renderSlideContent, loading } = useTemplateLayouts();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
      <div 
        className="relative flex h-full w-full max-w-[1200px] flex-col rounded-2xl bg-[var(--ds-system-surface-menu)] border border-[var(--ds-system-border-default)] shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: theme?.backgroundColor || '#0a0a0a',
          color: theme?.textColor || '#ffffff',
          borderColor: theme?.cardBorderColor || 'rgba(255,255,255,0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ds-system-border-default-alpha)] px-6 py-4 shrink-0 bg-black/20">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Deck</h2>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-white/10 text-xs font-medium text-white/60">
              v1 <ChevronRight size={12} className="rotate-90" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-white/60">Beta</span>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Slide List */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 custom_scrollbar scroll-smooth">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : (
            slides.map((slide, idx) => (
              <div 
                key={slide.id || idx}
                className="w-full max-w-[900px] mx-auto space-y-4"
              >
                <div className="flex items-center gap-3 text-white/40 mb-2">
                   <span className="text-xs font-bold tracking-widest uppercase">Slide {idx + 1}</span>
                   <div className="h-px flex-1 bg-white/10"></div>
                </div>
                
                <div 
                  className="w-full aspect-video rounded-xl shadow-2xl overflow-hidden border border-white/5 themed-slide-container relative"
                  style={{ 
                    '--theme-bg': theme?.backgroundColor || '#ffffff',
                    '--theme-text': theme?.textColor || '#000000',
                    '--theme-accent': theme?.accentColor || '#1e4cd9',
                    '--theme-accent-rgb': theme?.accentColorRgb || '30, 76, 217',
                    backgroundColor: 'var(--theme-bg)',
                    color: 'var(--theme-text)',
                  } as React.CSSProperties}
                >
                  <style>{`
                    .themed-slide-container h1, 
                    .themed-slide-container h2, 
                    .themed-slide-container h3, 
                    .themed-slide-container h4,
                    .themed-slide-container p, 
                    .themed-slide-container span:not([class*="icon"]),
                    .themed-slide-container li {
                      color: inherit !important;
                    }
                    .themed-slide-container .bg-white,
                    .themed-slide-container div[class*="bg-white"] {
                      background-color: var(--theme-bg) !important;
                    }
                    .themed-slide-container .text-[#1E4CD9],
                    .themed-slide-container .text-blue-600,
                    .themed-slide-container .text-blue-700 {
                      color: var(--theme-accent) !important;
                    }
                    .themed-slide-container .bg-[#1E4CD9],
                    .themed-slide-container .bg-blue-600,
                    .themed-slide-container .bg-blue-700 {
                      background-color: var(--theme-accent) !important;
                    }
                    .themed-slide-container .border-[#1E4CD9],
                    .themed-slide-container .border-blue-600,
                    .themed-slide-container .border-blue-700 {
                      border-color: var(--theme-accent) !important;
                    }
                    .themed-slide-container .bg-blue-50,
                    .themed-slide-container .bg-[#F5F8FE],
                    .themed-slide-container .bg-blue-100 {
                      background-color: rgba(var(--theme-accent-rgb, 30, 76, 217), 0.1) !important;
                      color: var(--theme-text) !important;
                    }
                  `}</style>
                  {renderSlideContent(slide, false)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--ds-system-border-default-alpha)] flex justify-end bg-black/20">
          <button
            onClick={onGoToEditor}
            className="rounded-xl bg-white text-black px-8 py-3 text-base font-bold hover:bg-white/90 transition-all shadow-xl flex items-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to editor 
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
