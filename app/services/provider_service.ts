export type ProviderMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type ProviderRequest = {
  sessionId: string
  messages: ProviderMessage[]
}

export type ProviderResponse = {
  content: string
}

export interface ProviderService {
  generateResponse(request: ProviderRequest): Promise<ProviderResponse>
}
