import { authHandlers } from './handlers/auth'
import { adminHandlers } from './handlers/admin'
import { chatHandlers } from './handlers/chat'
import { modelHandlers } from './handlers/models'
import { enterpriseHandlers } from './handlers/enterprise'
import { aiEngineHandlers } from './handlers/aiEngine'
import { collaborationHandlers } from './handlers/collaboration'
import { aiAdvancedHandlers } from './handlers/aiAdvanced'

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...chatHandlers,
  ...modelHandlers,
  ...enterpriseHandlers,
  ...aiEngineHandlers,
  ...collaborationHandlers,
  ...aiAdvancedHandlers,
]
