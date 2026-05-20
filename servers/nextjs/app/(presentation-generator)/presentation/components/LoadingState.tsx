import React, { useState, useEffect } from 'react';


const LoadingState = () => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const tips = [
        "We're crafting your presentation with AI magic ✨",
        "Analyzing your content for perfect slides 📊",
        "Organizing information for maximum impact 🎯",
        "Adding visual elements to engage your audience 🎨",
        "Almost there! Putting final touches ⚡️"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mx-auto w-[500px] flex flex-col items-center justify-center p-8">
            <div className="w-full bg-zinc-800 rounded-xl p-[1px] ">
                <div className="bg-card rounded-xl p-6 w-full">
                    <div className="flex items-center justify-center space-x-4 ">

                        <h2 className="text-2xl font-semibold text-foreground">Creating Your Presentation</h2>
                    </div>
                    <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-border p-6 mb-4">
                        <div className="min-h-[120px] flex items-center justify-center">
                            <p className="text-muted-foreground text-lg text-center">
                                {tips[currentTipIndex]}
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-md">
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full animate-progress" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingState; 