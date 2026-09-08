import type { HttpContext } from '@adonisjs/core/http'
import { chatService } from '#services/chat_service'

type AlexaWebhookRequest = {
  session?: {
    sessionId?: string
  }
  request?: {
    intent?: {
      name?: string
      slots?: Record<
        string,
        {
          value?: string
        }
      >
    }
    timestamp?: string
    type?: string
  }
}

type AlexaWebhookResponse = {
  version: '1.0'
  response: {
    outputSpeech?: {
      text: string
      type: 'PlainText'
    }
    shouldEndSession: boolean
  }
}

export default class AlexaWebhookController {
  async handle({ logger, request }: HttpContext): Promise<AlexaWebhookResponse> {
    const alexaRequest = request.all() as AlexaWebhookRequest
    const requestType = alexaRequest.request?.type
    const intentName = alexaRequest.request?.intent?.name

    if (requestType === 'SessionEndedRequest') {
      return this.createResponse(undefined, true)
    }

    if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
      return this.createResponse('Hasta luego.', true)
    }

    if (requestType === 'LaunchRequest') {
      return this.createResponse('Hola. Estoy listo para ayudarte.', false)
    }

    const question = this.getQuestion(alexaRequest)
    if (question) {
      try {
        const providerResponse = await chatService.generateResponse(
          alexaRequest.session?.sessionId ?? 'anonymous-session',
          question
        )

        return this.createResponse(this.formatForSpeech(providerResponse.content), false)
      } catch (error) {
        logger.error({ error }, 'OpenRouter response generation failed')
        return this.createResponse(
          'No pude responder en este momento. Por favor, intenta de nuevo.',
          false
        )
      }
    }

    return this.createResponse('¿Qué te gustaría preguntarme?', false)
  }

  private getQuestion(alexaRequest: AlexaWebhookRequest) {
    const slots = alexaRequest.request?.intent?.slots
    if (!slots) {
      return undefined
    }

    return Object.values(slots)
      .map((slot) => slot.value?.trim())
      .find((value) => value)
  }

  private formatForSpeech(content: string) {
    return content.replace(/\s+/g, ' ').trim().slice(0, 800)
  }

  private createResponse(
    text: string | undefined,
    shouldEndSession: boolean
  ): AlexaWebhookResponse {
    return {
      version: '1.0',
      response: {
        ...(text
          ? {
              outputSpeech: {
                type: 'PlainText',
                text,
              },
            }
          : {}),
        shouldEndSession,
      },
    }
  }
}
