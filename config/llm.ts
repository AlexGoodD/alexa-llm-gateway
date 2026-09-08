import env from '#start/env'

const llmConfig = {
  openRouter: {
    apiKey: env.get('OPENROUTER_API_KEY'),
    model: 'openrouter/free',
    timeout: 6000,
  },
}

export default llmConfig
