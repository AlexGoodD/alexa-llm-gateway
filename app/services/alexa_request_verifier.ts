import { SkillRequestSignatureVerifier, TimestampVerifier } from 'ask-sdk-express-adapter'
import type { IncomingHttpHeaders } from 'node:http'

export interface AlexaRequestVerifier {
  verify(requestEnvelope: string, headers: IncomingHttpHeaders): Promise<void>
}

interface AlexaTimestampVerifier {
  verify(requestEnvelope: string): Promise<void>
}

interface AlexaSignatureVerifier {
  verify(requestEnvelope: string, headers: IncomingHttpHeaders): Promise<void>
}

export class SignedAlexaRequestVerifier implements AlexaRequestVerifier {
  constructor(
    private readonly timestampVerifier: AlexaTimestampVerifier = new TimestampVerifier(),
    private readonly signatureVerifier: AlexaSignatureVerifier = new SkillRequestSignatureVerifier()
  ) {}

  async verify(requestEnvelope: string, headers: IncomingHttpHeaders): Promise<void> {
    await this.timestampVerifier.verify(requestEnvelope)
    await this.signatureVerifier.verify(requestEnvelope, headers)
  }
}

export const alexaRequestVerifier = new SignedAlexaRequestVerifier()
