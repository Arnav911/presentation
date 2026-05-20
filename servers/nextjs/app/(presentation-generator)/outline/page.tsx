import React from 'react';
import { Metadata } from 'next';
import OutlinePage from './components/OutlinePage';

export const metadata: Metadata = {
  title: "Outline Presentation",
  description: "Chat with the AI to shape your narrative and craft your presentation structure.",
  alternates: {
    canonical: "https://presentation-ai.com/create"
  }
}

const page = () => {
  return (
    <div className='relative min-h-screen bg-background text-foreground overflow-hidden font-sans'>
      {/* Absolute top-left toggle button area (Beta tag, workspace settings) */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-[var(--ds-system-foreground-secondary)] px-3 py-1.5 rounded-md hover:bg-[var(--ds-system-surface-secondary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--ds-system-border-default)]">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-current">
            <div className="h-2 w-3 border-l-2 border-b-2"></div>
          </div>
        </div>
      </div>

      <OutlinePage />
    </div>
  )
}

export default page;
