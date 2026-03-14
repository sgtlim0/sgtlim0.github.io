import React, { useState } from 'react'
import { ThemeProvider } from '@hchat/ui'
import { PopupHeader, ModeSelector, ContextBanner } from './components'
import { AnalyzePage } from './pages'
import { usePageContext, useExtensionSettings } from './hooks'
import type { AnalysisMode } from '../types/context'

export function App() {
  const { context, clearContext } = usePageContext()
  const { settings, updateSettings } = useExtensionSettings()
  const [activeMode, setActiveMode] = useState<AnalysisMode | null>(null)

  const handleModeSelect = (mode: AnalysisMode) => {
    setActiveMode(mode)
  }

  const handleBack = () => {
    setActiveMode(null)
  }

  const handleClearContext = async () => {
    try {
      await clearContext()
    } catch (err) {
      console.error('Failed to clear context:', err)
    }
  }

  // Show analysis page if mode is active
  if (activeMode && context) {
    return (
      <ThemeProvider>
        <div className="w-[400px] h-[600px] flex flex-col bg-ext-bg text-ext-text">
          <AnalyzePage mode={activeMode} context={context} onBack={handleBack} />
        </div>
      </ThemeProvider>
    )
  }

  // Show main popup UI
  return (
    <ThemeProvider>
      <div className="w-[400px] max-h-[600px] overflow-y-auto bg-ext-bg text-ext-text">
        <PopupHeader settings={settings} onSettingsChange={updateSettings} />
        {context && !activeMode && <ContextBanner context={context} onClear={handleClearContext} />}
        <ModeSelector disabled={!context} onSelect={handleModeSelect} />
      </div>
    </ThemeProvider>
  )
}
