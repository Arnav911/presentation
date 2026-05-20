"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Paintbrush } from "lucide-react";
import { PRESET_THEMES, Theme } from "../constants/themes";

interface ThemeSelectorProps {
  selectedThemeId: string | null;
  onSelect: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTheme = PRESET_THEMES.find((t) => t.id === selectedThemeId) || PRESET_THEMES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-2 rounded-lg border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-tertiary)] px-3 text-xs font-medium text-[var(--ds-system-foreground-secondary)] hover:bg-[var(--ds-system-surface-tertiary-hover)] transition-all"
      >
        <Paintbrush size={14} />
        <span>Choose theme</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-xl border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-menu)] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-[110]">
          <div className="p-2 border-b border-[var(--ds-system-border-default)]">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ds-system-foreground-tertiary)]">
              Preset themes
            </p>
          </div>
          <div className="h-full max-h-[300px] overflow-y-auto no-scrollbar p-1">
            {PRESET_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onSelect(theme);
                  setIsOpen(false);
                }}
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  borderColor: selectedThemeId === theme.id ? (theme.id === 'minimal' ? '#000' : theme.accentColor) : 'transparent',
                  borderWidth: '2px',
                }}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all mb-1 border-2 ${
                  selectedThemeId === theme.id
                    ? "shadow-lg scale-[1.02]"
                    : "opacity-90 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full shadow-sm ring-1 ring-white/10"
                    style={{ backgroundColor: theme.dotColor }}
                  />
                  <span className="text-sm font-semibold tracking-tight">
                    {theme.name}
                  </span>
                </div>
                {selectedThemeId === theme.id && (
                  <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="p-1 border-t border-[var(--ds-system-border-default)]">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--ds-system-foreground-secondary)] hover:bg-[var(--ds-system-action-surface-ghost-hover)] transition-colors">
              <Plus size={14} />
              <span>Create theme</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
