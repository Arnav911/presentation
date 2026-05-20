"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { 
  clearOutlines, 
  setPresentationId, 
  setTheme, 
  setOutlines, 
  setPresentationData, 
  clearPresentationData, 
  setStreaming, 
  updateOutlineAtIndex 
} from "@/store/slices/presentationGeneration";
import { PresentationGenerationApi } from "@/app/(presentation-generator)/services/api/presentation-generation";
import { ThemeSelector } from "./components/ThemeSelector";
import { Theme } from "./constants/themes";
import { RootState } from "@/store/store";
import { usePresentationStreaming } from "../presentation/hooks/usePresentationStreaming";
import { useLayout } from "../context/LayoutContext";
import { TemplateCards, TabType } from "./components/TemplateCards";
import { CustomTemplateModal } from "./components/CustomTemplateModal";
import "./chronicle.css";
import { SlidePreviewOverlay } from "./components/SlidePreviewOverlay";
import { GuideModeChat } from "./components/GuideModeChat";
import SupportingDoc from "../upload/components/SupportingDoc";
import {
  Sidebar,
  Settings,
  HelpCircle,
  Send,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
  X,
  Loader2,
  Pencil,
  Presentation,
  Layout,
  Search,
  Brain,
  ExternalLink,
} from "lucide-react";
import { setPptGenUploadState } from "@/store/slices/presentationGenUpload";
import { LanguageType, ToneType, VerbosityType } from "@/app/(presentation-generator)/upload/type";
import { useOutlineStreaming } from "@/app/(presentation-generator)/outline/hooks/useOutlineStreaming";
import { Template } from "@/app/(presentation-generator)/outline/types/index";

type ViewMode = "input" | "chat" | "guide_chat";
type PanelState = "storyline" | "generating" | "ready"; // Assuming PanelState is defined like this

interface NarrativeOption {
  title: string;
  description: string;
}

interface GuideBlock {
  type: "overview" | "taskBox" | "analysis" | "question" | "summary" | "narratives" | "research" | "content_clarification";
  phase?: number;
  totalPhases?: number;
  title?: string;
  steps?: { label: string; status: "complete" | "loading" | "pending" }[];
  questionId?: number;
  totalQuestions?: number;
  options?: string[];
  isAnswered?: boolean;
  selectedAnswer?: string;
  narrativeOptions?: NarrativeOption[];
  answers?: Record<number, string>;
  tasks?: string[];
  completedTaskCount?: number;
  pastedDocTitle?: string;
  research?: {
    status: string;
    thinking: string;
    sources: { title: string; href: string }[];
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls?: any[];
  guideBlock?: GuideBlock;
}



interface RecentPresentation {
  id: string;
  title: string | null;
  n_slides: number;
  created_at: string;
  updated_at: string;
}

/** Strip markdown syntax from outline item.content and extract a clean title + subtitle */
function parseOutlineContent(raw: string): { title: string; subtitle: string; body: string } {
  if (!raw) return { title: '', subtitle: '', body: '' };
  const lines = raw.split(/\n/).map(l => l.trim()).filter(Boolean);
  let title = '';
  let subtitle = '';
  const bodyLines: string[] = [];

  for (const line of lines) {
    // Strip leading #, *, -, > chars and bold/italic markers
    const clean = line
      .replace(/^#{1,6}\s*/, '')       // remove # headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
      .replace(/\*([^*]+)\*/g, '$1')    // *italic*
      .replace(/^[-*>]+\s*/, '')         // list/quote markers
      .replace(/`([^`]+)`/g, '$1')       // `code`
      .trim();

    if (!clean) continue;

    // First H1 line becomes title
    if (!title && /^#\s/.test(line)) {
      title = clean;
    } else if (!subtitle && /^#{2,}\s/.test(line)) {
      subtitle = clean;
    } else {
      bodyLines.push(clean);
    }
  }

  // Fallback: first line is title
  if (!title && lines.length > 0) {
    title = lines[0].replace(/^#{1,6}\s*/, '').replace(/\*\*([^*]+)\*\*/g, '$1').trim();
  }

  return { title, subtitle, body: bodyLines.join(' · ') };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<ViewMode>("input");
  const [userBubble, setUserBubble] = useState("");
  const [recentPresentations, setRecentPresentations] = useState<RecentPresentation[]>([]);

  const fetchRecentPresentations = async () => {
    try {
      const res = await fetch("/api/v1/ppt/presentation/all");
      if (res.ok) {
        const data: RecentPresentation[] = await res.json();
        setRecentPresentations(data.slice(0, 10));
      }
    } catch (err) {
      console.error("Failed to fetch recent presentations", err);
    }
  };

  useEffect(() => {
    fetchRecentPresentations();
  }, []);
  const [guidePrompt, setGuidePrompt] = useState("");
  const [isPreparingSlides, setIsPreparingSlides] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState<Template | null>(null);
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]);
  const [isLoadingNarratives, setIsLoadingNarratives] = useState(false);
  const [isNarrativeSelected, setIsNarrativeSelected] = useState(false);
  const [selectedNarrative, setSelectedNarrative] = useState<NarrativeOption | null>(null);
  const [isUpdatingPresentation, setIsUpdatingPresentation] = useState(false);
  const [expandedSlideIdx, setExpandedSlideIdx] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [presentationMode, setPresentationMode] = useState<"Professional" | "Guide">("Professional");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "4:3">("16:9");
  const [slideCount, setSlideCount] = useState<number>(10);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: "Hello! I'm Muse, your Senior Presentation Consultant. What are we creating today? I can help you brainstorm topics, or if you already have one in mind, just let me know!"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  // Track if the submission was a long pasted document (for chip display)
  const [pastedDocumentContent, setPastedDocumentContent] = useState<string | null>(null);

  // Guide Mode State
  const [isGuideModeActive, setIsGuideModeActive] = useState(false);
  const [guideAnswers, setGuideAnswers] = useState<Record<number, string>>({});
  const [currentGuideQuestionIndex, setCurrentGuideQuestionIndex] = useState(0);
  const [isLoadingGuideAnalysis, setIsLoadingGuideAnalysis] = useState(false);
  const [customGuideAnswer, setCustomGuideAnswer] = useState("");
  const [isStorylineVisible, setIsStorylineVisible] = useState(false);
  const [guideTasks, setGuideTasks] = useState<string[]>([]);
  const [guideTaskBoxMsgId] = useState('guide-taskbox');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [expandedOutlineIdx, setExpandedOutlineIdx] = useState<number | null>(null);
  const [editingOutlineIdx, setEditingOutlineIdx] = useState<number | null>(null);
  const [editingOutlineContent, setEditingOutlineContent] = useState("");

  // Derive slide count from guide question 6 answer
  const getSlideCountFromAnswers = (): number => {
    if (presentationMode === "Professional") return slideCount;
    const ans = (guideAnswers[6] || "").toLowerCase();
    if (ans.includes("10-15") || ans.includes("comprehensive")) return 12;
    if (ans.includes("5-8") || ans.includes("executive")) return 7;
    if (ans.includes("15-20") || ans.includes("deep dive")) return 18;
    return 10; // sensible default
  };

  const getGuideQuestions = (topic: string) => [
    {
      id: 1,
      title: "Target audience for this presentation",
      options: [
        "Business stakeholders/investors — Focus on market opportunity, financial performance, and growth metrics",
        "Internal Team - Focus on operations and strategy",
        "Public Audience - General overview and inspiring story"
      ]
    },
    {
      id: 2,
      title: "Core purpose of this presentation",
      options: [
        `Information Transfer — Present ${topic}'s story, data, and market insights clearly`,
        "Persuasion/Decision-Making — Build a case for investment, partnership, or strategic decision",
        `Educational/Inspirational — Share lessons from ${topic} for learning and motivation`
      ]
    },
    {
      id: 3,
      title: "Delivery format and context",
      options: [
        "Read-only document — This will be shared for independent reading (needs more detail)",
        "Live Presentation — Speaker-led with visual aids",
        "Workshop format"
      ]
    },
    {
      id: 4,
      title: "Material source preference",
      options: [
        "AI research only — Use the research I've already gathered",
        "I have materials to upload",
        "Other"
      ]
    },
    {
      id: 5,
      title: "Visual style and tone",
      options: [
        "Professional/Corporate — Data-focused, clean charts, minimal decorative elements",
        "Creative/Modern — Bold colors, large typography, highly visual",
        "Minimalist — Very clean, lots of whitespace"
      ]
    },
    {
      id: 6,
      title: "Presentation length and depth",
      options: [
        "10-15 slides — Comprehensive analysis (recommended for investor documents)",
        "5-8 slides — Quick Executive Summary",
        "15-20+ slides — Deep dive"
      ]
    }
  ];

  const fetchGuideAnalysis = async (initialPrompt: string) => {
    setIsLoadingGuideAnalysis(true);
    setIsGuideModeActive(true);
    setView("chat");

    const userMsgId = Date.now().toString();

    // Step 1: Show overview message immediately
    setChatMessages([
      { id: userMsgId, role: "user", content: initialPrompt },
      {
        id: 'guide-overview',
        role: 'assistant',
        content: `I'll help you create a professional presentation on **${initialPrompt}**. Since you've selected Guide Mode, I'll work with you through a comprehensive consultation process to build an authoritative presentation.\n\nLet me start by researching the topic to better understand the context — then I'll ask you some strategic questions to tailor the presentation to your specific needs.`,
      }
    ]);

    // Step 2: Fetch tasks and show task box
    let fetchedTasks: string[] = [];
    try {
      const tasksRes = await fetch("/api/v1/ppt/guide/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: initialPrompt }),
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        if (Array.isArray(tasksData.tasks)) fetchedTasks = tasksData.tasks;
      }
    } catch {}

    if (!fetchedTasks.length) {
      fetchedTasks = [
        `Research ${initialPrompt} - market position, business models, competitive landscape`,
        'Phase 1: Strategy Layer - Define audience, purpose, and context',
        'Phase 2: Substance Layer - Gather and filter materials',
        'Phase 3: Structure Layer - Design narrative framework and outline',
        'Phase 4: Surface Layer - Define visual style and design approach',
        'Phase 5: Execution & Reflection - Build slides and quality review',
      ];
    }
    setGuideTasks(fetchedTasks);

    // Show task box — research task active (index 0)
    setChatMessages(prev => [
      ...prev,
      {
        id: guideTaskBoxMsgId,
        role: 'assistant',
        content: '',
        guideBlock: { type: 'taskBox', tasks: fetchedTasks, completedTaskCount: 0 }
      }
    ]);

    // Step 3: Fetch research / analysis
    try {
      const res = await fetch("/api/v1/ppt/guide/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: initialPrompt }),
      });

      let analysisText = `**Phase 1: Strategy Layer – Understanding Your Needs**\n\nGreat! I've researched ${initialPrompt}. Here's what I found:\n\n• This topic has rich strategic dimensions worth exploring.\n• There are several key themes that will make for a compelling presentation.\n\nNow, before we proceed, I need to understand the strategic context for your presentation. Let me ask you some key questions to tailor this perfectly.`;
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) analysisText = data.analysis;
      }

      // Mark research task done in task box
      setChatMessages(prev => prev.map(m =>
        m.id === guideTaskBoxMsgId
          ? { ...m, guideBlock: { ...m.guideBlock!, completedTaskCount: 1 } }
          : m
      ));

      const questions = getGuideQuestions(initialPrompt);

      // Show analysis + first question
      setChatMessages(prev => [
        ...prev,
        {
          id: 'guide-analysis',
          role: 'assistant',
          content: analysisText,
        },
        {
          id: `q-1`,
          role: 'assistant',
          content: '',
          guideBlock: {
            type: 'question',
            questionId: 1,
            totalQuestions: questions.length,
            title: questions[0].title,
            options: questions[0].options,
            isAnswered: false,
          }
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingGuideAnalysis(false);
    }
  };

  const handleGuideAnswerSubmit = (qId: number, answer: string) => {
    const questions = getGuideQuestions(userBubble || prompt);
    const newAnswers = { ...guideAnswers, [qId]: answer };
    setGuideAnswers(newAnswers);
    setCustomGuideAnswer("");

    // Mark current question as answered (freeze it)
    setChatMessages(prev => prev.map(m =>
      m.guideBlock?.type === 'question' && m.guideBlock.questionId === qId
        ? { ...m, guideBlock: { ...m.guideBlock, isAnswered: true, selectedAnswer: answer } }
        : m
    ));

    // Add user's answer bubble
    setChatMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: answer }
    ]);

    // Mark next task in task box complete
    setChatMessages(prev => prev.map(m =>
      m.id === guideTaskBoxMsgId
        ? { ...m, guideBlock: { ...m.guideBlock!, completedTaskCount: Math.min((m.guideBlock!.completedTaskCount ?? 1) + 1, guideTasks.length) } }
        : m
    ));

    if (qId < questions.length) {
      const nextQ = questions[qId];
      setCurrentGuideQuestionIndex(qId);

      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            id: `q-${qId + 1}`,
            role: 'assistant',
            content: '',
            guideBlock: {
              type: 'question',
              questionId: qId + 1,
              totalQuestions: questions.length,
              title: nextQ.title,
              options: nextQ.options,
              isAnswered: false,
            }
          }
        ]);
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    } else {
      // All questions answered — show final summary
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            id: 'guide-summary',
            role: 'assistant',
            content: '',
            guideBlock: {
              type: 'summary',
              answers: newAnswers,
            }
          }
        ]);
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  };

 
  const streamChatMessages = async (messagesToStream: ChatMessage[]) => {
    setIsChatLoading(true);
    const aiMsgId = (Date.now() + 10).toString(); // Higher offset for safety
    
    // Immediately add the empty assistant bubble to the state
    setChatMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/v1/ppt/agent-chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(messagesToStream.map(m => ({ role: m.role, content: m.content })))
      });

      if (!response.ok) throw new Error("Stream failed");
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
           const trimmedLine = line.trim();
           if (!trimmedLine) continue;

           if (trimmedLine.startsWith("event: error")) {
               console.error("Stream SSE Error");
               continue;
           }
           
           if (trimmedLine.startsWith("data: ")) {
              try {
                 const jsonStr = trimmedLine.slice(6);
                 const data = JSON.parse(jsonStr);
                 if (data.type === "chunk" && data.chunk) {
                    setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + data.chunk } : m));
                 } else if (data.type === "error") {
                    setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: `Error: ${data.detail || 'Something went wrong on the server.'}` } : m));
                 }
              } catch (e) {
                 console.error("[Chat] JSON parse error:", e, "Line:", trimmedLine);
              }
           }
        }
      }

      // Attempt to clear any remaining buffer
      if (buffer.trim().startsWith("data: ")) {
         try {
            const data = JSON.parse(buffer.trim().slice(6));
            if (data.type === "chunk" && data.chunk) {
               setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + data.chunk } : m));
            }
         } catch(e) {}
      }

      // Fallback: If bubble is still empty after stream ends, show error
      setChatMessages(prev => {
         const last = prev[prev.length - 1];
         if (last && last.id === aiMsgId && !last.content) {
            return prev.map(m => m.id === aiMsgId ? { ...m, content: "I'm sorry, I'm having trouble connecting to my creative brain right now. Could you please try again?" } : m);
         }
         return prev;
      });
    } catch (error) {
       console.error(error);
       setChatMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'assistant' && !last.content) {
             return prev.map(m => m.id === last.id ? { ...m, content: "Sorry, I encountered an error. Please try again." } : m);
          }
          return prev;
       });
    } finally {
       setIsChatLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput.trim()
    };
    
    const newMessages = [...chatMessages, newUserMsg];
    setChatMessages(newMessages);
    setChatInput("");
    
    await streamChatMessages(newMessages);
  };

  const handleTransitionToGeneration = async (topic: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await PresentationGenerationApi.createPresentation({
        content: topic,
        n_slides: getSlideCountFromAnswers(),
        file_paths: [],
        language: LanguageType.English,
        tone: ToneType.Default,
        verbosity: VerbosityType.Standard,
        include_table_of_contents: false,
        include_title_slide: false,
        web_search: true,
      });

      if (!response?.id) throw new Error("No presentation ID returned.");

      dispatch(setPresentationId(response.id));
      setUserBubble(topic);
      setPanelState("storyline");
      setIsStorylineVisible(false);

      // Trigger narratives
      setIsLoadingNarratives(true);
      fetch("/api/v1/ppt/narrative/approaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic }),
      })
        .then(r => r.json())
        .then(data => {
            if (data?.approaches) {
              setNarrativeOptions(data.approaches);
              // Push narrative message to chat
              setChatMessages(prev => [
                ...prev,
                {
                  id: 'narrative-selector-' + Date.now(),
                  role: 'assistant',
                  content: '',
                  guideBlock: {
                    type: 'narratives',
                    narrativeOptions: data.approaches
                  }
                }
              ]);
          }
        })
        .catch(err => console.error("Narrative fetch failed:", err))
        .finally(() => setIsLoadingNarratives(false));
      
      // Update chat with context
      const newChatMsgs: ChatMessage[] = [
        ...chatMessages,
        { id: Date.now().toString(), role: 'user', content: topic },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: `Great! Let's get started on your presentation about **${topic}**. I'm preparing some narrative angles for you...` }
      ];
      setChatMessages(newChatMsgs);

    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const { presentation_id, outlines, presentationData, isStreaming: isPresentationStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  // Layout Context for getting full slide schemas
  const { getLayoutsByTemplateID } = useLayout();

  const [panelState, setPanelState] = useState<PanelState>("storyline");
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState(false);

  // Hook into presentation streaming once slides are being prepared
  usePresentationStreaming(
    panelState === "generating" && presentation_id ? presentation_id : "",
    panelState === "generating" ? "true" : null,
    setStreamLoading,
    setStreamError,
    () => { } // Do nothing if not streaming
  );

  // Auto-transition to ready when stream completes
  useEffect(() => {
    // Only transition to ready if we were generating AND the stream is definitely over (not just hasn't started)
    // We check if at least one slide has been populated with more than just a title to confirm "ready" status
    const hasFinishedContent = presentationData?.slides?.some((s: { content?: Record<string, unknown> }) => Object.keys(s.content || {}).length > 1);
    if (panelState === "generating" && !isPresentationStreaming && hasFinishedContent) {
      setPanelState("ready");
      // Refresh sidebar so the newly-generated deck appears
      fetchRecentPresentations();
    }
  }, [panelState, isPresentationStreaming, presentationData]);

  // Hook into the outline streaming once we have a presentation_id AND a narrative is selected,
  // but SKIP it entirely for Guide Mode since we already finalized the outline during consultation.
  const skipOutlineStream = isNarrativeSelected && selectedNarrative?.title === "Custom Guide Strategy";
  const streamState = useOutlineStreaming(view === "chat" && isNarrativeSelected && !skipOutlineStream ? presentation_id : null);
  const { isStreaming, citations, status, thinking } = streamState;

  // Effect to sync research state to chat history — Condensed version
  useEffect(() => {
    // Suppress "0 sources" message for Guide Mode which already did research in consultation
    const isGuideHandover = view === "chat" && isNarrativeSelected === true && selectedNarrative?.title === "Custom Guide Strategy";
    
    if (!isStreaming && isNarrativeSelected && (status || thinking || citations.length > 0)) {
        if (isGuideHandover && citations.length === 0) return;

        setChatMessages(prev => {
            if (prev.some(m => m.id.startsWith('research-done'))) return prev;
            
            const researchDoneMsg: ChatMessage = {
                id: 'research-done-' + Date.now(),
                role: 'assistant',
                content: `Research complete! I've analyzed ${citations.length} sources and identified the key ${typeof isNarrativeSelected === "object" ? "narrative" : 'research'} points. Now structuring your slides...`,
            };
            return [...prev, researchDoneMsg];
        });
    }
  }, [isStreaming, isNarrativeSelected, status, thinking, citations, view, selectedNarrative]);

  const [activeTab, setActiveTab] = useState<TabType>("Templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Pre-fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) throw new Error("Templates not found");
        const layouts = await res.json();
        const mapped: Template[] = layouts.map((l: any) => ({
          id: l.templateID,
          name: l.templateName || l.templateID,
          ordered: l.settings?.ordered || false,
          slides: l.files,
          description: l.settings?.description || "",
          default: l.settings?.default || false,
        }));
        setTemplates(mapped);

        const picked = mapped.find((l) => l.id === "marketing-agencies") || mapped[0];
        if (picked) setDefaultTemplate(picked);
      } catch (err) {
        console.error("Failed to pre-load templates", err);
      }
    };

    const fetchCustomTemplates = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch("/api/v1/ppt/template-management/summary", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          console.warn("Custom templates summary returned non-ok status:", res.status);
          return;
        }

        const data = await res.json();
        const presentations = data.presentations || [];
        const mapped: Template[] = presentations.map((p: any) => ({
          id: `custom-${p.presentation_id || p.id}`,
          name: p.template?.name || `Custom Template ${p.presentation_id || p.id}`,
          description: p.template?.description || "Custom template layout",
          ordered: false,
          slides: new Array(p.layout_count || 0).fill(""),
        }));
        setCustomTemplates(mapped);
      } catch (err) {
        console.error("Failed to load custom templates", err);
      }
    };

    fetchTemplates();
    fetchCustomTemplates();
  }, []);

  const { refetch: refetchLayouts } = useLayout();

  const handleGenerate = async (enhancedPrompt?: string | any) => {
    const submitted = (typeof enhancedPrompt === 'string' ? enhancedPrompt : prompt).trim();
    if (!submitted || isGenerating) return;
    setIsGenerating(true);

    // ── NEW: Guide Mode routes to the dedicated GuideModeChat view ──
    if (typeof enhancedPrompt !== 'string' && presentationMode === "Guide") {
      setGuidePrompt(submitted);
      setPrompt("");
      setView("guide_chat");
      setIsGenerating(false);
      return;
    }

    // Intent detection: if the prompt is a simple greeting or very short, treat as general chat
    const lower = submitted.toLowerCase();
    const isGeneralChat = ["hi", "hello", "hey", "who are you", "help"].includes(lower) || lower.split(/\s+/).length < 2;

    if (isGeneralChat) {
      // Switch to chat view and just stream a response without creating a presentation
      const newUserMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: submitted };
      const newMessages = [...chatMessages, newUserMsg];
      setChatMessages(newMessages);
      setPrompt("");
      setView("chat");
      setIsGenerating(false);
      // Pass the actual message list to avoid closure staleness
      streamChatMessages(newMessages);
      return;
    }

    try {
      // NOTE: Here we define that if no selectedTemplate is picked,
      // the backend should be responsible for LLM categorization. 
      // We pass the explicit layout instruction if a template IS selected.
      const instructions = selectedTemplate
        ? `Use the layout template specified: ${selectedTemplate.id}.`
        : null;

      let documentPaths: string[] = [];
      if (files.length > 0) {
        try {
          const uploadResponse = await PresentationGenerationApi.uploadDoc(files);
          if (uploadResponse.length > 0) {
            const decomposed = await PresentationGenerationApi.decomposeDocuments(uploadResponse);
            documentPaths = decomposed.map((d: any) => d.file_path);
          }
        } catch (err) {
          console.error("Error uploading documents", err);
        }
      }

      const createResponse = await PresentationGenerationApi.createPresentation({
        content: submitted,
        n_slides: getSlideCountFromAnswers(),
        file_paths: documentPaths,
        language: LanguageType.English,
        tone: ToneType.Default,
        verbosity: VerbosityType.Standard,
        instructions: instructions,
        include_table_of_contents: false,
        include_title_slide: false,
        web_search: true,
      });

      if (!createResponse?.id) throw new Error("No presentation ID returned.");

      dispatch(clearOutlines());
      dispatch(setPresentationId(createResponse.id));
      dispatch(setPptGenUploadState({
        config: {
          prompt: submitted,
          slides: String(getSlideCountFromAnswers()),
          language: LanguageType.English,
          tone: ToneType.Default,
          verbosity: VerbosityType.Standard,
          instructions: "",
          includeTableOfContents: false,
          includeTitleSlide: false,
          webSearch: true,
        },
        files: [],
      }));

      // Detect if this is a long pasted document (>300 chars) vs a short topic prompt
      const IS_PASTED_DOC = submitted.length > 300;

      // Transform page in place — no navigation and reset state BEFORE fetching
      setUserBubble(submitted);
      setPrompt("");
      setNarrativeOptions([]);
      setIsNarrativeSelected(false);
      setSelectedNarrative(null);
      setPanelState("storyline");
      setIsStorylineVisible(false);
      setView("chat");

      if (IS_PASTED_DOC) {
        // Store the full content for later use
        setPastedDocumentContent(submitted);

        // Show a compact chip + clarifying question (Chronicle HQ style)
        const newChatMsgs: ChatMessage[] = [
          // The user bubble will render as a chip thanks to pastedDocumentContent state
          { id: Date.now().toString(), role: 'user', content: submitted },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            guideBlock: {
              type: 'content_clarification',
              pastedDocTitle: 'Pasted text',
            }
          }
        ];
        setChatMessages(newChatMsgs);
      } else {
        // Short topic — existing behaviour: immediately fetch narratives
        setPastedDocumentContent(null);

        const newChatMsgs: ChatMessage[] = [
          { id: Date.now().toString(), role: 'user', content: submitted },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: `I'm on it! I'm analyzing your request for a deck on **${submitted}** and building some narrative options for you now...` }
        ];
        setChatMessages(newChatMsgs);

        // Start fetching AI narrative approaches in parallel
        setIsLoadingNarratives(true);
        fetch("/api/v1/ppt/narrative/approaches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: submitted, file_paths: documentPaths }),
        })
          .then((r) => {
            if (!r.ok) throw new Error(`Narrative API error: ${r.status} ${r.statusText}`);
            return r.json();
          })
          .then((data) => {
            console.log("Narrative response:", data);
            if (data?.approaches && data.approaches.length > 0) {
              setNarrativeOptions(data.approaches);
              setChatMessages(prev => [
                ...prev,
                {
                  id: 'narrative-selector-' + Date.now(),
                  role: 'assistant',
                  content: '',
                  guideBlock: {
                    type: 'narratives',
                    narrativeOptions: data.approaches
                  }
                }
              ]);
            }
          })
          .catch((err) => {
            console.error("Narrative fetch failed:", err);
          })
          .finally(() => setIsLoadingNarratives(false));
      }

    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for the content clarification step (pasted document flow)
  const handleContentModeSelect = (mode: "1:1" | "reshape") => {
    const content = pastedDocumentContent || userBubble;
    if (!content || !presentation_id) return;

    // Mark the clarification card as answered
    setChatMessages(prev => prev.map(m =>
      m.guideBlock?.type === 'content_clarification'
        ? { ...m, guideBlock: { ...m.guideBlock, isAnswered: true, selectedAnswer: mode } }
        : m
    ));

    const modeLabel = mode === '1:1' ? 'Match content 1:1' : 'Reshape into a tighter narrative';

    // Add user bubble for their choice
    setChatMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: modeLabel }
    ]);

    if (mode === '1:1') {
      // ── 1:1 path: skip narrative picker, go straight to storyline streaming ──
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here's the storyline matching your content 1:1. The deck maps all sections from your content — let me know if you'd like to adjust anything before generating.`
        }
      ]);

      // Update the presentation instructions and kick off outline streaming
      setIsUpdatingPresentation(true);
      setIsStorylineVisible(true);
      dispatch(clearOutlines());

      // Trigger outline streaming immediately — don't wait for the PATCH response
      setIsNarrativeSelected(true);

      // Fire the instructions update in the background
      fetch("/api/v1/ppt/presentation/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: presentation_id,
          instructions: "Match the content structure exactly. Preserve all sections in the order provided. Use the exact data and copy from the pasted content without reshaping the narrative. If the content contains multiple sections with the same title (e.g. two slides both called 'Product Overview'), merge them into a single slide using the richer of the two, keeping all unique data points. Do not create duplicate slides."
        }),
      })
        .catch(err => console.error("[1:1] Error updating instructions:", err))
        .finally(() => setIsUpdatingPresentation(false));

    } else {
      // ── Reshape path: fetch narrative approach options ──
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I'm on it! Reshaping your content into a tighter, more compelling narrative and building some angles for you now...`
        }
      ]);

      setIsLoadingNarratives(true);
      fetch("/api/v1/ppt/narrative/approaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.approaches && data.approaches.length > 0) {
            setNarrativeOptions(data.approaches);
            setChatMessages(prev => [
              ...prev,
              {
                id: 'narrative-selector-' + Date.now(),
                role: 'assistant',
                content: '',
                guideBlock: {
                  type: 'narratives',
                  narrativeOptions: data.approaches
                }
              }
            ]);
          }
        })
        .catch(err => console.error("Narrative fetch failed:", err))
        .finally(() => setIsLoadingNarratives(false));
    }
  };
  
  const handleNarrativeSelect = async (opt: NarrativeOption) => {
    if (!presentation_id || isUpdatingPresentation) return;

    console.log(`[Narrative] Selecting narrative: ${opt.title}`);
    setIsUpdatingPresentation(true);
    setSelectedNarrative(opt);

    try {
      setIsStorylineVisible(true);
      // Clear any existing outlines to ensure a fresh stream
      dispatch(clearOutlines());

      // Save the narrative as instructions for the outline generation
      const res = await fetch("/api/v1/ppt/presentation/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: presentation_id,
          instructions: `Narrative approach: ${opt.title}. ${opt.description}`
        }),
      });

      if (res.ok) {
        console.log("[Narrative] Presentation updated with instructions successfully");
        setIsNarrativeSelected(true);
      } else {
        console.error("[Narrative] Failed to update presentation instructions", await res.text());
      }
      
      // Acknowledge narrative choice
      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: `Excellent choice! I'm now building the detailed storyline for **${opt.title}**. Just a moment while I structure the slides...` }
      ]);
    } catch (err) {
      console.error("[Narrative] Error during selection flow", err);
    } finally {
      setIsUpdatingPresentation(false);
    }
  };

  const finalizeGuideGeneration = async () => {
    if (!presentation_id || isUpdatingPresentation) return;

    console.log("[Guide] Finalizing guide generation and proceeding to storyline.");
    setIsUpdatingPresentation(true);
    setIsStorylineVisible(true); // Show storyline panel

    try {
      // Construct the final instructions from the collected answers
      const questions = getGuideQuestions(userBubble || prompt);
      const finalInstructions = Object.entries(guideAnswers).map(([qId, ans]) => {
        const question = questions.find(q => q.id === parseInt(qId));
        return `${question?.title}: ${ans}`;
      }).join("\n");

      // Update the presentation with the final instructions
      const res = await fetch("/api/v1/ppt/presentation/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: presentation_id,
          instructions: finalInstructions,
        }),
      });

      if (res.ok) {
        console.log("[Guide] Presentation updated with final instructions successfully");
        
        // Acknowledge strategy and move to storyline
        setChatMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', content: `Strategy confirmed! I'm now analyzing your requirements and building the detailed storyline for your presentation...` }
        ]);
        
        setIsNarrativeSelected(true); // This will trigger outline streaming
      } else {
        console.error("[Guide] Failed to update presentation with final instructions", await res.text());
      }
    } catch (err) {
      console.error("[Guide] Error during guide finalization flow", err);
    } finally {
      setIsUpdatingPresentation(false);
    }
  };

  const handleGenerateSlides = async (overrideOutlines?: any[], overridePresentationId?: string) => {
    const activeOutlines = overrideOutlines || outlines;
    const activePresentationId = overridePresentationId || presentation_id;
    if (!activeOutlines || !Array.isArray(activeOutlines) || activeOutlines.length === 0 || !activePresentationId) {
      console.warn("[Generate] Missing outlines or presentation_id", { activeOutlines, presentation_id: activePresentationId });
      return;
    }
    setIsPreparingSlides(true);
    try {
      let templateToUse = selectedTemplate;

      if (!templateToUse && (presentationMode === "Guide" || isGuideModeActive)) {
        templateToUse = {
          id: "flex",
          name: "Dynamic Flex Layouts",
          ordered: false,
          description: "Guide Mode Dynamic Layouts",
          slides: []
        };
      }

      if (!templateToUse) {
        // Auto-select template based on content
        try {
          const autoSelectRes = await fetch("/api/v1/ppt/presentation/auto-select", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ presentation_id: activePresentationId }),
          });
          const autoSelectData = await autoSelectRes.json();
          const templateId = autoSelectData.template_id;
          templateToUse = templates.find((t) => t.id === templateId) || defaultTemplate;
        } catch (err) {
          console.error("Auto-selection failed, falling back to default", err);
          templateToUse = defaultTemplate;
        }
      }

      if (!templateToUse) throw new Error("No template available for generation");

      // We retrieve these from the LayoutContext using the template ID.
      // For flex (Guide Mode), we ONLY send flex-specific layouts — NOT all layouts from every template.
      const fullSlidesSchema = templateToUse.id === "flex" ? getLayoutsByTemplateID("flex") : getLayoutsByTemplateID(templateToUse.id);

      if (templateToUse.id !== "flex" && (!fullSlidesSchema || fullSlidesSchema.length === 0)) {
        throw new Error(`Failed to load full schema structure for template: ${templateToUse.id}`);
      }

      const response = await PresentationGenerationApi.presentationPrepare({
        presentation_id: activePresentationId,
        outlines: activeOutlines,
        layout: {
          name: templateToUse.id === "flex" ? "flex" : templateToUse.name,
          ordered: templateToUse.ordered,
          slides: fullSlidesSchema,
        },
      });
      if (response) {
        dispatch(clearOutlines());
        dispatch(clearPresentationData());
        dispatch(setStreaming(true));
        setPanelState("generating");
      }
    } catch (err: any) {
      console.error(err);
      setIsPreparingSlides(false);
    }
  };

  const handleThemeSelect = async (theme: Theme) => {
    if (!presentation_id) return;
    dispatch(setTheme(theme));
    try {
      await PresentationGenerationApi.updatePresentationContent({
        id: presentation_id,
        theme: theme,
      });
    } catch (err) {
      console.error("Failed to update theme", err);
    }
  };

  // ─── GUIDE CHAT VIEW ────────────────────────────────────────────────────────
  if (view === "guide_chat" && guidePrompt) {
    return (
      <div className="document-theme-dark h-screen w-full overflow-hidden">
        <GuideModeChat
          initialPrompt={guidePrompt}
          onCancel={() => {
            setView("input");
            setGuidePrompt("");
          }}
          onGenerate={async (enhancedPrompt: string, nSlides: number, outlineContent: string, designBrief: string) => {
            // Create presentation with guide-enhanced prompt and dynamic slide count
            try {
              // Build robust placeholder outlines from the Phase 3 LLM output.
              // Strip out conversational filler at the bottom
              const cleanContent = outlineContent.split(/\n\s*(?:\*\*Page Count|\*\*How This)/i)[0];
              
              // Safely split at the start of lines containing "**Slide X" or "Slide X"
              let rawSlides = cleanContent.split(/(?=^\s*\**Slide \d+)/im)
                .map(s => s.trim())
                .filter(s => /^\**Slide \d+/i.test(s)); // only keep actual slide sections
                
              if (rawSlides.length === 0) {
                 rawSlides = Array.from({ length: nSlides }, (_, i) => `Slide ${i + 1}\n- Description pending`);
              }
              // ── Extract brand colors from the design brief ──────────────────────
              // Regex finds hex codes near role keywords: Primary, Accent, Secondary, Background
              const extractBrandColors = (brief: string) => {
                const hexRe = /#([0-9A-Fa-f]{6})/g;
                const allHex = [...brief.matchAll(hexRe)].map(m => `#${m[1]}`);
                // Find colors near role keywords for accuracy
                const roleMatch = (role: string) => {
                  const re = new RegExp(`${role}[^#]*?(#[0-9A-Fa-f]{6})`, 'i');
                  return brief.match(re)?.[1] ?? null;
                };
                return {
                  primary:    roleMatch('primary') ?? allHex[0] ?? '#1e4cd9',
                  accent:     roleMatch('accent') ?? allHex[1] ?? '#ff6b00',
                  secondary:  roleMatch('secondary') ?? allHex[2] ?? '#5a189a',
                  background: roleMatch('background') ?? '#ffffff',
                };
              };
              const brandColors = extractBrandColors(designBrief);

              // ── Anti-repeat layout assignment ───────────────────────────────────
              // Track usage count. No layout may appear more than MAX_REPEATS times.
              const MAX_REPEATS = 2;
              const usageCount: Record<string, number> = {};

              // Keyword → layout map for content-aware assignment
              const FLEX_KEYWORD_MAP: Record<string, string> = {
                // Cover slide
                introduction: "title-slide", intro: "title-slide",
                // Timeline
                timeline: "timeline", history: "timeline", evolution: "timeline",
                trajectory: "timeline", milestones: "timeline", chronolog: "timeline",
                expansion: "timeline", founding: "timeline",
                // KPI / Metrics
                revenue: "kpi-grid", metrics: "kpi-grid", kpi: "kpi-grid",
                statistics: "kpi-grid", numbers: "kpi-grid", financial: "kpi-grid",
                performance: "kpi-grid", valuation: "kpi-grid", billion: "kpi-grid",
                million: "kpi-grid", viewership: "kpi-grid",
                // Two-col compare
                comparison: "two-col-compare", versus: "two-col-compare",
                contrast: "two-col-compare", "different from": "two-col-compare",
                // Flow diagram
                process: "flow-diagram", flow: "flow-diagram", strategy: "flow-diagram",
                model: "flow-diagram", steps: "flow-diagram", phases: "flow-diagram",
                framework: "flow-diagram", ripple: "flow-diagram",
                // Data table
                table: "data-table", breakdown: "data-table", schedule: "data-table",
                commercial: "data-table",
                // Big Statement
                playbook: "big-statement", insight: "big-statement", lesson: "big-statement",
                takeaway: "big-statement", principle: "big-statement",
                why: "big-statement", statement: "big-statement",
                // Icon bullets
                pillars: "icon-bullets", principles: "icon-bullets", "road ahead": "icon-bullets",
              };

              // Ordered diversity pool (used when keyword doesn't match or layout is saturated)
              const DIVERSITY_POOL = [
                "flow-diagram", "two-col-compare", "kpi-grid", "timeline",
                "big-statement", "data-table", "icon-bullets", "quote-hero",
              ];

              const pickLeastUsed = (lastLayout: string): string => {
                const sorted = [...DIVERSITY_POOL]
                  .filter(l => l !== lastLayout)
                  .sort((a, b) => (usageCount[a] ?? 0) - (usageCount[b] ?? 0));
                return sorted[0] ?? "icon-bullets";
              };

              let lastLayout = "title-slide";

              const processedOutlines = rawSlides.map((content, idx) => {
                // Slide 0 is always the title slide regardless of content
                if (idx === 0) {
                  usageCount["title-slide"] = 1;
                  return { content, visual_type: "title-slide" };
                }

                const lower = content.toLowerCase();
                let visual_type: string | undefined;

                // Keyword match — but skip if layout is already saturated
                for (const [kw, layout] of Object.entries(FLEX_KEYWORD_MAP)) {
                  if (lower.includes(kw)) {
                    if ((usageCount[layout] ?? 0) < MAX_REPEATS) {
                      visual_type = layout;
                    }
                    break; // found a keyword match; if saturated, fall through to diversity pool
                  }
                }

                // Fall back to the least-used layout
                if (!visual_type) {
                  visual_type = pickLeastUsed(lastLayout);
                }

                usageCount[visual_type] = (usageCount[visual_type] ?? 0) + 1;
                lastLayout = visual_type;
                return { content, visual_type };
              });

              // ── Build rich per-slide color instructions from the design brief ─────
              const colorInstruction = [
                `BRAND PALETTE (use these exact hex values):`,
                `  accentColor: "${brandColors.primary}" (primary brand color for headings, bars, icons)`,
                `  secondaryColor: "${brandColors.accent}" (accent for highlights, metrics, callouts)`,
                `  Alternate item colors: ["${brandColors.primary}", "${brandColors.accent}", "${brandColors.secondary}"]`,
                `IMPORTANT: Every slide MUST set accentColor to "${brandColors.primary}" unless the design brief specifies otherwise.`,
              ].join('\n');

              const createResponse = await PresentationGenerationApi.createPresentation({
                content: enhancedPrompt,
                n_slides: nSlides,
                file_paths: [],
                language: LanguageType.English,
                tone: ToneType.Default,
                verbosity: VerbosityType.Standard,
                instructions: [
                  `Guide Mode: ${nSlides} slides. FULL CONSULTATION FINISHED. USE THIS OUTLINE AND DESIGN STRATEGY.`,
                  `OUTLINE:\n${outlineContent}`,
                  `DESIGN DIRECTION:\n${designBrief}`,
                  colorInstruction,
                ].join('\n\n'),
                include_table_of_contents: false,
                include_title_slide: false,
                web_search: false,
              });


              if (!createResponse?.id) throw new Error("No presentation ID returned.");

              dispatch(setPresentationId(createResponse.id));

              // Inject the pre-generated outline into the store
              if (processedOutlines.length > 0) {
                dispatch(setOutlines(processedOutlines));
              }

              dispatch(setPptGenUploadState({
                config: {
                  prompt: enhancedPrompt,
                  slides: String(nSlides),
                  language: LanguageType.English,
                  tone: ToneType.Default,
                  verbosity: VerbosityType.Standard,
                  instructions: "",
                  includeTableOfContents: false,
                  includeTitleSlide: false,
                  webSearch: false,
                },
                files: [],
              }));

              // Transition UI
              setGuidePrompt("");
              setUserBubble(enhancedPrompt);
              setPrompt("");
              setNarrativeOptions([]);
              setIsNarrativeSelected(true); // SKIP NARRATIVE SELECTION
              setSelectedTemplate({ id: "flex", name: "Flexible Smart Layout", ordered: false, description: "Dynamic schemas for guides" }); // FORCE FLEX LAYOUT FOR GUIDE MODE
              setSelectedNarrative({
                title: "Custom Guide Strategy",
                description: "Tailored based on complete 5-phase consultation."
              });

              setPanelState("storyline");
              setIsStorylineVisible(true);
              setView("chat");

              // Acknowledge strategy and move to storyline
              setChatMessages(prev => [
                ...prev,
                { id: Date.now().toString(), role: 'user', content: enhancedPrompt },
                { 
                  id: (Date.now() + 1).toString(), 
                  role: 'assistant', 
                  content: `Strategy confirmed! I've synthesized our complete 5-phase consultation into a ${nSlides}-slide architecture. I'm now building the actual content using your custom Design Brief and Research Findings...` 
                }
              ]);

              // Strategy confirmed, wait for user to hit Generate on the right Sidebar
            } catch (err: any) {
              console.error("[Guide] Failed to create presentation", err);
            }
          }}
        />
      </div>
    );
  }

  // ─── INPUT VIEW ─────────────────────────────────────────────────────────────
  if (view === "input") {
    return (
      <div className="document-theme-dark flex h-screen w-full flex-col overflow-hidden text-[var(--ds-system-foreground-primary)]">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 z-[100] h-full w-[260px] p-2">
          <aside className="bg-[var(--ds-system-surface-menu)] border-[var(--ds-system-border-default)] flex h-full w-full flex-col overflow-hidden rounded-xl border shadow-lg">
            <div className="border-[var(--ds-system-border-default)] flex flex-col gap-3 border-b px-3 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center">
                  <div className="h-5 w-5 rounded-sm bg-white text-black flex items-center justify-center font-bold text-xs">P</div>
                </div>
                <button className="text-[var(--ds-system-action-foreground-ghost)] hover:bg-[var(--ds-system-action-surface-ghost-hover)] h-8 w-8 rounded-lg flex items-center justify-center transition-colors">
                  <Sidebar size={16} />
                </button>
              </div>
              <button className="group flex w-full items-center rounded-lg border px-2 py-1.5 text-left transition-colors bg-[var(--ds-system-surface-secondary)] border-[var(--ds-system-border-default)] hover:bg-[var(--ds-system-surface-secondary-hover)]">
                <div className="flex items-center gap-2 flex-auto min-w-0">
                  <div className="bg-[var(--ds-system-surface-tertiary)] flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ds-system-border-default)] text-sm font-medium">G</div>
                  <div className="flex-auto min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">Workspace</p>
                    <p className="text-[var(--ds-system-foreground-secondary)] text-xs mt-0.5 leading-none">Pro plan</p>
                  </div>
                </div>
                <ChevronDown size={14} className="text-[var(--ds-system-foreground-secondary)]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-3">
              {recentPresentations.length === 0 ? (
                <p className="px-2 text-xs text-[var(--ds-system-foreground-tertiary)]">No recent decks</p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-system-foreground-tertiary)]">Recent</p>
                  {recentPresentations.map((pres) => (
                    <button
                      key={pres.id}
                      onClick={() => router.push(`/presentation?id=${pres.id}`)}
                      className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--ds-system-action-surface-ghost-hover)]"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default)]">
                        <Presentation size={11} className="text-[var(--ds-system-foreground-tertiary)] group-hover:text-[var(--ds-system-foreground-secondary)] transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[var(--ds-system-foreground-secondary)] group-hover:text-[var(--ds-system-foreground-primary)] transition-colors leading-tight">
                          {pres.title || "Untitled Deck"}
                        </p>
                        <p className="text-[10px] text-[var(--ds-system-foreground-tertiary)] mt-0.5 leading-none">
                          {pres.n_slides} slides · {timeAgo(pres.updated_at)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-[var(--ds-system-border-default)] p-2 flex gap-1">
              <button className="text-[var(--ds-system-action-foreground-ghost)] hover:bg-[var(--ds-system-action-surface-ghost-hover)] h-7 w-7 rounded flex items-center justify-center transition-colors">
                <Settings size={14} />
              </button>
              <button className="text-[var(--ds-system-action-foreground-ghost)] hover:bg-[var(--ds-system-action-surface-ghost-hover)] h-7 w-7 rounded flex items-center justify-center transition-colors">
                <HelpCircle size={14} />
              </button>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <div className="ml-[260px] flex h-full justify-center overflow-y-hidden bg-[var(--ds-system-surface-primary)]">
          <div className="no-scrollbar relative mx-auto flex-1 overflow-x-hidden overflow-y-scroll">
            <div className="relative min-h-full w-full">
              <div className="h-16 w-full" />
              <div className="w-full flex justify-center mt-6">
                <div className="w-full max-w-[1440px] px-8">
                  <div className="flex h-full max-h-full flex-col items-center justify-start overflow-hidden">
                    <div className="my-auto flex w-full max-w-[1000px] flex-col mt-20">
                      <div className="flex flex-col justify-center mb-6 items-center md:items-start text-center md:text-left">
                        <h1 className="text-3xl font-semibold leading-7 mb-2 text-[var(--ds-system-foreground-primary)]">What are we creating today?</h1>
                        <p className="text-sm text-[var(--ds-system-foreground-secondary)]">Create beautiful presentations effortlessly with curated templates.</p>
                      </div>

                      <div className="flex items-center gap-6 mb-4 px-2 border-b border-[var(--ds-system-border-default-alpha)]">
                        {(["Recents", "Templates", "My decks", "Ganesh's Workspace", "Shared with you"] as TabType[]).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === tab
                              ? "text-[var(--ds-system-foreground-primary)]"
                              : "text-[var(--ds-system-foreground-tertiary)] hover:text-[var(--ds-system-foreground-secondary)]"
                              }`}
                          >
                            {tab}
                            {activeTab === tab && (
                              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--ds-system-foreground-primary)] rounded-t-sm" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="prompt-input-wrapper mb-8 max-w-[612px] mx-auto w-full">
                        <div className="bg-[var(--ds-system-surface-secondary)] flex flex-col rounded-[11px] p-4">
                          <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent border-none outline-none text-[var(--ds-system-foreground-primary)] text-base placeholder:text-[var(--ds-system-foreground-placeholder)] resize-none"
                            rows={2}
                            placeholder="Describe your idea, or paste notes..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleGenerate();
                              }
                            }}
                          />
                          <div className="flex items-center justify-between mt-8">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setShowFileUpload(!showFileUpload)}
                                className={`border-[var(--ds-system-border-default-alpha)] border flex h-9 w-9 items-center justify-center rounded-lg transition-colors text-[var(--ds-system-foreground-secondary)] ${showFileUpload || files.length > 0 ? 'bg-[var(--ds-system-action-surface-ghost-hover)]' : 'hover:bg-[var(--ds-system-action-surface-ghost-hover)]'}`}
                              >
                                <Plus size={16} />
                              </button>
                              
                              <div className="relative group">
                                <button className="hover:bg-[var(--ds-system-surface-tertiary)] flex h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors text-[var(--ds-system-foreground-secondary)] border border-[var(--ds-system-border-default-alpha)]">
                                  {presentationMode === "Guide" ? "Guide Mode" : "Professional Mode"}
                                  <ChevronDown size={14} className="text-[var(--ds-system-foreground-tertiary)]" />
                                </button>
                                <div className="absolute bottom-full mb-2 left-0 hidden group-hover:flex flex-col bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] rounded-xl shadow-lg p-2 gap-2 min-w-[200px] z-50">
                                  <div>
                                     <div className="text-xs text-[var(--ds-system-foreground-tertiary)] px-2 pb-1 font-medium">Mode</div>
                                     {(["Professional", "Guide"] as const).map(m => (
                                       <button 
                                         key={m} 
                                         onClick={() => setPresentationMode(m)} 
                                         className={`flex items-center w-full px-2 py-1.5 rounded-lg text-sm text-left ${presentationMode === m ? 'bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-primary)] font-medium' : 'hover:bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-secondary)]'}`}
                                       >
                                         {m} Mode
                                       </button>
                                     ))}
                                  </div>
                                  <div className="h-px bg-[var(--ds-system-border-default-alpha)] mx-2" />
                                  <div>
                                     <div className="text-xs text-[var(--ds-system-foreground-tertiary)] px-2 pb-1 font-medium">Aspect Ratio</div>
                                     {(["16:9", "4:3"] as const).map(ar => (
                                       <button 
                                         key={ar} 
                                         onClick={() => setAspectRatio(ar)} 
                                         className={`flex items-center w-full px-2 py-1.5 rounded-lg text-sm text-left ${aspectRatio === ar ? 'bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-primary)] font-medium' : 'hover:bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-secondary)]'}`}
                                       >
                                         {ar}
                                       </button>
                                     ))}
                                  </div>
                                  {presentationMode === "Professional" && (
                                    <>
                                      <div className="h-px bg-[var(--ds-system-border-default-alpha)] mx-2 my-1" />
                                      <div className="px-2 py-1 flex items-center justify-between">
                                        <div className="text-xs text-[var(--ds-system-foreground-tertiary)] font-medium">Slide Count</div>
                                        <div className="flex items-center gap-2">
                                          <button 
                                            onClick={() => setSlideCount(Math.max(1, slideCount - 1))}
                                            className="h-6 w-6 rounded flex items-center justify-center bg-[var(--ds-system-surface-tertiary)] hover:bg-[var(--ds-system-border-default)] text-[var(--ds-system-foreground-secondary)] transition-colors"
                                          >-</button>
                                          <span className="text-sm w-4 text-center text-[var(--ds-system-foreground-primary)]">{slideCount}</span>
                                          <button 
                                            onClick={() => setSlideCount(Math.min(30, slideCount + 1))}
                                            className="h-6 w-6 rounded flex items-center justify-center bg-[var(--ds-system-surface-tertiary)] hover:bg-[var(--ds-system-border-default)] text-[var(--ds-system-foreground-secondary)] transition-colors"
                                          >+</button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <button className="hover:bg-[var(--ds-system-surface-tertiary)] flex h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors text-[var(--ds-system-foreground-secondary)]">
                                Claude Sonnet 3.5
                                <ChevronDown size={14} className="text-[var(--ds-system-foreground-tertiary)]" />
                              </button>
                            </div>
                            <button
                              disabled={!prompt.trim() || isGenerating}
                              onClick={handleGenerate}
                              className="bg-[var(--ds-system-action-surface-tertiary)] hover:bg-[var(--ds-system-action-surface-tertiary-hover)] text-[var(--ds-system-foreground-primary)] disabled:opacity-50 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                            >
                              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {(showFileUpload || files.length > 0) && presentationMode === "Professional" && (
                        <div className="max-w-[612px] mx-auto w-full mb-8">
                          <SupportingDoc files={files} onFilesChange={setFiles} />
                        </div>
                      )}

                      <TemplateCards
                        activeTab={activeTab}
                        templates={templates}
                        customTemplates={customTemplates}
                        selectedTemplate={selectedTemplate}
                        onSelect={setSelectedTemplate}
                        onUploadClick={() => setIsUploadModalOpen(true)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CustomTemplateModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={(templateId) => {
            // Refresh custom templates
            const fetchCustomTemplates = async () => {
              try {
                const token = localStorage.getItem("auth_token");
                const res = await fetch("/api/v1/ppt/template-management/summary", {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const data = await res.json();
                const presentations = data.presentations || [];
                const mapped: Template[] = presentations.map((p: any) => ({
                  id: `custom-${p.presentation_id || p.id}`,
                  name: p.template?.name || `Custom Template ${p.presentation_id || p.id}`,
                  description: p.template?.description || "Custom template layout",
                  ordered: false,
                  slides: new Array(p.layout_count || 0).fill(""),
                }));
                setCustomTemplates(mapped);

                // Re-sync all layouts into LayoutContext so snapshots/previews can render
                await refetchLayouts();

                // Select the newly uploaded template
                const newlyAdded = mapped.find(m => m.id === templateId);
                if (newlyAdded) {
                  setSelectedTemplate(newlyAdded);
                  setActiveTab("My decks");
                }
              } catch (err) { }
            };
            fetchCustomTemplates();
          }}
        />
        </div>
    );
  }

  // ─── CHAT VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="document-theme-dark flex h-screen w-full overflow-hidden text-[var(--ds-system-foreground-primary)] bg-[var(--ds-system-surface-primary)]">
      {/* Sidebar toggle stub */}
      <div className="absolute top-4 left-4 z-50">
        <button className="text-[var(--ds-system-action-foreground-ghost)] hover:bg-[var(--ds-system-action-surface-ghost-hover)] h-8 w-8 rounded-lg flex items-center justify-center transition-colors border border-[var(--ds-system-border-default)]">
          <Sidebar size={14} />
        </button>
      </div>

      {/* Beta tag top-right */}
      <div className="absolute top-4 right-4 z-50">
        <span className="rounded bg-[var(--ds-system-action-surface-ghost-hover)] px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-[var(--ds-system-foreground-secondary)]">Beta</span>
      </div>

      {/* Main Chat Panel */}
      <div className={`flex h-full ${isStorylineVisible ? 'flex-[1.2]' : 'flex-1'} flex-col border-r border-[var(--ds-system-border-default-alpha)] bg-[var(--ds-system-surface-primary)]`}>
        <div className="flex-1 max-w-[800px] mx-auto w-full flex flex-col min-h-0 pt-12">
          <div className="flex-1 overflow-y-auto p-4 custom_scrollbar space-y-6">
            

            {/* Chat Messages */}
            {chatMessages.length > 0 && (
              <div className="space-y-6">
                {chatMessages.map(msg => {
                  
                  return (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                      {msg.role === 'assistant' && (
                         <div className="flex flex-col gap-1 items-start w-full">
                           <div className="flex items-center gap-2 mb-1">
                             <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)]">
                               <span className="text-[10px] font-bold">AI</span>
                             </div>
                             <span className="text-xs font-medium text-[var(--ds-system-foreground-secondary)]">Senior Presentation Consultant</span>
                           </div>
                           
                           {msg.guideBlock?.type === "analysis" && (
                              <div className="w-full mb-4 rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-4">
                                <div className="flex items-center justify-between text-sm mb-3">
                                  <span className="font-medium text-[var(--ds-system-foreground-primary)]">{msg.guideBlock.title}</span>
                                  <span className="text-[var(--ds-system-foreground-tertiary)]">Phase {msg.guideBlock.phase} of {msg.guideBlock.totalPhases}</span>
                                </div>
                                <div className="space-y-2">
                                  {msg.guideBlock.steps?.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      {step.status === "complete" ? (
                                        <Check size={14} className="text-green-500" />
                                      ) : step.status === "loading" ? (
                                        <Loader2 size={14} className="text-blue-500 animate-spin" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-[var(--ds-system-border-default)]" />
                                      )}
                                      <span className={`${step.status === "complete" ? "text-[var(--ds-system-foreground-secondary)] line-through" : "text-[var(--ds-system-foreground-primary)] font-medium"}`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                           )}

                           {msg.content && (
                             <div 
                               className="prose prose-invert max-w-none text-[15px] leading-relaxed mb-4"
                               dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as any }}
                             />
                           )}

                           {/* Task Box */}
                           {msg.guideBlock?.type === "taskBox" && (() => {
                             const tasks = msg.guideBlock.tasks || [];
                             const completedCount = msg.guideBlock.completedTaskCount ?? 0;
                             const remaining = tasks.length - completedCount;
                             const activeIndex = completedCount;
                             return (
                               <div className="w-full mb-4 rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden">
                                 <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-tertiary)]">
                                   <div className="flex items-center gap-3">
                                     <span className="text-xs font-medium text-[var(--ds-system-foreground-secondary)]">Using Tool</span>
                                     <span className="h-3 w-px bg-[var(--ds-system-border-default)]" />
                                     <span className="text-xs font-medium text-[var(--ds-system-foreground-primary)]">Deep Research &nbsp;·&nbsp; Total: {tasks.length} Tasks</span>
                                   </div>
                                 </div>
                                 <div className="p-4 space-y-3">
                                   <p className="text-xs text-[var(--ds-system-foreground-tertiary)] font-medium">{remaining} Task{remaining !== 1 ? 's' : ''} Remaining</p>
                                   {tasks.map((task: string, i: number) => {
                                     const isDone = i < completedCount;
                                     const isActive = i === activeIndex;
                                     return (
                                       <div key={i} className="flex items-start gap-3">
                                         <div className="shrink-0 mt-[2px]">
                                           {isDone ? (
                                             <div className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center">
                                               <Check size={10} className="text-green-500" />
                                             </div>
                                           ) : isActive ? (
                                             <Loader2 size={16} className="text-blue-400 animate-spin" />
                                           ) : (
                                             <div className="w-4 h-4 rounded-full border border-[var(--ds-system-foreground-tertiary)]" />
                                           )}
                                         </div>
                                         <span className={`text-sm leading-snug ${
                                           isDone ? 'line-through text-[var(--ds-system-foreground-tertiary)]'
                                           : isActive ? 'text-[var(--ds-system-foreground-primary)] font-medium'
                                           : 'text-[var(--ds-system-foreground-secondary)]'
                                         }`}>{task}</span>
                                       </div>
                                     );
                                   })}
                                 </div>
                               </div>
                             );
                           })()}

                           {/* Question Card */}
                           {msg.guideBlock?.type === "question" && (() => {
                             const isAnswered = msg.guideBlock.isAnswered;
                             const selectedAnswer = msg.guideBlock.selectedAnswer;
                             const qNum = msg.guideBlock.questionId!;
                             const qTotal = msg.guideBlock.totalQuestions || 6;
                             return (
                               <div className="w-full mb-4">
                                 <p className="text-xs text-[var(--ds-system-foreground-tertiary)] mb-2 font-medium">Question {qNum} of {qTotal}</p>
                                 <div className={`w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden transition-opacity ${isAnswered ? 'opacity-60' : ''}`}>
                                   <div className="flex items-center justify-between bg-[var(--ds-system-surface-tertiary)] px-4 py-3 border-b border-[var(--ds-system-border-default)]">
                                     <span className="font-medium text-sm text-[var(--ds-system-foreground-primary)]">{msg.guideBlock.title}</span>
                                   </div>
                                   <div className="p-4 space-y-2">
                                     {msg.guideBlock.options?.map((opt, i) => {
                                       const isSelected = selectedAnswer === opt;
                                       return (
                                         <button
                                           key={i}
                                           onClick={() => !isAnswered && handleGuideAnswerSubmit(qNum, opt)}
                                           disabled={!!isAnswered}
                                           className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                                             isSelected
                                               ? 'border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-primary)]'
                                               : 'border-[var(--ds-system-border-default-alpha)] hover:border-[var(--ds-system-border-default)] hover:bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-secondary)] hover:text-[var(--ds-system-foreground-primary)]'
                                           } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                                         >
                                           <div className="flex items-center gap-3">
                                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-400' : 'border-[var(--ds-system-foreground-tertiary)]'}`}>
                                               {isSelected && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                                             </div>
                                             <span>{opt}</span>
                                           </div>
                                         </button>
                                       );
                                     })}

                                     {!isAnswered && (
                                       <div className="mt-4 flex gap-2 w-full">
                                         <input
                                           type="text"
                                           value={customGuideAnswer}
                                           onChange={(e) => setCustomGuideAnswer(e.target.value)}
                                           onKeyDown={(e) => {
                                             if (e.key === 'Enter' && customGuideAnswer.trim()) {
                                               handleGuideAnswerSubmit(qNum, customGuideAnswer.trim());
                                             }
                                           }}
                                           placeholder="Additional details (optional)"
                                           className="flex-1 bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default-alpha)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--ds-system-border-default)] transition-colors"
                                         />
                                         <button
                                           onClick={() => {
                                             if (customGuideAnswer.trim()) {
                                               handleGuideAnswerSubmit(qNum, customGuideAnswer.trim());
                                             }
                                           }}
                                           disabled={!customGuideAnswer.trim()}
                                           className="px-4 py-2 bg-[var(--ds-system-action-surface-tertiary)] hover:bg-[var(--ds-system-action-surface-tertiary-hover)] disabled:opacity-50 text-[var(--ds-system-foreground-primary)] text-sm font-medium rounded-lg transition-colors"
                                         >
                                           Submit
                                         </button>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             );
                           })()}

                           {msg.guideBlock?.type === "narratives" && (
                              <div className="w-full space-y-4 mb-4">
                                <p className="text-[15px] font-medium text-[var(--ds-system-foreground-primary)] px-1">
                                   Which narrative approach would you like to take?
                                </p>
                                <div className="grid gap-4">
                                  {(msg.guideBlock.narrativeOptions || []).map((opt, i) => (
                                    <div
                                      key={i}
                                      onClick={() => !isNarrativeSelected && handleNarrativeSelect(opt)}
                                      className={`group flex items-center justify-between rounded-2xl bg-[var(--ds-system-surface-secondary)] border p-5 transition-all shadow-sm ${selectedNarrative?.title === opt.title
                                        ? "border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-tertiary)]"
                                        : "border-transparent hover:border-[var(--ds-system-border-default)] cursor-pointer"
                                        }`}
                                    >
                                      <div className="flex-1 pr-6">
                                        <p className="text-[16px] font-semibold text-[var(--ds-system-foreground-primary)]">{opt.title}</p>
                                        <p className="text-sm text-[var(--ds-system-foreground-secondary)] mt-2 leading-relaxed">{opt.description}</p>
                                      </div>
                                      {isUpdatingPresentation && selectedNarrative?.title === opt.title ? (
                                        <Loader2 size={18} className="animate-spin text-[var(--ds-system-foreground-tertiary)]" />
                                      ) : (
                                        !isNarrativeSelected && (
                                          <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-secondary)] group-hover:bg-[var(--ds-system-surface-secondary)] group-hover:text-[var(--ds-system-foreground-primary)] transition-all">
                                            Select
                                          </button>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                           )}

                           {msg.guideBlock?.type === "research" && (
                             <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden">
                               <div className="bg-[var(--ds-system-surface-tertiary)] px-4 py-3 border-b border-[var(--ds-system-border-default)] flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <Search size={14} className="text-blue-500" />
                                   <span className="font-medium text-sm text-[var(--ds-system-foreground-primary)]">{msg.guideBlock.research?.status || "Research complete"}</span>
                                 </div>
                                 <span className="text-[10px] text-[var(--ds-system-foreground-tertiary)] uppercase font-bold tracking-wider">Web Search</span>
                               </div>
                               <div className="p-4 space-y-4">
                                 {msg.guideBlock.research?.thinking && (
                                   <div className="flex gap-3 bg-[var(--ds-system-surface-tertiary)] p-3 rounded-lg border border-[var(--ds-system-border-default)]">
                                     <Brain size={16} className="text-purple-500 shrink-0 mt-0.5" />
                                     <div className="space-y-1">
                                       <span className="text-[10px] uppercase font-bold text-[var(--ds-system-foreground-tertiary)]">Thinking Process</span>
                                       <p className="text-xs text-[var(--ds-system-foreground-secondary)] italic leading-relaxed whitespace-pre-wrap">{msg.guideBlock.research.thinking}</p>
                                     </div>
                                   </div>
                                 )}
                                 
                                 {msg.guideBlock.research?.sources && msg.guideBlock.research.sources.length > 0 && (
                                   <div className="space-y-2">
                                     <span className="text-[10px] uppercase font-bold text-[var(--ds-system-foreground-tertiary)] pl-1">Sources Found</span>
                                     <div className="flex flex-wrap gap-2">
                                       {msg.guideBlock.research.sources.map((source, i) => (
                                         <a 
                                           key={i} 
                                           href={source.href} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default)] hover:border-[var(--ds-system-foreground-tertiary)] transition-all group"
                                         >
                                          {source.href && (() => {
                                            try {
                                              const hostname = new URL(source.href).hostname;
                                              return <img src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} alt="" className="w-3 h-3 grayscale group-hover:grayscale-0 transition-all" />;
                                            } catch (e) {
                                              return <Search size={12} className="text-[var(--ds-system-foreground-tertiary)]" />;
                                            }
                                          })()}

                                           <span className="text-[10px] font-medium text-[var(--ds-system-foreground-secondary)] max-w-[120px] truncate">{source.title}</span>
                                           <ExternalLink size={10} className="text-[var(--ds-system-foreground-tertiary)]" />
                                         </a>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                               </div>
                             </div>
                           )}

                            {/* Content Clarification Card (pasted document flow) */}
                            {msg.guideBlock?.type === "content_clarification" && (() => {
                              const isAnswered = !!msg.guideBlock.isAnswered;
                              const selected = msg.guideBlock.selectedAnswer;
                              return (
                                <div className="w-full mb-4">
                                  <div className={`w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden transition-opacity ${isAnswered ? 'opacity-60' : ''}`}>
                                    <div className="flex items-center gap-3 bg-[var(--ds-system-surface-tertiary)] px-4 py-3 border-b border-[var(--ds-system-border-default)]">
                                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)]">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ds-system-foreground-secondary)]">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                          <polyline points="14 2 14 8 20 8"/>
                                        </svg>
                                      </div>
                                      <span className="font-medium text-sm text-[var(--ds-system-foreground-primary)]">{msg.guideBlock.pastedDocTitle || 'Pasted text'}</span>
                                    </div>
                                    <div className="p-5">
                                      <p className="text-[15px] font-medium text-[var(--ds-system-foreground-primary)] mb-4">
                                        Would you like me to keep your content as closely as possible, or use it as context to shape a tighter narrative?
                                      </p>
                                      <div className="grid grid-cols-2 gap-3">
                                        {[
                                          { mode: '1:1' as const, label: 'Match content 1:1', desc: 'Preserve your structure and all sections exactly as provided.' },
                                          { mode: 'reshape' as const, label: 'Reshape narrative', desc: 'Use your content as context and build a more compelling story.' },
                                        ].map(({ mode, label, desc }) => {
                                          const isSelected = selected === mode;
                                          return (
                                            <button
                                              key={mode}
                                              disabled={isAnswered}
                                              onClick={() => !isAnswered && handleContentModeSelect(mode)}
                                              className={`flex flex-col text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                                                isSelected
                                                  ? 'border-[var(--ds-system-foreground-tertiary)] bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-primary)]'
                                                  : 'border-[var(--ds-system-border-default-alpha)] hover:border-[var(--ds-system-border-default)] hover:bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-secondary)] hover:text-[var(--ds-system-foreground-primary)]'
                                              } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                              <span className="font-semibold text-[var(--ds-system-foreground-primary)] mb-1">{label}</span>
                                              <span className="text-xs text-[var(--ds-system-foreground-tertiary)] leading-relaxed">{desc}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                           {msg.guideBlock?.type === "summary" && (
                              <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden">
                                <div className="bg-[var(--ds-system-surface-tertiary)] px-4 py-3 border-b border-[var(--ds-system-border-default)]">
                                  <span className="font-medium text-sm text-[var(--ds-system-foreground-primary)]">Strategy Summary — Final Confirmation</span>
                                </div>
                                <div className="p-4 space-y-4">
                                  {Object.entries(msg.guideBlock.answers || {}).map(([qId, ans]) => {
                                    const questions = getGuideQuestions(userBubble || prompt);
                                    return (
                                      <div key={qId} className="flex flex-col gap-1">
                                        <span className="text-xs text-[var(--ds-system-foreground-tertiary)] font-medium">
                                          {questions[parseInt(qId)-1].title}
                                        </span>
                                        <span className="text-sm text-[var(--ds-system-foreground-primary)]">
                                          {ans}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="p-4 border-t border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-tertiary)]">
                                  <button 
                                    onClick={finalizeGuideGeneration}
                                    className="flex items-center justify-center w-full gap-2 px-4 py-3 bg-white text-black hover:opacity-90 text-sm font-bold rounded-lg transition-opacity shadow-sm"
                                  >
                                    <Check size={16} /> Yes, proceed to Phase 2 (Generation)
                                  </button>
                                </div>
                              </div>
                           )}
                         </div>
                      )}
                      {msg.role === 'user' && (() => {
                         // For long pasted content, show a compact document chip instead of the full dump
                         const isDoc = pastedDocumentContent !== null && msg.content === pastedDocumentContent;
                         if (isDoc) {
                           const lineCount = msg.content.split('\n').filter((l: string) => l.trim()).length;
                           return (
                             <div className="max-w-[80%] flex flex-col gap-2 items-end">
                               <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default-alpha)] text-[var(--ds-system-foreground-primary)]">
                                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default)]">
                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ds-system-foreground-secondary)]">
                                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                     <polyline points="14 2 14 8 20 8"/>
                                     <line x1="16" y1="13" x2="8" y2="13"/>
                                     <line x1="16" y1="17" x2="8" y2="17"/>
                                     <polyline points="10 9 9 9 8 9"/>
                                   </svg>
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="text-sm font-medium leading-tight">Pasted text</span>
                                   <span className="text-xs text-[var(--ds-system-foreground-tertiary)] mt-0.5">TXT · {lineCount} lines</span>
                                 </div>
                               </div>
                             </div>
                           );
                         }
                         return (
                           <div 
                             className="max-w-[80%] rounded-2xl px-5 py-4 text-[15px] bg-[var(--ds-system-surface-secondary)] text-[var(--ds-system-foreground-primary)] border border-[var(--ds-system-border-default-alpha)] prose prose-invert overflow-x-auto"
                             dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as any }}
                           />
                         );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}

            <div ref={chatBottomRef} />

            {/* Dynamic Research Block while streaming - Transitions as generation begins */}
            {isStreaming && view === "chat" && !chatMessages.some(m => m.id.startsWith('research-done')) && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF4D4D] to-[#F97316] flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                    <Presentation className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-[90%] w-full">
                    <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden shadow-sm">
                      <div className="bg-[var(--ds-system-surface-tertiary)] px-4 py-3 border-b border-[var(--ds-system-border-default)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Search size={14} className="text-blue-500 animate-pulse" />
                          <span className="font-medium text-sm text-[var(--ds-system-foreground-primary)]">
                            {outlines && outlines.length > 0 ? "Research complete — building slides..." : (status || "Deep searching the web...")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {outlines && outlines.length > 0 ? (
                            <>
                              <Check size={12} className="text-green-500" />
                              <span className="text-[10px] text-green-500 uppercase font-bold tracking-wider">Verified</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                              <span className="text-[10px] text-[var(--ds-system-foreground-tertiary)] uppercase font-bold tracking-wider">Active Research</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Only show detailed research if slides haven't started yet */}
                      {(!outlines || outlines.length === 0) && (
                        <div className="p-4 space-y-4 animate-in fade-in duration-300">
                          {thinking && (
                            <div className="flex gap-3 bg-[var(--ds-system-surface-tertiary)] p-3 rounded-lg border border-[var(--ds-system-border-default)]">
                              <Brain size={16} className="text-purple-500 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-[var(--ds-system-foreground-tertiary)]">Thinking Process</span>
                                <p className="text-xs text-[var(--ds-system-foreground-secondary)] italic leading-relaxed whitespace-pre-wrap">{thinking}</p>
                              </div>
                            </div>
                          )}
                          
                          {citations && citations.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-[var(--ds-system-foreground-tertiary)] pl-1">Sources Found</span>
                              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                                  {citations.map((source, i) => {
                                    let favicon = null;
                                    try {
                                      if (source.href) {
                                        const hostname = new URL(source.href).hostname;
                                        favicon = <img src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} alt="" className="w-3 h-3 grayscale group-hover:grayscale-0 transition-all" />;
                                      }
                                    } catch (e) {
                                      favicon = <Search size={10} className="text-[var(--ds-system-foreground-tertiary)]" />;
                                    }
                                    
                                    return (
                                      <a 
                                        key={i} 
                                        href={source.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default)] hover:border-[var(--ds-system-foreground-tertiary)] transition-all group"
                                      >
                                        {favicon}
                                        <span className="text-[10px] font-medium text-[var(--ds-system-foreground-secondary)] max-w-[120px] truncate">{source.title}</span>
                                        <ExternalLink size={10} className="text-[var(--ds-system-foreground-tertiary)]" />
                                      </a>
                                    );
                                  })}

                              </div>
                            </div>
                          )}

                          {!thinking && citations.length === 0 && (
                            <div className="flex items-center gap-3 text-[var(--ds-system-foreground-tertiary)] py-2">
                              <Loader2 size={14} className="animate-spin" />
                              <span className="text-xs">Gathering intelligence and verifying data points...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generation Progress (Integrated) */}
          {panelState === "generating" && !isPresentationStreaming && (
            <div className="p-4 px-6 mb-4">
              <div className="flex flex-col gap-2 rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-5 animate-pulse">
                <div className="flex items-center gap-3 text-[var(--ds-system-foreground-primary)]">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                  <span className="text-[15px] font-medium">Generating your presentation...</span>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Sticky Bottom Input */}
          <div className="p-4 border-t border-[var(--ds-system-border-default-alpha)]">
            <div className="rounded-2xl border border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-secondary)] p-4 focus-within:border-[var(--ds-system-foreground-tertiary)] transition-all shadow-sm">
              <div className="text-xs font-medium text-[var(--ds-system-foreground-tertiary)] mb-2 uppercase tracking-tight">Reply to Muse</div>
              <textarea
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChatMessage(); }
                 }}
                 placeholder="Type a message..."
                 className="w-full bg-transparent text-[15px] resize-none outline-none min-h-[40px] max-h-[160px] text-[var(--ds-system-foreground-primary)] placeholder-[var(--ds-system-foreground-tertiary)]"
              />
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[var(--ds-system-border-default-alpha)]">
                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ds-system-border-default-alpha)] text-[var(--ds-system-foreground-secondary)] hover:bg-[var(--ds-system-action-surface-ghost-hover)] transition-colors">
                  <Plus size={16} />
                </button>
                <button className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--ds-system-foreground-secondary)] hover:bg-[var(--ds-system-surface-tertiary)] transition-colors border border-transparent">
                  Claude Sonnet 3.5
                  <ChevronDown size={14} className="text-[var(--ds-system-foreground-tertiary)]" />
                </button>
                {!presentation_id && (
                  <button 
                    onClick={() => handleTransitionToGeneration(chatInput.trim() || chatMessages[chatMessages.length-1]?.content || "")}
                    className="flex h-9 items-center gap-2 rounded-xl px-4 bg-[var(--ds-system-action-surface-ghost-hover)] text-xs font-bold text-[var(--ds-system-foreground-primary)] hover:bg-[var(--ds-system-surface-tertiary)] transition-colors border border-[var(--ds-system-border-default)]"
                  >
                    <Presentation size={14} className="text-blue-500" />
                    Create Presentation
                  </button>
                )}
                <div className="flex-1" />
                <button 
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ds-system-action-surface-tertiary)] text-[var(--ds-system-foreground-primary)] hover:bg-[var(--ds-system-action-surface-tertiary-hover)] transition-all shadow-sm disabled:opacity-50"
                >
                  {isChatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* RIGHT SIDE: Storyline (Only visible when triggered) */}
      {isStorylineVisible && (
        <div
          className="flex h-full w-[45%] min-w-[500px] flex-shrink-0 items-center justify-center p-8 transition-colors duration-500 border-l border-[var(--ds-system-border-default-alpha)] bg-[var(--ds-system-surface-primary)]"
          style={{ backgroundColor: presentationData?.theme?.backgroundColor || 'transparent' }}
        >
          <div
            className="relative flex h-full w-full flex-col rounded-2xl bg-[var(--ds-system-surface-menu)] border border-[var(--ds-system-border-default)] shadow-2xl overflow-hidden transition-all duration-500 slide-in-right"
            style={{
              backgroundColor: presentationData?.theme?.cardBackgroundColor || '',
              borderColor: presentationData?.theme?.cardBorderColor || ''
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--ds-system-border-default)] px-5 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">{panelState === "storyline" ? "Storyline" : "Deck"}</h2>
                <span className="text-[var(--ds-system-foreground-tertiary)] text-xs">· v1</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-[var(--ds-system-action-surface-ghost-hover)] px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-[var(--ds-system-foreground-secondary)]">Beta</span>
                <button onClick={() => setView("input")} className="hover:text-white transition-colors text-[var(--ds-system-foreground-secondary)]">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Outline List / Ready View */}
            <div className="flex-1 overflow-y-auto p-5 custom_scrollbar space-y-3 pb-24">
              {panelState === "ready" && presentationData && (
                <div className="mb-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div
                    className="group flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer deck-card-glow border border-white/5 hover:border-white/10"
                    onClick={() => setShowPreview(true)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default)]">
                        <Presentation size={24} className="text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-white tracking-tight">Full Deck Preview</span>
                        <span className="text-[10px] text-[var(--ds-system-foreground-tertiary)] uppercase font-bold tracking-widest mt-0.5">
                          {presentationData.slides?.length || 0} Slides · Visual Style Active
                        </span>
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--ds-system-surface-tertiary)] text-xs font-bold hover:bg-[var(--ds-system-surface-secondary)] transition-colors border border-white/5"
                    >
                      View
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3 px-1">
                    <p className="text-[15px] text-[var(--ds-system-foreground-secondary)] leading-relaxed">
                      Your {presentationData.title || 'presentation'} deck is ready — {presentationData.slides?.length || 0} slides covering the full story from market opportunity through to financial milestones.
                    </p>
                  </div>
                  <div className="h-px bg-[var(--ds-system-border-default-alpha)] my-6" />
                </div>
              )}

              {panelState === "storyline" && (
                <>
                  {!isNarrativeSelected && !isLoadingNarratives && (
                    <div className="flex h-full flex-col items-center justify-center space-y-3 text-center px-8">
                      <div className="rounded-2xl bg-[var(--ds-system-surface-secondary)] p-4 shadow-inner border border-white/5">
                        <Plus size={24} className="text-[var(--ds-system-foreground-tertiary)]" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--ds-system-foreground-secondary)]">
                        Waiting for selection
                      </p>
                      <p className="text-xs text-[var(--ds-system-foreground-tertiary)] max-w-[240px] leading-relaxed">
                        Pick a narrative approach on the left to start building your storyline.
                      </p>
                    </div>
                  )}

                  {isNarrativeSelected && streamState.isLoading && (!outlines || outlines.length === 0) && (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                         <Loader2 size={24} className="animate-spin text-blue-500" />
                         <p className="text-sm font-medium text-[var(--ds-system-foreground-tertiary)]">
                           Building storyline...
                         </p>
                      </div>
                    </div>
                  )}

                  {(Array.isArray(outlines) ? outlines : []).map((item, idx) => {
                    const isExpanded = expandedOutlineIdx === idx;
                    const isEditing = editingOutlineIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="flex flex-col rounded-xl border border-[var(--ds-system-border-default-alpha)] bg-[var(--ds-system-surface-secondary)] transition-all"
                      >
                        {/* Row header */}
                        <div className="flex items-center gap-3 p-4">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--ds-system-surface-tertiary)] text-[11px] font-bold text-[var(--ds-system-foreground-tertiary)]">
                            {idx + 1}
                          </div>
                          <span className="text-[14px] font-medium text-[var(--ds-system-foreground-primary)] flex-1 truncate">
                            {parseOutlineContent(item.content).title || item.content}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">

                            <button
                              onClick={() => {
                                if (isEditing) { setEditingOutlineIdx(null); return; }
                                setExpandedOutlineIdx(isExpanded ? null : idx);
                              }}
                              className="p-1 rounded hover:bg-[var(--ds-system-surface-tertiary)] transition-colors"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? <ChevronUp size={13} className="text-[var(--ds-system-foreground-tertiary)]" /> : <ChevronDown size={13} className="text-[var(--ds-system-foreground-tertiary)]" />}
                            </button>
                            <button
                              onClick={() => {
                                if (isEditing) { setEditingOutlineIdx(null); } else {
                                  setEditingOutlineIdx(idx);
                                  setEditingOutlineContent(item.content);
                                  setExpandedOutlineIdx(idx);
                                }
                              }}
                              className="p-1 rounded hover:bg-[var(--ds-system-surface-tertiary)] transition-colors"
                              title="Edit storyline"
                            >
                              <Pencil size={12} className={isEditing ? "text-blue-400" : "text-[var(--ds-system-foreground-tertiary)]"} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && !isEditing && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="rounded-lg bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default-alpha)] p-3 space-y-1.5">
                              {(() => {
                                const { title, subtitle, body } = parseOutlineContent(item.content);
                                return (
                                  <>
                                    {subtitle && <p className="text-[12px] font-semibold text-[var(--ds-system-foreground-secondary)]">{subtitle}</p>}
                                    {body && <p className="text-[12px] text-[var(--ds-system-foreground-tertiary)] leading-relaxed">{body}</p>}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Edit mode */}
                        {isEditing && (
                          <div className="px-4 pb-4 pt-0 flex flex-col gap-2">
                            <textarea
                              className="w-full rounded-lg bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default)] p-3 text-[12px] text-[var(--ds-system-foreground-primary)] resize-y min-h-[80px] focus:outline-none focus:border-blue-500 transition-colors"
                              value={editingOutlineContent}
                              onChange={e => setEditingOutlineContent(e.target.value)}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingOutlineIdx(null)}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--ds-system-foreground-secondary)] hover:bg-[var(--ds-system-surface-tertiary)] transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  dispatch(updateOutlineAtIndex({ idx, content: editingOutlineContent }));
                                  setEditingOutlineIdx(null);
                                  setExpandedOutlineIdx(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[11px] font-semibold text-white transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {(panelState === "generating" || panelState === "ready") && (
                <>
                  {panelState === "generating" && (
                    <div className="flex h-24 items-center justify-center">
                       <div className="flex flex-col items-center gap-3">
                          <Loader2 size={18} className="animate-spin text-blue-500" />
                          <p className="text-sm font-medium text-[var(--ds-system-foreground-secondary)]">
                            Generating slides...
                          </p>
                       </div>
                    </div>
                  )}

                  {(presentationData?.slides || []).map((slide: any, idx: number) => (
                    <div
                      key={idx}
                      className="group flex flex-col rounded-xl border border-[var(--ds-system-border-default-alpha)] bg-[var(--ds-system-surface-secondary)] p-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--ds-system-surface-tertiary)] text-[11px] font-bold text-[var(--ds-system-foreground-tertiary)]">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <span className="text-[14px] font-medium text-[var(--ds-system-foreground-primary)] flex-1 truncate">
                          {slide?.content?.title || slide?.content?.mainTitle || slide?.content?.headline || slide?.content?.agencyLabel || slide?.content?.concept || "Generating slide content..."}
                        </span>
                        {panelState === "generating" && idx === (presentationData?.slides?.length - 1) && (
                          <Loader2 size={13} className="animate-spin text-blue-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-center bg-gradient-to-t from-[var(--ds-system-surface-menu)] via-[var(--ds-system-surface-menu)] to-transparent pt-12">
              {panelState === "storyline" && (
                <ThemeSelector
                  selectedThemeId={presentationData?.theme?.id || null}
                  onSelect={handleThemeSelect}
                />
              )}
              <div className="flex-1" />
              {panelState === "ready" ? (
                <button
                  onClick={() => router.push(`/presentation?id=${presentation_id}`)}
                  className="rounded-xl bg-white text-black px-6 py-3 text-[14px] font-bold hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
                >
                  Go to editor
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => handleGenerateSlides()}
                  disabled={isPreparingSlides || !outlines || !Array.isArray(outlines) || outlines.length === 0 || streamState.isStreaming || panelState === "generating"}
                  className="rounded-xl bg-white text-black px-6 py-3 text-[14px] font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  {panelState === "generating" ? "Generating..." : isPreparingSlides ? "Preparing slides..." : "Generate slides"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Overlay */}
      {showPreview && presentationData && (
        <SlidePreviewOverlay
          slides={presentationData.slides}
          theme={presentationData.theme}
          onClose={() => setShowPreview(false)}
          onGoToEditor={() => router.push(`/presentation?id=${presentation_id}`)}
        />
      )}
    </div>
  );
}
