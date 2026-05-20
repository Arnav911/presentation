import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Plus, ArrowRight } from "lucide-react";

const EmptyStateView: React.FC = () => {
    const router = useRouter();

    return (
        <div className="w-full bg-[var(--ds-system-surface-primary)]">
            <div className="max-w-[800px] h-[calc(100vh-72px)] flex justify-center items-center mx-auto px-4 sm:px-6 pb-6">
                <div className="text-center space-y-8">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-[var(--ds-system-surface-secondary)] to-[var(--ds-system-surface-tertiary)] rounded-full flex items-center justify-center">
                                <FileText className="w-12 h-12 text-[var(--ds-system-foreground-secondary)]" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--ds-system-surface-tertiary-hover)] rounded-full flex items-center justify-center">
                                <Plus className="w-4 h-4 text-[var(--ds-system-foreground-primary)]" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--ds-system-foreground-primary)] font-instrument_sans">
                            No Presentation Found
                        </h1>
                        <p className="text-lg text-[var(--ds-system-foreground-secondary)] max-w-md mx-auto leading-relaxed">
                            It looks like the presentation you are looking for is not found.
                            Let's create a brand new presentation!
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        <Button
                            onClick={() => router.push("/upload")}
                            className="group bg-[var(--ds-system-action-surface-primary)] text-[var(--ds-system-action-foreground-primary)] px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Presentation
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmptyStateView; 