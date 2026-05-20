"use client";

import React from "react";
import { FolderHeart, Users, LayoutDashboard, Clock, FileUp, Upload, Eye, X, Loader2 } from "lucide-react";
import { Template } from "@/app/(presentation-generator)/outline/types/index";
import { useLayout } from "@/app/(presentation-generator)/context/LayoutContext";

export type TabType = "Recents" | "Templates" | "My decks" | "Workspace" | "Shared";

interface TemplateCardsProps {
    activeTab: TabType;
    templates: Template[];
    customTemplates: Template[];
    selectedTemplate: Template | null;
    onSelect: (template: Template) => void;
    onUploadClick: () => void;
}

export function TemplateCards({
    activeTab,
    templates,
    customTemplates,
    selectedTemplate,
    onSelect,
    onUploadClick,
}: TemplateCardsProps) {
    const [previewingTemplate, setPreviewingTemplate] = React.useState<Template | null>(null);
    const { getFullDataByTemplateID, loading: layoutLoading } = useLayout();
    let itemsToDisplay: Template[] = [];

    if (activeTab === "Templates") {
        itemsToDisplay = templates;
    } else if (activeTab === "My decks") {
        itemsToDisplay = customTemplates;
    }

    const handleSelect = (template: Template | null) => {
        if (template && selectedTemplate?.id === template.id) {
            // Allow deselecting
            // onSelect(null as any); 
            // Depending on your requirements, you might want clicking again to deselect.
            // For now let's just do nothing if already selected, or maybe we do deselect?
        } else if (template) {
            onSelect(template);
        }
    }

    return (
        <div className="w-full mt-4">
            {itemsToDisplay.length === 0 && activeTab !== "My decks" ? (
                <div className="flex flex-col items-center justify-center p-8 text-[var(--ds-system-foreground-tertiary)]">
                    <p className="text-sm">No templates found.</p>
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Upload Card for "My decks" */}
                {activeTab === "My decks" && (
                    <div
                        onClick={onUploadClick}
                        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-secondary)] transition-all hover:bg-[var(--ds-system-surface-tertiary)] hover:border-[var(--ds-system-border-default-alpha)] min-h-[160px] items-center justify-center border-dashed"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-secondary)] group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-[var(--ds-system-foreground-primary)]">
                                    Upload Custom Template
                                </p>
                                <p className="text-xs text-[var(--ds-system-foreground-tertiary)] mt-1">
                                    PPTX or PDF
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Template Cards */}
                {itemsToDisplay.map((tpl) => {
                    const isSelected = selectedTemplate?.id === tpl.id;

                    // Get the first slide layout for the thumbnail
                    const layouts = getFullDataByTemplateID(tpl.id);
                    const firstLayout = layouts.length > 0 ? layouts[0] : null;
                    const LayoutComponent = firstLayout?.component;
                    const sampleData = firstLayout?.sampleData;

                    return (
                        <div
                            key={tpl.id}
                            onClick={() => handleSelect(tpl)}
                            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-all duration-300 h-[220px] ${isSelected
                                ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                : "border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-secondary)] hover:border-blue-500/30"
                                }`}
                        >
                            {/* Card Background Thumbnail (Live Layout) - 100% Opacity */}
                            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 pointer-events-none">
                                {LayoutComponent ? (
                                    <div className="absolute inset-0 origin-top-left w-[400%] h-[400%] scale-[0.25]">
                                        <div className="w-full h-full bg-white">
                                            <LayoutComponent data={sampleData} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                        <LayoutDashboard size={40} className="text-[var(--ds-system-foreground-tertiary)] opacity-20" />
                                    </div>
                                )}
                                {/* Subtle vignette to help context */}
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                            </div>

                            {isSelected && (
                                <div className="absolute top-3 right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-md">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            )}

                            {/* Main Content Area (Transparent) */}
                            <div className="flex-1 relative z-10" />

                            {/* Bottom Info Section - Compact & Minimalist */}
                            <div className="relative z-10 p-2.5 bg-black/75 backdrop-blur-sm border-t border-white/5 flex flex-col gap-0.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="text-xs font-bold text-white truncate px-1">
                                            {tpl.name || tpl.id}
                                        </h3>
                                        <div className="flex items-center gap-1.5 px-1 opacity-60">
                                            <LayoutDashboard size={10} className="text-white" />
                                            <span className="text-[9px] text-white font-medium">
                                                {tpl.slides ? tpl.slides.length : 0} slides
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewingTemplate(tpl);
                                            }}
                                            className="p-1.5 rounded-md bg-white/5 text-white/50 hover:text-white hover:bg-blue-600 transition-all"
                                            title="Preview Slides"
                                        >
                                            <Eye size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Slide Preview Modal */}
            {previewingTemplate && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-10">
                    <div className="relative w-full max-w-6xl h-full max-h-[90vh] rounded-2xl border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-primary)] shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-[var(--ds-system-border-default)]">
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--ds-system-foreground-primary)]">{previewingTemplate.name}</h2>
                                <p className="text-sm text-[var(--ds-system-foreground-secondary)]">{previewingTemplate.description}</p>
                            </div>
                            <button
                                onClick={() => setPreviewingTemplate(null)}
                                className="rounded-full p-2 text-[var(--ds-system-foreground-tertiary)] hover:bg-[var(--ds-system-surface-tertiary)] hover:text-[var(--ds-system-foreground-primary)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom_scrollbar bg-[var(--ds-system-surface-secondary)]">
                            <h3 className="text-sm font-bold text-[var(--ds-system-foreground-tertiary)] uppercase tracking-[0.2em] mb-6">Available Slide Layouts</h3>

                            {layoutLoading ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3">
                                    <Loader2 size={32} className="animate-spin text-blue-500" />
                                    <p className="text-sm text-[var(--ds-system-foreground-secondary)]">Loading real snapshots...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {getFullDataByTemplateID(previewingTemplate.id).map((layout: any, idx: number) => {
                                        const { component: LayoutComponent, sampleData, name } = layout;
                                        return (
                                            <div key={idx} className="flex flex-col gap-3 group/slide">
                                                <div className="aspect-[16/9] rounded-xl border border-[var(--ds-system-border-default)] bg-white overflow-hidden relative shadow-sm group-hover/slide:border-blue-500/50 transition-all">
                                                    {/* Real Template Rendering (Scaled down) */}
                                                    <div className="absolute inset-0 pointer-events-none origin-top-left w-[400%] h-[400%] scale-[0.25]">
                                                        <LayoutComponent data={sampleData} />
                                                    </div>

                                                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center text-[10px] font-bold border border-white/20 z-10">
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                                <p className="text-xs font-medium text-[var(--ds-system-foreground-primary)] truncate px-1 text-center">
                                                    {name}
                                                </p>
                                            </div>
                                        );
                                    })}
                                    {getFullDataByTemplateID(previewingTemplate.id).length === 0 && (
                                        <div className="col-span-full py-20 text-center text-[var(--ds-system-foreground-tertiary)]">
                                            No layouts found for this template.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-tertiary)] flex justify-end gap-3">
                            <button
                                onClick={() => setPreviewingTemplate(null)}
                                className="px-6 py-2.5 rounded-lg text-sm font-medium text-[var(--ds-system-foreground-secondary)] hover:text-[var(--ds-system-foreground-primary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onSelect(previewingTemplate);
                                    setPreviewingTemplate(null);
                                }}
                                className="px-8 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-md active:scale-95"
                            >
                                Use This Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
