import vine from '@vinejs/vine'

const alexaSlotValidator = vine
  .object({
    value: vine.string().trim().optional(),
  })
  .allowUnknownProperties()

export const alexaWebhookValidator = vine.create(
  vine
    .object({
      version: vine.literal('1.0'),
      context: vine
        .object({
          System: vine
            .object({
              application: vine
                .object({
                  applicationId: vine.string().trim().minLength(1),
                })
                .allowUnknownProperties(),
            })
            .allowUnknownProperties(),
        })
        .allowUnknownProperties(),
      session: vine
        .object({
          sessionId: vine.string().trim().minLength(1),
        })
        .allowUnknownProperties()
        .optional(),
      request: vine
        .object({
          type: vine.string().trim().minLength(1),
          timestamp: vine.string().trim().minLength(1),
          intent: vine
            .object({
              name: vine.string().trim().minLength(1),
              slots: vine.record(alexaSlotValidator).optional(),
            })
            .allowUnknownProperties()
            .optional(),
        })
        .allowUnknownProperties(),
    })
    .allowUnknownProperties()
)
