import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Slide } from '../../types/slide';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';

interface SortableSlideProps {
    slide: Slide;
    index: number;
    selectedSlide: number;
    onSlideClick: (index: any) => void;
    renderSlideContent: (slide: any, isEditMode?: boolean) => React.ReactElement;
}

export function SortableSlide({ slide, index, selectedSlide, onSlideClick, renderSlideContent }: SortableSlideProps) {
    const lastClickTime = useRef(0);
    const { presentationData } = useSelector(
        (state: RootState) => state.presentationGeneration
    );

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: slide.id || `${slide.index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    const handleClick = (e: React.MouseEvent) => {
        const now = Date.now();

        // Debounce clicks - only allow one click every 300ms
        if (now - lastClickTime.current < 300) {
            return;
        }

        // Only trigger click if not dragging
        if (!isDragging) {
            lastClickTime.current = now;
            onSlideClick(slide.index);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={` cursor-pointer border-2 relative p-1 shadow-sm rounded-xl transition-all duration-300 hover:shadow-md ${selectedSlide === index 
                ? ' border-white shadow-zinc-900 ring-4 ring-white/10' 
                : 'border-transparent hover:border-zinc-700'
                }`}
        >
            <div className=" slide-box relative z-50  overflow-hidden aspect-video">
                <div className="absolute bg-transparent z-50 top-0 left-0 w-full h-full" />
                <div 
                    className="transform scale-[0.2] flex pointer-events-none justify-center items-center origin-top-left w-[500%] h-[500%] themed-slide-container"
                    style={{ 
                        // Generic theme vars
                        '--theme-bg': presentationData?.theme?.backgroundColor || '#ffffff',
                        '--theme-text': presentationData?.theme?.textColor || '#000000',
                        '--theme-accent': presentationData?.theme?.accentColor || '#1e4cd9',
                        '--theme-accent-rgb': presentationData?.theme?.accentColorRgb || '30, 76, 217',
                        // Swift template CSS vars
                        '--card-background-color': presentationData?.theme?.backgroundColor || '#ffffff',
                        '--primary-accent-color': presentationData?.theme?.accentColor || '#BFF4FF',
                        '--secondary-accent-color': presentationData?.theme?.cardBackgroundColor || '#ffffff',
                        '--text-heading-color': presentationData?.theme?.textColor || '#111827',
                        '--text-body-color': presentationData?.theme?.textColor ? `${presentationData.theme.textColor}99` : '#6B7280',
                        backgroundColor: presentationData?.theme?.backgroundColor || '#ffffff',
                        color: presentationData?.theme?.textColor || '#000000',
                    } as React.CSSProperties}
                >
                    {renderSlideContent(slide, false)}
                </div>
            </div>
        </div>
    );
}
 