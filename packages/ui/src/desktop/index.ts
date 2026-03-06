'use client'

// Types
export type {
  DesktopChat,
  DesktopMessage,
  DesktopAgent,
  DesktopTool,
  SwarmAgent,
  DebateParticipant,
  DebateMessage,
} from './types'

// Components
export { default as DesktopSidebar } from './DesktopSidebar'
export type { DesktopSidebarProps, DesktopNavItem } from './DesktopSidebar'

export { default as DesktopChatBubble } from './DesktopChatBubble'
export type { DesktopChatBubbleProps } from './DesktopChatBubble'

export { default as AgentCard } from './AgentCard'
export type { AgentCardProps } from './AgentCard'

export { default as SwarmPanel } from './SwarmPanel'
export type { SwarmPanelProps } from './SwarmPanel'

export { default as DebateArena } from './DebateArena'
export type { DebateArenaProps } from './DebateArena'

export { default as ToolGrid } from './ToolGrid'
export type { ToolGridProps } from './ToolGrid'
