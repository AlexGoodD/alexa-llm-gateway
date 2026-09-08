import AlexaSignatureMiddleware from '#middleware/alexa_signature_middleware'
import { SignedAlexaRequestVerifier } from '#services/alexa_request_verifier'
import type { HttpContext } from '@adonisjs/core/http'
import { test } from '@japa/runner'
import type { IncomingHttpHeaders } from 'node:http'

test.group('Alexa request verification', () => {
  test('accepts a request when timestamp and signature verification succeed', async ({
    assert,
  }) => {
    const verificationCalls: string[] = []
    const requestEnvelope = JSON.stringify({ request: { timestamp: new Date().toISOString() } })
    const requestVerifier = new SignedAlexaRequestVerifier(
      {
        async verify(receivedRequestEnvelope: string) {
          verificationCalls.push(`timestamp:${receivedRequestEnvelope}`)
        },
      },
      {
        async verify(receivedRequestEnvelope: string, headers: IncomingHttpHeaders) {
          verificationCalls.push(`signature:${receivedRequestEnvelope}:${headers['signature-256']}`)
        },
      }
    )

    await requestVerifier.verify(requestEnvelope, { 'signature-256': 'signature' })

    assert.deepEqual(verificationCalls, [
      `timestamp:${requestEnvelope}`,
      `signature:${requestEnvelope}:signature`,
    ])
  })

  test('continues to the webhook controller after a verified request', async ({ assert }) => {
    let didCallNext = false
    const middleware = new AlexaSignatureMiddleware({
      async verify() {},
    })
    const httpContext = {
      logger: {
        warn() {},
      },
      request: {
        raw: () => JSON.stringify({ request: { timestamp: new Date().toISOString() } }),
        headers: () => ({ 'signature-256': 'signature' }),
      },
      response: {
        badRequest() {},
      },
    } as unknown as HttpContext

    await middleware.handle(httpContext, async () => {
      didCallNext = true
    })

    assert.isTrue(didCallNext)
  })

  test('rejects a request when signature verification fails', async ({ assert }) => {
    const middleware = new AlexaSignatureMiddleware({
      async verify() {
        throw new Error('Invalid signature')
      },
    })
    let responseBody: unknown
    const httpContext = {
      logger: {
        warn() {},
      },
      request: {
        raw: () => JSON.stringify({ request: { timestamp: new Date().toISOString() } }),
        headers: () => ({}),
      },
      response: {
        badRequest(body: unknown) {
          responseBody = body
        },
      },
    } as unknown as HttpContext

    await middleware.handle(httpContext, async () => {})

    assert.deepEqual(responseBody, { message: 'Invalid Alexa request signature' })
  })
})
