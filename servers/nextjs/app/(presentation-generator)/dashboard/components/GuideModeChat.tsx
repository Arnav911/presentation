'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Loader2, Check, ChevronLeft, Circle, ExternalLink,
  Search, BookOpen, Brain, Presentation, ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GuideModeChatProps {
  initialPrompt: string;
  onGenerate: (enhancedPrompt: string, nSlides: number, outline: string, designBrief: string) => void;
  onCancel: () => void;
}

type GuidePhase =
  | 'phase0_researching'
  | 'phase1_batch1_qa'
  | 'phase1_batch2_qa'
  | 'phase1_strategy_loading'
  | 'phase1_strategy_review'
  | 'phase2_researching'
  | 'phase2_review'
  | 'phase3_outlining'
  | 'phase3_review'
  | 'phase4_designing'
  | 'phase4_review'
  | 'complete';

interface ToolLogEntry { tool: string; label: string; description: string }
interface AnswerMap { [key: string]: string | string[] }

// ─── Static Q&A Definitions ───────────────────────────────────────────────────

const BATCH1_QUESTIONS = [
  {
    id: 'audience',
    title: 'Who is the primary audience for this presentation?',
    icon: '👥',
    options: [
      { label: 'Investors/VCs analyzing the topic', icon: '📈' },
      { label: 'Business students/professionals studying strategy', icon: '📖' },
      { label: 'Industry analysts/media preparing reports', icon: '📊' },
      { label: 'Corporate executives making strategic decisions', icon: '🏢' },
      { label: 'General audience / public interest', icon: '🌐' },
    ],
  },
  {
    id: 'purpose',
    title: 'What is the core purpose of this presentation?',
    icon: '🎯',
    options: [
      { label: 'Educational/Storytelling – Explain dynamics and business lessons', icon: '📚' },
      { label: 'Persuasion/Decision-Making – Build a case for action', icon: '💡' },
      { label: 'Information Transfer – Present data and insights clearly', icon: '📋' },
      { label: 'Inspiration – Share vision and motivate', icon: '✨' },
    ],
  },
  {
    id: 'delivery',
    title: 'How will this presentation be delivered?',
    icon: '🎤',
    options: [
      { label: 'Live Presentation – Speaker-led with visual aids', icon: '🎙️' },
      { label: 'Read-only document – Shared for independent reading', icon: '📄' },
      { label: 'Workshop / Interactive format', icon: '🤝' },
      { label: 'Video / Recorded presentation', icon: '🎬' },
    ],
  },
  {
    id: 'material',
    title: 'Material sourcing strategy',
    icon: '🔍',
    options: [
      { label: 'AI conducts comprehensive research (recommended)', icon: '🤖' },
      { label: 'I will provide my own materials and data', icon: '📂' },
      { label: 'Mix of AI research and my own materials', icon: '⚡' },
    ],
  },
];

const BATCH2_QUESTIONS = [
  {
    id: 'duration',
    title: 'What is the expected presentation duration?',
    icon: '⏱️',
    options: [
      { label: 'Short (5-10 min) – 8 slides, quick highlights', icon: '⚡' },
      { label: 'Medium (15-20 min) – 12 slides, balanced depth', icon: '⏱️' },
      { label: 'Long (30+ min) – 16 slides, deep dive', icon: '∞' },
    ],
  },
  {
    id: 'emphasis',
    title: 'Which aspects should receive the most emphasis? (select all that apply)',
    icon: '📌',
    multi: true,
    options: [
      { label: 'Strategic choices & competitive moves over time', icon: '♟️' },
      { label: 'Business model & revenue strategy differences', icon: '💰' },
      { label: 'Market share & financial performance', icon: '📊' },
      { label: 'Product/service evolution & innovation', icon: '🚀' },
      { label: 'Customer experience & brand positioning', icon: '❤️' },
    ],
  },
  {
    id: 'tone',
    title: 'What tone would best suit your audience?',
    icon: '🎨',
    options: [
      { label: 'Balanced narrative – Data insights with strategic storytelling', icon: '⚖️' },
      { label: 'Data-driven – Heavy focus on metrics and evidence', icon: '📈' },
      { label: 'Story-first – Narrative arc with supporting data', icon: '📖' },
      { label: 'Provocative – Challenge assumptions, bold claims', icon: '⚡' },
    ],
  },
];

const CONFIRMATION_QUESTIONS = {
  strategy: {
    id: 'strategy_confirm',
    title: 'Strategy confirmation',
    icon: '✅',
    options: [
      { label: 'Yes, this strategy is perfect — proceed to research phase', icon: '✅' },
      { label: 'Almost there — I\'d like to adjust some aspects', icon: '✏️' },
    ],
  },
  research: {
    id: 'research_confirm',
    title: 'Research & core message confirmation',
    icon: '🔬',
    options: [
      { label: 'Perfect — research is complete. Proceed to Phase 3', icon: '✅' },
      { label: 'Good foundation, but I\'d like deeper research on specific aspects', icon: '🔍' },
      { label: 'The research is good, but adjust the core message', icon: '✏️' },
    ],
  },
  outline: {
    id: 'outline_confirm',
    title: 'Outline approval',
    icon: '📋',
    options: [
      { label: 'Perfect — this outline captures the story well. Proceed to Phase 4', icon: '✅' },
      { label: 'Good structure, but I\'d like to adjust specific slides', icon: '✏️' },
      { label: 'I prefer a different narrative approach', icon: '🔄' },
    ],
  },
  design: {
    id: 'design_confirm',
    title: 'Design direction confirmation',
    icon: '🎨',
    options: [
      { label: 'Perfect — proceed with this design direction and build slides', icon: '✅' },
      { label: 'I\'d like to adjust the visual style', icon: '✏️' },
    ],
  },
};

// ─── Utility: extract slide count ──────────────────────────────────────────────
function extractSlideCount(durationAnswer: string): number {
  const lower = durationAnswer.toLowerCase();
  if (lower.includes('short') || lower.includes('5-10') || lower.includes('8 slide')) return 8;
  if (lower.includes('long') || lower.includes('30') || lower.includes('16 slide')) return 16;
  return 12;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AILabel() {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)]">
        <span className="text-[10px] font-bold text-[var(--ds-system-foreground-primary)]">AI</span>
      </div>
      <span className="text-xs font-medium text-[var(--ds-system-foreground-secondary)]">Senior Presentation Consultant</span>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-xs text-[var(--ds-system-foreground-secondary)] mb-1 mr-1 font-medium">You</span>
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[var(--ds-system-action-surface-tertiary)] px-5 py-3 text-[14px] text-[var(--ds-system-foreground-primary)]">
        {text}
      </div>
    </div>
  );
}

function PhaseHeading({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-start w-full">
      <AILabel />
      <p className="font-bold text-[15px] text-[var(--ds-system-foreground-primary)]">{text}</p>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        if (t.startsWith('**') && t.endsWith('**')) {
          return <p key={i} className="font-semibold text-[var(--ds-system-foreground-primary)] text-[14px] mt-3 first:mt-0">{t.slice(2, -2)}</p>;
        }
        if (t.startsWith('> ')) {
          return <blockquote key={i} className="border-l-2 border-blue-400 pl-3 italic text-[13px] text-[var(--ds-system-foreground-secondary)]">{t.slice(2)}</blockquote>;
        }
        if (t.startsWith('✅') || t.startsWith('•') || t.startsWith('-')) {
          const content = t.replace(/^[✅•\-]\s*/, '');
          const parts = content.split(/\*\*(.+?)\*\*/g);
          return (
            <div key={i} className="flex gap-2 text-[13px] text-[var(--ds-system-foreground-secondary)]">
              <span className="shrink-0 mt-[2px]">{t.startsWith('✅') ? '✅' : '•'}</span>
              <span>{parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="text-[var(--ds-system-foreground-primary)]">{p}</strong> : p)}</span>
            </div>
          );
        }
        // inline table row
        if (t.startsWith('|')) {
          return null; // handled by MarkdownTable below
        }
        const parts = t.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="text-[13px] text-[var(--ds-system-foreground-secondary)] leading-relaxed">
            {parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="text-[var(--ds-system-foreground-primary)]">{p}</strong> : p)}
          </p>
        );
      })}
    </div>
  );
}

function MarkdownTable({ text }: { text: string }) {
  // Find table blocks within text
  const lines = text.split('\n');
  const tableStart = lines.findIndex(l => l.trim().startsWith('|'));
  if (tableStart === -1) return <RichText text={text} />;

  const tableLines: string[] = [];
  const preLines: string[] = [];
  const postLines: string[] = [];
  let inTable = false;
  let tableEnded = false;

  for (const line of lines) {
    if (!tableEnded && (line.trim().startsWith('|') || (inTable && line.trim() === ''))) {
      if (line.trim() !== '') { inTable = true; tableLines.push(line); }
      else if (inTable) { tableEnded = true; }
    } else if (!inTable) {
      preLines.push(line);
    } else {
      tableEnded = true;
      postLines.push(line);
    }
  }

  const rows = tableLines.filter(l => !l.match(/^\|[\s\-|]+\|$/));
  const headers = rows[0]?.split('|').map(c => c.trim()).filter(Boolean) ?? [];
  const dataRows = rows.slice(1).map(r => r.split('|').map(c => c.trim()).filter(Boolean));

  return (
    <div className="space-y-3">
      {preLines.some(l => l.trim()) && <RichText text={preLines.join('\n')} />}
      <div className="overflow-x-auto rounded-lg border border-[var(--ds-system-border-default)]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[var(--ds-system-surface-tertiary)] border-b border-[var(--ds-system-border-default)]">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-[var(--ds-system-foreground-primary)] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-[var(--ds-system-surface-secondary)]' : 'bg-transparent'}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-[var(--ds-system-foreground-secondary)] align-top">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {postLines.some(l => l.trim()) && <RichText text={postLines.join('\n')} />}
    </div>
  );
}

function ToolLogChip({ entry }: { entry: ToolLogEntry }) {
  const icons: Record<string, React.ReactNode> = {
    search: <Search size={12} />,
    read: <BookOpen size={12} />,
    think: <Brain size={12} />,
    presentation: <Presentation size={12} />,
  };
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] text-[12px] text-[var(--ds-system-foreground-secondary)]">
      <span className="text-[var(--ds-system-foreground-tertiary)]">Using Tool</span>
      <span className="w-px h-3 bg-[var(--ds-system-border-default)]" />
      <span className="text-[var(--ds-system-foreground-tertiary)]">{icons[entry.tool] ?? '⚙️'}</span>
      <span className="font-medium text-[var(--ds-system-foreground-primary)]">{entry.label}</span>
      <span className="truncate max-w-[220px] text-[var(--ds-system-foreground-tertiary)]">{entry.description}</span>
      <ExternalLink size={11} className="shrink-0 ml-auto opacity-40" />
    </div>
  );
}

function TaskBox({ tasks, completedCount, activeIndex, isLoading }: {
  tasks: string[]; completedCount: number; activeIndex: number; isLoading: boolean;
}) {
  const remaining = tasks.length - completedCount;
  return (
    <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ds-system-border-default)] bg-[var(--ds-system-surface-tertiary)]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--ds-system-foreground-secondary)]">Using Tool</span>
          <span className="h-3 w-px bg-[var(--ds-system-border-default)]" />
          <Brain size={13} className="text-[var(--ds-system-foreground-tertiary)]" />
          <span className="text-xs font-medium text-[var(--ds-system-foreground-primary)]">Deep Thinking &nbsp;·&nbsp; Total: {tasks.length} Tasks</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-[var(--ds-system-foreground-tertiary)] font-medium">{remaining} Task{remaining !== 1 ? 's' : ''} Remaining</p>
        {tasks.map((task, i) => {
          const isDone = i < completedCount;
          const isActive = i === activeIndex && isLoading;
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
                  <Circle size={16} className="text-[var(--ds-system-foreground-tertiary)]" />
                )}
              </div>
              <span className={`text-sm leading-snug ${isDone ? 'line-through text-[var(--ds-system-foreground-tertiary)]' : isActive ? 'text-[var(--ds-system-foreground-primary)] font-medium' : 'text-[var(--ds-system-foreground-secondary)]'}`}>
                {task}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionCard({ question, onAnswer, onSkip, disabled, selectedAnswers }: {
  question: { id: string; title: string; icon: string; options: { label: string; icon: string }[]; multi?: boolean };
  onAnswer: (answer: string | string[]) => void;
  onSkip: () => void;
  disabled: boolean;
  selectedAnswers?: string | string[];
}) {
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  const isMulti = question.multi === true;
  const selected = disabled
    ? (Array.isArray(selectedAnswers) ? selectedAnswers : selectedAnswers ? [selectedAnswers] : [])
    : localSelected;

  const toggle = (label: string) => {
    if (disabled) return;
    if (isMulti) {
      setLocalSelected(prev => {
        const next = prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label];
        if (selectedAnswers) {
          onAnswer(next); // Auto-update if they already submitted but want to edit
        }
        return next;
      });
    } else {
      setLocalSelected([label]);
      onAnswer(label); // Auto-submit single selection immediately
    }
  };

  const handleSubmit = () => {
    if (!disabled && localSelected.length > 0) {
      onAnswer(isMulti ? localSelected : localSelected[0]);
    }
  };

  return (
    <div className={`w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden transition-opacity ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between bg-[var(--ds-system-surface-tertiary)] px-4 py-3 border-b border-[var(--ds-system-border-default)]">
        <span className="font-medium text-[14px] text-[var(--ds-system-foreground-primary)]">{question.title}</span>
        {isMulti && <span className="text-[11px] text-[var(--ds-system-foreground-tertiary)] bg-[var(--ds-system-surface-secondary)] px-2 py-0.5 rounded-full">multi-select</span>}
      </div>
      <div className="p-4 space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected.includes(opt.label);
          return (
            <button key={i} onClick={() => toggle(opt.label)} disabled={disabled}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-[13px] flex items-center gap-3 ${isSelected
                ? 'border-blue-500/50 bg-blue-500/10 text-[var(--ds-system-foreground-primary)]'
                : 'border-[var(--ds-system-border-default-alpha)] hover:border-[var(--ds-system-border-default)] hover:bg-[var(--ds-system-surface-tertiary)] text-[var(--ds-system-foreground-secondary)]'
              } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
              <span className="shrink-0">{opt.icon}</span>
              <span className="flex-1">{opt.label}</span>
              {isSelected && (
                isMulti
                  ? <Check size={14} className="text-blue-400 shrink-0" />
                  : <div className="w-3 h-3 rounded-full bg-blue-400 shrink-0" />
              )}
            </button>
          );
        })}

        {(!disabled && !selectedAnswers) && (
          <div className="flex gap-2 pt-2">
            <button onClick={onSkip} className="flex-1 px-4 py-2 text-[13px] text-[var(--ds-system-foreground-secondary)] border border-[var(--ds-system-border-default)] rounded-lg hover:bg-[var(--ds-system-surface-tertiary)] transition-colors">
              Skip
            </button>
            {isMulti && (
              <button onClick={handleSubmit} disabled={localSelected.length === 0}
                className="flex-1 px-4 py-2 text-[13px] font-semibold text-[var(--ds-system-foreground-primary)] bg-[var(--ds-system-action-surface-tertiary)] hover:bg-[var(--ds-system-action-surface-tertiary-hover)] rounded-lg transition-colors disabled:opacity-40">
                Submit ({localSelected.length} selected)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UserInputSummaryCard({ answers, questions }: {
  answers: AnswerMap;
  questions: Array<{ id: string; title: string }>;
}) {
  return (
    <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-4 space-y-3">
      <p className="text-[12px] font-semibold text-[var(--ds-system-foreground-tertiary)] uppercase tracking-wider">User's input is as follows:</p>
      {questions.map(q => {
        const ans = answers[q.id];
        if (!ans) return null;
        return (
          <div key={q.id} className="space-y-0.5">
            <p className="text-[12px] text-[var(--ds-system-foreground-tertiary)]">For the question: <em>{q.title}</em></p>
            <p className="text-[13px] text-[var(--ds-system-foreground-primary)]">
              The user's answer is: {Array.isArray(ans) ? ans.join(', ') : ans}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ProceedButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ds-system-action-surface-tertiary)] hover:bg-[var(--ds-system-action-surface-tertiary-hover)] text-[var(--ds-system-foreground-primary)] text-[13px] font-bold rounded-full border border-[var(--ds-system-border-default)] transition-all hover:scale-[1.02]">
      <ChevronRight size={15} />
      {label}
    </button>
  );
}

// Right panel placeholder
function RightPlaceholder({ outline, designBrief, phase }: { outline: string; designBrief: string, phase: GuidePhase }) {
  const isDesignPhase = ['phase4_designing', 'phase4_review'].includes(phase);
  
  const lines = outline.split('\n').filter(l => {
    const t = l.trim();
    return t.startsWith('**Slide') || t.startsWith('Slide');
  });

  return (
    <div className="h-full w-full bg-[#18181A] flex flex-col overflow-hidden border-l border-white/5">
      <div className="p-6 border-b border-white/5">
         <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Live Generation Console</p>
         <h2 className="text-white text-lg font-semibold mt-1">
           {isDesignPhase ? 'Visual Design Strategy' : 'Storyline Architecture'}
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {isDesignPhase ? (
          <div className="space-y-6">
            {!designBrief ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-sm text-white/50 font-medium">Drafting visual language...</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700">
                <MarkdownTable text={designBrief} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                <p className="text-sm text-white/50 font-medium">Constructing narrative layers...</p>
              </div>
            ) : (
              lines.map((line, i) => {
                const title = line.trim().replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/^Slide \d+:\s*/, '');
                return (
                  <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3 hover:bg-white/[0.08] transition-colors group">
                    <span className="text-white/30 text-[11px] font-bold w-5 shrink-0 group-hover:text-blue-400 transition-colors">{i + 1}</span>
                    <span className="text-white/90 text-[13px] font-medium leading-snug">{title}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const GuideModeChat: React.FC<GuideModeChatProps> = ({ initialPrompt, onGenerate, onCancel }) => {
  const [phase, setPhase] = useState<GuidePhase>('phase0_researching');
  const [phaseError, setPhaseError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<string[]>([]);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [toolLogs, setToolLogs] = useState<ToolLogEntry[]>([]);
  const [researchSummary, setResearchSummary] = useState('');

  // Q&A state
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [batch1Done, setBatch1Done] = useState(false);
  const [batch2Done, setBatch2Done] = useState(false);

  // User-provided material (for "I will provide" / "Mix of" material options)
  const [userMaterial, setUserMaterial] = useState('');
  const [userMaterialSubmitted, setUserMaterialSubmitted] = useState(false);

  // Phase content
  const [strategySummary, setStrategySummary] = useState('');
  const [nSlides, setNSlides] = useState(12);
  const [phase2Logs, setPhase2Logs] = useState<ToolLogEntry[]>([]);
  const [researchFindings, setResearchFindings] = useState('');
  const [outline, setOutline] = useState('');
  const [phase3Logs, setPhase3Logs] = useState<ToolLogEntry[]>([]);
  const [designBrief, setDesignBrief] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  // ── Phase 0: Initial research ─────────────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      // Load tasks
      let fetchedTasks: string[] = [];
      try {
        const res = await fetch('/api/v1/ppt/guide/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: initialPrompt }),
        });
        if (res.ok) {
          const d = await res.json();
          if (Array.isArray(d.tasks)) fetchedTasks = d.tasks;
        }
      } catch {}
      if (!fetchedTasks.length) {
        fetchedTasks = [
          `Research ${initialPrompt}`,
          'Phase 1: Strategy Layer – Define audience, purpose, and context',
          'Phase 2: Substance Layer – Gather and filter materials',
          'Phase 3: Structure Layer – Design narrative framework and outline',
          'Phase 4: Surface Layer – Define visual style and design approach',
          'Phase 5: Execution & Reflection – Build slides and quality review',
        ];
      }
      setTasks(fetchedTasks);

      // Initial search log
      setToolLogs([{ tool: 'search', label: 'Parallel Search', description: `${initialPrompt} competitive landscape...` }]);

      // Fetch analysis
      let analysis = '';
      try {
        const res2 = await fetch('/api/v1/ppt/guide/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: initialPrompt }),
        });
        if (res2.ok) {
          const d2 = await res2.json();
          if (d2.analysis) analysis = d2.analysis;
        }
      } catch {}

      if (!analysis) {
        analysis = `**Phase 1: Strategy Layer – Understanding Your Needs**\n\nGreat! I've researched **${initialPrompt}**. Here's what I found:\n\n• This topic has significant strategic depth worth exploring in detail.\n• There are several key themes that will make for a compelling presentation.\n• The subject has strong relevance in today's landscape.\n\nNow, before we proceed, let me ask you some key questions to tailor this perfectly.`;
      }

      setResearchSummary(analysis);
      setCompletedTaskCount(1);
      setPhase('phase1_batch1_qa');
      scrollBottom();
    };
    run();
  }, []); // eslint-disable-line

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Returns true if the material answer requires the user to paste their own content */
  const materialNeedsInput = (ans: string | string[] | undefined): boolean => {
    const str = Array.isArray(ans) ? ans[0] : (ans ?? '');
    return str.includes('I will provide') || str.includes('Mix of');
  };

  const handleBatch1Submit = (qId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const submitBatch1 = () => {
    setBatch1Done(true);
    setCompletedTaskCount(2);
    setPhase('phase1_batch2_qa');
    scrollBottom();
  };

  const handleBatch2Submit = (qId: string, answer: string | string[]) => {
    setAnswers(prev => {
      const updated = { ...prev, [qId]: answer };
      return updated;
    });
  };

  const submitBatch2 = async () => {
    setBatch2Done(true);
    setPhase('phase1_strategy_loading');
    setCompletedTaskCount(2);
    scrollBottom();

    const currentAnswers = { ...answers };
    const duration = currentAnswers['duration'] as string || 'Medium';
    const slides = extractSlideCount(duration);
    setNSlides(slides);

    try {
      const res = await fetch('/api/v1/ppt/guide/phase1/strategy-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: initialPrompt, answers: currentAnswers }),
      });
      if (res.ok) {
        const d = await res.json();
        setStrategySummary(d.strategy_summary || '');
        if (d.n_slides) setNSlides(d.n_slides);
      }
    } catch {}

    setPhase('phase1_strategy_review');
    scrollBottom();
  };

  const handleStrategyConfirm = async (answer: string | string[]) => {
    const ans = Array.isArray(answer) ? answer[0] : answer;
    setAnswers(prev => ({ ...prev, strategy_confirm: ans }));

    if (ans.includes('perfect') || ans.includes('Yes')) {
      setPhase('phase2_researching');
      setCompletedTaskCount(3);
      scrollBottom();
      await runPhase2();
    }
  };

  const runPhase2 = async () => {
    const strategyText = strategySummary.slice(0, 400);
    const materialChoice = (answers['material'] as string) ?? '';
    const willProvideOwn  = materialChoice.includes('I will provide');
    const isMix           = materialChoice.includes('Mix of');

    // ── "I will provide" → skip AI research entirely, use user material ──
    if (willProvideOwn) {
      setPhase2Logs([{ tool: 'read', label: 'User Material', description: 'Using your provided content as research source' }]);
      setResearchFindings(
        `--- User-Provided Materials ---\n${userMaterial}\n\n` +
        `(No AI research was conducted — presentation will be built exclusively from the above content.)`
      );
      setPhase('phase2_review');
      setCompletedTaskCount(3);
      scrollBottom();
      return;
    }

    // ── AI research (or Mix) ───────────────────────────────────────────────
    const logs: ToolLogEntry[] = [];
    if (isMix && userMaterial.trim()) {
      logs.push({ tool: 'read', label: 'User Material', description: 'Loaded your provided content — will merge with AI research' });
      setPhase2Logs([...logs]);
    }

    try {
      const res = await fetch('/api/v1/ppt/guide/phase2/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: initialPrompt, strategy: strategyText }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          const dataLine = part.split('\n').find(l => l.startsWith('data:'));
          if (!dataLine) continue;
          try {
            const evt = JSON.parse(dataLine.slice(5));
            if (evt.type === 'tool_log') {
              logs.push({ tool: evt.tool, label: evt.label, description: evt.description });
              setPhase2Logs([...logs]);
              scrollBottom();
            } else if (evt.type === 'complete' && evt.research_summary) {
              // For Mix: append user material to AI research
              const combined = isMix && userMaterial.trim()
                ? `${evt.research_summary}\n\n--- User-Provided Materials ---\n${userMaterial}`
                : evt.research_summary;
              setResearchFindings(combined);
            }
          } catch {}
        }
      }
    } catch {}

    setPhase('phase2_review');
    setCompletedTaskCount(3);
    scrollBottom();
  };

  const handleResearchConfirm = async (answer: string | string[]) => {
    const ans = Array.isArray(answer) ? answer[0] : answer;
    setAnswers(prev => ({ ...prev, research_confirm: ans }));

    if (ans.includes('Perfect') || ans.includes('Proceed')) {
      setPhase('phase3_outlining');
      setCompletedTaskCount(4);
      scrollBottom();
      await runPhase3();
    }
  };

  const runPhase3 = async () => {
    const logs: ToolLogEntry[] = [{ tool: 'think', label: 'Think', description: `Designing narrative framework for ${initialPrompt.slice(0, 40)}...` }];
    setPhase3Logs([...logs]);

    try {
      const res = await fetch('/api/v1/ppt/guide/phase3/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: initialPrompt,
          strategy: strategySummary.slice(0, 500),
          research_summary: researchFindings.slice(0, 1200),
          n_slides: nSlides,
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      let hasError = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          const dataLine = part.split('\n').find(l => l.startsWith('data:'));
          if (!dataLine) continue;
          try {
            const evt = JSON.parse(dataLine.slice(5));
            if (evt.type === 'complete' && evt.outline) {
              setOutline(evt.outline);
            } else if (evt.type === 'error') {
              console.error("Phase 3 Error:", evt.detail);
              setPhaseError(evt.detail);
              setPhase3Logs([{ tool: 'think', label: 'Error', description: evt.detail }]);
              hasError = true;
            } else if (evt.type === 'text_chunk') {
              setOutline(prev => prev + evt.chunk);
            } else if (evt.type === 'tool_log') {
               setPhase3Logs(prev => [...prev, { tool: evt.tool, label: evt.label, description: evt.description }]);
            }
          } catch {}
        }
      }
      
      if (hasError) {
         // Stop the spinner but remain on outlining step to show the error
         setPhase('phase3_outlining');
         return;
      }
    } catch (e: any) {
      console.error(e);
      setPhaseError(e.message || "Unknown error occurred");
      return;
    }

    setPhase('phase3_review');
    setCompletedTaskCount(4);
    scrollBottom();
  };

  const handleOutlineConfirm = async (answer: string | string[]) => {
    const ans = Array.isArray(answer) ? answer[0] : answer;
    setAnswers(prev => ({ ...prev, outline_confirm: ans }));

    if (ans.includes('Perfect') || ans.includes('Proceed')) {
      setPhase('phase4_designing');
      setCompletedTaskCount(5);
      scrollBottom();
      await runPhase4();
    }
  };

  const runPhase4 = async () => {
    const outlineTitle = outline.split('\n').find(l => l.trim().startsWith('**Slide')) ?? '';
    try {
      const res = await fetch('/api/v1/ppt/guide/phase4/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: initialPrompt,
          strategy: strategySummary.slice(0, 400),
          outline_summary: outlineTitle,
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          const dataLine = part.split('\n').find(l => l.startsWith('data:'));
          if (!dataLine) continue;
          try {
            const evt = JSON.parse(dataLine.slice(5));
            if (evt.type === 'complete' && evt.design_brief) {
               setDesignBrief(evt.design_brief);
            } else if (evt.type === 'text_chunk') {
               setDesignBrief(prev => prev + evt.chunk);
            } else if (evt.type === 'error') {
               setPhaseError(evt.detail);
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error("Phase 4 Error:", err);
    }

    setPhase('phase4_review');
    setCompletedTaskCount(5);
    scrollBottom();
  };

  const handleDesignConfirm = async (answer: string | string[]) => {
    const ans = Array.isArray(answer) ? answer[0] : answer;
    setAnswers(prev => ({ ...prev, design_confirm: ans }));
    setCompletedTaskCount(tasks.length);
    setPhase('complete');
    scrollBottom();

    // Give the user a moment to see the "All phases complete" state
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Build the enhanced prompt
    const emphasiList = Array.isArray(answers['emphasis']) ? (answers['emphasis'] as string[]).join(', ') : answers['emphasis'] ?? '';
    const enhancedPrompt = [
      `Topic: ${initialPrompt}`,
      `Audience: ${answers['audience'] ?? ''}`,
      `Purpose: ${answers['purpose'] ?? ''}`,
      `Delivery: ${answers['delivery'] ?? ''}`,
      `Tone: ${answers['tone'] ?? ''}`,
      `Emphasis: ${emphasiList}`,
      `Duration: ${answers['duration'] ?? ''}`,
      `Slides: ${nSlides}`,
      `\nStrategy:\n${strategySummary}`,
      `\nResearch Summary:\n${researchFindings}`,
      `\nPresentation Outline:\n${outline}`,
      `\nDesign Direction:\n${designBrief}`,
    ].join('\n');

    onGenerate(enhancedPrompt, nSlides, outline, designBrief);
  };

  // ── Determine if all batch1 questions answered ────────────────────────────
  const batch1AllAnswered = BATCH1_QUESTIONS.every(q => answers[q.id]);
  const batch2AllAnswered = BATCH2_QUESTIONS.every(q => answers[q.id]);

  const showSplitScreen = ['phase3_outlining', 'phase3_review', 'phase4_designing', 'phase4_review', 'complete'].includes(phase);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full w-full bg-[var(--ds-system-surface-primary)] overflow-hidden">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <button onClick={onCancel}
          className="flex items-center gap-1 text-[var(--ds-system-action-foreground-ghost)] hover:bg-[var(--ds-system-action-surface-ghost-hover)] h-8 px-2 rounded-lg transition-colors border border-[var(--ds-system-border-default)]">
          <ChevronLeft size={16} />
          <span className="text-xs font-medium">Exit Guide Mode</span>
        </button>
      </div>

      {/* LEFT CHAT PANEL */}
      <div className={`${showSplitScreen ? 'w-[42%]' : 'w-full'} flex flex-col overflow-y-auto no-scrollbar pt-20 pb-40 transition-all duration-500 border-r border-[var(--ds-system-border-default)]`}>
        <div className="w-full max-w-[640px] mx-auto px-6 space-y-8">

          {/* User prompt */}
          <UserBubble text={initialPrompt} />

          {/* Phase 0 intro */}
          <div className="flex flex-col items-start w-full">
            <AILabel />
            <p className="text-[14px] text-[var(--ds-system-foreground-secondary)] leading-relaxed">
              I'll help you create a professional presentation on <strong className="text-[var(--ds-system-foreground-primary)]">{initialPrompt}</strong>. I'll guide you through a 5-phase consultation process to build an authoritative, tailored deck.
            </p>
          </div>

          {/* Task box */}
          {tasks.length > 0 && (
            <div className="flex flex-col items-start w-full">
              <AILabel />
              <TaskBox
                tasks={tasks}
                completedCount={completedTaskCount}
                activeIndex={completedTaskCount}
                isLoading={phase === 'phase0_researching'}
              />
            </div>
          )}

          {/* Phase 0 tool logs */}
          {toolLogs.length > 0 && (
            <div className="flex flex-col items-start w-full gap-1">
              {toolLogs.map((log, i) => <ToolLogChip key={i} entry={log} />)}
            </div>
          )}

          {/* Research summary */}
          {researchSummary && (
            <div className="flex flex-col items-start w-full">
              <AILabel />
              <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-5">
                <RichText text={researchSummary} />
              </div>
            </div>
          )}

          {/* ── PHASE 1: Batch 1 Q&A ────────────────────────── */}
          {['phase1_batch1_qa', 'phase1_batch2_qa', 'phase1_strategy_loading', 'phase1_strategy_review',
            'phase2_researching', 'phase2_review', 'phase3_outlining', 'phase3_review',
            'phase4_designing', 'phase4_review', 'complete'].includes(phase) && (
            <>
              <PhaseHeading text="Phase 1: Strategy Layer – Understanding Your Needs" />
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <p className="text-[14px] text-[var(--ds-system-foreground-secondary)]">
                  Now, before we proceed, I need to understand the strategic context. Let me ask you some key questions:
                </p>
              </div>

              {BATCH1_QUESTIONS.map((q, i) => {
                // Sequential display logic
                if (i > 0 && !answers[BATCH1_QUESTIONS[i - 1].id]) return null;
                
                return (
                  <React.Fragment key={q.id}>
                    <div className="flex flex-col items-start w-full">
                      <AILabel />
                      <QuestionCard
                        question={q}
                        onAnswer={ans => handleBatch1Submit(q.id, ans)}
                        onSkip={() => handleBatch1Submit(q.id, q.options[0].label)}
                        disabled={batch1Done}
                        selectedAnswers={answers[q.id]}
                      />
                    </div>
                    {answers[q.id] && <UserBubble text={Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).join(', ') : answers[q.id] as string} />}
                  </React.Fragment>
                );
              })}

              {!batch1Done && answers['material'] && materialNeedsInput(answers['material']) && (
                <div className="flex flex-col items-start w-full">
                  <AILabel />
                  <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] overflow-hidden">
                    <div className="flex items-center gap-2 bg-[var(--ds-system-surface-tertiary)] px-4 py-3 border-b border-[var(--ds-system-border-default)]">
                      <span className="text-sm">📋</span>
                      <span className="font-medium text-[14px] text-[var(--ds-system-foreground-primary)]">
                        {answers['material']?.toString().includes('Mix')
                          ? 'Paste your materials — AI will blend them with its research'
                          : 'Paste your materials — these will be used as the sole research source'}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <textarea
                        value={userMaterial}
                        onChange={e => { setUserMaterial(e.target.value); setUserMaterialSubmitted(false); }}
                        disabled={userMaterialSubmitted}
                        placeholder={`Paste your research notes, data, statistics, key points, or any content you want included in the presentation...\n\nExamples:\n• Revenue figures, market share data\n• Key quotes or excerpts\n• Your own analysis or narrative\n• Raw notes or bullet points`}
                        rows={8}
                        className={`w-full text-[13px] bg-[var(--ds-system-surface-tertiary)] border border-[var(--ds-system-border-default)] rounded-lg p-3 resize-none focus:outline-none focus:border-blue-500/60 transition-colors placeholder:text-[var(--ds-system-foreground-tertiary)] text-[var(--ds-system-foreground-primary)] leading-relaxed ${
                          userMaterialSubmitted ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-[var(--ds-system-foreground-tertiary)]">
                          {userMaterial.trim().length > 0
                            ? `${userMaterial.trim().length} characters · ~${Math.ceil(userMaterial.trim().split(/\s+/).length / 200)} min read`
                            : 'Your content will replace or supplement the AI research phase'}
                        </p>
                        {!userMaterialSubmitted ? (
                          <button
                            onClick={() => { if (userMaterial.trim()) setUserMaterialSubmitted(true); }}
                            disabled={!userMaterial.trim()}
                            className="px-4 py-2 text-[13px] font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white"
                          >
                            ✓ Use this material
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 text-[12px] font-medium">✓ Material saved</span>
                            <button
                              onClick={() => setUserMaterialSubmitted(false)}
                              className="text-[12px] text-[var(--ds-system-foreground-tertiary)] underline hover:text-[var(--ds-system-foreground-secondary)] transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!batch1Done && batch1AllAnswered && (!materialNeedsInput(answers['material']) || userMaterialSubmitted) && (
                <div className="flex flex-col items-start w-full">
                  <AILabel />
                  <ProceedButton label="Continue to next questions →" onClick={submitBatch1} />
                </div>
              )}
            </>
          )}

          {/* ── PHASE 1: Batch 2 Q&A ────────────────────────── */}
          {batch1Done && (
            <>
              {batch1Done && (
                <div className="flex flex-col items-start w-full">
                  <AILabel />
                  <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-4">
                    <UserInputSummaryCard answers={answers} questions={BATCH1_QUESTIONS} />
                  </div>
                </div>
              )}
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <p className="text-[13px] text-[var(--ds-system-foreground-secondary)]">
                  Strategic context confirmed. Let me ask a few more targeted questions:
                </p>
              </div>

              {BATCH2_QUESTIONS.map((q, i) => {
                // Sequential display logic
                if (i > 0 && !answers[BATCH2_QUESTIONS[i - 1].id]) return null;

                return (
                  <React.Fragment key={q.id}>
                    <div className="flex flex-col items-start w-full">
                      <AILabel />
                      <QuestionCard
                        question={q}
                        onAnswer={ans => handleBatch2Submit(q.id, ans)}
                        onSkip={() => handleBatch2Submit(q.id, q.id === 'duration' ? 'Medium (15-20 min)' : q.options[0].label)}
                        disabled={batch2Done}
                        selectedAnswers={answers[q.id]}
                      />
                    </div>
                    {answers[q.id] && <UserBubble text={Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).join(', ') : answers[q.id] as string} />}
                  </React.Fragment>
                );
              })}

              {!batch2Done && batch2AllAnswered && (
                <div className="flex flex-col items-start w-full">
                  <AILabel />
                  <ProceedButton label="Generate Strategy Summary →" onClick={submitBatch2} />
                </div>
              )}
            </>
          )}

          {/* Strategy loading */}
          {phase === 'phase1_strategy_loading' && (
            <div className="flex items-center gap-2 text-[var(--ds-system-foreground-tertiary)]">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Generating strategy summary…</span>
            </div>
          )}

          {/* Strategy Summary */}
          {strategySummary && ['phase1_strategy_review', 'phase2_researching', 'phase2_review', 'phase3_outlining', 'phase3_review', 'phase4_designing', 'phase4_review', 'complete'].includes(phase) && (
            <>
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-5">
                  <MarkdownTable text={strategySummary} />
                </div>
              </div>
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <QuestionCard
                  question={CONFIRMATION_QUESTIONS.strategy}
                  onAnswer={handleStrategyConfirm}
                  onSkip={() => handleStrategyConfirm(CONFIRMATION_QUESTIONS.strategy.options[0].label)}
                  disabled={!!answers['strategy_confirm']}
                  selectedAnswers={answers['strategy_confirm'] as string}
                />
              </div>
              {answers['strategy_confirm'] && <UserBubble text={answers['strategy_confirm'] as string} />}
            </>
          )}

          {/* ── PHASE 2: Deep Research ──────────────────────── */}
          {['phase2_researching', 'phase2_review', 'phase3_outlining', 'phase3_review', 'phase4_designing', 'phase4_review', 'complete'].includes(phase) && (
            <>
              <PhaseHeading text="Phase 2: Substance Layer – Deep Research Execution" />
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <p className="text-[13px] text-[var(--ds-system-foreground-secondary)]">
                  Excellent! Strategy confirmed. Conducting deep, comprehensive research to build the evidence base.
                </p>
              </div>
              {phase2Logs.length > 0 && (
                <div className="flex flex-col items-start w-full gap-1.5">
                  {phase2Logs.map((log, i) => <ToolLogChip key={i} entry={log} />)}
                </div>
              )}
              {phase === 'phase2_researching' && (
                <div className="flex items-center gap-2 text-[var(--ds-system-foreground-tertiary)]">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Synthesising research findings…</span>
                </div>
              )}
            </>
          )}

          {/* Research Findings */}
          {researchFindings && ['phase2_review', 'phase3_outlining', 'phase3_review', 'phase4_designing', 'phase4_review', 'complete'].includes(phase) && (
            <>
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-5">
                  <RichText text={researchFindings} />
                </div>
              </div>
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <QuestionCard
                  question={CONFIRMATION_QUESTIONS.research}
                  onAnswer={handleResearchConfirm}
                  onSkip={() => handleResearchConfirm(CONFIRMATION_QUESTIONS.research.options[0].label)}
                  disabled={!!answers['research_confirm']}
                  selectedAnswers={answers['research_confirm'] as string}
                />
              </div>
              {answers['research_confirm'] && <UserBubble text={answers['research_confirm'] as string} />}
            </>
          )}

          {/* ── PHASE 3: Outline ────────────────────────────── */}
          {['phase3_outlining', 'phase3_review', 'phase4_designing', 'phase4_review', 'complete'].includes(phase) && (
            <>
              <PhaseHeading text="Phase 3: Structure Layer – Designing the Narrative Framework" />
              <div className="flex flex-col items-start w-full gap-1.5">
                {phase3Logs.map((log, i) => <ToolLogChip key={i} entry={log} />)}
              </div>
              {phase === 'phase3_outlining' && !phaseError && (
                <div className="flex items-center gap-2 text-[var(--ds-system-foreground-tertiary)]">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Designing {nSlides}-slide narrative framework… (this may take up to 60 seconds)</span>
                </div>
              )}
              {phaseError && (
                <div className="flex flex-col items-start gap-3 mt-4 w-full p-4 border border-red-500/30 bg-red-500/10 rounded-xl">
                  <p className="text-red-400 text-sm font-medium">Generation Failed</p>
                  <p className="text-white/70 text-xs">{phaseError}</p>
                  <button 
                    onClick={() => { setPhaseError(null); runPhase3(); }}
                    className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-medium text-xs transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}

          {/* Outline content */}
          {outline && !phaseError && ['phase3_review', 'phase4_designing', 'phase4_review', 'complete'].includes(phase) && (
            <>
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-5">
                  <RichText text={outline} />
                </div>
              </div>
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <QuestionCard
                  question={CONFIRMATION_QUESTIONS.outline}
                  onAnswer={handleOutlineConfirm}
                  onSkip={() => handleOutlineConfirm(CONFIRMATION_QUESTIONS.outline.options[0].label)}
                  disabled={!!answers['outline_confirm']}
                  selectedAnswers={answers['outline_confirm'] as string}
                />
              </div>
              {answers['outline_confirm'] && <UserBubble text={answers['outline_confirm'] as string} />}
            </>
          )}

          {/* ── PHASE 4: Design ─────────────────────────────── */}
          {['phase4_designing', 'phase4_review', 'complete'].includes(phase) && (
            <>
              <PhaseHeading text="Phase 4: Surface Layer – Design Direction" />
              {phase === 'phase4_designing' && (
                <div className="flex items-center gap-2 text-[var(--ds-system-foreground-tertiary)]">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Generating design brief…</span>
                </div>
              )}
            </>
          )}

          {designBrief && ['phase4_review', 'complete'].includes(phase) && (
            <>
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <div className="w-full rounded-xl bg-[var(--ds-system-surface-secondary)] border border-[var(--ds-system-border-default)] p-5">
                  <MarkdownTable text={designBrief} />
                </div>
              </div>
              <div className="flex flex-col items-start w-full">
                <AILabel />
                <QuestionCard
                  question={CONFIRMATION_QUESTIONS.design}
                  onAnswer={handleDesignConfirm}
                  onSkip={() => handleDesignConfirm(CONFIRMATION_QUESTIONS.design.options[0].label)}
                  disabled={!!answers['design_confirm']}
                  selectedAnswers={answers['design_confirm'] as string}
                />
              </div>
              {answers['design_confirm'] && <UserBubble text={answers['design_confirm'] as string} />}
            </>
          )}

          {/* Complete */}
          {phase === 'complete' && (
            <div className="flex flex-col items-start w-full">
              <AILabel />
              <div className="w-full rounded-xl bg-green-500/10 border border-green-500/30 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={18} className="text-green-400" />
                  <span className="font-semibold text-[14px] text-green-400">All phases complete!</span>
                </div>
                <p className="text-[13px] text-[var(--ds-system-foreground-secondary)]">
                  All 5 consultation phases finished. Building your {nSlides}-slide presentation now…
                </p>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* RIGHT PANEL — Outline Preview */}
      {showSplitScreen && (
        <div className="flex-1 overflow-hidden">
          <RightPlaceholder outline={outline} designBrief={designBrief} phase={phase} />
        </div>
      )}
    </div>
  );
};
