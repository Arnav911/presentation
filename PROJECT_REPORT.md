# Project Report: Presenton (AI-Powered Presentation Generator)

## 1. Project Overview
**Presenton** is a sophisticated AI-driven platform designed to automate the creation of high-quality, professional presentations. Unlike standard template-based tools, Presenton uses a multi-phase "Guide Mode" to consult with users, extract deep narrative insights, and then generates dynamic, visually rich slides using a variety of smart layout systems.

## 2. Technical Stack
- **Frontend**: Next.js (React), TypeScript, Tailwind CSS, Lucide React (Icons).
- **State Management**: Redux Toolkit (thunks, slices) and React Context API.
- **Backend**: FastAPI (Python), SQLAlchemy (ORM).
- **Database**: SQLite (for local single-user persistence).
- **AI/LLM Integration**: LangChain, Anthropic (Claude), and OpenAI (GPT-4) for narrative generation and slide structuring.
- **Styling & Components**: Shadcn UI, Framer Motion (animations), and custom Vanilla CSS design tokens.
- **Project Structure**: Monorepo with `/servers/fastapi` (Backend) and `/servers/nextjs` (Frontend).

## 3. Core Features
- **Guide Mode**: A conversational AI interface that asks the user clarifying questions to build a comprehensive story outline before generating slides.
- **Dynamic Dashboard**: A central hub for starting new projects or continuing recent ones.
- **Smart Layout Engines**: 
    - **Flex Layout**: Automatically chooses between 8 different visualizations (Timeline, Compare, KPI Grid, etc.) based on content context.
    - **Template Gallery**: Support for Agency Pitch, Corporate, Modern, and Custom user-defined templates.
- **Recent Decks Panel**: Persistent storage and retrieval of all generated presentations.
- **Interactive Slide Editor**: Real-time content editing with AI-assisted slide updates.

## 4. Current Progress (What we are doing)
- **Database Persistence**: Successfully integrated the SQLite backend with the frontend sidebar. Users can now see their "Recent Decks" with titles, slide counts, and relative timestamps (e.g., "Generated 2h ago").
- **UI/UX Polishing**: Fixed critical rendering issues where slides were not filling the full canvas (the "blank white half" bug).
- **API Optimization**: Wires up the frontend to refresh the deck list automatically after a new presentation is generated.

## 5. Recent Key Implementations
- **Recent Decks Integration**: 
    - Implemented `fetchRecentPresentations` in the Dashboard.
    - Optimized the sidebar to show clickable deck history.
    - Added UI helpers for relative date/time formatting.
- **Layout Rendering Fixes**: 
    - Adjusted the `SlideContent` component to ensure scaled slide containers fill the full 1280x720 16:9 aspect ratio.
    - Fixed CSS flex properties that were causing content to center and shrink prematurely.

## 6. Future Roadmap (What will be doing)
- **Advanced Export Engines**: Implementation of direct PPTX and PDF exports using high-fidelity rendering.
- **Multi-User Support**: Migrating from local SQLite to PostgreSQL and adding authentication (OAuth/JWT).
- **Rich Media Library**: Integration with Unsplash/Pexels for automated image fetching for slides.
- **Custom Template Builder**: Allowing users to write their own JSX/Zod-based layout code directly in the browser to extend the system.

## 7. Internship Impact
This project demonstrates the ability to manage a full-stack AI application, handling complex data flows between a Python-based AI agentic backend and a modern React frontend. It involves database architecture, UI/UX debugging, and prompt engineering for structural content generation.
