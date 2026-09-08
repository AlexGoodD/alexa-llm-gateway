import OpenRouterProviderService from '#services/openrouter_provider_service'
import type { ProviderService } from '#services/provider_service'

export default class ChatService {
  constructor(private providerService: ProviderService) {}

  generateResponse(sessionId: string, question: string) {
    return this.providerService.generateResponse({
      sessionId,
      messages: [
        {
          role: 'system',
          content:
            'Responde en español de México, de forma clara y breve para ser escuchada por voz. No uses Markdown ni listas.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
    })
  }
}

export const chatService = new ChatService(new OpenRouterProviderService())
