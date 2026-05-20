import React from 'react';
import { ChevronDown, Plus, ArrowRight, Copy, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react';

export default function StorylineChat() {
    return (
        <div className="flex h-full w-full flex-col p-8 md:p-12 border-r border-[var(--ds-system-border-default)]">
            {/* Scrollable Conversation History */}
            <div className="flex-1 overflow-y-auto pr-4 no-scrollbar pb-10">

                {/* Header / Current phase */}
                <div className="flex items-center gap-1 text-[var(--ds-system-foreground-secondary)] text-sm mb-6">
                    <span className="cursor-pointer hover:text-white transition-colors">Musings</span>
                    <ChevronRight size={14} />
                </div>

                {/* System / AI Message */}
                <div className="mb-8">
                    <p className="text-base text-[var(--ds-system-foreground-primary)] mb-6">
                        Which narrative approach would you like to take
                    </p>

                    <div className="flex flex-col gap-3 max-w-[500px]">
                        {[
                            { title: "The great debate", desc: "Balanced exploration of human and AI strengths" },
                            { title: "AI as a tool", desc: "How AI augments, not replaces, human potential" },
                            { title: "The threat is real", desc: "Where AI is winning, and what humans risk losing" },
                            { title: "Finding the middle ground", desc: "A future where humans and AI co-exist" }
                        ].map((option, i) => (
                            <div key={i} className="group flex items-center justify-between rounded-xl bg-[var(--ds-system-surface-secondary)] border border-transparent hover:border-[var(--ds-system-border-default-alpha)] p-4 cursor-pointer transition-all">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-medium text-[var(--ds-system-foreground-primary)]">{option.title}</h3>
                                    <p className="text-[13px] text-[var(--ds-system-foreground-secondary)]">{option.desc}</p>
                                </div>
                                <button className="rounded-lg bg-[var(--ds-system-surface-tertiary)] px-4 py-1.5 text-xs font-medium text-[var(--ds-system-foreground-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                                    Select
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-6 text-[var(--ds-system-foreground-tertiary)] hover:text-[var(--ds-system-foreground-secondary)] transition-colors">
                        <button><Copy size={14} /></button>
                        <button><ThumbsUp size={14} /></button>
                        <button><ThumbsDown size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Input */}
            <div className="relative mt-auto pt-4 shrink-0">
                <div className="rounded-xl border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-secondary)] p-2">
                    <div className="px-2 pt-1 pb-3 text-xs text-[var(--ds-system-foreground-tertiary)]">Reply to Muse</div>
                    <div className="flex items-center gap-2">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ds-system-border-default-alpha)] text-[var(--ds-system-foreground-secondary)] hover:bg-[var(--ds-system-action-surface-ghost-hover)] transition-colors">
                            <Plus size={16} />
                        </button>
                        <button className="flex h-8 items-center gap-1.5 rounded-lg px-3 py-1 text-sm text-[var(--ds-system-foreground-secondary)] hover:bg-[var(--ds-system-surface-tertiary)] transition-colors">
                            Claude Sonnet 3.5
                            <ChevronDown size={14} className="text-[var(--ds-system-foreground-tertiary)]" />
                        </button>
                        <div className="flex-1"></div>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-secondary)] hover:bg-[var(--ds-system-action-surface-tertiary-hover)] transition-colors">
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
