import { alexaWebhookValidator } from '#validators/alexa'
import { test } from '@japa/runner'

function createAlexaRequest() {
  return {
    version: '1.0' as const,
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
  }
}

test.group('Alexa webhook validator', () => {
  test('accepts an Alexa request with the required envelope fields', async ({ assert }) => {
    const alexaRequest = await alexaWebhookValidator.validate(createAlexaRequest())

    assert.equal(alexaRequest.context.System.application.applicationId, 'amzn1.ask.skill.test')
    assert.equal(
      alexaRequest.request.intent?.slots?.question.value,
      '¿Cuál es la capital de México?'
    )
  })

  test('rejects a request without an application identifier', async ({ assert }) => {
    const alexaRequest = createAlexaRequest()
    delete (alexaRequest.context.System.application as { applicationId?: string }).applicationId

    await assert.rejects(() => alexaWebhookValidator.validate(alexaRequest))
  })

  test('rejects a request without its timestamp', async ({ assert }) => {
    const alexaRequest = createAlexaRequest()
    delete (alexaRequest.request as { timestamp?: string }).timestamp

    await assert.rejects(() => alexaWebhookValidator.validate(alexaRequest))
  })
})
