import React from 'react'
import * as z from "zod";
import { ImageSchema, IconSchema } from '@/presentation-templates/defaultSchemes';
import { RemoteSvgIcon } from '@/app/hooks/useRemoteSvgIcon';

export const layoutId = 'bullet-with-icons-slide'
export const layoutName = 'Bullet with Icons'
export const layoutDescription = 'A bullets style slide with main content, supporting image, and bullet points with icons and descriptions.'

const bulletWithIconsSlideSchema = z.object({
    title: z.string().min(3).max(40).default('Problem').meta({
        description: "Main title of the slide",
    }),
    description: z.string().max(150).default('Businesses face challenges with outdated technology and rising costs, limiting efficiency and growth in competitive markets.').meta({
        description: "Main description text explaining the problem or topic",
    }),
    image: ImageSchema.default({
        __image_url__: "",
        __image_prompt__: 'Business people analyzing documents and charts in office'
    }).meta({
        description: "Supporting image for the slide",
    }),
    bulletPoints: z.array(z.object({
        title: z.string().min(2).max(60).meta({
            description: "Bullet point title",
        }),
        description: z.string().min(10).max(100).meta({
            description: "Bullet point description",
        }),
        icon: IconSchema,
    })).min(1).max(3).default([
        {
            title: 'Inefficiency',
            description: 'Businesses struggle to find digital tools that meet their needs, causing operational slowdowns.',
            icon: {
                __icon_url__: 'https://presentation-ai-public.s3.ap-southeast-1.amazonaws.com/static/icons/bold/checks-bold.svg',
                __icon_query__: 'warning alert inefficiency'
            }
        },
        {
            title: 'High Costs',
            description: 'Outdated systems increase expenses, while small businesses struggle to expand their market reach.',
            icon: {
                __icon_url__: 'https://presentation-ai-public.s3.ap-southeast-1.amazonaws.com/static/icons/bold/fediverse-logo-bold.svg',
                __icon_query__: 'trending up costs chart'
            }
        }
    ]).meta({
        description: "List of bullet points with icons and descriptions",
    })
})

export const Schema = bulletWithIconsSlideSchema

export type BulletWithIconsSlideData = z.infer<typeof bulletWithIconsSlideSchema>

interface BulletWithIconsSlideLayoutProps {
    data?: Partial<BulletWithIconsSlideData>
}

const BulletWithIconsSlideLayout: React.FC<BulletWithIconsSlideLayoutProps> = ({ data: slideData }) => {
    const bulletPoints = slideData?.bulletPoints || []

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <div
                className="w-full rounded-sm max-w-[1280px] shadow-lg max-h-[720px] aspect-video bg-gradient-to-br from-gray-50 to-white relative z-20 mx-auto overflow-hidden"
                style={{
                    fontFamily: 'var(--heading-font-family,Inter)',
                    background: "var(--card-background-color,#ffffff)"
                }}
            >



                {/* Main Content */}
                <div className="flex flex-col h-full px-8 sm:px-12 lg:px-16 pt-8 pb-4">
                    {/* Title Section - Full Width */}
                    <div className="mb-4">
                        <h1 style={{ color: "var(--text-heading-color,#111827)" }} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                            {slideData?.title || 'Problem'}
                        </h1>
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-1">
                        {/* Left Section - Image with Grid Pattern */}
                        <div className="flex-1 relative">
                            {/* Grid Pattern Background */}
                            <div className="absolute top-0 left-0 w-full h-full">
                                <svg className="w-full h-full opacity-30" viewBox="0 0 200 200">
                                    <defs>
                                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--primary-accent-color,#9333ea)" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            {/* Image Container */}
                            <div className="relative z-10 h-full flex items-center justify-center p-4">
                                <div className="w-full max-w-md h-80 rounded-2xl overflow-hidden shadow-lg">
                                    <img
                                        src={slideData?.image?.__image_url__ || ''}
                                        alt={slideData?.image?.__image_prompt__ || slideData?.title || ''}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Decorative Sparkle */}
                            <div style={{ color: "var(--primary-accent-color,#9333ea)" }} className="absolute top-20 right-8 text-purple-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0l3.09 6.26L22 9l-6.91 2.74L12 18l-3.09-6.26L2 9l6.91-2.74L12 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Right Section - Content */}
                        <div className="flex-1 flex flex-col justify-center pl-8 lg:pl-12">
                            {/* Description */}
                            <p style={{ color: "var(--text-body-color,#4b5563)" }} className="text-sm lg:text-base text-gray-700 leading-relaxed text-left mb-4">
                                {slideData?.description || 'Businesses face challenges with outdated technology and rising costs, limiting efficiency and growth in competitive markets.'}
                            </p>

                            {/* Bullet Points */}
                            <div className="space-y-3">
                                {bulletPoints.map((bullet, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        {/* Icon */}
                                        <div style={{ background: "var(--primary-accent-color,#9333ea)" }} className="flex-shrink-0 w-8 h-8 rounded-lg shadow-md flex items-center justify-center">
                                            <RemoteSvgIcon
                                                url={bullet.icon.__icon_url__}
                                                strokeColor={"currentColor"}
                                                className="w-4 h-4"
                                                color="var(--text-heading-color,#ffffff)"
                                                title={bullet.icon.__icon_query__}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h3 style={{ color: "var(--text-heading-color,#111827)" }} className="text-sm lg:text-base font-semibold text-gray-900 mb-1">
                                                {bullet.title}
                                            </h3>
                                            <div style={{ background: "var(--primary-accent-color,#9333ea)" }} className="w-8 h-0.5 bg-purple-600 mb-2"></div>
                                            <p style={{ color: "var(--text-body-color,#4b5563)" }} className="text-xs lg:text-sm text-gray-700 leading-relaxed text-left">
                                                {bullet.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BulletWithIconsSlideLayout 