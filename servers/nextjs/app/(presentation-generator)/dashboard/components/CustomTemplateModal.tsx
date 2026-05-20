"use client";

import React, { useState, useEffect } from "react";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFileUpload } from "@/app/(presentation-generator)/custom-template/hooks/useFileUpload";
import { useSlideProcessing } from "@/app/(presentation-generator)/custom-template/hooks/useSlideProcessing";
import { useLayoutSaving } from "@/app/(presentation-generator)/custom-template/hooks/useLayoutSaving";
import { useCustomLayout } from "@/app/(presentation-generator)/custom-template/hooks/useCustomLayout";
import { useFontManagement } from "@/app/(presentation-generator)/custom-template/hooks/useFontManagement";

interface CustomTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (templateId: string) => void;
}

export function CustomTemplateModal({ isOpen, onClose, onSuccess }: CustomTemplateModalProps) {
    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [step, setStep] = useState<"upload" | "processing" | "saving">("upload");

    const { selectedFile, handleFileSelect, removeFile } = useFileUpload();
    const { slides, setSlides, completedSlides } = useCustomLayout();
    const { fontsData, UploadedFonts, setFontsData } = useFontManagement();
    const { isProcessingPptx, processFile } = useSlideProcessing(
        selectedFile,
        slides,
        setSlides,
        setFontsData
    );

    // Dummy refetch
    const refetch = async () => { };

    const { isSavingLayout, saveLayout } = useLayoutSaving(
        slides,
        UploadedFonts,
        fontsData,
        refetch,
        setSlides
    );

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            removeFile();
            setSlides([]);
            setTemplateName("");
            setDescription("");
            setStep("upload");
        }
    }, [isOpen]);

    // Handle the automatic flow once a file is selected and processed
    useEffect(() => {
        if (selectedFile && step === "upload" && !isProcessingPptx && slides.length === 0) {
            // Start processing
            setStep("processing");
            processFile();
        }
    }, [selectedFile, step, isProcessingPptx, slides.length]);

    useEffect(() => {
        if (step === "processing" && slides.length > 0 && completedSlides === slides.length && slides.some(s => s.processed)) {
            // Finished processing all slides!
            // In a real simplified flow, we might just jump to saving here.
            // E.g.
            // handleAutoSave();
        }
    }, [step, slides, completedSlides]);


    const handleAutoSave = async () => {
        if (!templateName.trim()) {
            toast.error("Please provide a template name.");
            return;
        }
        setStep("saving");
        const id = await saveLayout(templateName, description);
        if (id) {
            toast.success("Custom template saved successfully!");
            onSuccess(`custom-${id}`);
            onClose();
        } else {
            setStep("processing"); // revert if failed
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-2xl border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-primary)] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-[var(--ds-system-foreground-tertiary)] hover:bg-[var(--ds-system-surface-tertiary)] hover:text-[var(--ds-system-foreground-primary)] transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold text-[var(--ds-system-foreground-primary)] mb-6">
                    Upload Custom Template
                </h2>

                {step === "upload" && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[var(--ds-system-foreground-secondary)]">Template Name (required)</label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="e.g. Acme Corp Brand Guidelines"
                                className="rounded-lg border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-secondary)] px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[var(--ds-system-foreground-secondary)]">Description (optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A brief description of this template"
                                rows={2}
                                className="rounded-lg border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-secondary)] px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors resize-none mb-2"
                            />
                        </div>

                        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--ds-system-border-default-alpha)] bg-[var(--ds-system-surface-secondary)] p-10 mt-2 transition-all hover:border-[var(--ds-system-border-default)] hover:bg-[var(--ds-system-surface-tertiary)]">
                            <input
                                type="file"
                                accept=".pptx,.pdf"
                                onChange={handleFileSelect}
                                disabled={!templateName.trim()}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                            />
                            <UploadCloud size={48} className={`mb-4 ${templateName.trim() ? "text-[var(--ds-system-foreground-secondary)]" : "text-[var(--ds-system-foreground-tertiary)] opacity-50"}`} />
                            <p className="mb-2 text-sm font-medium text-[var(--ds-system-foreground-primary)] text-center">
                                {templateName.trim() ? "Click or drag to upload PPTX/PDF" : "Please enter a template name first"}
                            </p>
                            <p className="text-xs text-[var(--ds-system-foreground-tertiary)] text-center">
                                We'll extract the layouts and convert them to AI-ready templates.
                            </p>
                        </div>
                    </div>
                )}

                {step === "processing" && (
                    <div className="flex flex-col items-center justify-center py-10 gap-6">
                        <div className="relative">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle className="text-[var(--ds-system-surface-tertiary)]" strokeWidth="6" stroke="currentColor" fill="transparent" r="44" cx="48" cy="48" />
                                <circle
                                    className="text-blue-500 transition-all duration-300 ease-in-out"
                                    strokeWidth="6"
                                    strokeDasharray={276}
                                    strokeDashoffset={slides.length > 0 ? 276 - (completedSlides / slides.length) * 276 : 276}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="44"
                                    cx="48"
                                    cy="48"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[var(--ds-system-foreground-primary)]">
                                {slides.length > 0 ? Math.round((completedSlides / slides.length) * 100) : 0}%
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-medium text-[var(--ds-system-foreground-primary)] mb-2">
                                Processing your ({selectedFile?.name})
                            </h3>
                            <p className="text-sm text-[var(--ds-system-foreground-secondary)]">
                                {isProcessingPptx ? "Extracting slides and mapping elements..." :
                                    slides.length > 0 ? `Processed ${completedSlides} of ${slides.length} slides.` : "Preparing..."}
                            </p>
                        </div>

                        {/* When all slides processed, show manual save button instead of auto-save to be safe */}
                        {!isProcessingPptx && slides.length > 0 && completedSlides === slides.length && slides.some(s => s.processed) && (
                            <button
                                onClick={handleAutoSave}
                                className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Save & Use Template
                            </button>
                        )}
                    </div>
                )}

                {step === "saving" && (
                    <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
                        <Loader2 size={48} className="animate-spin text-blue-500 mb-2" />
                        <div>
                            <h3 className="text-lg font-medium text-[var(--ds-system-foreground-primary)] mb-2">
                                Saving Template...
                            </h3>
                            <p className="text-sm text-[var(--ds-system-foreground-secondary)]">
                                Converting extracted slides to React components. This may take a minute.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
