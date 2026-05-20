import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface OutlineItem {
    id?: string;
    outline_id?: string;
    content: string;
}

interface StorylineBoardProps {
    outlines: OutlineItem[];
    onGenerate: () => void;
    isGenerating: boolean;
}

export default function StorylineBoard({ outlines, onGenerate, isGenerating }: StorylineBoardProps) {


    return (
        <div className="flex relative h-[90vh] my-auto w-full max-w-[600px] flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden mx-auto mt-6 mr-6 transition-all duration-300">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-foreground">Storyline</h2>
                    <span className="text-muted-foreground text-xs">&middot; v1</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">Beta</span>
                    <button className="hover:text-white transition-colors"><X size={16} /></button>
                </div>
            </div>

            {/* Outlines List */}
            <div className="flex-1 overflow-y-auto p-4 custom_scrollbar space-y-2">
                {outlines && outlines.map((item, idx) => (
                    <div key={item.id || item.outline_id || idx} className="group flex items-center justify-between rounded-xl bg-zinc-900/50 hover:bg-zinc-800 p-4 border border-transparent hover:border-zinc-700 transition-all cursor-pointer">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <ChevronRight size={14} className="text-muted-foreground group-hover:text-white transition-colors shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">{item.content}</span>
                        </div>
                    </div>
                ))}

                {(!outlines || outlines.length === 0) && (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic">
                        Waiting for AI to generate a storyline...
                    </div>
                )}
            </div>

            {/* Generate Button Footer */}
            <div className="absolute min-w-full bottom-0 left-0">
                <div className="z-10 p-4 flex justify-end bg-gradient-to-t from-card via-card to-transparent pt-12">
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || !outlines || outlines.length === 0}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isGenerating ? "Preparing slides..." : "Generate slides"}
                    </button>
                </div>
            </div>
        </div>
    );
}
