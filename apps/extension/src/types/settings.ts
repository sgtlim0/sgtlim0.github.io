export interface ExtensionSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'ko' | 'en'
  apiMode: 'mock' | 'real'
  apiBaseUrl: string
  maxTextLength: number
  autoSanitize: boolean
  enableSidePanel: boolean
  enableShortcuts: boolean
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: 'system',
  language: 'ko',
  apiMode: 'mock',
  apiBaseUrl: 'https://hchat-user.vercel.app',
  maxTextLength: 5000,
  autoSanitize: true,
  enableSidePanel: true,
  enableShortcuts: true,
}
