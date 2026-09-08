import ChatService from '#services/chat_service'
import type { ProviderRequest } from '#services/provider_service'
import { test } from '@japa/runner'

test.group('Chat service', () => {
  test('passes a voice-focused conversation to the configured provider', async ({ assert }) => {
    let providerRequest: ProviderRequest | undefined
    const chatService = new ChatService({
      async generateResponse(request) {
        providerRequest = request
        return { content: 'Respuesta de prueba' }
      },
    })

    const response = await chatService.generateResponse(
      'session-123',
      '¿Cuál es la capital de México?'
    )

    assert.equal(response.content, 'Respuesta de prueba')
    assert.deepEqual(providerRequest, {
      sessionId: 'session-123',
      messages: [
        {
          role: 'system',
          content:
            'Responde en español de México, de forma clara y breve para ser escuchada por voz. No uses Markdown ni listas.',
        },
        {
          role: 'user',
          content: '¿Cuál es la capital de México?',
        },
      ],
    })
  })
})
