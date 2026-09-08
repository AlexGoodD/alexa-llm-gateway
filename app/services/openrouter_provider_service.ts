import llmConfig from '#config/llm'
import type { ProviderRequest, ProviderResponse, ProviderService } from '#services/provider_service'
import env from '#start/env'

type OpenRouterCompletion = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

export default class OpenRouterProviderService implements ProviderService {
  async generateResponse(request: ProviderRequest): Promise<ProviderResponse> {
    if (!llmConfig.openRouter.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured')
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${llmConfig.openRouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.get('APP_URL'),
        'X-Title': 'Alexa LLM Gateway',
      },
      body: JSON.stringify({
        model: llmConfig.openRouter.model,
        messages: request.messages,
        max_tokens: 220,
      }),
      signal: AbortSignal.timeout(llmConfig.openRouter.timeout),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter request failed with status ${response.status}`)
    }

    const completion = (await response.json()) as OpenRouterCompletion
    const content = completion.choices?.[0]?.message?.content?.trim()

    if (!content) {
      throw new Error('OpenRouter returned an empty response')
    }

    return { content }
  }
}
