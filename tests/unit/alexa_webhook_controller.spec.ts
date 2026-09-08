import AlexaWebhookController from '#controllers/alexa_webhook_controller'
import type { HttpContext } from '@adonisjs/core/http'
import { test } from '@japa/runner'

function createAlexaRequest(overrides: Record<string, unknown> = {}) {
  return {
    version: '1.0',
    context: {
      System: {
        application: {
          applicationId: 'amzn1.ask.skill.test',
        },
      },
    },
    session: {
      sessionId: 'session-123',
    },
    request: {
      type: 'LaunchRequest',
      timestamp: new Date().toISOString(),
    },
    ...overrides,
  }
}

function createHttpContext(alexaRequest: Record<string, unknown>, errors: unknown[]) {
  return {
    logger: {
      error(error: unknown) {
        errors.push(error)
      },
      warn() {},
    },
    request: {
      async validateUsing() {
        return alexaRequest
      },
    },
    response: {
      forbidden(body: unknown) {
        return { status: 403, body }
      },
    },
  } as unknown as HttpContext
}

test.group('Alexa webhook controller', () => {
  test('responds to a launch request', async ({ assert }) => {
    const errors: unknown[] = []
    const controller = new AlexaWebhookController({
      async generateResponse() {
        return { content: 'No debe utilizarse' }
      },
    })

    const response = await controller.handle(createHttpContext(createAlexaRequest(), errors))

    assert.deepEqual(response, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'Hola. Estoy listo para ayudarte.',
        },
        shouldEndSession: false,
      },
    })
  })

  test('responds to the stop intent by closing the session', async ({ assert }) => {
    const errors: unknown[] = []
    const controller = new AlexaWebhookController({
      async generateResponse() {
        return { content: 'No debe utilizarse' }
      },
    })
    const alexaRequest = createAlexaRequest({
      request: {
        type: 'IntentRequest',
        timestamp: new Date().toISOString(),
        intent: {
          name: 'AMAZON.StopIntent',
        },
      },
    })

    const response = await controller.handle(createHttpContext(alexaRequest, errors))

    assert.deepEqual(response, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'Hasta luego.',
        },
        shouldEndSession: true,
      },
    })
  })

  test('sends the question to the provider and formats the response for speech', async ({
    assert,
  }) => {
    const errors: unknown[] = []
    let receivedSessionId: string | undefined
    let receivedQuestion: string | undefined
    const controller = new AlexaWebhookController({
      async generateResponse(sessionId, question) {
        receivedSessionId = sessionId
        receivedQuestion = question
        return { content: '  La capital\n de México es Ciudad de México.  ' }
      },
    })
    const alexaRequest = createAlexaRequest({
      request: {
        type: 'IntentRequest',
        timestamp: new Date().toISOString(),
        intent: {
          name: 'AskQuestionIntent',
          slots: {
            question: {
              value: '¿Cuál es la capital de México?',
            },
          },
        },
      },
    })

    const response = await controller.handle(createHttpContext(alexaRequest, errors))

    assert.equal(receivedSessionId, 'session-123')
    assert.equal(receivedQuestion, '¿Cuál es la capital de México?')
    assert.deepEqual(response, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'La capital de México es Ciudad de México.',
        },
        shouldEndSession: false,
      },
    })
  })

  test('returns a fallback response when the provider fails', async ({ assert }) => {
    const errors: unknown[] = []
    const controller = new AlexaWebhookController({
      async generateResponse() {
        throw new Error('OpenRouter timeout')
      },
    })
    const alexaRequest = createAlexaRequest({
      request: {
        type: 'IntentRequest',
        timestamp: new Date().toISOString(),
        intent: {
          name: 'AskQuestionIntent',
          slots: {
            question: {
              value: '¿Qué hora es?',
            },
          },
        },
      },
    })

    const response = await controller.handle(createHttpContext(alexaRequest, errors))

    assert.equal(errors.length, 1)
    assert.deepEqual(response, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'No pude responder en este momento. Por favor, intenta de nuevo.',
        },
        shouldEndSession: false,
      },
    })
  })

  test('rejects requests intended for a different skill', async ({ assert }) => {
    const errors: unknown[] = []
    const controller = new AlexaWebhookController({
      async generateResponse() {
        return { content: 'No debe utilizarse' }
      },
    })
    const alexaRequest = createAlexaRequest({
      context: {
        System: {
          application: {
            applicationId: 'amzn1.ask.skill.unauthorized',
          },
        },
      },
    })

    const response = await controller.handle(createHttpContext(alexaRequest, errors))

    assert.deepEqual(response, {
      status: 403,
      body: { message: 'Alexa skill is not authorized' },
    })
  })
})
