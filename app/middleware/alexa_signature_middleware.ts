import { SkillRequestSignatureVerifier, TimestampVerifier } from 'ask-sdk-express-adapter'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { IncomingHttpHeaders } from 'node:http'

const signatureVerifier = new SkillRequestSignatureVerifier()
const timestampVerifier = new TimestampVerifier()

export default class AlexaSignatureMiddleware {
  async handle({ logger, request, response }: HttpContext, next: NextFn) {
    const rawRequestBody = request.raw()

    if (!rawRequestBody) {
      return response.badRequest({ message: 'Alexa request body is required' })
    }

    try {
      await timestampVerifier.verify(rawRequestBody)
      await signatureVerifier.verify(rawRequestBody, request.headers() as IncomingHttpHeaders)
    } catch (error) {
      logger.warn({ error }, 'Alexa request verification failed')
      return response.badRequest({ message: 'Invalid Alexa request signature' })
    }

    return next()
  }
}
