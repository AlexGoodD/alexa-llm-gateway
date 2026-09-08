import OpenRouterProviderService from '#services/openrouter_provider_service'
import type { ProviderRequest } from '#services/provider_service'
import { test } from '@japa/runner'

function createProviderRequest(): ProviderRequest {
  return {
    sessionId: 'session-123',
    messages: [
      {
        role: 'user',
        content: '¿Cuál es la capital de México?',
      },
    ],
  }
}

test.group('OpenRouter provider service', () => {
  test('returns generated content and supplies an abort signal', async ({ assert }) => {
    const originalFetch = globalThis.fetch
    let requestSignal: AbortSignal | undefined
    globalThis.fetch = async (_input, requestOptions) => {
      requestSignal = requestOptions?.signal ?? undefined
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: 'La capital de México es Ciudad de México.',
              },
            },
          ],
        }),
        { status: 200 }
      )
    }

    try {
      const providerService = new OpenRouterProviderService()
      const response = await providerService.generateResponse(createProviderRequest())

      assert.equal(response.content, 'La capital de México es Ciudad de México.')
      assert.instanceOf(requestSignal, AbortSignal)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test('rejects unsuccessful provider responses', async ({ assert }) => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(null, { status: 503 })

    try {
      const providerService = new OpenRouterProviderService()

      await assert.rejects(() => providerService.generateResponse(createProviderRequest()))
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test('rejects provider responses without generated content', async ({ assert }) => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(JSON.stringify({ choices: [] }), { status: 200 })

    try {
      const providerService = new OpenRouterProviderService()

      await assert.rejects(() => providerService.generateResponse(createProviderRequest()))
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
