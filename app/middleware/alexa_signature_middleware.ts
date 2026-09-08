import { alexaRequestVerifier, type AlexaRequestVerifier } from '#services/alexa_request_verifier'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { IncomingHttpHeaders } from 'node:http'

export default class AlexaSignatureMiddleware {
  constructor(private readonly requestVerifier: AlexaRequestVerifier = alexaRequestVerifier) {}

  async handle({ logger, request, response }: HttpContext, next: NextFn) {
    const rawRequestBody = request.raw()

    if (!rawRequestBody) {
      return response.badRequest({ message: 'Alexa request body is required' })
    }

    try {
      await this.requestVerifier.verify(rawRequestBody, request.headers() as IncomingHttpHeaders)
    } catch (error) {
      logger.warn({ error }, 'Alexa request verification failed')
      return response.badRequest({ message: 'Invalid Alexa request signature' })
    }

    return next()
  }
}
