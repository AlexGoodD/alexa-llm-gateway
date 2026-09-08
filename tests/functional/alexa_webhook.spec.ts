import { test } from '@japa/runner'

test.group('Alexa webhook', () => {
  test('rejects a request without Alexa signature headers', async ({ client }) => {
    const response = await client.post('/alexa/webhook').json({
      version: '1.0',
      request: {
        timestamp: new Date().toISOString(),
        type: 'LaunchRequest',
      },
    })

    response.assertStatus(400)
    response.assertBodyContains({ message: 'Invalid Alexa request signature' })
  })
})
