import React from 'react'
import { 
  Rocket, 
  Shield, 
  Users, 
  Zap, 
  Target, 
  TrendingUp, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Database,
  Globe,
  Lock,
  Search,
  Settings,
  Star,
  Activity,
  Award,
  BarChart3,
  Briefcase,
  Clock,
  Compass,
  Cpu,
  Layers,
  Lightbulb,
  ShieldCheck,
  ZapOff
} from 'lucide-react'

// Map AI keywords to Lucide components
const ICON_MAP: Record<string, any> = {
  'rocket': Rocket,
  'speed': Zap,
  'velocity': Zap,
  'safety': ShieldCheck,
  'security': Lock,
  'protection': Shield,
  'users': Users,
  'growth': TrendingUp,
  'target': Target,
  'brain': Brain,
  'ai': Cpu,
  'process': Activity,
  'success': Award,
  'data': Database,
  'global': Globe,
  'search': Search,
  'settings': Settings,
  'feature': Star,
  'layer': Layers,
  'idea': Lightbulb,
  'insight': Lightbulb,
  'timeline': Clock,
  'roadmap': Compass,
  'metrics': BarChart3,
  'business': Briefcase,
  'check': CheckCircle,
  'alert': AlertCircle,
  'danger': ZapOff,
  'flow': ArrowRight,
}

interface FlexIconProps {
  name?: string | { __icon_query__?: string; __icon_url__?: string } | any
  className?: string
  color?: string
  size?: number
}

export function FlexIcon({ name, className = "w-6 h-6", color, size = 24 }: FlexIconProps) {
  if (!name) return null

  // If backend injected an icon object, extract the query string
  let iconName = typeof name === 'string' ? name : (name?.__icon_query__ || name?.__icon_url__ || "");
  if (!iconName || typeof iconName !== 'string') return null;

  // Strip JSON/markdown artifacts: {}, [], ", ' that LLM sometimes wraps icon names in
  const cleaned = iconName.replace(/[{}\[\]"']/g, '').trim()
  // Treat placeholder tokens as no-icon
  if (!cleaned || ['_icon', 'icon', 'placeholder', 'null', 'none', 'undefined'].includes(cleaned.toLowerCase())) return null

  // Normalize: lowercase, remove non-alphanumeric
  const normalized = cleaned.toLowerCase().replace(/[^a-z0-9]/g, '')

  // Try to find a match in the map
  const IconComponent = Object.entries(ICON_MAP).find(([key]) => normalized.includes(key))?.[1]

  if (IconComponent) {
    return <IconComponent className={className} color={color} size={size} />
  }

  // Fallback: render a short readable label (max 6 chars, not raw punctuation)
  const fallbackText = cleaned.slice(0, 6)
  return (
    <div className={`${className} flex items-center justify-center font-bold`} style={{ color, fontSize: size * 0.45 }}>
      {fallbackText}
    </div>
  )
}
